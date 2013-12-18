define([
], function () {

  /**
   * Constructor for a new Vertex object.
   * @param {number} [x=0] - the 'x' coordinate.
   * @param {number} [y=0] - the 'y' coordinate.
   * @param {number} [z=0] - the 'z' coordinate.
   *
   * @alias atlas/model/Vertex
   * @constructor
   */
  var Vertex = function (x, y, z) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
  };

  Vertex.prototype.add = function (other) {
    return new Vertex(this.x + other.x, this.y + other.y, this.z + other.z);
  };

  Vertex.prototype.subtract = function (other) {
    return new Vertex(this.x - other.x, this.y - other.y, this.z - other.z);
  };

  return Vertex;
});
