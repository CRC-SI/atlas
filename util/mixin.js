define([
], function () {

  /**
   * Mixes an object another object.
   * @param {Object} dest - The object to be updated.
   * @param {Object} src - The source of the updates.
   * @returns {Object}
   */
  return function (dest, src) {
    dest = dest || {};
    src = src || {};
    var keys = Object.keys(src);
    keys.forEach(function(key) {
      dest[key] = src[key];
    });
    return dest;
  };
});
