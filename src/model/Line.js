define([
  'atlas/util/Extends',
  'atlas/util/default',
  './GeoEntity',
  './Vertex'
], function (extend, defaultValue, GeoEntity, Vertex) {

  /**
   * Constructor for a new Line object.
   *
   * @param {atlas.model.Vertex} [start=Vertex(0,0,0)] - Vertex at start of the line segment.
   * @param {atlas.model.Vertex} [end=Vertex(0,0,0)] - Vertex at end of the line segment.
   *
   * @extends {atlas.model.GeoEntity}
   * @alias atlas.model.Line
   * @constructor
   */
  var Line = function (start, end) {
    Line.base.constructor.call(this, id, parent);

    this._startVertex = defaultValue(start, new Vertex(0,0,0));
    this._endVertex =  defaultValue(end, new Vertex(0,0,0));
  };
  // Inherit from GeoEntity
  extend(GeoEntity, Line);

  /**
   * Returns the length of the Line.
   * @returns {number} Length of line.
   */
  Line.prototype.getLength = function () {
    var x2 = Math.abs(this._endVertex.x - this._startVertex.x);
    x2 = Math.pow(x2, 2);
    var y2 = Math.abs(this._endVertex.y - this._startVertex.y);
    y2 = Math.pow(y2, 2);
    var z2 = Math.abs(this._endVertex.z - this._startVertex.z);
    z2 = Math.pow(z2, 2);
    return Math.sqrt(x2 + y2 + z2);
  };

  Line.prototype.edit = function () {
    throw new DeveloperError('Can not call method of abstract Line');
  };

  return Line;
});
