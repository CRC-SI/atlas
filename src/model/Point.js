define([
  'atlas/lib/utility/Setter',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError',
  // Base class
  'atlas/model/VertexedEntity'
], function(Setter, GeoPoint, DeveloperError, VertexedEntity) {

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
   * @param {atlas.model.GeoPoint} [data.vertices=[]] - Either a WKT string or
   *     an array of vertices describing the Point.
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
     * The primitive point model.
     * @type {atlas.model.GeoPoint}
     */
    _point: null,

    /**
     * Constructs a new Point.
     * @ignore
     */
    _setup: function(id, data, args) {
      this._point = new GeoPoint({longitude: data.longitude, latitude: data.latitude,
          elevation: data.elevation});
      data.vertices = [this._point];
      this._super(id, data, args);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @return {atlas.model.GeoPoint} The primitive point model.
     */
    getPosition: function() {
      return this._point.clone();
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
