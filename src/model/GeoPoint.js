define([
  'atlas/util/AtlasMath',
  'atlas/util/Class',
  'atlas/util/mixin',
  'atlas/util/DeveloperError'
], function(AtlasMath, Class, mixin, DeveloperError) {

  /**
   * @typedef atlas.model.GeoPoint
   * @ignore
   */
  var GeoPoint;

  /**
   * @classdesc The GeoPoint class represents a geospatial location on a globe. The location
   * is specified with latitude, longitude, and elevation.
   * @param {Number} [latitude=0] - The GeoPoint's latitude in decimal degrees.
   * @param {Number} [longitude=0] - The GeoPoint's longitude in decimal degrees.
   * @param {Number} [elevation=0] - The GeoPoint's elevation in decimal degrees.
   * @class atlas.model.GeoPoint
   */
  GeoPoint = Class.extend(/** @lends atlas.model.GeoPoint# */ {

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
    _init: function() {
      if (typeof arguments[0] === 'object') {
        this._setFromObject.apply(this, arguments);
      } else {
        this._setFromArgs.apply(this, arguments);
      }
    },

    _setFromObject: function(args) {
      if (args.x !== undefined) {
        this._setFromArgs(args.x, args.y, args.z);
      } else {
        this._setFromArgs(args.latitude || args.lat, args.longitude || args.lng,
                args.elevation || args.height);
      }
    },

    _setFromArgs: function(latitude, longitude, elevation) {
      this.latitude = parseFloat(latitude) || 0.0;
      this.longitude = parseFloat(longitude) || 0.0;
      this.elevation = parseFloat(elevation) || 0.0;
    },

    // -------------------------------------------------
    // OPERATIONS
    // -------------------------------------------------

    /**
     * Subtracts a GeoPoint from this GeoPoint
     * @param {atlas.model.GeoPoint} other
     * @returns {atlas.model.GeoPoint}
     */
    subtract: function(other) {
      return new GeoPoint(this.latitude - other.latitude,
              this.longitude - other.longitude,
              this.elevation - other.elevation);
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Translates this GeoPoint by a given difference in latitude and longitude.
     * @param {atlas.model.GeoPoint | {latitude, longitude}} other
     * @returns {atlas.model.GeoPoint}
     */
    translate: function(other) {
      return new GeoPoint(this.latitude + other.latitude,
              this.longitude + other.longitude, this.elevation);
    },

    // -------------------------------------------
    // GENERATORS AND CONVERTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.Vertex} The GeoPoint as a new Vertex object.
     */
    toVertex: function() {
      // TODO(aramk) This uses cartographic coordinates for Vertex, which should be in cartesian.
      throw new DeveloperError('GeoPoint.toVertex not implemented.');
    },

    /**
     * @returns {atlas.model.GeoPoint} The GeoPoint with latitude and longitude converted to Radians.
     */
    toRadians: function() {
      return new GeoPoint(AtlasMath.toRadians(this.latitude),
          AtlasMath.toRadians(this.longitude), this.elevation);
    },

    /**
     * @returns {{degrees: Number, minutes: Number, seconds: Number}}
     * The GeoPoint as a map to degrees, minutes, and seconds values.
     */
    toDmsString: function() {
      throw 'GeoPoint.toDmsString not yet implemented.';
    }

  });

  return mixin(GeoPoint, {
    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    /**
     * Constructs a new {@link GeoPoint} from an object containing properties for latitude,
     * longitude (both in radians), and height.
     * @returns {atlas.model.GeoPoint}
     * @memberOf atlas.model.GeoPoint
     * @static
     */
    fromRadians: function(pos) {
      var point = new GeoPoint(pos);
      point.latitude = AtlasMath.toDegrees(point.latitude);
      point.longitude = AtlasMath.toDegrees(point.longitude);
      return point;
    },

    /**
     * Constructs a new GeoPoint from a Vertex object.
     * @param {atlas.model.Vertex} vertex - The vertex.
     * @param {Number} vertex.x - The longitude (horizontal position) in decimal degrees.
     * @param {Number} vertex.y - The latitude (vertical position) in decimal degrees.
     * @param {Number} vertex.z - The elevation in metres.
     * @returns {atlas.model.GeoPoint}
     * @memberOf atlas.model.GeoPoint
     * @static
     */
    fromVertex: function(vertex) {
      if (!vertex) {
        return new GeoPoint();
      }
      return new GeoPoint(vertex.y, vertex.x, vertex.z);
    },

    /**
     * Constructs a new GeoPoint from an object containing properties for latitude,
     * longitude, and height.
     * @param other - The object containing the geospatial data.
     * @returns {atlas.model.GeoPoint}
     * @memberOf atlas.model.GeoPoint
     * @static
     */
    fromLatLngHeight: function(other) {
      return new GeoPoint(other.lat, other.lng, other.height);
    }

  });
});
