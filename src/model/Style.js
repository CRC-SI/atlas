// Style.js
define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError',
  './Colour'
], function (Setter, Class, DeveloperError, Colour) {

  /**
   * @typedef atlas.model.Style
   * @ignore
   */
  var Style;

  /**
   * Constructs a new Style object.
   * @class A Style object defines the colour and opacity of a polygon's
   * fill and border.
   *
   * @param {Object} [args]
   * @param {atlas.model.Colour} [args.fillColour=Colour.GREEN] - The fill colour for the polygon.
   * @param {atlas.model.Colour} [args.borderColour=Colour.GREEN] - The border colour for the polygon.
   * @param {Number} [args.borderWidth=1] - The border width for the polygon in pixels.
   *
   * @class atlas.model.Style
   */
  Style = Class.extend( /** @lends atlas.model.Style# */ {

    /**
     * Fill colour of this Style.
     * @type {atlas.model.Colour}
     * @private
     */
    _fillColour: null,

    /**
     * Border colour of this Style.
     * @type {atlas.model.Colour}
     * @private
     */
    _borderColour: null,

    /**
     * Border width in pixels of this Style.
     * @type {Number}
     * @private
     */
    _borderWidth: null,

    _init: function(args) {
      args = args || {};
      this._fillColour = args.fillColour;
      this._borderColour = args.borderColour;
      this._borderWidth = args.borderWidth;
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Sets the Style's fill colour.
     * @param {atlas.model.Colour} colour - The new fill colour.
     * @returns {atlas.model.Colour} The original colour.
     */
    setFillColour: function (colour) {
      if (!(colour instanceof Colour)) {
        throw new DeveloperError('Feature fill colour only accepts an atlas.model.colour, not', colour);
      }
      var original = this.getFillColour();
      this._fillColour = colour;
      return original;
    },

    /**
     * Sets the Style's border colour.
     * @param {atlas.model.Colour} colour - The new border colour.
     * @returns {atlas.model.Colour} The original border colour.
     */
    setBorderColour: function (colour) {
      if (!(colour instanceof Colour)) {
        throw new DeveloperError('Feature border colour only accepts an atlas.model.colour, not', colour);
      }
      var original = this.getBorderColour;
      this._borderColour = colour;
      return original;
    },

    /**
     * Sets the Style's border width.
     * @param {Number} width - The new border width, in pixels.
     * @returns {Number} The original border width.
     */
    setBorderWidth: function (width) {
      width = parseInt(width, 10) || 1;
      var original = this.getBorderWidth();
      this._borderWidth = width;
      return original;
    },

    /**
     * @returns {atlas.model.Colour} The Style's fill colour.
     */
    getFillColour: function () {
      return this._fillColour;
    },

    /**
     * @returns {atlas.model.Colour} The Style's border colour.
     */
    getBorderColour: function () {
      return this._borderColour;
    },

    /**
     * @returns {Number} The Style's border width, in pixels.
     */
    getBorderWidth: function () {
      return this._borderWidth;
    },

    /**
     * @param {atlas.model.Style} other
     * @returns {Boolean} Whether the given object is equal to this object.
     */
    equals: function (other) {
      return other && this._colourEquals(this.getFillColour(), other.getFillColour()) &&
          this._colourEquals(this.getBorderColour(), other.getBorderColour()) &&
          this.getBorderWidth() === other.getBorderWidth();
    },

    // TODO(aramk) Abstract this.
    _colourEquals: function (colourA, colourB) {
      // Allow type coercion. If first condition fails, at least one of them is assumed to be an
      // object, so if the second condition fails, either both are different objects, or colourA is
      // falsey - both of which indicate they are not equal.
      return (colourA == colourB) || (colourA && colourA.equals(colourB))
    }

  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  Style.getDefault = function () {
    return new Style({fillColour: Colour.GREEN, borderColour: null, borderWidth: 0});
  };

  return Style;
});
