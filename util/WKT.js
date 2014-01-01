/**
 * Well-Known Text Utility
 * Uses subsets of Open Layers library.
 * Has functionality to convert to and from WKT, OpenLayers geometry, and an atlas-compatible
 * format. Exposes an API to scale and rotate supported geometries as well.
 * @author aramk
 */

define([
  'atlas/lib/open-layers',
  'atlas/model/Vertex'
], function (OpenLayers, Vertex) {

  var _instance = null;

  /**
   * Defines a set of utility methods for working with Well-Known-Text.
   */
  var WKT = function () {
    this.parser = new OpenLayers.Format.WKT();
  };

  /**
   * Converts a WKT polygon string to an array of
   * {@see atlas/model/Vertex|Vertices}.
   * @param {String} wktStr - The WKT string to convert
   * @returns {Array.<atlas/model/Vertex>} The convert polygon.
   */
  WKT.prototype.verticesFromWKT = function(wktStr) {
    var geometry = this.openLayersGeometryFromWKT(wktStr).geometry;
    return this.verticesFromOpenLayersGeometry(geometry);
  };

  /**
   * Parses the given WKT string and returns an OpenLayers geometry collection.
   * @param {String} wktStr - The WKT string to convert
   * @returns {OpenLayers.Geometry.Collection}
   */
  WKT.prototype.openLayersGeometryFromWKT = function (wktStr) {
    var geometry;
    if (typeof wktStr === 'string') {
      geometry = this.parser.read(wktStr);
    }
    return geometry;
  };

  /**
   * Returns an array of Vertices representing the given geometry object.
   * @param  {OpenLayers.Geometry.Collection|OpenLayers.Geometry.Point} geometry - The geometry to convert.
   * @returns {Array.<atlas/model/Vertex>|atlas/model/Vertex} An array of Vertices forming a closed polygon.
   */
  WKT.prototype.verticesFromOpenLayersGeometry = function (geometry) {
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
  };

  /**
   * Converts an OpenLayers.Geometry.Point to a {@link atlas/model/Vertex|Vertex}.
   * @param  {OpenLayers.Geometry.Point} point - The point to be converted.
   * @returns {atlas/model/Vertex}
   */
  WKT.prototype.vertexFromOpenLayersPoint = function (point) {
    return new Vertex(point.x, point.y, 0);
  };

  /**
   * Returns an OpenLayers Polygon from an array of vertices.
   * @param {Array.<atlas/model/Vertex>} vertices - The vertices to convert.
   * @returns {OpenLayers.Geometry.Polygon}
   */
  WKT.prototype.openLayersPolygonFromVertices = function (vertices) {
    var points = this.openLayersPointsFromVertices(vertices);
    var ring = new OpenLayers.Geometry.LinearRing(points);
    if (ring.components.length > 1) {
      ring.components.pop();
    }
    if (ring.components[0] != ring.components.slice(-1)) {
      ring.components.push(ring.components[0]);
    }
    return new OpenLayers.Geometry.Polygon([ring]);
  };

  /**
   * Returns a WKT string from an array of vertices.
   * @param {Array.<Number>} vertices - The vertices to convert.
   * @returns {String}
   */
  WKT.prototype.wktStringFromVertices = function (vertices) {
    var polygon = this.openLayersPolygonFromVertices(vertices);
    return this.parse.extractGeometry(polygon);
  };

  /**
   * Converts an array of coordinates into an array of Points.
   * @param {Array.<atlas/model/Vertex>} vertices - The coordinates to convert.
   * @returns {Array.<OpenLayers.Geometry.Points>}
   */
  WKT.prototype.openLayersPointsFromVertices = function (vertices) {
    var points = [];
    for (var i = 0; i < vertices.length; i++) {
      var vertex = vertices[i];
      points.push(new OpenLayers.Geometry.Point(vertex.x, vertex.y));
    }
    return points;
  };


  return (_instance = (_instance || new WKT()));

});
