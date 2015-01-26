define([
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Setter',
  'atlas/model/GeoPoint',
  'atlas/model/Rectangle'
], function(Class, Setter, GeoPoint, Rectangle) {
  /**
   * @typedef {atlas.model.HeightMap}
   * @ignore
   */
  var HeightMap;

  /**
   * @classdesc Represents a model of terrain elevation. The model is a square representation of
   * a given geographic area, with sample points of the terrain elevation at regular intervals.
   * This terrain elevation is relative to the equivalent height of a WGS84 ellipsoid.
   *
   * @class atlas.model.HeightMap
   */
  HeightMap = Class.extend(/** @lends atlas.model.HeightMap# */ {

    /**
     * The geographic location of the centre of the height map.
     *
     * @type {atlas.model.GeoPoint}
     * @private
     */
    _geoLocation: null,

    /**
     * The height (parallel to longitude lines) of the height map, in metres.
     *
     * @type {Number}
     * @private
     */
    _height: null,

    /**
     * The width (parallel to latitude lines) of the height map square, in metres.
     *
     * @type {Number}
     * @private
     */
    _width: null,

    /**
     * Number of sample points across the width and height of the height map.
     *
     * @type {Number}
     * @private
     */
    _resolution: null,

    /**
     * The elevation data model for the height map. Each element is the height of the terrain at the
     * given sample point. The data is in row-major order, where rows are parallel to the lines
     * of latitude.
     *
     * @type {Array.Array.<Number>}
     * @private
     */
    _elevationData: null,

    /**
     * Rectangle describing the extent of the terrain model.
     *
     * @type {atlas.model.Rectangle}
     * @private
     */
    _modelExtent: null,

    _init: function(args) {
      this._geoLocation = new GeoPoint(Setter.require(args, 'geoLocation'));
      this._resolution = Setter.require(args, 'resolution');
      this._width = Setter.require(args, 'width');
      this._height = Setter.require(args, 'height');
      this._elevationData = Setter.require(args, 'points');

      this._shiftX = Setter.def(args.x, 0);
      this._shiftY = Setter.def(args.z, 0);

      if (this._elevationData.length !== this._resolution) {
        throw new Error('Terrain model resolution does not match data');
      }
      if (this._elevationData[0].length !== this._resolution) {
        throw new Error('Terrain model resolution does not match data');
      }

      this._modelExtent = this._calculateExtent();
    },

    _calculateExtent: function() {
      var centroidUtm = this._geoLocation.toUtm();
      var zone = centroidUtm.zone;
      var isSouthern = centroidUtm.isSouthern;
      var centroidX = centroidUtm.coord.x + this._shiftX;
      var centroidY = centroidUtm.coord.y + this._shiftY;

      var north = GeoPoint.fromUtm({
        coord: {
          x: centroidX - (this._height / 2),
          y: centroidY
        },
        zone: zone,
        isSouthern: isSouthern
      }).latitude;

      var south = GeoPoint.fromUtm({
        coord: {
          x: centroidX + (this._height / 2),
          y: centroidY
        },
        zone: zone,
        isSouthern: isSouthern
      }).latitude;

      var east = GeoPoint.fromUtm({
        coord: {
          x: centroidX,
          y: centroidY + (this._width / 2)
        },
        zone: zone,
        isSouthern: isSouthern
      }).longitude;

      var west = GeoPoint.fromUtm({
        coord: {
          x: centroidX,
          y: centroidY - (this._width / 2)
        },
        zone: zone,
        isSouthern: isSouthern
      }).longitude;

      // TODO(bpstudds): Why do the north/south and east/west need to be swapped? Something to do
      // with UTM?
      if (isSouthern) {
        return new Rectangle(north, south, east, west);
      } else {
        return new Rectangle(south, north, west, east);
      }
    },

    _centroidFromGeoLocation: function() {
      var localGeoLocation = this._geoLocation.toUtm();

      // TODO(bpstudds): Update this when the actual height map format changes.
      localGeoLocation.coord.x += this._shiftX;
      localGeoLocation.coord.y += this._shiftY;
      return new GeoPoint.fromUtm(localGeoLocation);
    }

  });

  return HeightMap;

});
