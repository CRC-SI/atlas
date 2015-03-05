define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError',
  // Base class
  'atlas/model/VertexedEntity',
  'atlas/util/WKT'
], function(Setter, Types, GeoPoint, DeveloperError, VertexedEntity, WKT) {

  /**
   * @typedef atlas.model.Point
   * @ignore
   */
  var Point;

  /**
   * @classdesc Represents a single point that can be rendered.
   *
   * @param {Number} id - The ID of this Point.
   * @param {Object} data - Data describing the Point.
   * @param {atlas.model.GeoPoint|String} [data.position] The position of the Point. This can
   *     optionally be a WKT string. If not provided, both <code>longitude</code> and
   *     <code>latitude</code> are expected.
   * @param {Number} [data.longitude] - The longitude in decimal degrees.
   * @param {Number} [data.latitude] - The latitude in decimal degrees.
   * @param {Number} [data.elevation] - The elevation of the base of the Point.
   * @returns {atlas.model.Point}
   *
   * @class atlas.model.Point
   * @extends atlas.model.VertexedEntity
   */
  Point = VertexedEntity.extend(/** @lends atlas.model.Point# */ {

    /**
     * The position of the Point.
     * @type {atlas.model.GeoPoint}
     */
    _position: null,

    /**
     * Constructs a new Point.
     * @ignore
     */
    _setup: function(id, data, args) {
      var position = new GeoPoint(data.position);
      if (Types.isString(position)) {
        var wkt = WKT.getInstance();
        position = wkt.geoPointsFromWKT(position)[0];
      } else if (!position) {
        position = new GeoPoint({longitude: data.longitude, latitude: data.latitude,
            elevation: data.elevation});
      }
      this._position = position;
      data.vertices = [position];
      this._super(id, data, args);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.GeoPoint} The primitive point model.
     */
    getPosition: function() {
      return this._position.clone();
    },

    toJson: function() {
      var point = this.getPosition();
      var json = Setter.merge(this._super(), {
        type: 'point',
        longitude: point.longitude,
        latitude: point.latitude,
        elevation: point.elevation
      });
      return json;
    },

    getOpenLayersGeometry: function(args) {
      var wkt = WKT.getInstance();
      if (args && args.utm) {
        return wkt.openLayersPointsFromVertices([this._position.toUtm().coord])[0];
      } else {
        return wkt.openLayersPointsFromGeoPoints([this._position])[0];
      }
    }

  });

  return Point;
});
