// Colour.js
define([
  'atlas/lib/tinycolor'
], function(tinycolor) {

  /**
   * Constructs a colour specified by red, green, blue and alpha
   * intensity values. The intensities can vary from <code>0.0</code>
   * (minimum intensity) to <code>1.0</code> (maximum intensity).
   *
   * @param {Number} [r=0.0] Red component.
   * @param {Number} [g=0.0] Green component
   * @param {Number} [b=0.0] Blue component
   * @param {Number} [a=0.0] Alpha component
   *
   * @alias atlas.model.Colour
   * @constructor
   */
  var Colour = function (r, g, b, a) {
    this.red    = Colour._limit(0.0, 1.0, r);
    this.green  = Colour._limit(0.0, 1.0, g);
    this.blue   = Colour._limit(0.0, 1.0, b);
    this.alpha  = Colour._limit(0.0, 1.0, a);
  };

  Colour._limit = function(lo, hi, x) {
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
  };

  /**
   * Function that creates a new Colour instance from the given RGBA values.
   * @param {Number|Array} red - The red value, where 0 is minimum intensity and 255 is maximum intensity. Alternatively, an array of 4 elements containing values for red, green, blue, and alpha in that order.
   * @param {Number} green - The green value, where 0 is minimum intensity and 255 is maximum intensity.
   * @param {Number} blue - The blue value, where 0 is minimum intensity and 255 is maximum intensity.
   * @param {Number} alpha - The alpha value, where 0 is minimum intensity and 255 is maximum intensity.
   * @returns {Colour}
   */
  Colour.fromRGBA = function(red, green, blue, alpha) {
    if (red.length) {
      return new Colour(red[0] / 255, red[1] / 255, red[2] / 255, red[3] / 255);
    } else {
      return new Colour(red / 255, green / 255, blue / 255, alpha / 255);
    }
  };

  // Specify some colour constants.
  Colour.WHITE = new Colour(1, 1, 1, 1);
  Colour.BLACK = new Colour(0, 0, 0, 1);
  Colour.RED = new Colour(1, 0, 0, 1);
  Colour.GREEN = new Colour(0, 1, 0, 1);
  Colour.BLUE = new Colour(0, 0, 1, 1);


  /// NEW CODE THAT WILL CONFLICT WITH ANOTHER PULL-REQUEST
  Colour.prototype.toString = function () {
    return 'rgba (' + [this.red, this.green, this.blue, this.alpha].join(', ') + ')';
  };

  Colour.prototype.toHsv = function () {
    var tiny = tinycolor(this.toString());
    return tiny.toHsv();
  };

  Colour.fromHsv = function (hsv) {
    var tiny = tinycolor(hsv).toRgb();
    return new Colour(tiny.r, tiny.g, tiny.b, 1);
  };


  return Colour;
});
