define([
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Class',
  'atlas/model/GeoPoint',
  'underscore',
], function(Types, Class, GeoPoint, _) {

  /**
   * @typedef atlas.model.Rectangle
   * @ignore
   */
  var Rectangle;

  /**
   * @classdesc Represents a rectangle with north, south, east and west sides.
   * @class atlas.model.Rectangle
   */
  Rectangle = Class.extend(/** @lends atlas.model.Rectangle# */ {

    /**
     * @type {Number} The north side's latitude in decimal degrees.
     */
    north: null,

    /**
     * @type {Number} The south side's latitude in decimal degrees.
     */
    south: null,

    /**
     * @type {Number} The east side's longitude in decimal degrees.
     */
    east: null,

    /**
     * @type {Number} The west side's longitude in decimal degrees.
     */
    west: null,

    _init: function(arg) {
      if (Types.isObjectLiteral(arg)) {
        this._setFromObject(arg);
      } else if (Types.isNumber(arg)) {
        this._setFromArray.apply(this, arguments);
      } else {
        throw new Error('Invalid arguments');
      }
    },

    _setFromObject: function(args) {
      ['north', 'south', 'east', 'west'].forEach(function(side) {
        var value = args[side];
        if (value === undefined) {
          throw new Error('Missing side: ' + side);
        }
        this[side] = args[side];
      }, this);
    },

    _setFromArray: function(north, south, east, west) {
      return this._setFromObject({north: north, south: south, east: east, west: west});
    },

    // -------------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------------

    getNorth: function() {
      return this.north;
    },

    getSouth: function() {
      return this.south;
    },

    getEast: function() {
      return this.east;
    },

    getWest: function() {
      return this.west;
    },

    getCorners: function() {
      return [
        new GeoPoint(this.east, this.north),
        new GeoPoint(this.west, this.north),
        new GeoPoint(this.west, this.south),
        new GeoPoint(this.east, this.south)
      ];
    },

    toJson: function() {
      return {
        north: this.getNorth(),
        south: this.getSouth(),
        east: this.getEast(),
        west: this.getWest()
      };
    },

    // -------------------------------------------------
    // OPERATIONS
    // -------------------------------------------------

    containsPoint: function(point) {
      return (this.south <= point.latitude && point.latitude <= this.north &&
              this.west <= point.longitude && point.longitude <= this.east);
    },

    /**
     * Subtracts a Rectangle from this Rectangle. This has the negative effect of
     * {@link #translate()}.
     * @param {atlas.model.Rectangle} other
     * @returns {atlas.model.Rectangle}
     */
    subtract: function(other) {
      return new Rectangle({
        north: this.north - other.north,
        south: this.south - other.south,
        east: this.east - other.east,
        west: this.west - other.west
      });
    },

    /**
     * Translates this Rectangle by a given difference.
     * @param {atlas.model.Rectangle} other
     * @returns {atlas.model.Rectangle}
     */
    translate: function(other) {
      return new Rectangle({
        north: this.north + other.north,
        south: this.south + other.south,
        east: this.east + other.east,
        west: this.west + other.west
      });
    },

    /**
     * Scales this Rectangle from the centroid.
     * @param {Number} scale - A scale of 1 has no effect. 0.5 is half the size. 2 is
     * twice the size.
     * @returns {atlas.model.Rectangle} The scaled rectangle
     */
    scale: function(scale) {
      var centroid = this.getCentroid();
      return new Rectangle({
        north: centroid.latitude + scale * (this.north - centroid.latitude),
        south: centroid.latitude + scale * (this.south - centroid.latitude),
        east: centroid.longitude + scale * (this.east - centroid.longitude),
        west: centroid.longitude + scale * (this.west - centroid.longitude)
      });
    },

    /**
     * @returns {atlas.model.GeoPoint} The centre-point of this Rectangle.
     */
    getCentroid: function() {
      return new GeoPoint({
        longitude: (this.east + this.west) / 2,
        latitude: (this.north + this.south) / 2
      });
    },

    /**
     * Sets the values from the given Rectangle.
     * @param {atlas.model.Rectangle} other
     * @returns {atlas.model.Rectangle} This Rectangle.
     */
    set: function(other) {
      this._setFromObject(other);
      return this;
    },

    // -------------------------------------------
    // GENERATORS AND CONVERTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.Rectangle} A deep copy of this object.
     */
    clone: function() {
      return new Rectangle(this);
    },

    /**
     * @param {atlas.model.Rectangle} other
     * @returns {Boolean} Whether the given object is equal to this one.
     */
    equals: function(other) {
      return this.north === other.north && this.south === other.south &&
          this.east === other.east && this.west === other.west;
    }

  });

  /**
   * @param {Array.<atlas.model.GeoPoint} rectangles
   * @return {atlas.model.Rectangle} The rectangle formed by the bounding box around the given
   * rectangles.
   */
  Rectangle.fromPoints = function(points) {
    var longitudes = [];
    var latitudes = [];
    _.each(points, function(point) {
      latitudes.push(point.latitude);
      longitudes.push(point.longitude);
    });
    return new Rectangle(_.max(latitudes), _.min(latitudes), _.max(longitudes),
      _.min(longitudes));
  };

  /**
   * @param {Array.<atlas.model.Rectangle>} rectangles
   * @return {atlas.model.Rectangle} The rectangle formed by the bounding box around the given
   * rectangles.
   */
  Rectangle.fromRectangles = function(rectangles) {
    var longitudes = [];
    var latitudes = [];
    _.each(rectangles, function(rectangle) {
      latitudes.push(rectangle.north);
      latitudes.push(rectangle.south);
      longitudes.push(rectangle.east);
      longitudes.push(rectangle.west);
    });
    return new Rectangle(_.max(latitudes), _.min(latitudes), _.max(longitudes),
      _.min(longitudes));
  };

  return Rectangle;
});
