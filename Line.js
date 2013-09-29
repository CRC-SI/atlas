define([
  'Vertex'
], function (Vertex) {

  /**
   * Constructor for a new Line object.
   * @param {Vertex} [start=Vertex(0,0,0)] - vertex at start of the line segment.
   * @param {Vertex} [end=Vertex(0,0,0)] - vertex at end of the line segment.
   */
  var Line = function (start, end) {
    this.startVertex = (start || new Vertex(0,0,0));
    this.endVertex =  (end || new Vertex(0,0,0));
  };

  /**
   * Returns the length of the Line.
   * @return {number} Length of line.
   */
  Line.prototype.getLength = function () {
    x2 = Math.abs(this.endVertex.x - this.startVertex.x)^2;
    y2 = Math.abs(this.endVertex.y - this.startVertex.y)^2;
    z2 = Math.abs(this.endVertex.z - this.startVertex.z)^2;
    return Math.sqrt(x2 + y2 + z2);
  };

  // Not sure what this does
  Line.prototype.edit = function () {
    throw new DeveloperError('Can not call method of abstract Line');
  };


  // Not sure what this does
  Line.prototype.remove = function () {
    throw new DeveloperError('Can not call method of abstract Line');
  };

  return Line;
});
