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

  var WKT = function () {
    // summary:
    //      A set of utility methods for working with Well-Known-Text
    this.parser = new OpenLayers.Format.WKT();
  };

  // TODO rename to wktTo
  WKT.prototype.wktToCoords = function (/*String*/ poly) {

    return this.wktToArray(poly);

    // summary:
    //      Returns an array of coordinates from the WKT Polygon string
    // description:
    //      e.g. "POLYGON ((-37.760746002197266 145.15419006347656, ...))"

    // bpstudds: Commented out this code as it's after a return statement
    // var vector = this.parser.read(poly);

    // // 2D array of coordinates
    // var coords2D = [];

    // var geometry = vector.geometry;

    // if (geometry instanceof OpenLayers.Geometry.Point) {
    //   var vertices = geometry.getVertices();
    //   coords2D.push(vertices);
    // } else if (geometry instanceof OpenLayers.Geometry.Polygon) {
    //   var components = geometry.components;
    //   for (var i = 0; i < components.length; i++) {
    //     var component = components[i];
    //   }
    // }
    // return coords2D;
  };

  WKT.prototype.wktToVertices = function(/*String*/ poly) {
    var geometry = this.parseGeometry(poly).geometry;
    return this.wktGeometryToArray(geometry, this.wktPointToVertex);
  };

  WKT.prototype.parseGeometry = function (wktStr) {
    var geometry = wktStr;
    if (typeof geometry == 'string') {
      geometry = this.parser.read(wktStr);
    }
    return geometry;
  };

  WKT.prototype.wktToArray = function (wktStr) {
    var geometry = this.parseGeometry(wktStr).geometry;
    return this.wktGeometryToArray(geometry);
  };

  WKT.prototype.wktGeometryToArray = function (geometry, /*Function*/ pointConverter) {
    // summary:
    //      Returns an array of coordinates representing the given geometry object.
    // geometry: OpenLayers.Geometry.Collection | OpenLayers.Geometry.Point
    //      The geometry to convert
    // pointConverter: function(OpenLayers.Geometry.Point)
    //      Function to convert an OpenLayers point to the desired format.
    //      Defaults to converting to a 2d array.
    // returns:
    //      An array of Points (as defined by pointConverter) forming a closed
    //      polygon.
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

  WKT.prototype.wktPointToArray = function (point) {
    return [point.x, point.y];
  };

  WKT.prototype.wktPointToVertex = function (point) {
    return new Vertex(point.x, point.y, 0);
  };

  WKT.prototype.coordsToWKTObject = function (/*Array*/ coords) {
    // summary:
    //      Returns a WKT Polygon from an array of coordinates
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

  WKT.prototype.coordsToWKT = function (/*Array*/ coords) {
    // summary:
    //      Returns a WKT string from an array of coordinates
    return this.wktObjectToString(this.coordsToWKTObject(coords));
  };

  WKT.prototype.wktObjectToString = function (/*Object*/ obj) {
    // summary:
    //      Returns a WKT string from a WKT object
    return this.parser.extractGeometry(obj);
  };

  WKT.prototype.toPoints = function (/*Array*/ coords) {
    // summary:
    //      Converts an array of coordinates into an array of Points
    var points = [];
    for (var i = 0; i < coords.length; i++) {
      var coord = coords[i];
      points.push(new OpenLayers.Geometry.Point(coord[0], coord[1]));
    }
    return points;
  };


  return (_instance = (_instance || new WKT()));

});
