define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError'
], function(Setter, Types, Class, DeveloperError) {
  
  /**
   * @typedef atlas.model.Vertex
   * @ignore
   */
  var Vertex;

  /**
   * @classdesc A Vertex represents a 3D point in an arbitrary coordinate system.
   * @param {Number|Array.<Number>|Object} [x=0] - the 'x' coordinate, or an 3 element array
   *    containing the x, y, and z coordinates in the 1st, 2nd, and 3rd index, or a object
   *    with <code>x</code>, <code>y</code>, and <code>z</code> properties.
   * @param {Number} [y=0] - the 'y' coordinate.
   * @param {Number} [z=0] - the 'z' coordinate.
   * @class atlas.model.Vertex
   */
  Vertex = Setter.mixin(Class.extend(/** @lends atlas.model.Vertex# */ {

    /**
     * The <code>x</code> coordinate.
     * @type {Number}
     */
    x: null,

    /**
     * The <code>y</code> coordinate.
     * @type {Number}
     */
    y: null,

    /**
     * The <code>z</code> coordinate.
     * @type {Number}
     */
    z: null,

    _init: function() {
      var firstArg = arguments[0];
      if (Types.isArrayLiteral(firstArg)) {
        this._setFromArgs.apply(this, firstArg);
      } else if (Types.isObjectLiteral(firstArg)) {
        this._setFromObject(firstArg);
      } else {
        this._setFromArgs.apply(this, arguments);
      }
    },

    _setFromObject: function(args) {
      this._setFromArgs(args.x, args.y, args.z);
    },

    _setFromArgs: function(x, y, z) {
      this.x = parseFloat(x) || 0.0;
      this.y = parseFloat(y) || 0.0;
      this.z = parseFloat(z) || 0.0;
    },

    /**
     * Adds a given Vertex to this Vertex.
     * @param {atlas.model.Vertex} other
     * @returns {atlas.model.Vertex}
     */
    add: function(other) {
      // TODO(aramk) This is an alias for translate - keep one for both GeoPoint and Vertex.
      return this.translate.apply(this, arguments);
    },

    /**
     * Sets the values from the given Vertex.
     * @param {atlas.model.Vertex} other
     * @returns {atlas.model.Vertex} This Vertex.
     */
    set: function(other) {
      this._setFromObject(other);
      return this;
    },

    /**
     * Subtracts a given Vertex from this Vertex.
     * @param {atlas.model.Vertex} other
     * @returns {atlas.model.Vertex}
     */
    subtract: function(other) {
      return new Vertex(this.x - other.x, this.y - other.y, this.z - other.z);
    },

    /**
     * Translates this Vertex by another vertex.
     * @param {atlas.model.Vertex} other
     */
    translate: function(other) {
      return new Vertex(this.x + other.x, this.y + other.y, this.z + other.z);
    },

    /**
     * @returns {atlas.model.Vertex} This vertex with each component converted to its absolute value.
     */
    absolute: function() {
      return new Vertex(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
    },

    negate: function() {
      return new Vertex(0, 0, 0).subtract(this);
    },

    /**
     * Componentwise multiplies this Vertex with another Vertex.
     * @param {atlas.model.Vertex} other
     * @returns {atlas.model.Vertex}
     */
    componentwiseMultiply: function(other) {
      return new Vertex(this.x * other.x, this.y * other.y, this.z * other.z);
    },

    /**
     * Componentwise divides this Vertex with another Vertex.
     * @param {atlas.model.Vertex} other
     * @returns {atlas.model.Vertex}
     */
    componentwiseDivide: function(other) {
      return new Vertex(this.x / other.x, this.y / other.y, this.z / other.z);
    },

    /**
     * Returns the Euclidean distance squared between this Vertex and another Vertex.
     * @param {atlas.model.Vertex} other
     * @returns {Number}
     */
    distanceSquared: function(other) {
      var diff = this.subtract(other);
      return Math.pow(diff.x, 2) + Math.pow(diff.y, 2) + Math.pow(diff.z, 2);
    },

    /**
     * @param {Object} [args]
     * @param {Number} [args.dimension] The dimension of the resulting vertex arrays in the range
     * [2,3].
     * @param {Number} [args.round] The number of significant decimal places for rounding.
     * @returns {Array.<Number>} An array with each coordinate as an index in the order x, y, z. The
     * z index is omitted if it is undefined.
     */
    toArray: function(args) {
      args = Setter.mixin({
        dimension: 3
      }, args);
      var dimension = args.dimension,
          round = args.round;
      if (dimension !== undefined && (dimension < 2 || dimension > 3)) {
        throw new DeveloperError('Invalid dimensions');
      }
      var points = Types.isNullOrUndefined(this.z) || dimension === 2 ? [this.x, this.y] :
          [this.x, this.y, this.z];
      if (round !== undefined) {
        for (var i = 0; i < points.length; i++) {
          points[i] = parseFloat(points[i].toFixed(round));
        }
      }
      return points;
    },

    /**
     * @returns {atlas.model.Vertex} A deep copy of this object.
     */
    clone: function () {
      return new Vertex(this);
    },

    /**
     * @param {atlas.model.Vertex} other
     * @returns {Boolean} Whether the given object is equal to this one.
     */
    equals: function (other) {
      return this.x === other.x && this.y === other.y && this.z === other.z;
    }

  }), {

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    /**
     * @param {Array.<atlas.model.Vertex>} vertices
     * @param {Object} [args]
     * @see #toArray
     * @returns {Array.<Array.<Number>>} An array of the given vertices converted to arrays.
     */
    toArrays: function(vertices, args) {
      return vertices.map(function(vertex) {
        return vertex.toArray(args);
      });
    }

  });
  return Vertex;
});
