define([
  'atlas/model/Vertex',
  'atlas/util/AtlasMath',
  'atlas/util/Class',
  'atlas/util/mixin',
  'atlas/util/DeveloperError'
], function(Vertex, AtlasMath, Class, mixin, DeveloperError) {

  /**
   * @classdesc The Point class represents a geospatial location on a globe. The location
   * is specified with latitude, longitude, and elevation.
   * @param {Number} [latitude=0] - The GeoPoint's latitude in decimal degrees.
   * @param {Number} [longitude=0] - The GeoPoint's longitude in decimal degrees.
   * @param {Number} [elevation=0] - The GeoPoint's elevation in decimal degrees.
   * @class atlas.model.GeoPoint
   */
  var GeoPoint = Class.extend(/** @lends atlas.model.GeoPoint# */ {
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
     * @ignore
     */
    _init: function() {
      if (typeof arguments[0] === 'object') {
        this._setFromObject(arguments[0]);
      } else {
        this._setFromArgs.apply(this, arguments);
      }
    },

    _setFromObject: function(args) {
      this._setFromArgs(args.latitude || args.lat, args.longitude || args.lng,
              args.elevation || args.height);
    },

    _setFromArgs: function(lat, lng, elevation) {
      this.latitude = parseFloat(lat) || 0.0;
      this.longitude = parseFloat(lng) || 0.0;
      this.elevation = parseFloat(elevation) || 0.0;
    },

    /**
     * @returns {atlas.model.Vertex} The GeoPoint as a new Vertex object.
     */
    toVertex: function() {
      // TODO(aramk) This uses cartographic coordinates for Vertex, which should be in cartesian.
      throw new DeveloperError('GeoPoint.toVertex not implemented.');
    },

    /**
     * @returns {atlas.model.GeoPoint} A clone of this point with degrees converted to radians.
     */
    toRadians: function () {
      var point = new GeoPoint(this);
      point.latitude = AtlasMath.toRadians(point.latitude);
      point.longitude = AtlasMath.toRadians(point.longitude);
      return point;
    },

    toDmsString: function() {
      throw 'GeoPoint.toDmsString not yet implemented.';

      var latDms = AtlasMath.toDMS(this.latitude),
          lngDms = AtlasMath.toDMS(this.longitude),
          latMarker = this.latitude < 0 ? 'S' : 'N',
          lngMarker = this.longitude < 0 ? 'W' : 'E',
          dms = '';
    }

  });

  return mixin(GeoPoint, {
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
    fromVertex: function(vertex) {
      if (!vertex) {
        return new GeoPoint();
      }
      return new GeoPoint(vertex.y, vertex.x, vertex.y);
    },

    /**
     * Constructs a new {@link GeoPoint} from an object containing properties for latitude,
     * longitude (both in radians), and height.
     * @returns {atlas.model.GeoPoint}
     */
    fromRadians: function(pos) {
      var point = new GeoPoint(pos);
      point.latitude = AtlasMath.toDegrees(point.latitude);
      point.longitude = AtlasMath.toDegrees(point.longitude);
      return point;
    }
  });
});
