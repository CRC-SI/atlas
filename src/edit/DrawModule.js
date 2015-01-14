define([
  'atlas/edit/BaseEditModule',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  'atlas/model/Vertex',
  'atlas/util/DeveloperError'
], function(BaseEditModule, Log, Setter, Feature, Vertex, DeveloperError) {

  // TODO(aramk) Make this AbstractDrawModule and extend with PolygonDrawModule and LineDrawModule.

  /**
   * @typedef atlas.edit.DrawModule
   * @ignore
   */
  var DrawModule;

  /**
   * @classdesc Handles logic for drawing {@link atlas.model.GeoEntity} objects through user
   * interaction.
   * @extends atlas.render.BaseEditModule
   * @class atlas.edit.DrawModule
   */
  DrawModule = BaseEditModule.extend(/** @lends atlas.edit.DrawModule# */ {

    /**
     * The handles added during the current draw process. Used to store their sequence.
     * @type {Array.<atlas.model.Handle>}
     */
    _handles: null,

    /**
     * The object being drawn.
     * @type {atlas.model.Feature}
     */
    _feature: null,

    /**
     * The milliseconds from epoch of the last click. Used to detect a double click.
     * @type {Number}
     */
    _lastClickTime: null,

    /**
     * The position of the last mouse click.
     * @type {atlas.model.Vertex}
     */
    _lastClickPosition: null,

    /**
     * The maximum amount of time difference between clicks to detect as a double click.
     * @type {Number}
     */
    _doubleClickDelta: 500,

    /**
     * The next available ID for drawn objects.
     * @type {Number}
     */
    _nextId: 1,

    /**
     * @type{Boolean} Whether a current drawing sequence exists.
     */
    _isDrawing: false,

    /**
     * The display mode to use when drawing.
     * @type {atlas.model.Feature.DisplayMode}
     */
    _displayMode: null,

    _init: function(managers) {
      this._super(managers);
      this._reset();
      this.bindEvents({
        'input/leftclick': this._add,
        'entity/draw': {
          callback: this._draw,
          source: 'extern',
          persistent: true
        },
        'entity/draw/stop': {
          callback: function(args) {
            if (this._stop(args) === false) {
              // Stopping has failed, so we need to abort manually.
              this._cancel();
            }
          },
          source: 'extern'
        },
        'input/keyup': function(args) {
          // Cancel drawing on escape key.
          if (this.isDrawing() && args.key === 27) {
            this._cancel();
          }
        }
      });
    },

    _getNextId: function() {
      return '_draw_' + this._nextId++;
    },

    /**
     * Sets up the resources needed before drawing.
     * @private
     */
    _setup: function() {
      if (!this._feature) {
        var displayMode = this._displayMode;
        var createArgs = {
          line: {vertices: [], width: '2px'},
          displayMode: displayMode
        };
        if (displayMode === Feature.DisplayMode.FOOTPRINT) {
          createArgs.polygon = {vertices: []};
        }
        this._feature = this._managers.entity.createFeature(this._getNextId(), createArgs);
        // We will be adding new handles ourselves, and the new feature doesn't have any to begin
        // with.
        this._managers.edit.enable({
          entities: [this._feature], show: false, addHandles: false});
      }
    },

    /**
     * Called at the start of the drawing to bind event callbacks.
     * @param {Object} args
     * @param {Function} [args.update] - A callback invoked as the object is drawn (vertices are
     * added).
     * @param {Function} [args.create] - A callback invoked when drawing is complete.
     * @param {Function} [args.cancel] - A callback invoked when drawing is cancelled.
     * @param {Function} [args.init] - A callback invoked when drawing is started.
     * @param {atlas.model.Feature.DisplayMode} [displayMode] - The display mode to use when drawing
     * the entity. {@link atlas.model.Feature.DisplayMode.FOOTPRINT} by default.
     * @private
     */
    _draw: function(args) {
      if (this.isDrawing()) {
        throw new DeveloperError('Already drawing - end the current session first.');
      }
      // Bind the draw event handlers.
      for (var event in this._handlers) {
        var handler = args[event];
        handler && this._handlers[event].push(handler);
      }
      this._displayMode = args.displayMode || Feature.DisplayMode.FOOTPRINT
      this.enable();
      this._setup();
      this._managers.edit.enableModule('translation');
      this._isDrawing = true;
      init = args.init;
      if (init) {
        init({feature: this._feature});
      }
    },

    /**
     * Executes the given handlers with the drawn object.
     * @param {Array.<Function>} handlers
     * @param  {atlas.model.Feature} [feature]
     * @private
     */
    _executeHandlers: function(handlers, feature) {
      feature = feature || this._feature;
      handlers.forEach(function(handler) {
        handler.call(this, {
          feature: feature,
          // Pass the given feature (if any) to allow returning the forms without without relying on
          // this._feature (which might be null if these handlers are executed after drawing has
          // stopped).
          form: this._getForm(undefined, feature),
          line: this._getLine(feature)
        });
      }, this);
    },

    /**
     * Called when a vertex should be added during drawing. Creates a handle for the new vertex.
     * If two consecutive calls are made within {@link #_doubleClickDelta} it is considered a double
     * click and drawing stops.
     * @param {Object} args - The event object.
     * @private
     */
    _add: function(args) {
      var handles = this._managers.edit.getHandles();
      var position = new Vertex(args.position);
      var targetId = this._managers.render.getAt(args.position)[0];
      var target = handles.get(targetId);
      var now = Date.now();
      var translationModule = this._managers.edit.getModule('translation');
      var form = this._getForm();
      var line = this._getLine();

      if (this._lastClickTime) {
        var timeDiff = now - this._lastClickTime;
        var posDiff = position.subtract(this._lastClickPosition).absolute();
        // Only register a double click if the mouse did not move between clicks.
        if (timeDiff <= this._doubleClickDelta && posDiff.equals(new Vertex(0, 0))) {
          if (target) {
            // Ensure a translation doesn't exist if we clicked on a handle. Perform the cancel
            // before removing the handle to ensure translation doesn't fail.
            translationModule.cancel();
          }
          var lastHandle = this._handles.pop();
          // Remove the point added on the first click of the double click.
          // NOTE: it will still invoke the update callback.
          form.removeVertex();
          line !== form && line.removeVertex();
          this._removeHandle(lastHandle);
          this._render();
          this._stop(args);
          return;
        }
      }
      this._lastClickTime = now;
      this._lastClickPosition = position;

      if (target) {
        translationModule.cancel();
        // Stop editing if clicking on the first handle, otherwise ignore.
        if (this._handles.length > 0 && target === this._handles[0]) {
          // Ensure a translation doesn't exist if we clicked on a handle.
          this._stop(args);
        }
        return;
      }

      var point = this._managers.render.geoPointFromScreenCoords(args.position);
      this._doAdd(point);
      this._executeHandlers(this._handlers.update);
    },

    _doAdd: function(point) {
      var handles = this._managers.edit.getHandles();
      var form = this._getForm();
      var line = this._getLine();
      form.addVertex(point);
      if (form.getVertices().length <= 2) {
        line.addVertex(point);
      }
      // Use the form's handle constructor for consistency.
      var handle = form.addHandle(form.createHandle(point, form.getVertices().length - 1));
      handle.show();
      this._handles.push(handle);
      handles.add(handle);
      this._render();
    },

    /**
     * Renders the feature if it's safe to do so (has the minimum number of vertices).
     * @private
     */
    _render: function() {
      var len = this._getForm().getVertices().length;
      if (len === 2) {
        this._feature.setDisplayMode(Feature.DisplayMode.LINE);
        this._feature.show();
      } else if (len >= 3) {
        this._feature.setDisplayMode(this._displayMode);
        this._feature.show();
      }
    },

    /**
     * Stops drawing if the currently drawn object is valid (has the minimum number of vertices).
     * @param {Object} [args]
     * @param {Boolean} [args.validate=true] Whether to preform validation and prevent completion of
     * the draw session if validation fails.
     * @returns {Boolean} Whether stopping was successful.
     * @private
     */
    _stop: function(args) {
      args = Setter.merge({
        validate: true
      }, args);
      if (!this.isDrawing()) {
        throw new DeveloperError('Nothing is being drawn - cannot stop.');
      }
      var form = this._getForm();
      if (args.validate) {
        var len = form.getVertices().length;
        if ((this._displayMode === Feature.DisplayMode.FOOTPRINT ||
          this._displayMode === Feature.DisplayMode.EXTRUSION) && len < 3) {
          Log.error('A polygon must have at least 3 vertices.');
          return false;
        } else if (this._displayMode === Feature.DisplayMode.LINE && len < 2) {
          Log.error('A line must have at least 2 vertices.');
          return false;
        }
      }
      // Store references to the handlers and the feature which is passed to them. We need to
      // unregister before calling the handlers in case another draw session is started from within.
      var feature = this._feature;
      var handlers = this._handlers.create;
      this._removeHandles();
      this._reset();
      this._executeHandlers(handlers, feature);
      return true;
    },

    /**
     * Forcefully stops drawing.
     * @private
     */
    _cancel: function() {
      if (!this.isDrawing()) {
        throw new DeveloperError('Nothing is being drawn - cannot cancel.');
      }
      this._executeHandlers(this._handlers.cancel);
      this._removeHandles();
      this._feature.remove();
      this._reset();
    },

    _removeHandles: function() {
      this._handles.forEach(this._removeHandle, this);
    },

    _removeHandle: function(handle) {
      var handles = this._managers.edit.getHandles();
      handles.remove(handle.getId());
      handle.remove();
    },

    /**
     * Removes drawing resources, resets property states and disables drawing and editing.
     */
    _reset: function() {
      this._feature = null;
      this._handles = [];
      this._handlers = {
        update: [],
        create: [],
        cancel: []
      };
      this._lastClickTime = null;
      this._managers.edit.disable();
      this.disable();
      this._isDrawing = false;
    },

    _getForm: function(displayMode, feature) {
      feature = feature || this._feature;
      return feature.getForm(displayMode || this._displayMode, feature);
    },

    _getLine: function(feature) {
      return this._getForm(Feature.DisplayMode.LINE, feature);
    },

    /**
     * @returns {Boolean} Whether an object is being drawn at the moment.
     */
    isDrawing: function() {
      return !!this._isDrawing;
    }

  });
  return DrawModule;
});
