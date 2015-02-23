define([
  'atlas/util/Factory',
  '../../lib/factory/ModuleWithConstructors.js',
  '../../lib/factory/factoryClasses/Foo.js',
  '../../lib/factory/factoryClasses/Bar.js',
  '../../lib/factory/factoryClasses/BazNeedsAFoo.js'
], function(Factory, moduleWithConstructors, Foo, Bar, BazNeedsAFoo) {

  var factory;

  describe('A Factory', function() {

    afterEach(function() {
      factory = null;
    });

    it('accepts module definitions that define constructors to bind on construction', function() {
      factory = new Factory(moduleWithConstructors);

      var foo = factory.getConstructor('factoryClasses/Foo');
      var bar = factory.getConstructor('factoryClasses/Bar');
      var baz = factory.getConstructor('factoryClasses/BazNeedsAFoo');

      expect(foo).toBeDefined();
      expect(bar).toBeDefined();
      expect(baz).toBeDefined();
      expect(foo !== bar !== baz).toBe(true);
    });

    it('can bind and retrieve constructors when requested', function() {
      factory = new Factory();
      factory.bindConstructor('foo', Foo);

      var actualFoo = factory.getConstructor('foo');
      expect(actualFoo).toBeDefined();

      expect(actualFoo.prototype).toBe(Foo.prototype);
    });

    it('can create instances of bound classes', function() {
      factory = new Factory(moduleWithConstructors);
      var foo = factory.create('factoryClasses/Foo', 12);

      expect(foo).toBeDefined();
      expect(foo instanceof Foo).toBe(true);
      expect(foo.getFoo()).toBe(12);
    });

    it('can bind instances to a name', function() {
      factory = new Factory(moduleWithConstructors);
      var foo = factory.create('factoryClasses/Foo', 12);

      factory.bindInstance('theFoo', foo);
      expect(factory.getInstance('theFoo')).toBe(foo);
    });

    it('can populated declared dependencies with a specified name when creating classes, if the ' +
        'given instance has been registered', function() {
      factory = new Factory(moduleWithConstructors);
      var foo = factory.create('factoryClasses/Foo', 12);
      factory.bindInstance('theFoo', foo);

      // Check that the dependency has be correctly defined as tested here.
      expect(BazNeedsAFoo._dependencies._foo).toEqual('theFoo');

      var baz = factory.create('factoryClasses/BazNeedsAFoo', 4);
      expect(foo.getFoo()).toEqual(12);
      expect(baz.b).toEqual(4);
      expect(baz.calcBaz()).toEqual(12 + 4);
    });

    it('can populate declared nested dependencies if they exist', function() {
      factory = new Factory(moduleWithConstructors);
      var foo = factory.create('factoryClasses/Foo', 12);
      factory.bindInstance('theFoo', foo);
      var bar = factory.create('factoryClasses/Bar', 24);
      factory.bindInstance('theBar', bar);
      var bork = factory.create('factoryClasses/Bork', 1);

      expect(foo.getFoo()).toEqual(12);
      expect(bar.getBar()).toEqual(24);
      expect(bork.borkaMorka()).toEqual(1 + 12 + 24);
    });

    describe('Error checking', function() {
      it('should fail creating if a dependency is missing', function() {
        factory = new Factory(moduleWithConstructors);
        var exception = '';
        try {
          factory.create('factoryClasses/BazNeedsAFoo', 4);
        } catch (e) {
          exception = e.message;
        }
        expect(exception.match(/unregistered instance.*theFoo/)).toBeDefined();
      });

      it('should fail retrieving an instance if it is not registered', function() {
        factory = new Factory(moduleWithConstructors);
        var exception = '';
        try {
          factory.getInstance('noSuchThing');
        } catch (e) {
          exception = e.message;
        }
        expect(exception.match(/unregistered instance.*noSuchThing/)).toBeDefined();
      });

      it('should fail retrieving a constructor if it is not registered', function() {
        factory = new Factory(moduleWithConstructors);
        var exception = '';
        try {
          factory.getConstructor('noSuchThing');
        } catch (e) {
          exception = e.message;
        }
        expect(exception.match(/unregistered constructor.*noSuchThing/)).toBeDefined();
      });

    });

  });

});
