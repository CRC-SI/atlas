define([
], function() {

  var Bar = function(bar) {
    this.bar = bar;
  };

  Bar.prototype.getBar = function() {
    return this.bar;
  };

  return Bar;

});
