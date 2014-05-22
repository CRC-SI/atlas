define([
  'atlas/edit/BaseEditModule',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  'atlas/util/DeveloperError'
], function(BaseEditModule, Log, Setter, Feature, DeveloperError) {

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
  DrawModule = BaseEditModule.extend({

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

    _init: function(atlasManagers) {
      this._super(atlasManagers);
      this._reset();
      this.bindEvents({
        'input/leftclick': this._add,
        'entity/draw': {
          callback: this._draw,
          source: 'extern',
          persistent: true
        },
        'entity/draw/stop': {
          callback: function() {
            if (this._stop() === false) {
              // Stopping has failed, so we need to abort manually.
              this._cancel();
            }
          },
          source: 'extern'
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
        this._feature = this._atlasManagers.entity.createFeature(this._getNextId(), {
          polygon: {vertices: []},
          line: {vertices: [], width: '2px'},
          displayMode: Feature.DisplayMode.FOOTPRINT
        });
//        this._vertices = this._feature.getVertices();
        this._atlasManagers.edit.enable({
          entities: [this._feature], show: false, addHandles: false});
      }
    },

    /**
     * Called at the start of the drawing to bind event callbacks.
     * @param {Object} args
     * @param {Function} [args.update] - A callback invoked as the object is drawn (vertices are
     * added).
     * @param {Function} [args.create] - A callback invoked when drawing is complete.
     * @private
     */
    _draw: function(args) {
      if (this.isDrawing()) {
        throw new DeveloperError('Already drawing - end the current session first.');
      }
      for (var event in this._handlers) {
        var handler = args[event];
        handler && this._handlers[event].push(handler);
      }
      this.enable();
      this._atlasManagers.edit.enableModule('translation');
      this._isDrawing = true;
    },

    /**
     * Executes the given handlers with the drawn object.
     * @param handlers
     * @private
     */
    _executeHandlers: function(handlers) {
      handlers.forEach(function(handler) {
        handler.call(this, {
          feature: this._feature
        });
      }, this);
    },

    /**
     * Called when a vertex should be added during drawing. Creates a handle for the new vertex.
     * If two consecutive calls are made within {@link #_doubleClickDelta} it is considered a double
     * click and drawing stops.
     * @private
     */
    _add: function(args) {
      var handles = this._atlasManagers.edit.getHandles();
      var targetId = this._atlasManagers.render.getAt(args.position)[0];
      var target = handles.get(targetId);
      var now = Date.now();
      var translationModule = this._atlasManagers.edit.getModule('translation');
      this._setup();
      var polygon = this._getPolygon(),
          line = this._getLine();

      if (this._lastClickTime) {
        var diff = now - this._lastClickTime;
        if (diff <= this._doubleClickDelta) {
          // Remove the point added on the first click of the double click.
          // NOTE: it will still invoke the update callback.
          polygon.getVertices().pop();
          line.getVertices().pop();
          var lastHandle = this._handles.pop();
          handles.remove(lastHandle.getId());
          lastHandle.remove();
          this._render();
          if (target) {
            // Ensure a translation doesn't exist if we clicked on a handle.
            translationModule.cancel();
          }
          this._stop(args);
          return;
        }
      }
      this._lastClickTime = now;

      if (target) {
        // Ensure a translation doesn't exist if we clicked on a handle.
        translationModule.cancel();
        this._stop(args);
        return;
      }

      var point = this._atlasManagers.render.convertScreenCoordsToLatLng(args.position);
      var vertex = point.toVertex();
      polygon.getVertices().push(vertex);
      if (polygon.getVertices().length <= 2) {
        line.getVertices().push(vertex.clone());
      }

      // Use the polygon handle constructor for consistency.
      var handle = polygon.createHandle(vertex);
      handle.render();
      handles.add(handle);
      this._handles.push(handle);
      this._render();
      this._executeHandlers(this._handlers.update);
    },

    /**
     * Renders the feature if it's safe to do so (has the minimum number of vertices).
     * @private
     */
    _render: function() {
      var len = this._getPolygon().getVertices().length;
      if (len === 2) {
        this._feature.setDisplayMode(Feature.DisplayMode.LINE);
        this._feature.show();
      } else if (len >= 3) {
        this._feature.setDisplayMode(Feature.DisplayMode.FOOTPRINT);
        this._feature.show();
      }
    },

    /**
     * Stops drawing if the currently drawn object is valid (has the minimum number of vertices).
     * @returns {Boolean} Whether stopping was successful.
     * @private
     */
    _stop: function(args) {
      if (!this._feature) {
        throw new DeveloperError('Nothing is being drawn - cannot stop.');
      }
      if (this._getPolygon().getVertices().length < 3) {
        Log.error('A polygon must have at least 3 vertices.');
        return false;
      }
      this._executeHandlers(this._handlers.create);
      this._reset();
      return true;
    },

    /**
     * Forcefully stops drawing.
     * @private
     */
    _cancel: function() {
      if (!this._feature) {
        throw new DeveloperError('Nothing is being drawn - cannot cancel.');
      }
      this._executeHandlers(this._handlers.cancel);
      this._reset();
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
      this._atlasManagers.edit.disable();
      this.disable();
      this._isDrawing = false;
    },

    _getPolygon: function() {
      return this._feature.getForm(Feature.DisplayMode.FOOTPRINT);
    },

    _getLine: function() {
      return this._feature.getForm(Feature.DisplayMode.LINE);
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
