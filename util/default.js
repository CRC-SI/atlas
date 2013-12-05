define([
], function () {
  return function(a, b) {
    if (typeof a !== 'undefined') {
      return a;
    } else {
      return b;
    }
  };
});