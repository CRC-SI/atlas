define([
  './BaseEditModule',
  'atlas/model/GeoEntity',
  'atlas/model/Vertex',
//  'atlas-cesium/model/Polygon',
  'atlas/core/ItemStore',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter'
], function(BaseEditModule, GeoEntity, Vertex, ItemStore, Log, Setter) {

  // TODO(aramk) Docs.

  return BaseEditModule.extend({

    _atlasManagers: null,
    _vertices: null,
    _feature: null,
    _nextId: 0,
    /**
     * A set of event handlers for "entity/draw".
     * @type {Array.<Object>}
     */
    _handlers: null,
    /**
     * @type {Array.<atlas.model.Handle>}
     */
    _handles: null,
    _startArgs: null,
    /**
     * The time of the last click. Used to detect a double click.
     * @type {Date}
     */
    _lastClickTime: null,
    /**
     * The maximum amount of time difference between clicks to detect as a double click.
     * @type {Number}
     */
    _doubleClickDelta: 200,

    _init: function(atlasManagers) {
      this._atlasManagers = atlasManagers;
      this.reset();
    },

    _getNextId: function() {
      return '_draw_' + ++this._nextId;
    },

    getEventBindings: function() {
      return Setter.mixin(this._super(), {
        'input/leftclick': this._add,
        extern: {
          'entity/draw': this._draw
        }
      });
    },

    _setup: function() {
      if (!this._feature) {
        this._feature = this._atlasManagers.entity.createFeature(this._getNextId(), {
          polygon: {
            vertices: []
          }
        });
        this._vertices = this._feature.getVertices();
      }
    },

    _draw: function(args) {
      var onUpdate = args.update;
      var onCreate = args.create;
      onUpdate && this._handlers.update.push(onUpdate);
      onCreate && this._handlers.create.push(onCreate);
    },

    _executeHandlers: function(handlers) {
      handlers.forEach(function(handler) {
        handler.call(this, {
          feature: this._feature,
          vertices: this._vertices
        });
      }, this);
    },

    _add: function(args) {
      if (this._lastClickTime) {
        var diff = Date.now() - this._lastClickTime;
        if (diff <= this._doubleClickDelta) {
          this._finish(args);
          return;
        }
      }
      this._lastClickTime = Date.now();
      this._setup();
      var point = this._atlasManagers.render.convertScreenCoordsToLatLng(args.position);
      var vertex = point.toVertex();
      this._vertices.push(vertex);

      var handle = this._feature.createHandle(vertex);
      this._handles.push(handle);
      handle.render();
      if (this._vertices.length >= 3) {
        this._feature.show();
      }
      this._executeHandlers(this._handlers.update);
    },

    _finish: function(args) {
      this._handles.forEach(function(handle) {
        handle.remove();
      });
      if (this._vertices.length < 3) {
        alert('A polygon must have at least 3 vertices.');
        return;
      }
      this._executeHandlers(this._handlers.create);
      this.reset();
      this.disable();
    },

    reset: function() {
      this._feature = null;
      this._vertices = null;
      this._handles = [];
      this._handlers = {
        update: [],
        create: []
      };
      this._lastClickTime = null;
    }

  });
});
