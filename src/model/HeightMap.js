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
     * The geographic location of the origin of the height map. If <code>_offsetX</code> and
     * <code>offsetY</code> are both <code>0</code> this corresponds to the centroid of
     * the HeightMap.
     *
     * @type {atlas.model.GeoPoint}
     * @private
     */
    _geoLocation: null,

    /**
     * The offset of the HeightMap from it's origin along the UTM eastings axis, in metres. Note;
     * positive eastings are in the east direction.
     *
     * @type {Number}
     * @private
     */
    _offsetX: null,

    /**
     * The offset of the HeightMap from it's origin along the UTM northings axis, in metres. Note;
     * positive northings are in the north direction.
     *
     * @type {Number}
     * @private
     */
    _offsetY: null,

    /**
     * The height (parallel to UTM northings) of the height map, in metres.
     *
     * @type {Number}
     * @private
     */
    _height: null,

    /**
     * The width (parallel to UTM eastings) of the height map square, in metres.
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
     * given sample point.
     *
     * The "top left" element (ie. <code>_elevationData[0][0]</code>) is the north west corner. The
     * innermost array proceeds eastwards as its index increases and the outer array working
     * southwards as its index increases. ie <code>_elevationData[0][5]</code> is further east and
     * <code>_elevationData[5][0]</code> is further south.
     *
     * The geographic position of the top left element is <code>this._offsetX</code> east and
     * <code>this._offsetY</code> north of <code>this._geoLocation</code>
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
      this._geoLocation = new GeoPoint(Setter.require(args, 'geoLocation', 'HeightMap'));
      this._resolution = Setter.require(args, 'resolution', 'HeightMap');
      this._width = Setter.require(args, 'width', 'HeightMap');
      this._height = Setter.require(args, 'height', 'HeightMap');
      this._elevationData = Setter.require(args, 'points', 'HeightMap');

      this._offsetX = Setter.def(args.x, 0);
      this._offsetY = Setter.def(args.z, 0);

      if (this._elevationData.length !== this._resolution) {
        throw new Error('Terrain model resolution does not match data');
      }
      if (this._elevationData[0].length !== this._resolution) {
        throw new Error('Terrain model resolution does not match data');
      }

      this._modelExtent = this._calculateExtent();
    },

    _calculateExtent: function() {
      var centroidUtm = this._centroidUtmFromGeoLocation();
      var centroidX = centroidUtm.coord.x;
      var centroidY = centroidUtm.coord.y;

      var utm = {
        zone: centroidUtm.zone,
        isSouthern: centroidUtm.isSouthern
      };

      // Calculate limits of extent
      utm.coord = {
        x: centroidX,
        y: centroidY + (this._height / 2),
      };
      var north = GeoPoint.fromUtm(utm).latitude;

      utm.coord = {
        x: centroidX,
        y: centroidY - (this._height / 2),
      };
      var south = GeoPoint.fromUtm(utm).latitude;

      utm.coord = {
        x: centroidX + (this._width / 2),
        y: centroidY
      };
      var east = GeoPoint.fromUtm(utm).longitude;

      utm.coord = {
        x: centroidX - (this._width / 2),
        y: centroidY
      };
      var west = GeoPoint.fromUtm(utm).longitude;

      return new Rectangle(north, south, east, west);
    },

    _displayExtent: function() {
      var extent = this._modelExtent.toJson();

      window.cesiumAtlas.publish('entity/create', { // jshint ignore: line
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

    /**
     * @returns {atlas.model.GeoLocation} The GeoLocation of the HeightMap.
     */
    getGeoLocation: function() {
      if (this._offsetX || this._offsetY) {
        return GeoPoint.fromUtm(this._centroidUtmFromGeoLocation());
      }
      return this._geoLocation;
    },

    /**
     * Converts the GeoLocation of the HeightMap into the centroid, accounting for any offset of
     * the HeightMap, in UTM format.
     *
     * @returns {UTM}
     * @private
     */
    _centroidUtmFromGeoLocation: function() {
      var geoLocationUtm = this._geoLocation.toUtm();

      // If the HeightMap is offset, a counter offset is calculated.
      // => geoLocationUtm.x + this._offsetX = north west corner easting value
      //    => north west corner easting value + (this._width / 2) = centroid easting value.
      // => geoLocationUtm.y + this._offsetY = north west corner northing value
      //    => north west corner northing value - (this._height / 2) = centroid northing value.
      // N.B: Eastings are monotonic east to west, northings are monotonic south to north.
      var offsetToCentroidX = this._offsetX ? this._offsetX + (this._width / 2) : 0;
      var offsetToCentroidY = this._offsetY ? this._offsetY - (this._height / 2) : 0;

      geoLocationUtm.coord.x += offsetToCentroidX;
      geoLocationUtm.coord.y += offsetToCentroidY;

      return geoLocationUtm;
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
      return elevations ? elevations : [];
    },

    /**
     * Returns the elevation for at a given GeoPoint, or <code>null</code> if that GeoPoint is not
     * within the defined terrain elevation model.
     *
     * @param {atlas.model.GeoPoint} geoPoint - The point to sample at.
     * @returns {Number|null} The terrain elevation or <code>null</code> if the point is not in the
     *     terrain model.
     */
    sampleTerrainAtPoint: function(geoPoint) {
      if (!this._containsPoint(geoPoint)) {
        return null;
      }
      var northSouth = this._getNorthSouthIndex(geoPoint.latitude);
      var eastWest = this._getEastWestIndex(geoPoint.longitude);

      var elevation = this._elevationData[northSouth][eastWest];

      return elevation === HeightMap.NULL_ELEVATION ? null : elevation;
    },

    /**
     * Determines the row index into the terrain model for the given value of latitude.
     *
     * @param {Number} latitude - The latitude.
     * @returns {Number} The index.
     */
    _getNorthSouthIndex: function(latitude) {
      var north = this._modelExtent.getNorth();
      var south = this._modelExtent.getSouth();
      return this._lerpResolution(north, south, latitude);
    },

    /**
     * Determines the column index into the terrain model for the given value of longitude.
     *
     * @param {Number} longitude - The longitude.
     * @returns {Number} The index.
     */
    _getEastWestIndex: function(longitude) {
      var east = this._modelExtent.getEast();
      var west = this._modelExtent.getWest();
      return this._lerpResolution(west, east, longitude);
    },

    /**
     * Given a value and an upper and lower bound; an index into the terrain model (either
     * in eastings or northings) is determined by interpolating the models resolution (the model
     * array's dimensions) by where <code>value</code> falls between <code>hi</code> and
     * <code>lo</code>.
     *
     * @returns {Number} The index.
     */
    _lerpResolution: function(hi, lo, value) {
      var actualDiff = value - hi;
      var maxDiff = lo - hi;
      if (Math.abs(actualDiff) === Math.abs(maxDiff)) {
        return this._resolution - 1;
      }
      var index = Math.abs(Math.floor(actualDiff / maxDiff * this._resolution));
      return index;
    },

    /**
     * @param {atlas.model.GeoPoint} geoPoint - GeoPoint to check.
     * @returns {Boolean} True if the given GeoPoint is contained in the elevation model.
     * @private
     */
    _containsPoint: function(geoPoint) {
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
