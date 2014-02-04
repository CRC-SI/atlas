define([
], function () {
  /**
   * Defines a bunch of handy math functions. That are probably defined else where.
   * @exports atlas.util.AtMath
   */
  return {
    /**
     * @param {Number} degrees - Values to convert to radians.
     * @returns {Number}
     */
    toRadians: function (degrees) {
      degrees = parseInt(degrees, 10) || 0;
      return degrees * Math.PI / 180;
    },

    /**
     * @param {Number} radians - Values to convert to degrees.
     * @returns {Number}
     */
    toDegrees: function (radians) {
      radians = parseInt(radians, 10) || 0;
      return radians / Math.PI * 180;
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
    }
  };
});
