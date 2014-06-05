define([
  'atlas/model/GeoEntity',
  'atlas/model/Style',
  'atlas/model/Colour',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/util/WKT'
], function(GeoEntity, Style, Colour, DeveloperError, defaultValue, mixin, WKT) {

  /**
   * @typedef atlas.model.Line
   * @ignore
   */
  var Line;

  /**
   * @classdesc Represents a 2D line segment.
   * @class atlas.model.Line
   * @extends atlas.model.GeoEntity
   */
  Line = mixin(GeoEntity.extend(/** @lends atlas.model.Line# */{

    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @type {Array.<atlas.model.Vertex>}
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

    getVertices: function() {
      return this._vertices;
    },

    /**
     * Function to enable interactive editing of the polygon.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Polygon.');
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
