/**
 * Well-Known Text Utility
 * Uses subsets of Open Layers library.
 * Has functionality to convert to and from WKT, OpenLayers geometry, and an atlas-compatible
 * format. Exposes an API to scale and rotate supported geometries as well.
 * @author aramk
 */

define([
  'atlas/util/Class',
  'atlas/lib/open-layers',
  'atlas/model/Vertex',
  'atlas/util/mixin'
], function(Class, OpenLayers, Vertex, mixin) {
  OpenLayers = !OpenLayers || typeof OpenLayers === 'string' ? window.OpenLayers : OpenLayers;
  var _instance = null;

  /**
   * Defines a set of utility methods for working with Well-Known-Text.
   * @class {atlas.util.WKT}
   */
  var WKT = mixin(Class.extend({

    _init: function() {
      this.parser = new OpenLayers.Format.WKT();
    },

    /**
     * Converts a WKT polygon string to an array of
     * {@see atlas.model.Vertex|Vertices}.
     * @param {String} wktStr - The WKT string to convert
     * @returns {Array.<Array.<atlas.model.Vertex>> | Array.<atlas.model.Vertex>} The convert polygon.
     */
    verticesFromWKT: function(wktStr) {
      var geometry = this.openLayersGeometryFromWKT(wktStr).geometry;
      return this.verticesFromOpenLayersGeometry(geometry);
    },

    /**
     * Parses the given WKT string and returns an OpenLayers geometry collection.
     * @param {String} wktStr - The WKT string to convert
     * @returns {OpenLayers.Geometry.Collection}
     */
    openLayersGeometryFromWKT: function(wktStr) {
      var geometry;
      if (typeof wktStr === 'string') {
        geometry = this.parser.read(wktStr);
      }
      return geometry;
    },

    /**
     * Returns an array of Vertices representing the given geometry object.
     * @param  {OpenLayers.Geometry.Collection|OpenLayers.Geometry.Point} geometry - The geometry to convert.
     * @returns {Array.<atlas.model.Vertex>|atlas.model.Vertex} An array of Vertices forming a closed polygon.
     */
    verticesFromOpenLayersGeometry: function(geometry) {
      var vertices = [];
      if (geometry instanceof OpenLayers.Geometry.Point) {
        return this.vertexFromOpenLayersPoint(geometry);
      } else if (geometry instanceof OpenLayers.Geometry.Collection) {
        var components = geometry.components;
        for (var i = 0; i < components.length; i++) {
          var component = components[i];
          vertices.push(this.verticesFromOpenLayersGeometry(component));
        }
      }
      return vertices;
    },

    /**
     * Converts an OpenLayers.Geometry.Point to a {@link atlas.model.Vertex|Vertex}.
     * @param  {OpenLayers.Geometry.Point} point - The point to be converted.
     * @returns {atlas.model.Vertex}
     */
    vertexFromOpenLayersPoint: function(point) {
      return new Vertex(point.x, point.y, 0);
    },

    /**
     * Converts an array of coordinates into an array of Points.
     * @param {Array.<atlas.model.Vertex>} vertices - The coordinates to convert.
     * @returns {Array.<OpenLayers.Geometry.Points>}
     */
    openLayersPointsFromVertices: function(vertices) {
      throw 'WKT.openLayersPointsFromVertices does not work.';

      var points = [];
      for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        var point = new OpenLayers.Geometry.Point(vertex.x, vertex.y);
        points.push(point);
      }
      return points;
    },

    /**
     * Returns an OpenLayers Polygon from an array of vertices.
     * @param {Array.<atlas.model.Vertex>} vertices - The vertices to convert.
     * @returns {OpenLayers.Geometry.Polygon}
     */
    openLayersPolygonFromVertices: function(vertices) {
      throw 'WKT.openLayersPolygonFromVertices does not work.';
      var points = this.openLayersPointsFromVertices(vertices);
      var ring = new OpenLayers.Geometry.LinearRing(points);
      if (ring.components.length > 1) {
        ring.components.pop();
      }
      if (ring.components[0] != ring.components.slice(-1)) {
        ring.components.push(ring.components[0]);
      }
      return new OpenLayers.Geometry.Polygon([ring]);
    },

    /**
     * Returns a WKT string from an array of vertices.
     * @param {Array.<Number>} vertices - The vertices to convert.
     * @returns {String}
     */
    wktStringFromVertices: function(vertices) {
      var polygon = this.openLayersPolygonFromVertices(vertices);
      return this.parse.extractGeometry(polygon);
    },

    /**
     * Scales a polygon formed by a series of Vertices.
     * @param {Array.<atlas.model.Vertex>} vertices - The vertices to scale.
     * @param {atlas.model.Vertex} scaleBy - Defines the factors to scale by.
     * @param {Number} scaleBy.x - The factor to scale the x axis by.
     * @param {Number} scaleBy.y - The factor to scale the y axis by.
     * @returns {Array.<atlas.model.Vertex>} The rescaled vertices.
     */
    scaleVertices: function(vertices, scaleBy) {
      // TODO(aramk) WKT.scaleVertices does not work.
      throw 'WKT.scaleVertices does not work.'
      var polygon = this.openLayersPolygonFromVertices(vertices);
      var scaleAspectRatio = scaleBy.x / scaleBy.y;
      polygon.resize(scaleBy.x, polygon.getCentroid, scaleAspectRatio);
      return this.verticesFromOpenLayersGeometry(polygon);
    },

    _isType: function(wktStr, type) {
      return typeof wktStr === 'string' && wktStr.indexOf(type) !== -1;
    },

    isPoint: function(wktStr) {
      return this._isType(wktStr, 'POINT');
    },

    isLineString: function(wktStr) {
      return this._isType(wktStr, 'LINESTRING');
    },

    isPolygon: function(wktStr) {
      return this._isType(wktStr, 'POLYGON');
    }

  }), {
    // Static members

    /**
     * @returns {atlas.util.WKT} An instance of {@link WKT}.
     */
    getInstance: function() {
      return (_instance = (_instance || new WKT()));
    }
  });
  return WKT;

});
