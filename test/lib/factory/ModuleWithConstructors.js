define([
  './factoryClasses/Foo.js',
  './factoryClasses/Bar.js',
  './factoryClasses/BazNeedsAFoo.js',
  './factoryClasses/Bork.js'
], function(Foo, Bar, BazNeedsAFoo, Bork) {

  return {
    'factoryClasses/Foo': Foo,
    'factoryClasses/Bar': Bar,
    'factoryClasses/BazNeedsAFoo': BazNeedsAFoo,
    'factoryClasses/Bork': Bork
  };

});
