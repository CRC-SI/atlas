define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError',
  'atlas/material/Color',
  'atlas/material/Material'
], function(Setter, Class, DeveloperError, Color, Material) {

  /**
   * @typedef atlas.material.Style
   * @ignore
   */
  var Style;

  /**
   * Constructs a new Style object.
   * @classdesc Defines the fill and border materials of a polygon.
   *
   * @param {Object} [args]
   * @param {atlas.material.Material} [args.fillMaterial=Style.getDefaultFillMaterial()] - The fill
   *     material for the polygon.
   * @param {atlas.material.Material} [args.borderMaterial=Style.getDefaultBorderMaterial()] - The
   *     border material for the polygon.
   * @param {Number} [args.borderWidth=Style.DEFAULT_BORDER_WIDTH] - The border width for the
   *     polygon in pixels.
   *
   * @class atlas.material.Style
   */
  Style = Class.extend( /** @lends atlas.material.Style# */ {

    /**
     * Fill material of this Style.
     * @type {atlas.material.Material}
     * @private
     */
    _fillMaterial: null,

    /**
     * Gradient material of this Style.
     * @type {atlas.material.Material}
     * @private
     */
    _gradientMaterial: null,

    /**
     * Border material of this Style.
     * @type {atlas.material.Material}
     * @private
     */
    _borderMaterial: null,

    /**
     * Border width in pixels of this Style.
     * @type {Number}
     * @private
     */
    _borderWidth: null,

    _init: function(args) {
      args = args || {};
      this.setFillMaterial(args.fillMaterial || Style.getDefaultFillMaterial());
      this.setGradientMaterial(args.gradientMaterial || Style.getDefaultGradientMaterial());
      this.setBorderMaterial(args.borderMaterial || Style.getDefaultBorderMaterial());
      this.setBorderWidth(Setter.def(args.borderWidth, Style.DEFAULT_BORDER_WIDTH));
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Sets the Style's fill material.
     * @param {atlas.material.Material} material - The new fill material.
     * @returns {atlas.material.Material} The original material.
     */
    setFillMaterial: function(material) {
      if (material && !(material instanceof Material)) {
        throw new DeveloperError('Invalid material');
      }
      var original = this.getFillMaterial();
      this._fillMaterial = material;
      return original;
    },

    /**
     * Sets the Style's gradient material.
     * @param {atlas.material.Material} material - The new gradient material.
     * @returns {atlas.material.Material} The original material.
     */
    setGradientMaterial: function(material) {
      if (material && !(material instanceof Material)) {
        throw new DeveloperError('Invalid material');
      }
      var original = this.getGradientMaterial();
      this._gradientMaterial = material;
      return original;
    },

    /**
     * Sets the Style's border material.
     * @param {atlas.material.Material} material - The new border material.
     * @returns {atlas.material.Material} The original border material.
     */
    setBorderMaterial: function(material) {
      if (material && !(material instanceof Material)) {
        throw new DeveloperError('Invalid material');
      }
      var original = this.getBorderMaterial();
      this._borderMaterial = material;
      return original;
    },

    /**
     * Sets the Style's border width.
     * @param {Number} width - The new border width, in pixels.
     * @returns {Number} The original border width.
     */
    setBorderWidth: function(width) {
      width = parseInt(width, 10) || 1;
      var original = this.getBorderWidth();
      this._borderWidth = width;
      return original;
    },

    /**
     * @returns {atlas.material.Material} The Style's fill material.
     */
    getFillMaterial: function() {
      return this._fillMaterial;
    },

    /**
     * @returns {atlas.material.Material} The Style's gradients material.
     */
    getGradientMaterial: function() {
      return this._gradientMaterial;
    },

    /**
     * @returns {atlas.material.Material} The Style's border material.
     */
    getBorderMaterial: function() {
      return this._borderMaterial;
    },

    /**
     * @returns {Number} The Style's border width, in pixels.
     */
    getBorderWidth: function() {
      return this._borderWidth;
    },

    /**
     * @param {atlas.material.Style} other
     * @returns {Boolean} Whether the given object is equal to this object.
     */
    equals: function(other) {
      return other && this._equals(this.getFillMaterial(), other.getFillMaterial()) &&
          this._equals(this.getBorderMaterial(), other.getBorderMaterial()) &&
          this.getBorderWidth() === other.getBorderWidth();
    },

    // TODO(aramk) Abstract this.
    _equals: function(a, b) {
      // Allow type coercion. If first condition fails, at least one of them is assumed to be an
      // object, so if the second condition fails, either both are different objects, or a is
      // falsey - both of which indicate they are not equal.
      return (a == b) || (a && a.equals(b))
    },

    /**
     * @return {Object}
     */
    toJson: function() {
      var json = {};
      var fillMaterial = this.getFillMaterial();
      var borderMaterial = this.getBorderMaterial();
      var borderWidth = this.getBorderWidth();
      if (fillMaterial) { json.fillMaterial = fillMaterial.toJson(); }
      if (borderMaterial) { json.borderMaterial = borderMaterial.toJson(); }
      if (borderWidth != null) { json.borderWidth = borderWidth; }
      return json;
    },

    /**
     * @return {Object} Simliar to {@link #toJson()}, but keeps the properties as object references
     * rather than JSON objects.
     */
    toObject: function() {
      return {
        fillMaterial: this.getFillMaterial(),
        borderMaterial: this.getBorderMaterial(),
        borderWidth: this.getBorderWidth()
      };
    }

  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  /**
   * The default style for entities without an explicit style.
   * @static
   * @returns {Style}
   */
  Style.getDefault = function() {
    return new Style();
  };

  /**
   * @return {atlas.model.Material} The default fill {@link atlas.model.Material} used when
   *     constructing a {@link atlas.model.Style}.
   */
  Style.getDefaultFillMaterial = function() {
    return new Color('#ddd');
  };

  /**
   * @return {atlas.model.Material} The default gradient {@link atlas.model.Material} used when
   *     constructing a {@link atlas.model.Style}.
   */
  Style.getDefaultGradientMaterial = function() {
    return [{color: new Color('#ddd'), pivot: 0.0}];
  };

  /**
   * @return {atlas.model.Material} The default border {@link atlas.model.Material} used when
   *     constructing a {@link atlas.model.Style}.
   */
  Style.getDefaultBorderMaterial = function() {
    return new Color('#999');
  };

  /**
   * The default selected style for entities without an explicit style.
   * @static
   * @returns {Style}
   */
  Style.getDefaultSelected = function() {
    return new Style({fillMaterial: new Color('#87ECFE'), borderMaterial: new Color('#24A2FE')});
  };

  Style.DEFAULT_BORDER_WIDTH = 1;

  return Style;
});
