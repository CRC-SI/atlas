define([
], function () {

  /**
   * Mixes an object another object.
   * @param {Object} dest - The object to be updated.
   * @param {Object} src - The source of the updates.
   * @param {Boolean} [addToExisting=true] - If true, entries in <code>src</code> are added to
   *      <code>dest</code>, if an entry already exists it is overwritten.
   *      If false <code>dest</code> is entirely overwritten by <code>src</code>.
   * @returns {*}
   */
  return function (dest, src, addToExisting) {
    addToExisting = addToExisting === undefined ? true : addToExisting;
    src = src || {};
    if (!addToExisting) {
      dest = src;
    } else {
      var keys = Object.keys(src);
      keys.forEach(function(key) {
        dest[key] = src[key];
      });
    }
    return dest;
  };
});
