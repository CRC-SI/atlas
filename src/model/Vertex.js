define([
  'atlas/util/Class'
], function(Class) {
  /**
   * @classdesc A 3D cartesian coordinate.
   * @param {Number|Array.<Number>} [x=0] - the 'x' coordinate, or an 3 element array containing
   * the x, y, and z coordinates in the 1st, 2nd, and 3rd index.
   * @param {Number} [y=0] - the 'y' coordinate.
   * @param {Number} [z=0] - the 'z' coordinate.
   *
   * @class atlas.model.Vertex
   * @constructor
   */
  var Vertex = Class.extend(/** @lends atlas.model.Vertex# */ {

    _init: function() {
      var firstArg = arguments[0],
          type = typeof firstArg;
      if (type === 'object') {
        this._setFromObject(firstArg);
      } else if (type === 'array') {
        this._setFromArgs.apply(this, firstArg);
      } else {
        this._setFromArgs.apply(this, arguments);
      }
    },

    _setFromObject: function(args) {
      this._setFromArgs(args.x, args.y, args.z);
    },

    _setFromArgs: function(x, y, z) {
      this.x = x || 0.0;
      this.y = y || 0.0;
      this.z = z || 0.0;
    },

    add: function(other) {
      return new Vertex(this.x + other.x, this.y + other.y, this.z + other.z);
    },

    subtract: function(other) {
      return new Vertex(this.x - other.x, this.y - other.y, this.z - other.z);
    },

    absolute: function() {
      return new Vertex(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
    },

    componentwiseMultiply: function(other) {
      return new Vertex(this.x * other.x, this.y * other.y, this.z * other.z);
    },

    distanceSquared: function(other) {
      var diff = this.subtract(other);
      return Math.pow(diff.x, 2) + Math.pow(diff.y, 2) + Math.pow(diff.z, 2);
    }

  });
  return Vertex;
});
