define([
], function() {

  var Baz = function(b) {
    this.b = b;
    this._foo = null;
  };

  Baz.prototype.calcBaz = function() {
    return this.b + this._foo.getFoo();
  };

  Baz._dependencies = {
    '_foo': 'theFoo'
  };

  return Baz;

});
