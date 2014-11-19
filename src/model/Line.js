define([
  'atlas/model/GeoPoint',
  'atlas/model/Style',
  'atlas/model/Colour',
  'atlas/model/VertexedEntity',
  'atlas/lib/OpenLayers',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/util/DeveloperError',
  'atlas/util/WKT'
], function(GeoPoint, Style, Colour, VertexedEntity, OpenLayers, Setter, Types, DeveloperError,
  WKT) {

  /**
   * @typedef atlas.model.Line
   * @ignore
   */
  var Line;

  /**
   * @classdesc Represents a 2D line segment.
   *
   * @param {string} id - The ID of the Line object
   * @param {object} lineData - Properties of the Line
   * @param {Array.<atlas.model.GeoPoint>|string} vertices - Either a WKT string or array of
   *     GeoPoints describing the geometry of the Line.
   * @param {number|string} [lineData.width=10] - The width of the line. Assumed to be meters if a
   *     argument type is number, or pixels if the argument is a string with the format "[0-9]+px".
   * @param {atlas.model.Colour} [lineData.color] - The color of the Line.
   * @param {atlas.model.Style} [lineData.style] - The style of the Line.
   * @class atlas.model.Line
   * @extends atlas.model.VertexedEntity
   */
  Line = Setter.mixin(VertexedEntity.extend(/** @lends atlas.model.Line# */{

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
      this._super(id, lineData, args);
      this._width = lineData.width || this._width;
      var style;
      if (lineData.color) {
        if (lineData.color instanceof Colour) {
          style = new Style({fillColour: lineData.color});
        } else {
          style = new Style({fillColour: Colour.fromRGBA(lineData.color)});
        }
      } else if (lineData.style) {
        style = lineData.style;
      } else {
        style = Line.getDefaultStyle();
      }
      this.setStyle(style);
    },

    getWidth: function() {
      return this._width;
    },

    /**
     * @return {Number} The length of the line in metres.
     */
    getLength: function() {
      return this._getOpenLayersCurve().getGeodesicLength();
    },

    getOpenLayersGeometry: function() {
      var wkt = WKT.getInstance();
      return wkt.openLayersPolylineFromGeoPoints(this._vertices);
    },

    _getOpenLayersCurve: function() {
      var wkt = WKT.getInstance();
      var points = wkt.openLayersPointsFromGeoPoints(this._vertices);
      return new OpenLayers.Geometry.Curve(points);
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
