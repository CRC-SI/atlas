define([
  'atlas/model/Vertex',
  'atlas/util/AtlasMath',
  'atlas/util/Class'
], function (Vertex, AtlasMath, Class) {

  /**
   * @typedef atlas.model.GeoPoint
   * @ignore
   */
  var GeoPoint;

  /**
   * @classdesc The GeoPoint class represents a geospatial location on a globe. The location
   * is specified with latitude, longitude, and elevation.
   * @param {Number} [lat=0] - The GeoPoint's latitude in decimal degrees.
   * @param {Number} [lng=0] - The GeoPoint's longitude in decimal degrees.
   * @param {Number} [elevation=0] - The GeoPoint's elevation in decimal degrees.
   * @class atlas.model.GeoPoint
   */
  GeoPoint = Class.extend( /** @lends atlas.model.GeoPoint# */ {

    /**
     * The GeoPoint's latitude in decimal degrees.
     * @type {Number}
     */
    latitude: null,

    /**
     * The GeoPoint's longitude in decimal degrees.
     * @type {Number}
     */
    longitude: null,

    /**
     * The GeoPoint's elevation in metres.
     * @type {Number}
     */
    elevation: null,

    /*
     * Constructs a new GeoPoint object.
     */
    _init: function (latitude, longitude, elevation) {
      if (latitude.latitude !== undefined) {
        longitude = latitude.longitude;
        elevation = latitude.elevation;
        latitude = latitude.latitude;
      } else if (latitude.x) {
        longitude = latitude.y;
        elevation = latitude.z;
        latitude = latitude.x;
      }
      this.latitude = parseFloat(latitude) || 0.0;
      this.longitude = parseFloat(longitude) || 0.0;
      this.elevation = parseFloat(elevation) || 0.0;
    },

    // -------------------------------------------
    // GENERATORS AND CONVERTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.Vertex} The GeoPoint as a new Vertex object.
     */
    toVertex: function () {
      return new Vertex(this.longitude, this.latitude, this.elevation);
    },

    /**
     * @returns {{degrees: Number, minutes: Number, seconds: Number}}
     * The GeoPoint as a map to degrees, minutes, and seconds values.
     */
    toDmsString: function () {
      throw 'GeoPoint.toDmsString not yet implemented.';
    },

    /**
     * @returns {atlas.model.GeoPoint} The GeoPoint with latitude and longitude converted to Radians.
     */
    toRadians: function () {
      return new GeoPoint(AtlasMath.toRadians(this.latitude),
          AtlasMath.toRadians(this.longitude), this.elevation);
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Translates this GeoPoint by a given difference in latitude and longitude.
     * @param {atlas.model.GeoPoint | {latitude, longitude}} other
     * @returns {atlas.model.GeoPoint}
     */
    translate: function (other) {
      return new GeoPoint(this.latitude + other.latitude,
          this.longitude + other.longitude, this.elevation);
    }
  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  /**
   * Constructs a new GeoPoint from a Vertex object.
   * @param {atlas.model.Vertex} vertex - The vertex.
   * @param {Number} vertex.x - The longitude (horizontal position) in decimal degrees.
   * @param {Number} vertex.y - The latitude (vertical position) in decimal degrees.
   * @param {Number} vertex.z - The elevation in metres.
   * @returns {atlas.model.GeoPoint}
   */
  GeoPoint.fromVertex = function (vertex) {
    if (!vertex) { return new GeoPoint(); }
    return new GeoPoint(vertex.x, vertex.y, vertex.z);
  };

  /**
   * Constructs a new GeoPoint from an object containing properties for latitude,
   * longitude, and height.
   * @param other - The object containing the geospatial data.
   * @returns {atlas.model.GeoPoint}
   */
  GeoPoint.fromLatLngHeight = function (other) {
    return new GeoPoint(other.lat, other.lng, other.height);
  };

  return GeoPoint;
});
