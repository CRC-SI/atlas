define([
], function () {

  /**
   * Used to freeze objects using ECMAScript5 <code>Object.freeze</code>. If this
   * is unsupported, the object is returned unchanged.
   * @exports atlas.util.freezeObject
   */
  var freezeObject = Object.freeze;
  if (freezeObject === undefined) {
    freezeObject = function (o) {
      return o;
    };
  }
  return freezeObject;
});
