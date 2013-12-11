define([
], function () {
  return function(a, b) {
    return a !== undefined ? a : b; 
  };
});