// Function to facilitate prototypical inheritance
// Based upon
// http://js-bits.blogspot.com.au/2010/08/javascript-inheritance-done-right.html

define([
], function () {
  var surrogateCtor = function() {};

  /**
   * Produces a subclasses based on extending the given base class.
   * @param {Object} base The base class that is being extended.
   * @param {Object} sub  The extended class.
   */
  var Extends = function (base, sub) {
    surrogateCtor.prototype = base.prototype;
    sub.prototype = new surrogateCtor();
    sub.prototype.constructor = sub;

    // Add a reference to the base class' prototype
    sub.base = base.prototype;

    return sub;
  };

  return Extends;
});
