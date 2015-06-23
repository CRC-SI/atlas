define([
  'atlas/lib/OpenLayers',
  'atlas/lib/utility/Setter',
  'atlas/material/Color',
  'atlas/model/GeoPoint',
  'atlas/material/Style',
  'atlas/model/Vertex',
  // Base class
  'atlas/model/GeoEntity',
  'atlas/util/DeveloperError'
], function(OpenLayers, Setter, Color, GeoPoint, Style, Vertex, GeoEntity, DeveloperError) {

  /**
   * @classdesc Represents a 2D ellipse.
   *
   * @param {Number} id - The ID of this Ellipse.
   * @param {Object} data - Parameters regarding the Ellipse
   * @param {atlas.model.GeoPoint} data.centroid - The centroid of the Ellipse.
   * @param {Number} data.semiMajor - The semi major axis of the Ellipse.
   * @param {Number} data.semiMinor - The semi minor axis of the Ellipse.
   * @param {Number} [data.height=0] - The extruded height of the Ellipse to form a prism.
   * @param {Number} [data.elevation] - The elevation of the base of the Ellipse.
   * @param {atlas.material.Color} [data.color] - The fill color of the Ellipse.
   * @param {atlas.material.Style} [data.style=defaultStyle] - The Style to apply to the
   *    Ellipse.
   * @param {Object} [args] - Optional arguments describing the Ellipse.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Ellipse.
   * @returns {atlas.model.Ellipse}
   *
   * @class atlas.model.Ellipse
   * @extends atlas.model.GeoEntity
   */
  var Ellipse = GeoEntity.extend(/** @lends atlas.model.Ellipse# */ {

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
    _setup: function(id, data, args) {
      if (!data || !data.centroid) {
        throw new DeveloperError('Cannot construct ellipse without centre.');
      } else if (!parseFloat(data.semiMajor)) {
        throw new DeveloperError('Cannot construct ellipse without semi major axis.');
      }
      args = Setter.mixin({}, args);
      data = Setter.mixin({
        rotation: 0
      }, data);
      if (typeof id === 'object') {
        data = id;
        id = data.id;
      }
      this._super(id, data, args);
      this._centroid = new GeoPoint(data.centroid);
      this._semiMajor = parseFloat(data.semiMajor);
      this._semiMinor = parseFloat(data.semiMinor) || this._semiMajor;
      this._height = parseFloat(data.height) || this._height;
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
      if (this._elevation !== elevation) {
        this.setDirty('vertices');
        this._update();
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
      if (this._height !== height) {
        this._height = height;
        this.setDirty('vertices');
        this._update();
      }
    },

    /**
     * @returns {Number} The extrusion height of the polygon.
     */
    getHeight: function() {
      return this._height;
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

    _invalidateGeometry: function() {
      // Keep centroid property since it's provided.
      this._area = null;
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
     * @param {atlas.model.GeoPoint} translation - Translates the Ellipse by
     * a given amount in latitude and longitude.
     */
    translate: function(translation) {
      this._centroid = this._centroid.translate(translation);
      this._super(translation);
    },

    /**
     * Scales the Ellipse by the given vector. This scaling can be uniform in all axis or
     * non-uniform. A scaling factor of <code>1</code> has no effect. Factors lower or higher than
     * <code>1</code> scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as
     * big and <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the Ellipse by.
     * @param {Number} scale.x - The scale along the semi major axis.
     * @param {Number} scale.y - The scale along the semi minor axis.
     */
    scale: function(scale) {
      if (scale.x < 0 || scale.y < 0) {
        throw new DeveloperError('Can not scale Ellipse negatively');
      }
      var major = this._semiMajor * (parseFloat(scale.x) || 1.0);
      var minor = this._semiMinor * (parseFloat(scale.y) || 1.0);
      if (minor > major) {
        var tempMinor = minor;
        minor = major;
        major = tempMinor;
        this.rotate({z: 90});
      }
      this._semiMajor = major;
      this._semiMinor = minor;
      this._super(scale);
    }

  });

  return Ellipse;
});
