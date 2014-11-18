define([
  'atlas/edit/BaseEditModule',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError'
], function (BaseEditModule, Log, Setter, Feature, GeoPoint, DeveloperError) {

  // TODO(bpstudds): This is copied almost entirely from the existing DrawModule (for polygons).
  // TODO(bpstudds): Abstract common logic in DrawModule and LineDrawModule.
  // TODO(aramk): The logic to draw lines is now available in DrawModule so this module should be
  // cleaned up to set only the display mode to "line".
  
  // Possibly could abstract this whole module.
  //  - DrawModule is abstract, doesn't care what it's drawing.
  //  - Might construct it like var lineDrawer = DrawModule(Line);
  //  - DrawModule emits events for adding vertices/nodes, cancelling drawing, finishing drawing
  //  - The thing being drawn

  /**
   * @typedef atlas.edit.LineDrawModule
   * @ignore
   */
  var LineDrawModule;

  LineDrawModule = BaseEditModule.extend({
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
        this._feature = this._managers.entity.createFeature(this._getNextId(), {
          line: {vertices: [], width: '2px'},
          displayMode: Feature.DisplayMode.LINE
        });
        // We will be adding new handles ourselves, and the new feature doesn't have any to begin
        // with.
        this._managers.edit.enable({
          entities: [this._feature], show: false, addHandles: false
        });
      }
    },

    /**
     * Called at the start of the drawing to bind event callbacks.
     * @param {Object} args
     * @param {Function} [args.update] - A callback invoked as the object is drawn (vertices are
     * added).
     * @param {Function} [args.create] - A callback invoked when drawing is complete.
     * @param {Function} [args.cancel] - A callback invoked when drawing is cancelled.
     * @private
     */
    _draw: function(args) {
      args = Setter.def(args, {});
      if (this.isDrawing()) {
        throw new DeveloperError('Already drawing - end the current session first.');
      }
      // Bind the draw event handlers.
      for (var event in this._handlers) {
        var handler = args[event];
        handler && this._handlers[event].push(handler);
      }
      this.enable();
      // TODO(bpstudds): Discover why translation is broken.
      this._managers.edit.disableModule('translation');
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

    _debounceAdd: function(diff, target) {
      // Remove the point added on the first click of the double click.
      // NOTE: it will still invoke the update callback.
      var handles = this._managers.edit.getHandles(),
          line = this._getLine(),
          lastHandle = this._handles.pop(),
          translationModule = this._managers.edit.getModule('translation');

      line.removeVertex();
      handles.remove(lastHandle.getId());
      lastHandle.remove();
      if (target) {
        // Ensure a translation doesn't exist if we clicked on a handle.
        translationModule && translationModule.cancel();
      }
      return true;
    },

    _addHandleOnTarget: function(line, target, args) {
      if (this._handles && target === this._handles[0]) {
        // Add last vertex if closing the line
        var centroid = target.getCentroid();
        if (centroid) {
          line.addVertex(centroid);
          this._render();
        }
        this._stop(args);
        return true;
      }
      return false;
    },

    _doAdd: function(line, point) {
      // Add point to the current line and redraw.
      line.addVertex(point);
      this._render();
      // Create and show a handle for that point.
      var handle = line.addHandle(line.createHandle(point, line.getVertices().length - 1));
      handle.show();

      // Add the new handle to the edit manager and the local store.
      this._managers.edit.getHandles().add(handle);
      this._handles.push(handle);

      return true;
    },

    /**
     * Called when a vertex should be added during drawing. Creates a handle for the new vertex.
     * If two consecutive calls are made within {@link #_doubleClickDelta} it is considered a double
     * click and drawing stops.
     * @param {Object} args - The event object.
     * @private
     */
    _add: function(args) {
      var clickedAt = this._managers.render.geoPointFromScreenCoords(args.position);
      if (!clickedAt) {
        // Click was not registered on the globe
        return;
      }

      var handles = this._managers.edit.getHandles();
      var targetId = this._managers.render.getAt(args.position)[0];
      var target = handles.get(targetId);
      var now = Date.now();
      var translationModule = this._managers.edit.getModule('translation');
      this._setup();
      var line = this._getLine();

      if (this._lastClickTime) {
        var diff = now - this._lastClickTime;
        if (diff <= this._doubleClickDelta) {
          // Remove node added on first click of double click
          if (this._debounceAdd(diff, target)) {
            // Render after removing erroneously added point.
            this._render();
          }
          // And finish drawing.
          this._stop(args);
          return;
        }
      }
      this._lastClickTime = now;

      // Stop editing if clicking on the first handle, otherwise ignore.
      if (target) {
        // TODO(bpstudds): Fix up translation of existing nodes.
        //translationModule.cancel();
        if (this._addHandleOnTarget(line, target, args)) {
          return;
        }
      }
      // Actually add the new point to the line.
      this._doAdd(line, clickedAt);
      // Call the update handler.
      this._executeHandlers(this._handlers.update);
    },

    /**
     * Renders the feature if it's safe to do so (has the minimum number of vertices).
     * @private
     */
    _render: function() {
      if (this._getLine().getVertices().length >= 2) {
        this._feature.show();
      }
    },

    /**
     * Stops drawing if the currently drawn object is valid (has the minimum number of vertices).
     * @returns {Boolean} Whether stopping was successful.
     * @private
     */
    _stop: function(args) {
      if (!this.isDrawing()) {
        throw new DeveloperError('Nothing is being drawn - cannot stop.');
      }
      if (this._getLine().getVertices().length < 2) {
        Log.error('A line must have at least 2 vertices.');
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
      if (!this.isDrawing()) {
        throw new DeveloperError('Nothing is being drawn - cannot cancel.');
      }
      this._executeHandlers(this._handlers.cancel);
      var handles = this._managers.edit.getHandles();
      this._handles.forEach(function(handle) {
        handles.remove(handle.getId());
        handle.remove();
      }, this);
      this._feature.remove();
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
      this._managers.edit.disable();
      this.disable();
      this._isDrawing = false;
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

  return LineDrawModule;
});

