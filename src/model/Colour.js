define([
  'atlas/util/AtMath',
  'atlas/util/Class',
  'atlas/util/FreezeObject',
], function(AtMath, Class, freeze) {

  /**
   * @classdesc Constructs a colour specified by red, green, blue and alpha
   * intensity values. The intensities can vary from <code>0.0</code>
   * (minimum intensity) to <code>1.0</code> (maximum intensity).
   *
   * @param {Number} [r=0.0] Red component.
   * @param {Number} [g=0.0] Green component
   * @param {Number} [b=0.0] Blue component
   * @param {Number} [a=0.0] Alpha component
   *
   * @class atlas.model.Colour
   */
  var Colour = Class.extend( /** @lends atlas.model.Colour# */ {
    red: null,
    green: null,
    blue: null,
    alpha: null,

    _init: function(r, g, b, a) {
      this.red    = AtMath.limit(r);
      this.green  = AtMath.limit(g);
      this.blue   = AtMath.limit(b);
      this.alpha  = AtMath.limit(a);
    }
  });

//////
// STATICS

  /**
   * Function that creates a new Colour instance from the given RGBA values.
   * @param {Number|Array} red - The red value, where 0 is minimum intensity and 255 is maximum intensity. Alternatively, an array of 4 elements containing values for red, green, blue, and alpha in that order.
   * @param {Number} green - The green value, where 0 is minimum intensity and 255 is maximum intensity.
   * @param {Number} blue - The blue value, where 0 is minimum intensity and 255 is maximum intensity.
   * @param {Number} alpha - The alpha value, where 0 is minimum intensity and 255 is maximum intensity.
   * @returns {atlas.model.Colour}
   */
  Colour.fromRGBA = function(red, green, blue, alpha) {
    if (red.length) {
      return new Colour(red[0] / 255, red[1] / 255, red[2] / 255, red[3] / 255);
    } else {
      return new Colour(red / 255, green / 255, blue / 255, alpha / 255);
    }
  };

  // These constants are frozen. Any attempt to alter them may silently fail.
  Colour.WHITE = freeze(new Colour(1, 1, 1, 1));
  Colour.GREY = freeze(new Colour(0.7, 0.7, 0.7, 1));
  Colour.BLACK = freeze(new Colour(0, 0, 0, 1));
  Colour.RED = freeze(new Colour(1, 0, 0, 1));
  Colour.GREEN = freeze(new Colour(0, 1, 0, 1));
  Colour.BLUE = freeze(new Colour(0, 0, 1, 1));

  return Colour;
});
