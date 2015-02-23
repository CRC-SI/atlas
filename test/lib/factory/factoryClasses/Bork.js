define([
], function() {

  var Bork = function(d) {
    this.d = d;
    this._foo = null;
  };

  Bork.prototype.borkaMorka = function() {
    return this.d + this._things.foo.getFoo() + this._things.bar.getBar();
  };

  Bork._dependencies = {
    '_things': {
      'foo': 'theFoo',
      'bar': 'theBar'
    }
  };

  return Bork;

});
