define([
], function () {
  /**
   * Defines a bunch of handy math functions. That are probably defined elsewhere.
   * @exports atlas.util.AtlasMath
   */
  return {

    // -------------------------------------------
    // CONVERSIONS
    // -------------------------------------------

    /**
     * @param {Number} radians - Values to convert to degrees.
     * @returns {Number}
     */
    toDegrees: function (radians) {
      radians = parseInt(radians, 10) || 0;
      return radians / Math.PI * 180;
    },

    /**
     * @param {Number} degrees - Values to convert to radians.
     * @returns {Number}
     */
    toRadians: function (degrees) {
      degrees = parseInt(degrees, 10) || 0;
      return degrees * Math.PI / 180;
    },

    // -------------------------------------------
    // FUNCTIONS
    // -------------------------------------------

    /**
     * Linearly interpolates between two values.
     * @param {Number} lo - The value to interpolate from.
     * @param {Number} hi - The value to interpolate to.
     * @param {Number} f - The interpolation factor.
     * @returns {Number}
     */
    lerp: function (lo, hi, f) {
      return lo + (hi - lo) * f;
    },

    /**
     * Limits a value to a specific range of values,
     * @param {Number} x - Number to limit.
     * @param {Number} [lo=0] - The minimum value.
     * @param {Number} [hi=1] - The maximum value.
     * @returns {Number}
     */
    limit: function(x, lo, hi) {
      x  = parseFloat(x);
      lo = parseFloat(lo) || 0.0;
      hi = parseFloat(hi) || 1.0;

      if (x < lo) return lo;
      if (x > hi) return hi;
      return x;
    },

    /**
     * Rounds a number to a given precision.
     * @param val
     * @param precision
     * @returns {number}
     */
    round: function (val, precision) {
      return Math.round(val / precision) * precision;
    }
  };
});
