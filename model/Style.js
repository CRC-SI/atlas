// Style.js
define([
], function () {

  /**
   * A Style object defines the colour and opacity of a polygon's
   * fill and border.
   *
   * @alias atlas/model/Style
   * @constructor
   */
  var Style = function () {
    /**
     * Fill colour of this Style.
     * @type {Colour}
     */
    this.fillColour = null;

    /**
     * Fill opacity of this Style.
     * @type {Number}
     */
    this.opacity = 1.0;

    /**
     * Border colour of this Style.
     * @type {Colour}
     */
    this.borderColour = {};

    /**
     * Border opacity of this Style.
     * @type {Number}
     */
    this.borderOpacity = 1.0;

    /**
     * Border width of this Style.
     * @type {Number}
     */
    this.borderWidth = 1.0;
  };

  return Style;
});