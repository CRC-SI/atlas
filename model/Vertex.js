define([
], function () {

  /**
   * Constructor for a new Vertex object.
   * @param {Number|Array.<Number>} [x=0] - the 'x' coordinate, or an 3 element array containing the x, y, and z coordinates in the 1st, 2nd, and 3rd index.
   * @param {Number} [y=0] - the 'y' coordinate.
   * @param {Number} [z=0] - the 'z' coordinate.
   *
   * @alias atlas/model/Vertex
   * @constructor
   */
  var Vertex = function (x, y, z) {
    if (x.length) {
      this.x = x[0];
      this.y = x[1];
      this.z = x[2];
    } else {
      this.x = x || 0.0;
      this.y = y || 0.0;
      this.z = z || 0.0;
    }
  };

  Vertex.prototype.add = function (other) {
    return new Vertex(this.x + other.x, this.y + other.y, this.z + other.z);
  };

  Vertex.prototype.subtract = function (other) {
    return new Vertex(this.x - other.x, this.y - other.y, this.z - other.z);
  };

  Vertex.prototype.absolute = function () {
    return new Vertex(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
  };

  Vertex.prototype.componentWiseMultiply = function (other) {
    return new Vertex(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  return Vertex;
});
