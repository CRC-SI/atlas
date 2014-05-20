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
     * @type {atlas.core.ItemStore}
     */
    _handles: null,
    _startArgs: null,

    _init: function(atlasManagers) {
      this._atlasManagers = atlasManagers;
      this.reset();
    },

//    __start: function(args) {
//      this._startArgs = args;
//      console.error('start', args);
//    },

    _getNextId: function() {
      return '_draw_' + ++this._nextId;
    },

    getEventBindings: function() {
      return Setter.mixin(this._super(), {
        'input/leftclick': this._add,
        'input/left/dblclick': this._finish
      });
    },
    
    _setup: function () {
      if (!this._feature) {
        this._feature = this._atlasManagers.entity.createFeature(this._getNextId(), {
          polygon: {
            vertices: []
          }
        });
        this._vertices = this._feature.getVertices();
      }
    },

    _add: function(args) {
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
    },

    _finish: function(args) {
      this._handles.forEach(function (handle) {
        handle.remove();
      });
      // Since we captured the last click as well, remove the last vertex.
      this._vertices.pop();
      this._feature.show();
      this.disable();
    },

//    _remove: function() {
//      console.error('remove');
//      this.reset();
//    },

//    __end: function(args) {
//      console.error('end', args);
//      var posDiff = new Vertex(this._startArgs.position).subtract(new Vertex(args.position));
//      if (posDiff.x === 0 && posDiff.y === 0) {
//        var point = this._atlasManagers.render.convertScreenCoordsToLatLng(args.position);
//        var vertex = point.toVertex();
//        this._vertices.push(vertex);
//        this._feature = new Polygon();
//        this._feature._vertices = this._vertices;
//        var handles = this._feature.createHandles();
//        this._handles.addArray(handles);
//        this._handles.map('render');
//        console.error('handles', handles);
//
//      }
//    },

    reset: function() {
//      if (this._feature) {
//        this._feature.remove();
//        this._feature = null;
//      }
      this._vertices = null;
      this._handles = []; // TODO(aramk) .remove();
    }

  });
});
