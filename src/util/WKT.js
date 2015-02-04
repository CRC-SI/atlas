define([
  'atlas/model/Vertex',
  'atlas/model/GeoPoint',
  'atlas/lib/OpenLayers',
  'atlas/lib/utility/error/DevError',
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Types',
  'atlas/util/Instances'
], function(Vertex, GeoPoint, OpenLayers, DevError, Class, Types, Instances) {

  /**
   * @typedef atlas.util.WKT
   * @ignore
   */
  var WKT;

  /**
   * Defines a set of utility methods for working with Well-Known-Text.
   * NOTE: All vertices used in Atlas use "x" as longitude and "y" as latitude and these methods
   * expect this format. WKT and OpenLayers uses the opposite.
   * @class atlas.util.WKT
   */
  WKT = Instances.defineGlobal(Class.extend(/** @lends atlas.util.WKT# */ {

    _init: function() {
      this.parser = new OpenLayers.Format.WKT();
    },

    /**
     * @param {String} wktStr - The WKT string to convert
     * @returns {Array.<Array.<atlas.model.Vertex>>} The converted vertices.
     */
    verticesFromWKT: function(wktStr) {
      var points = wktStr.match(/([+-]?[\d\.]+\s*)+/g).map(function(match){
        return match.split(/\s+/).map(function(component){
          return parseFloat(component);
        });
      });
      var vertices = points.map(function(point){
        return new Vertex(point[1], point[0], point[2]);
      });
      return [vertices];
    },

    /**
     * @param {String} wktStr - The WKT string to convert
     * @returns {Array.<Array.<atlas.model.GeoPoint>>} The converted polygon.
     */
    geoPointsFromWKT: function(wktStr) {
      return this._verticesToGeoPoints(this.verticesFromWKT(wktStr));
    },

    /**
     * @param {String} wktStr - The WKT string to convert
     * @returns {Object} args
     * @returns {OpenLayers.Geometry.Collection} args.geometry
     */
    openLayersGeometryFromWKT: function(wktStr) {
      var result = this.parser.read(wktStr);
      if (!result) return null;
      return result.geometry;
    },

    /**
     * @param {OpenLayers.Geometry.Collection|OpenLayers.Geometry.Point} geometry - The geometry to convert.
     * @returns {Array.<Array.<atlas.model.Vertex>>|atlas.model.Vertex} An array of Vertices forming a closed polygon.
     */
    verticesFromOpenLayersGeometry: function(geometry) {
      var vertices = [];
      if (geometry instanceof OpenLayers.Geometry.Point) {
        // TODO(aramk) This is inconsistent - prefer to return an array containing an array
        // containing the Vertex.
        return this.vertexFromOpenLayersPoint(geometry);
      } else {
        // NOTE: This is flattenning the vertices into a single array.
        return [geometry.getVertices().map(this.vertexFromOpenLayersPoint, this)];
      }
    },

    /**
     * @param {OpenLayers.Geometry.Collection|OpenLayers.Geometry.Point} geometry - The geometry to convert.
     * @returns {Array.<Array.<atlas.model.GeoPoint>>|atlas.model.GeoPoint} An array of points forming a closed polygon.
     */
    geoPointsFromOpenLayersGeometry: function(geometry) {
      return this._verticesToGeoPoints(this.verticesFromOpenLayersGeometry(geometry));
    },

    /**
     * @param  {OpenLayers.Geometry.Point} point - The point to be converted.
     * @returns {atlas.model.Vertex}
     */
    vertexFromOpenLayersPoint: function(point) {
      // NOTE: OpenLayers treats latitude as x, longitude as y.
      return new Vertex(point.y, point.x);
    },

    /**
     * @param  {OpenLayers.Geometry.Point} point - The point to be converted.
     * @returns {atlas.model.GeoPoint}
     */
    geoPointFromOpenLayersPoint: function(point) {
      // NOTE: OpenLayers treats latitude as x, longitude as y.
      return new GeoPoint({longitude: point.y, latitude: point.x});
    },

    /**
     * @param {Array.<atlas.model.Vertex>} vertices
     * @returns {Array.<OpenLayers.Geometry.Point>}
     */
    openLayersPointsFromVertices: function(vertices) {
      var points = [];
      for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        // NOTE: OpenLayers treats latitude as x, longitude as y. Atlas uses the opposite.
        var point = new OpenLayers.Geometry.Point(vertex.y, vertex.x);
        points.push(point);
      }
      return points;
    },

    /**
     * @param {Array.<atlas.model.GeoPoint>} points
     * @returns {Array.<OpenLayers.Geometry.Point>}
     */
    openLayersPointsFromGeoPoints: function(points) {
      return this.openLayersPointsFromVertices(GeoPoint.arrayToVertices(points));
    },

    /**
     * @param {Array.<atlas.model.Vertex>} vertices
     * @returns {OpenLayers.Geometry.Polygon}
     */
    openLayersPolygonFromVertices: function(vertices) {
      var points = this.openLayersPointsFromVertices(vertices);
      var ring = new OpenLayers.Geometry.LinearRing(points);
      var components = ring.components;
      if (components.length > 1) {
        components.pop();
      }
      // Ensure the ring is closed.
      if (components.length > 0 && components[0] !== components.slice(-1)) {
        components.push(components[0]);
      }
      return new OpenLayers.Geometry.Polygon([ring]);
    },

    /**
     * @param {Array.<atlas.model.GeoPoint>} points
     * @returns {OpenLayers.Geometry.Polygon}
     */
    openLayersPolygonFromGeoPoints: function(points) {
      return this.openLayersPolygonFromVertices(GeoPoint.arrayToVertices(points));
    },

    /**
     * @param {Array.<atlas.model.Vertex>} vertices
     * @returns {OpenLayers.Geometry.Polygon}
     */
    openLayersPolylineFromVertices: function(vertices) {
      var points = this.openLayersPointsFromVertices(vertices);
      return new OpenLayers.Geometry.LineString(points);
    },

    /**
     * @param {Array.<atlas.model.GeoPoint>} points
     * @returns {OpenLayers.Geometry.Polygon}
     */
    openLayersPolylineFromGeoPoints: function(points) {
      return this.openLayersPolylineFromVertices(GeoPoint.arrayToVertices(points));
    },

    /**
     * @param {Array.<atlas.model.Vertex>} vertices
     * @returns {String}
     */
    // TODO(aramk) Rename this to indicate that it creates polygons.
    // TODO(aramk) Also support LINESTRING and POINT.
    wktFromVertices: function(vertices) {
      var polygon = this.openLayersPolygonFromVertices(vertices);
      return this.parser.extractGeometry(polygon);
    },

    /**
     * @param {Array.<atlas.model.GeoPoint>} points - The points to convert.
     * @returns {String}
     */
    wktFromGeoPoints: function(points) {
      return this.wktFromVertices(GeoPoint.arrayToVertices(points));
    },

    /**
     * @param {atlas.model.GeoPoint} point
     * @return {String}
     */
    wktFromGeoPoint: function(point) {
      var point = this.openLayersPointsFromGeoPoints([point])[0];
      return this.parser.extractGeometry(point);
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
      throw 'WKT.scaleVertices does not work.';
      var polygon = this.openLayersPolygonFromVertices(vertices);
      var scaleAspectRatio = scaleBy.x / scaleBy.y;
      polygon.resize(scaleBy.x, polygon.getCentroid, scaleAspectRatio);
      return this.verticesFromOpenLayersGeometry(polygon);
    },

    /**
     * @param {Array} coords - An array of coordinates as either 2 elements in an array, or an
     * object with x and y coordinate keys.
     * @returns {Array} A new array with the coordinate points swapped in-place.
     */
    swapCoords: function(coords) {
      coords.forEach(function(coord) {
        if (coord.x !== undefined) {
          var x = coord.x;
          coord.x = coord.y;
          coord.y = x;
        } else if (coord.length === 2) {
          var tmp = coords[0];
          coords[0] = coords[1];
          coords[1] = tmp;
        } else {
          throw new DevError('Invalid arguments', coords);
        }
      });
      return coords;
    },

    _verticesToGeoPoints: function(vertices) {
      var isMultiPolygon = Types.isArrayLiteral(vertices[0]);
      var innerArray = isMultiPolygon ? vertices[0] : vertices;
      innerArray = innerArray.map(function(vertex) {
        return GeoPoint.fromVertex(vertex);
      });
      return isMultiPolygon ? [innerArray] : innerArray;
    },

    _isType: function(wktStr, type) {
      if (!Types.isString(wktStr)) {
        return false;
      }
      wktStr = wktStr.trim();
      return wktStr.indexOf(type) === 0;
    },

    isPoint: function(wktStr) {
      return this._isType(wktStr, 'POINT');
    },

    isLine: function(wktStr) {
      return this._isType(wktStr, 'LINESTRING');
    },

    isPolygon: function(wktStr) {
      return this._isType(wktStr, 'POLYGON');
    },

    isWKT: function(wktStr) {
      return this.isPoint(wktStr) || this.isLine(wktStr) || this.isPolygon(wktStr);
    }

  }));

  return WKT;
});
