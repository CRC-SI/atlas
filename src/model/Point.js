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
   * @classdesc Represents a single point.
   *
   * @param {Number} id - The ID of this Point.
   * @param {Object} data - Data describing the Point.
   * @param {atlas.model.GeoPoint|String} [data.position] The position of the Point. This can
   *     optionally be a WKT string. If not provided, both <code>longitude</code> and
   *     <code>latitude</code> are expected.
   * @param {Number} [data.longitude]
   * @param {Number} [data.latitude]
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
      var position = data.position;
      if (Types.isString(position)) {
        var wkt = WKT.getInstance();
        position = wkt.geoPointsFromWKT(position)[0][0];
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
     * @return {atlas.model.GeoPoint} The primitive point model.
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
    }

  });

  return Point;
});
