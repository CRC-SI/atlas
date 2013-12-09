define([
], function () {
  return function(a, b) {
    if (a !== undefined) {
      return a;
    } else {
      return b;
    }
  };
});