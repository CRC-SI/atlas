define([
  'atlas/util/Class'
], function (Class) {

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
   * @typedef atlas.model.Vertex
   * @class
   */
  Vertex = Class.extend( /** @lends atlas.model.Vertex# */ {

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

    _init: function (x, y, z) {
      if (x instanceof Array) {
        this.x = (parseFloat(x[0]) || 0.0);
        this.y = (parseFloat(x[1]) || 0.0);
        this.z = (parseFloat(x[2]) || 0.0);
      } else if (x.x) {
        this.x = (parseFloat(x.x) || 0.0);
        this.y = (parseFloat(x.y) || 0.0);
        this.z = (parseFloat(x.z) || 0.0);
      } else {
        this.x = (parseFloat(x) || 0.0);
        this.y = (parseFloat(y) || 0.0);
        this.z = (parseFloat(z) || 0.0);
      }
    },

    /**
     * Adds a given Vertex to this Vertex.
     * @param {atlas.model.Vertex} other - The other vertex.
     * @returns {atlas.model.Vertex}
     */
    add: function (other) {
      return new Vertex(this.x + other.x, this.y + other.y, this.z + other.z);
    },

    /**
     * Subtracts a given Vertex from this Vertex.
     * @param {atlas.model.Vertex} other - The other vertex.
     * @returns {atlas.model.Vertex}
     */
    subtract: function (other) {
      return new Vertex(this.x - other.x, this.y - other.y, this.z - other.z);
    },

    /**
     * @returns {atlas.model.Vertex} This vertex with each component converted to its absolute value.
     */
    absolute: function () {
      return new Vertex(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
    },

    /**
     * Componentwise multiplies this Vertex with another Vertex.
     * @param {atlas.model.Vertex} other - The other vertex.
     * @returns {atlas.model.Vertex}
     */
    componentwiseMultiply: function (other) {
      return new Vertex(this.x * other.x, this.y * other.y, this.z * other.z);
    },

    /**
     * Returns the Euclidean distance squared between this Vertex and another Vertex.
     * @param {atlas.model.Vertex} other - The other vertex.
     * @returns {Number}
     */
    distanceSquared: function (other) {
      var diff = this.subtract(other);
      return Math.pow(diff.x, 2) + Math.pow(diff.y, 2) + Math.pow(diff.z, 2);
    }
  });

  return Vertex;
});
