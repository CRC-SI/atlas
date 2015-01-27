define([
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/GeoPoint',
  'atlas/model/Rectangle'
], function(Class, Log, Setter, GeoPoint, Rectangle) {
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
      this._displayExtent();
    },

    _calculateExtent: function() {
      var centroidUtm = this._geoLocation.toUtm();
      var zone = centroidUtm.zone;
      var isSouthern = centroidUtm.isSouthern;
      Log.debug('Calculating height map extent with centroid half shift');
      var centroidX = centroidUtm.coord.x + (this._shiftX / 2);
      var centroidY = centroidUtm.coord.y + (this._shiftY / 2);

      var utm = {
        zone: zone,
        isSouthern: isSouthern
      };

      // Calculate limits of extent
      utm.coord = {
        x: centroidX,
        y: centroidY + (this._height / 2),
      }
      var north = GeoPoint.fromUtm(utm).latitude;

      utm.coord = {
        x: centroidX,
        y: centroidY - (this._height / 2),
      }
      var south = GeoPoint.fromUtm(utm).latitude;

      utm.coord = {
        x: centroidX + (this._width / 2),
        y: centroidY
      }
      var east = GeoPoint.fromUtm(utm).longitude;

      utm.coord = {
        x: centroidX - (this._width / 2),
        y: centroidY
      }
      var west = GeoPoint.fromUtm(utm).longitude;

      var extent = new Rectangle(north, south, east, west);
      return extent;
    },

    _displayExtent: function() {
      var extent = {north: this._modelExtent.getNorth(), south: this._modelExtent.getSouth(),
          east: this._modelExtent.getEast(), west: this._modelExtent.getWest()};

      window.cesiumAtlas.publish('entity/create', {
        id: 'heightmap-extent',
        polygon: {
          vertices: [
            {latitude: extent.north, longitude: extent.west}, // NW
            {latitude: extent.north, longitude: extent.east}, // NE
            {latitude: extent.south, longitude: extent.east}, // SE
            {latitude: extent.south, longitude: extent.west}  // SW
          ],
          elevation: 0
        },
        show: true
      });
    },

    _centroidFromGeoLocation: function() {
      return new GeoPoint(this._geoLocation);
      var localGeoLocation = this._geoLocation.toUtm();

      // TODO(bpstudds): Update this when the actual height map format changes.
      localGeoLocation.coord.x += this._shiftX;
      localGeoLocation.coord.y += this._shiftY;
      return new GeoPoint.fromUtm(localGeoLocation);
    },

    /**
     * Returns an array of terrain elevation for the given <code>GeoPoints</code>, or
     * an empty array if the all of the GeoPoints do not reside within the terrain.
     *
     * @param {Array.<atlas.model.GeoPoint>} geoPoints - The GeoPoints to retrieve the terrain
     *     elevation for.
     * @returns {Array.<Number>}
     */
    sampleTerrain: function(geoPoints) {
      var elevations = geoPoints.map(this.sampleTerrainAtPoint, this).filter(function(element) {
        return !!element;
      });
      if (!elevations) {return [];}
      return elevations;
    },

    /**
     * Returns the elevation for at a given GeoPoint, or null if that GeoPoint is not within the
     * defined terrain elevation model.
     * @param {[type]} geoPoint [description]
     * @returns {[type]} [description]
     */
    sampleTerrainAtPoint: function(geoPoint) {
      if (!this._pointInModel(geoPoint)) {return null;}
      var row = this._getModelRowIndex(geoPoint.latitude);
      var col = this._getModelColIndex(geoPoint.longitude);
      var elevation = this._elevationData[row][col];
      return elevation === HeightMap.NULL_ELEVATION ? null : elevation;
    },

    _getModelRowIndex: function(latitude) {
      var north = this._modelExtent.getNorth();
      var south = this._modelExtent.getSouth();
      return this._lerpResolution(north, south, latitude);
    },

    _getModelColIndex: function(longitude) {
      var east = this._modelExtent.getEast();
      var west = this._modelExtent.getWest();
      return this._lerpResolution(west, east, longitude);
    },

    _lerpResolution: function(hi, lo, value) {
      var f = value - hi;
      var diff = lo - hi;
      if (Math.abs(f) === Math.abs(diff)) {
        return this._resolution - 1;
      }
      var index = Math.abs(Math.floor(f / diff * this._resolution));
      return index;
    },

    _pointInModel: function(geoPoint) {
      return this._modelExtent.containsPoint(geoPoint);
    }

  });

  /**
   * Value signify that a particular sample point for the terrain model is not set, and thus the
   * terrain should default to some value.
   * @type {Number}
   */
  HeightMap.NULL_ELEVATION = -1000000;

  return HeightMap;

});
