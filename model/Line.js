define([
  'atlas/lib/extends',
  './GeoEntity',
  './Vertex'
], function (extend, GeoEntity, Vertex) {

  /**
   * Constructor for a new Line object.
   *
   * @param {Vertex} [start=Vertex(0,0,0)] - vertex at start of the line segment.
   * @param {Vertex} [end=Vertex(0,0,0)] - vertex at end of the line segment.
   *
   * @extends {GeoEntity}
   * @alias atlas/model/Line
   * @constructor
   */
  var Line = function (start, end) {
    Line.base.constructor.call(this, id, parent);
    
    this.startVertex = (start || new Vertex(0,0,0));
    this.endVertex =  (end || new Vertex(0,0,0));
  };
  // Inherit from GeoEntity
  extend(GeoEntity, Line);

  /**
   * Returns the length of the Line.
   * @return {number} Length of line.
   */
  Line.prototype.getLength = function () {
    var x2 = Math.abs(this.endVertex.x - this.startVertex.x);
    x2 = Math.pow(x2, 2);
    var y2 = Math.abs(this.endVertex.y - this.startVertex.y);
    y2 = Math.pow(y2, 2);
    var z2 = Math.abs(this.endVertex.z - this.startVertex.z);
    z2 = Math.pow(z2, 2);
    return Math.sqrt(x2 + y2 + z2);
  };

  Line.prototype.edit = function () {
    throw new DeveloperError('Can not call method of abstract Line');
  };

  return Line;
});
