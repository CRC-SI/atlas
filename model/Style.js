// Style.js
define([
  'atlas/util/DeveloperError',
  './Colour'
], function (DeveloperError, Colour) {
  "use strict";

  /**
   * Constructs a new Style object.
   * @class A Style object defines the colour and opacity of a polygon's
   * fill and border.
   *
   * @param {atlas.model.Colour} [fillColour] - The fill colour for the polygon.
   * @param {atlas.model.Colour} [borderColour] - The border colour for the polygon.
   * @param {Number} [borderWidth=1] - The borderwidth for the polygon in pixels.
   *
   * @alias atlas.model.Style
   * @constructor
   */
  var Style = function (fillColour, borderColour, borderWidth) {
    /**
     * Fill colour of this Style.
     * @type {atlas.model.Colour}
     * @private
     */
    this._fillColour = fillColour || Colour.GREEN;

    /**
     * Fill opacity of this Style.
     * @type {Number}
     */
    // this.opacity = 1.0;

    /**
     * Border colour of this Style.
     * @type {atlas.model.Colour}
     * @private
     */
    this._borderColour = fillColour || Colour.GREEN;

    /**
     * Border opacity of this Style.
     * @type {Number}
     */
    // this.borderOpacity = 1.0;

    /**
     * Border width in pixels of this Style.
     * @type {Number}
     * @private
     */
    this._borderWidth = borderWidth || 1.0;
  };

  /**
   * Sets the Style's fill colour.
   * @param {atlas.model.Colour} colour - The new fill colour.
   * @returns {atlas.model.Colour} The original colour.
   */
  Style.prototype.setFill = function (colour) {
    if (!(colour instanceof Colour)) {
      throw new DeveloperError('Feature fill colour only accepts an atlas.model.colour, not', colour);
    }
    var original = this.getFill();
    this._fillColour = colour;
    return original;
  };

  /**
   * Sets the Style's border colour.
   * @param {atlas.model.Colour} colour - The new border colour.
   * @returns {atlas.model.Colour} The original border colour.
   */
  Style.prototype.setBorderColour = function (colour) {
    if (!(colour instanceof Colour)) {
      throw new DeveloperError('Feature border colour only accepts an atlas.model.colour, not', colour);
    }
    var original = this.getBorderColour;
    this._borderColour = colour;
    return original;
  };

  /**
   * Sets the Style's border width.
   * @param {Number} width - The new border width, in pixels.
   * @returns {Number} The original border width.
   */
  Style.prototype.setBorderWidth = function (width) {
    width = parseInt(width, 10) || 1;
    var original = this.getBorderWidth();
    this._borderWidth = width;
    return original;
  };

  /**
   * @returns {atlas.model.Colour} The Style's fill colour.
   */
  Style.prototype.getFill = function () {
    return this._fillColour;
  };

  /**
   * @returns {atlas.model.Colour} The Style's border colour.
   */
  Style.prototype.getBorderColour = function () {
    return this._borderColour;
  };

  /**
   * @returns {Number} The Style's border width, in pixels.
   */
  Style.prototype.getBorderWidth = function () {
    return this._borderWidth;
  };

  Style.DEFAULT = function () {
    return new Style(Colour.GREEN, Colour.GREEN, 1);
  };

  return Style;
});
