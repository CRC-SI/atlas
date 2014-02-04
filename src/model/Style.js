// Style.js
define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  './Colour'
], function (Class, DeveloperError, mixin, Colour) {
  "use strict";

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
  var Style = Class.extend( /** @lends atlas.model.Style# */ {

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
      args = mixin({
        fillColour: Colour.GREEN,
        borderWidth: 1
      }, args);
      this._fillColour = args.fillColour;
      this._borderColour = args.borderColour || args.fillColour;
      this._borderWidth = args.borderWidth;
    },

    /**
     * Sets the Style's fill colour.
     * @param {atlas.model.Colour} colour - The new fill colour.
     * @returns {atlas.model.Colour} The original colour.
     */
    setFill: function (colour) {
      if (!(colour instanceof Colour)) {
        throw new DeveloperError('Feature fill colour only accepts an atlas.model.colour, not', colour);
      }
      var original = this.getFill();
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
    getFill: function () {
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
    }
  });

//////
// STATICS
  Style.DEFAULT = function () {
    return new Style({fillColour: Colour.GREEN, borderColour: Colour.GREEN, borderWidth: 1});
  };

  return Style;
});
