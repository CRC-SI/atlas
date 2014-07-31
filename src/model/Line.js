define([
  'atlas/model/GeoPoint',
  'atlas/model/Style',
  'atlas/model/Colour',
  'atlas/model/VertexedEntity',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Type',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/WKT'
], function(GeoPoint, Style, Colour, VertexedEntity, Setter, Type, DeveloperError, defaultValue, WKT) {

  /**
   * @typedef atlas.model.Line
   * @ignore
   */
  var Line;

  /**
   * @classdesc Represents a 2D line segment.
   * @param {string} id - The ID of the Line object
   * @param {object} lineData - Properties of the Line
   * @param {Array.<atlas.model.GeoPoint>|string} vertices - Either a WKT string or array of
   *     GeoPoints describing the geometry of the Line.
   * @param {number|string} [lineData.width=10] - The width of the line. Assumed to be meters if a
   *     argument type is number, or pixels if the argument is a string with the format "[0-9]+px".
   * @param {atlas.model.Colour} [lineData.color] - The color of the Line.
   * @param {atlas.model.Style} [lineData.style] - The style of the Line.
   * @class atlas.model.Line
   * @extends atlas.model.GeoEntity
   */
  Line = Setter.mixin(VertexedEntity.extend(/** @lends atlas.model.Line# */{

    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @type {Array.<atlas.model.GeoPoint>}
     * @private
     */
    _vertices: null,

    /**
     * The width of the line segment in metres (e.g. 10) or pixels (eg. '10px'). If in pixels, the
     * absolute width remains fixed while scaling/zooming.
     * @type {Number|String}
     * @private
     */
    _width: 10,

    /**
     * Constructs a new {@link Line}.
     * @ignore
     */
    _init: function(id, lineData, args) {
      this._super(id, args);
      if (Type.isString(lineData.vertices)) {
        var wkt = WKT.getInstance(),
            vertices = wkt.verticesFromWKT(lineData.vertices).map(GeoPoint.fromVertex, GeoPoint);
        if (Type.isArray(vertices)) {
          this._vertices = vertices;
        } else {
          throw new Error('Invalid vertices for Line ' + id);
        }
      } else {
        this._vertices = defaultValue(lineData.vertices, []);
      }
      this._width = lineData.width || this._width;
      if (lineData.color) {
        var style;
        if (lineData.color instanceof Colour) {
          style = new Style({fillColour: lineData.color});
        } else {
          style = new Style({fillColour: Colour.fromRGBA(lineData.color)});
        }
        this.setStyle(style);
      } else if (lineData.style) {
        this.setStyle(lineData.style);
      }
    },

    /**
     * Sets the vertices of the line.
     * @param {Array.<atlas.model.GeoPoint>} vertices
     */
    setVertices: function (vertices) {
      this._vertices = vertices;
      this.setDirty('vertices');
    },

    getVertices: function() {
      return this._vertices;
    },

    getWidth: function () {
      return this._width;
    },

    /**
     * Function to enable interactive editing of the polygon.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Line.');
    }

  }), {

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    /**
     * Defines the default style to use when rendering a polygon.
     * @type {atlas.model.Style}
     */
    getDefaultStyle: function() {
      return new Style({fillColour: Colour.GREEN});
    }

  });

  return Line;
});
