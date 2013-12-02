// Colour.js
define([
], function() {

  /**
   * Constructs a colour specified by red, green, blue and alpha
   * intensity values. The intensities can vary from <code>0.0</code> 
   * (minimum intensity) to <code>1.0</code> (max intensity).
   * 
   * @param {Number} [r=0.0] Red component.
   * @param {Number} [g=0.0] Green component
   * @param {Number} [b=0.0] Blue component
   * @param {Number} [a=0.0] Alpha component
   * 
   * @alias atlas/model/Colour
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

  Colour.GREEN = new Colour(0, 1, 0, 0.7);

  return Colour;
});
