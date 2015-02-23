define([
], function() {

  var Foo = function(foo) {
    this.foo = foo;
  };

  Foo.prototype.getFoo = function() {
    return this.foo;
  };

  return Foo;

});
