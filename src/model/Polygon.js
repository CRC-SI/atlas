define([
  'atlas/lib/utility/Setter',
  'atlas/model/Colour',
  'atlas/model/Style',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError',
  'atlas/util/WKT',
  // Base class
  'atlas/model/VertexedEntity'
], function(Setter, Colour, Style, GeoPoint, DeveloperError, WKT, VertexedEntity) {

  /**
   * @typedef atlas.model.Polygon
   * @ignore
   */
  var Polygon;

  /**
   * @classdesc Represents a 2D polygon.
   *
   * @param {Number} id - The ID of this Polygon.
   * @param {Object} polygonData - Data describing the Polygon.
   * @param {string|Array.<atlas.model.GeoPoint>} [polygonData.vertices=[]] - The vertices of the Polygon.
   * @param {Number} [polygonData.height=0] - The extruded height of the Polygon to form a prism.
   * @param {Number} [polygonData.elevation] - The elevation of the base of the Polygon (or prism).
   * @param {atlas.model.Colour} [polygonData.color] - The fill colour of the Polygon (overridden/overrides Style)
   * @param {atlas.model.Style} [polygonData.style=defaultStyle] - The Style to apply to the Polygon.
   * @param {Object} [args] - Option arguments describing the Polygon.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Polygon.
   * @returns {atlas.model.Polygon}
   *
   * @class atlas.model.Polygon
   * @extends atlas.model.GeoEntity
   */
  Polygon = Setter.mixin(VertexedEntity.extend(/** @lends atlas.model.Polygon# */ {

    // TODO(aramk) Either put docs on params and document the getters and setters which don't have
    // obvious usage/logic.
    // TODO(aramk) Units for height etc. are open to interpretation - define them as metres in docs.

    /**
     * List of counter-clockwise ordered array of vertices constructing holes of this polygon.
     * @type {Array.<Array.<atlas.model.Vertex>>}
     * @private
     */
    _holes: null,

    /**
     * The extruded height of the polygon in metres (if rendered as extruded polygon).
     * @type {Number}
     * @private
     */
    _height: 0,

    /**
     * Whether the Polygon should be rendered as an extruded polygon or a 2D polygon.
     * @type {Boolean}
     * @protected
     */
    _showAsExtrusion: false,

    /**
     * Constructs a new Polygon
     * @ignore
     */
    _init: function(id, polygonData, args) {
      polygonData = Setter.mixin({}, polygonData);
      args = Setter.mixin({}, args);
      this._super(id, args);
      if (typeof polygonData.vertices === 'string') {
        // TODO(aramk) Add support for MULTIPOLYGON by not taking the first item.
        var wkt = WKT.getInstance(),
            vertices = wkt.verticesFromWKT(polygonData.vertices);
        if (vertices[0] instanceof Array) {
          this._vertices = vertices[0].map(GeoPoint.fromVertex, GeoPoint);
        } else {
          throw new Error('Invalid vertices for Polygon ' + id);
        }
      } else {
        this._vertices = Setter.def(polygonData.vertices, []);
      }
      // Don't have closed polygons.
      var len = this._vertices.length;
      if (this._vertices[0] === this._vertices[len - 1] && len > 1) {
        this._vertices.pop();
      }
      if (polygonData.holes) {
        this._holes = polygonData.holes;
      }
      this._height = parseFloat(polygonData.height) || this._height;
      // TODO(aramk) Abstract this into VertexedEntity.
      this._elevation = parseFloat(polygonData.elevation) || this._elevation;
      this._zIndex = parseFloat(polygonData.zIndex) || this._zIndex;
      this._zIndexOffset = parseFloat(polygonData.zIndexOffset) || this._zIndexOffset;
      var style;
      if (polygonData.color) {
        if (polygonData.color instanceof Colour) {
          style = new Style({fillColour: polygonData.color});
        } else {
          style = new Style({fillColour: Colour.fromRGBA(polygonData.color)});
        }
      } else if (polygonData.style) {
        style = polygonData.style;
      } else {
        style = Polygon.getDefaultStyle();
      }
      this.setStyle(style);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Enables showing the polygon as an extruded polygon.
     */
    enableExtrusion: function() {
      this._showAsExtrusion = true;
      this.setDirty('model');
    },

    /**
     * Disables showing the polygon as an extruded polygon.
     */
    disableExtrusion: function() {
      this._showAsExtrusion = false;
      this.setDirty('model');
    },

    /**
     * @returns {Boolean} Whether the polygon should be shown as an extruded polygon.
     */
    isExtrusion: function() {
      return this._showAsExtrusion;
    },

    /**
     * Set the extruded height of the polygon to form a prism.
     * @param {Number} height The extruded height of the building.
     */
    setHeight: function(height) {
      // TODO(aramk) Throw error if height is not number?
      if (typeof height === 'number' && this._height !== height) {
        this._height = height;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The extrusion height of the polygon.
     */
    getHeight: function() {
      return this._height;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

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
  return Polygon;
});
