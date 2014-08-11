define([
], function() {

  /**
   * Provides utilities for creating and managing object instances.
   * @class atlas.util.Instances
   */
  return {

    /**
     * The name of the static method to construct for returning a global instance.
     * @type {String}
     */
    _globalAccessorName: 'getInstance',

    /**
     * The property to use for storing a global instance.
     * @type {String}
     */
    _instancePropertyName: '_instance',

    /**
     * Defines a static accessor method named {@link #_globalAccessorName} for retrieving a global
     * instance.
     * @param {Function} constructor
     * @param {Array} [args] - Either an array of arguments to invoke the constructor with.
     * @returns {Function} The original constructor with the added accessor method.
     */
    defineGlobal: function(constructor, args) {
      var instance = constructor[this._instancePropertyName];
      if (!instance) {
        // In order to use the `new` keyword, we must wrap the constructor in a `bind()` which we
        // provide with `null` scope and the passed arguments. This constructs a new function which
        // we can use with the `new` keyword without needing to invoke it with our passed arguments.
        // Since the underlying bound constructor is still called, `instanceof` works as before.
        var _args = [null];
        args !== undefined && _args.concat(args);
        instance = new (constructor.bind.apply(constructor, _args))();
      }
      constructor[this._globalAccessorName] = function() {
        return instance;
      };
      return constructor;
    }

  };
});
