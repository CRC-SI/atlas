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
   * @param {object} data - Properties of the Line
   * @param {Array.<atlas.model.GeoPoint>|string} vertices - Either a WKT string or array of
   *     GeoPoints describing the geometry of the Line.
   * @param {number|string} [data.width=10] - The width of the line. Assumed to be meters if a
   *     argument type is number, or pixels if the argument is a string with the format "[0-9]+px".
   * @param {atlas.model.Colour} [data.color] - The color of the Line.
   * @param {atlas.model.Style} [data.style] - The style of the Line.
   * @class atlas.model.Line
   * @extends atlas.model.VertexedEntity
   */
  Line = VertexedEntity.extend(/** @lends atlas.model.Line# */{

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
    _init: function(id, data, args) {
      this._super(id, data, args);
      this._width = data.width || this._width;
      var style = data.style || Style.getDefault();
      var color = data.color;
      var borderColor = data.borderColor;
      if (color) {
        color = color instanceof Colour ? color : new Colour(color);
        style.setFillColour(color);
      }
      if (borderColor) {
        borderColor = borderColor instanceof Colour ? borderColor : new Colour(borderColor);
        style.setBorderColour(borderColor);
      }
      this.setStyle(style);
    },

    setWidth: function(width) {
      this._width = width;
      this.setDirty('entity');
      this._update();
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

  });

  return Line;
});
