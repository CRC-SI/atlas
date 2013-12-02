// Style.js
define([
  './Colour'
], function (Colour) {
  "use strict";

  /**
   * A Style object defines the colour and opacity of a polygon's
   * fill and border.
   *
   * @alias atlas/model/Style
   * @constructor
   */
  var Style = function (fillColour, borderColour, borderWidth) {
    /**
     * Fill colour of this Style.
     * @type {Colour}
     */
    this.fillColour = (fillColour || Colour.GREEN);

    /**
     * Fill opacity of this Style.
     * @type {Number}
     */
    // this.opacity = 1.0;

    /**
     * Border colour of this Style.
     * @type {Colour}
     */
    this.borderColour = (fillColour || Colour.GREEN);

    /**
     * Border opacity of this Style.
     * @type {Number}
     */
    // this.borderOpacity = 1.0;

    /**
     * Border width of this Style.
     * @type {Number}
     */
    this.borderWidth = (borderWidth || 1.0);
  };

  Style.DEFAULT = new Style(Colour.GREEN, Colour.GREEN, 1);

  return Style;
});