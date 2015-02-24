define([
  'atlas/model/GeoPoint',
  'atlas/material/Style',
  'atlas/material/Color',
  'atlas/model/VertexedEntity',
  'atlas/lib/OpenLayers',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/util/DeveloperError',
  'atlas/util/WKT'
], function(GeoPoint, Style, Color, VertexedEntity, OpenLayers, Setter, Types, DeveloperError,
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
   * @param {atlas.material.Color} [data.color] - The fill color of the Polygon. Overrides the
   *     given style.
   * @param {atlas.material.Color} [data.borderColor] - The border color of the Polygon.
   *     Overrides the given style.
   * @param {atlas.material.Style} [data.style=Style.getDefault()] - The Style to apply to the
   *     Polygon.
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
    _setup: function(id, data, args) {
      this._super(id, data, args);
      this._width = data.width || this._width;
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

    getOpenLayersGeometry: function(args) {
      var wkt = WKT.getInstance();
      var vertices = this.getVertices();
      if (args && args.utm) {
        vertices = vertices.map(function(point) {
          return point.toUtm().coord;
        });
        return wkt.openLayersPolylineFromVertices(vertices);
      } else {
        return wkt.openLayersPolylineFromGeoPoints(vertices);
      }
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
    },

    toJson: function() {
      return Setter.merge(this._super(), {
        type: 'line',
        width: this.getWidth()
      });
    }

  });

  return Line;
});
