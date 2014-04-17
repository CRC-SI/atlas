define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/WKT',
  './GeoEntity',
  './Style',
  './Colour',
  './Vertex'
], function(DeveloperError, defaultValue, WKT, GeoEntity, Style, Colour, Vertex) {
  /**
   * @classdesc Represents a 2D line segment.
   * @class atlas.model.Line
   * @extends atlas.model.GeoEntity
   */
  var Line = GeoEntity.extend(/** @lends atlas.model.Line# */{

    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @type {Array.<atlas.model.Vertex>}
     * @private
     */
    _vertices: null,

    /**
     * @type {atlas.model.Style}
     * @private
     */
    _style: null,

    /**
     * The width of the line segment.
     * @type {Number}
     * @private
     */
    _width: 10,

    /**
     * Constructs a new {@link Line}.
     * @ignore
     */
    _init: function(id, lineData, args) {
      this._super(id, args);
      if (typeof lineData.vertices === 'string') {
        var wkt = WKT.getInstance(),
            vertices = wkt.verticesFromWKT(lineData.vertices);
        if (vertices instanceof Array) {
          this._vertices = vertices;
        } else {
          throw new Error('Invalid vertices for Line ' + id);
        }
      } else {
        this._vertices = defaultValue(lineData.vertices, []);
      }
      this._width = lineData.width || this._width;
      // TODO(aramk) Refactor with Ellipse, Polygon, etc.
      var style = null;
      if (lineData.color) {
        style = new Style({fillColour: lineData.color});
      } else if (lineData.style) {
        style = lineData.style;
      } else {
        style = Line.getDefaultStyle();
      }
      this.setStyle(style);
    },

    /**
     * Function to enable interactive editing of the polygon.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Polygon.');
    }

  });

  // TODO(aramk) This is shared across Feature, Polygon, Line etc. Put in GeoEntity?
  Line.getDefaultStyle = function () {return new Style({fillColour: Colour.GREEN}); };

  return Line;
});
