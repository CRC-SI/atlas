// Style.js
define([
  './Colour'
], function (Colour) {
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
     * @type {Colour}
     */
    this.fillColour = fillColour || Colour.GREEN;

    /**
     * Fill opacity of this Style.
     * @type {Number}
     */
    // this.opacity = 1.0;

    /**
     * Border colour of this Style.
     * @type {Colour}
     */
    this.borderColour = fillColour || Colour.GREEN;

    /**
     * Border opacity of this Style.
     * @type {Number}
     */
    // this.borderOpacity = 1.0;

    /**
     * Border width in pixels of this Style.
     * @type {Number}
     */
    this.borderWidth = borderWidth || 1.0;
  };

  Style.DEFAULT = new Style(Colour.GREEN, Colour.GREEN, 1);

  return Style;
});
