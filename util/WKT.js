/**
 * Well-Known Text Utility
 * Uses subsets of Open Layers library
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
   * Converts a WKT polygon string to a multidimensional array of numbers.
   * @param {String} poly - The WKT string to convert.
   * @returns {Array.Number} The converted polygon.
   */
  WKT.prototype.wktToCoords = function (/*String*/ poly) {
    return this.wktToArray(poly);
  };

  /**
   * Converts a WKT polygon string to an array of 
   * {@see atlas/model/Vertex|Vertices}.
   * @param {String} poly - The WKT string to convert
   * @returns {Array.atlas/model/Vertex} The convert polygon.
   */
  WKT.prototype.wktToVertices = function(/*String*/ poly) {
    var geometry = this.parseGeometry(poly).geometry;
    return this.wktGeometryToArray(geometry, this.wktPointToVertex);
  };

  /**
   * Parses the given WKT string and returns an OpenLayers geometry collection.
   * @param {String} wktStr - The WKT string to convert
   * @returns {OpenLayers.Geometry.Collection} 
   */
  WKT.prototype.parseGeometry = function (wktStr) {
    var geometry = wktStr;
    if (typeof geometry === 'string') {
      geometry = this.parser.read(wktStr);
    }
    return geometry;
  };

  /**
   * Converts a WKT polygon string to a multidimensional array of numbers.
   * @param {String} poly - The WKT string to convert.
   * @returns {Array.Number} The converted polygon.
   */
  WKT.prototype.wktToArray = function (wktStr) {
    var geometry = this.parseGeometry(wktStr).geometry;
    return this.wktGeometryToArray(geometry);
  };

  /**
   * Returns an array of coordinates representing the given geometry object. The
   * type of coordinate generated depends on the <code>pointConverted</code>
   * function.
   * @param  {OpenLayers.Geometry.Collection|OpenLayers.Geometry.Point} geometry - The geometry to convert.
   * @param  {Function} pointConverter - Function that converts a OpenLayers.Geometry.Point to the desired coordinate format.
   * @returns {Array} An array of Points (as returned by pointConverter) forming a closed polygon.
   */
  WKT.prototype.wktGeometryToArray = function (geometry, /*Function*/ pointConverter) {
    var coords = [];
    pointConverter = (pointConverter || this.wktPointToArray);
    if (geometry instanceof OpenLayers.Geometry.Point) {
      return pointConverter(geometry);
    } else if (geometry instanceof OpenLayers.Geometry.Collection) {
      var components = geometry.components;
      for (var i = 0; i < components.length; i++) {
        var component = components[i];
        coords.push(this.wktGeometryToArray(component, pointConverter));
      }
    }
    return coords;
  };

  /**
   * Converts an OpenLayers.Geometry.Point to an array.
   * @param  {OpenLayers.Geometry.Point} point - The point to be converted.
   * @returns {Array.Number} 
   */
  WKT.prototype.wktPointToArray = function (point) {
    return [point.x, point.y];
  };

  /**
   * Converts an OpenLayers.Geometry.Point to a {@link atlas/model/Vertex|Vertex}.
   * @param  {OpenLayers.Geometry.Point} point - The point to be converted.
   * @returns {atlas/model/Vertex} 
   */
  WKT.prototype.wktPointToVertex = function (point) {
    return new Vertex(point.x, point.y, 0);
  };

  /**
   * Returns a WKT Polygon from an array of coordinates.
   * @param {Array.Number} coords - The coords to convert.
   * @returns {OpenLayers.Geometry.Polygon}
   */
  WKT.prototype.coordsToWKTObject = function (/*Array*/ coords) {
    var points = this.toPoints(coords);
    var ring = new OpenLayers.Geometry.LinearRing(points);
    var len = ring.components.length;
    if (ring.components.length > 1) {
      ring.components.pop();
    }
    if (ring.components[0] != ring.components.slice(-1)) {
      ring.components.push(ring.components[0]);
    }
    return new OpenLayers.Geometry.Polygon([ring]);
  };

  /**
   * Returns a WKT string from an array of coordinates.
   * @param {Array.Number} coords - The coords to convert.
   * @returns {String}
   */
  WKT.prototype.coordsToWKT = function (/*Array*/ coords) {
    return this.wktObjectToString(this.coordsToWKTObject(coords));
  };

  /**
   * Returns a WKT string from a WKT object.
   * @param  {Object} obj - The WKT object to convert.
   * @returns {String}
   */
  WKT.prototype.wktObjectToString = function (/*Object*/ obj) {
    // summary:
    //      Returns a WKT string from a WKT object
    return this.parser.extractGeometry(obj);
  };

  /**
   * Converts an array of coordinates into an array of Points.
   * @param {Array.Number} coords - The coordinates to convert.
   * @returns {Array.OpenLayers.Geometry.Points}
   */
  WKT.prototype.toPoints = function (/*Array*/ coords) {
    var points = [];
    for (var i = 0; i < coords.length; i++) {
      var coord = coords[i];
      points.push(new OpenLayers.Geometry.Point(coord[0], coord[1]));
    }
    return points;
  };


  return (_instance = (_instance || new WKT()));

});
