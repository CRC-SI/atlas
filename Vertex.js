define([
], function () {

  /**
   * Constructor for a new Vertex.
   * @param {number} [u=0] - the 'x' coordinate.
   * @param {number} [v=0] - the 'y' coordinate.
   * @param {number} [w=0] - the 'z' coordinate.
   */
  var Vertex = function (u, v, w) {
    this.x = (u || 0);
    this.y = (v || 0);
    this.z = (w || 0);
  };

  return Vertex;
});
