define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/util/WKT',
  './Colour',
  './GeoPoint',
  './Material',
  './Style',
  './Vertex',
  // Base class
  './GeoEntity'
], function(DeveloperError, defaultValue, mixin, WKT, Colour, GeoPoint, Material, Style, Vertex,
            GeoEntity) {

  /**
   * @classdesc Represents a 2D ellipse that can be rendered within an
   * Atlas scene. Ellipses are constructed by specifying the centre and the ellipse's
   * semi major and semi minor axes. A {@link atlas.model.Material|Material}
   * and {@link atlas.model.Style|Style} can also be defined when
   * constructing a Ellipse.
   *
   * @param {Number} id - The ID of this Ellipse.
   * @param {Object} ellipseData - Parameters regarding the Ellipse
   * @param {atlas.model.GeoPoint} ellipseData.centroid - The centroid of the Ellipse.
   * @param {Number} ellipseData.semiMajor - The semi major axis of the Ellipse.
   * @param {Number} ellipseData.semiMinor - The semi minor axis of the Ellipse.
   * @param {Number} [ellipseData.height=0] - The extruded height of the Ellipse to form a prism.
   * @param {Number} [ellipseData.elevation] - The elevation of the base of the Ellipse.
   * @param {atlas.model.Colour} [ellipseData.color] - The fill colour of the Ellipse.
   * @param {atlas.model.Style} [ellipseData.style=defaultStyle] - The Style to apply to the Ellipse.
   * @param {atlas.model.Material} [ellipseData.material=defaultMaterial] - The Material to apply to the Ellipse.
   * @param {Object} [args] - Optional arguments describing the Ellipse.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Ellipse.
   * @returns {atlas.model.Ellipse}
   *
   * @class atlas.model.Ellipse
   * @extends atlas.model.GeoEntity
   */
  var Ellipse = GeoEntity.extend(/** @lends atlas.model.Ellipse# */ {
    // TODO(aramk) Either put docs on params and document the getters and setters which don't have
    // obvious usage/logic.
    // TODO(aramk) Units for height etc. are open to interpretation - define them as metres in docs.

    /**
     * The extruded height of the Ellipse (if rendered as extruded Ellipse).
     * @type {Number}
     * @private
     */
    _height: 0,

    /**
     * The elevation of the base of the Ellipse.
     * @type {Number}
     * @private
     */
    _elevation: 0,

    /**
     * The z-axis order as an integer in the range [0, Infinity]. Ellipses with higher zIndex will
     * appear on top.
     * @type {Number}
     * @private
     */
    _zIndex: 0,

    /**
     * The z-axis offset for z-index used to separate different indices.
     * @type {Number}
     * @private
     */
    _zIndexOffset: 0.1,

    /**
     * The material used to render the Ellipse.
     * @type {atlas.model.Material}
     * @private
     */
    // TODO(bpstudds): Create a Ellipse specific default Material to use.
    _material: null,

    /**
     * The semi major axis of the ellipse in metres.
     * @type {Number}
     */
    _semiMajor: null,

    /**
     * The semi minor axis of the ellipse in metres.
     * @type {Number}
     */
    _semiMinor: null,

    /**
     * Whether the Ellipse should be rendered as an extruded Ellipse or a 2D Ellipse.
     * @type {Boolean}
     * @protected
     */
    _showAsExtrusion: false,

    /**
     * Constructs a new Ellipse
     * @ignore
     */
    _init: function(id, ellipseData, args) {
      if (!ellipseData || !ellipseData.centroid) {
        throw new DeveloperError('Can not construct ellipse without centre.');
      } else if (!parseFloat(ellipseData.semiMajor)) {
        throw new DeveloperError('Can not construct ellipse without semi major axis.');
      }
      args = mixin({}, args);
      ellipseData = mixin({
        rotation: 0
      }, ellipseData);
      if (typeof id === 'object') {
        ellipseData = id;
        id = ellipseData.id;
      }
      this._super(id, args);

      this._visible = false;
      this._centroid = new GeoPoint(ellipseData.centroid);
      this._semiMajor = parseFloat(ellipseData.semiMajor);
      this._semiMinor = parseFloat(ellipseData.semiMinor) || this._semiMajor;
      this._rotation = ellipseData.rotation;
      this._height = parseFloat(ellipseData.height) || this._height;
      this._elevation = parseFloat(ellipseData.elevation) || this._elevation;
      this._zIndex = parseFloat(ellipseData.zIndex) || this._zIndex;
      this._zIndexOffset = parseFloat(ellipseData.zIndexOffset) || this._zIndexOffset;
      this._material = (ellipseData.material || Material.DEFAULT);
      var style;
      if (ellipseData.color) {
        style = new Style({fillColour: ellipseData.color});
      } else if (ellipseData.style) {
        style = ellipseData.style;
      } else {
        style = Ellipse.getDefaultStyle();
      }
      this.setStyle(style);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getVertices: function() {
      return [];
    },

    /**
     * Gets the area of the Ellipse, in <tt>unit**2</tt> where <tt>unit</tt> is the
     * unit corresponding to the Vertices describing this Ellipse.
     * @see {@link http://www.mathopenref.com/coordpolygonarea2.html}
     * @returns {Number} The area of the polygon.
     */
    getArea: function() {
      throw new Error('This function not yet implemented.');
    },

    /**
     * Set the elevation of the base of the polygon (or prism).
     * @param {Number} elevation - The elevation of the base of the polygon.
     */
    setElevation: function(elevation) {
      if (typeof elevation === 'number' && this._elevation !== elevation) {
        this._elevation = elevation;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The elevation of the base of the polygon (or prism).
     */
    getElevation: function() {
      return this._elevation;
    },

    /**
     * Enables showing the polygon as an extruded polygon.
     */
    enableExtrusion: function() {
      this._showAsExtrusion = true;
    },

    /**
     * Disables showing the polygon as an extruded polygon.
     */
    disableExtrusion: function() {
      this._showAsExtrusion = false;
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

    /**
     * @returns {Number} The rotation of the Ellipse.
     */
    getRotation: function() {
      return this._rotation;
    },

    /**
     * @returns {Number} The semi major axis of the Ellipse.
     */
    getSemiMajorAxis: function() {
      return this._semiMajor;
    },

    /**
     * @returns {Number} The semi minor axis of the Ellipse.
     */
    getSemiMinorAxis: function() {
      return this._semiMinor;
    },

    /**
     * Sets the z-axis order. Ellipses with higher zIndex will appear on top.
     * @param {Number} index
     */
    setZIndex: function(index) {
      if (typeof index === 'number' && this._zIndex !== index) {
        this._zIndex = index;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The z-axis order.
     */
    getZIndex: function() {
      return this._zIndex;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Function to enable interactive editing of the polygon.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Ellipse.');
    },

    /**
     * Translates the Ellipse.
     * @param {atlas.model.GeoPoint | {latitude, longitude}} translation - Translates the Ellipse by
     * a given amount in latitude and longitude.
     */
    translate: function(translation) {
      if (translation.x !== undefined) {
        translation = GeoPoint.fromVertex(translation);
      }
      this._centroid = this._centroid.translate(translation);
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    /**
     * Scales the Ellipse by the given vector. This scaling can be uniform in all axis or non-uniform.
     * A scaling factor of <code>1</code> has no effect. Factors lower or higher than <code>1</code>
     * scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as big and
     * <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the Ellipse by.
     * @param {Number} scale.x - The scale along the semi major axis.
     * @param {Number} scale.y - The scale along the semi minor axis.
     */
    scale: function(scale) {
      if (scale.x < 0 || scale.y < 0) {
        throw new DeveloperError('Can not scale Ellipse negatively');
      }
      var major = this._semiMajor * (parseFloat(scale.x) || 1.0),
          minor = this._semiMinor * (parseFloat(scale.y) || 1.0);
      if (minor > major) {
        var tempMinor = minor;
        minor = major;
        major = tempMinor;
        this._rotation += 90;
      }
      this._semiMajor = major;
      this._semiMinor = minor;
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    /**
     * Rotates the Ellipse by the given amount.
     * @param {Number} rotation - Change in rotation in degrees. Positive rotates clockwise.
     */
    rotate: function(rotation) {
      this._rotation += (parseFloat(rotation) || 0.0);
      this.setDirty('model');
      this.isVisible() && this.show();
    }

  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  /**
   * Defines the default style to use when rendering a polygon.
   * @type {atlas.model.Style}
   */
  Ellipse.getDefaultStyle = function() {
    return new Style({fillColour: Colour.GREEN});
  };

  return Ellipse;
});

