define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError',
  './Colour'
], function(Setter, Class, DeveloperError, Colour) {

  /**
   * @typedef atlas.model.Style
   * @ignore
   */
  var Style;

  /**
   * Constructs a new Style object.
   * @classdesc Defines the fill and border materials of a polygon.
   *
   * @param {Object} [args]
   * @param {atlas.material.Material} [args.fillMaterial=Colour.GREEN] - The fill material for the polygon.
   * @param {atlas.material.Material} [args.borderMaterial=Colour.GREEN] - The border material for the
   * polygon.
   * @param {Number} [args.borderWidth=1] - The border width for the polygon in pixels.
   *
   * @class atlas.model.Style
   */
  Style = Class.extend( /** @lends atlas.model.Style# */ {

    /**
     * Fill material of this Style.
     * @type {atlas.material.Material}
     * @private
     */
    _fillMaterial: null,

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
      this.setFillMaterial(args.fillMaterial);
      this.setBorderMaterial(args.borderMaterial);
      this.setBorderWidth(Setter.def(args.borderWidth, 1));
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
     * @param {atlas.model.Style} other
     * @returns {Boolean} Whether the given object is equal to this object.
     */
    equals: function(other) {
      return other && this._colourEquals(this.getFillMaterial(), other.getFillMaterial()) &&
          this._colourEquals(this.getBorderMaterial(), other.getBorderMaterial()) &&
          this.getBorderWidth() === other.getBorderWidth();
    },

    // TODO(aramk) Abstract this.
    _colourEquals: function(colourA, colourB) {
      // Allow type coercion. If first condition fails, at least one of them is assumed to be an
      // object, so if the second condition fails, either both are different objects, or colourA is
      // falsey - both of which indicate they are not equal.
      return (colourA == colourB) || (colourA && colourA.equals(colourB))
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
    return new Style({fillMaterial: new Colour('#ddd'), borderMaterial: new Colour('#999')});
  };

  /**
   * The default selected style for entities without an explicit style.
   * @static
   * @returns {Style}
   */
  Style.getDefaultSelected = function() {
    return new Style({fillMaterial: Colour.RED, borderMaterial: Colour.BLACK});
  };

  return Style;
});
