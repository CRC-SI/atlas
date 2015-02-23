define([
  'atlas/lib/utility/Class',
], function(Class) {

  function def(val, defaultOption) {
    if (val === undefined || val === null) {
      return defaultOption;
    }
    return val;
  }

  var Factory;

  Factory = Class.extend(/** @lends atlas.core.AtlasFactor# */ {

    /**
     * A map of class ID to class constructors.
     *
     * @type {Object.<String, Class>}
     * @private
     */
    _constructors: null,

    /**
     * A map of instance ID to class instances.
     *
     * @type {Object.<String, Class>}
     * @private
     */
    _instances: null,

    _init: function(moduleDefinition, options) {
      options = options || {};

      this._constructors = {};
      this._instances = {};

      if (moduleDefinition) {
        this.setFromModule(moduleDefinition);
      }

      this._privateInstances = def(options.privateInstances, true);
      this._privateMethod = def(options.privateMethod, false);
      this._bindDependencies = def(options.bindDependencies, true);
      this._bindFactory = def(options.bindFactory, true);
      this._bindCreate = def(options.bindCreate, false);
      this._bindGetConstructor = def(options.bindGetConstructor, false);
      this._bindGetInstance = def(options.bindGetInstance, false);
    },

    setFromModule: function(moduleDef) {
      Object.keys(moduleDef).forEach(function(name) {
        this.bindConstructor(name, moduleDef[name]);
      }, this);
    },

    /**
     * Binds the the given Intance to the given ID.
     * @param {String} id - The ID to bind the instance to.
     * @param {Object} instance - The object to bind.
     */
    bindInstance: function(id, instance) {
      if (!id) {
        throw new Error('Must specify ID of instance');
      }
      if (!instance) {
        throw new Error('Must provide instance to bind');
      }
      this._instances[id] = instance;
    },

    /**
     * Retrieves the instance bound to the given ID.
     * @param {String} id - ID of the bound instance to retrieve.
     * @returns {Object} The requested instance.
     */
    getInstance: function(id) {
      var instance = this._instances[id];
      if (!instance) {
        throw new Error('Tried to get non-existent instance with ID ' + id);
      }
      return instance;
    },

    /**
     * Binds the given constructor to the given ID.
     * @param {String} id - The ID to bind the constructor to.
     * @param {Constructor} Constructor - The constructor of a class to bind to the given ID.
     */
    bindConstructor: function(id, Constructor) {
      if (!id) {
        throw new Error('Must specify ID of Constructor');
      }
      if (!Constructor) {
        throw new Error('Must provide Constructor to bind');
      }
      this._constructors[id] = Constructor;
    },

    /**
     * Retrieves the Constructor bound to the given ID.
     * @param {Strign} id - ID of the constructor to return.
     * @returns {Constructor} The requested Constructor.
     */
    getConstructor: function(id) {
      var Constructor = this._constructors[id];
      if (!Constructor) {
        throw new Error('Tried to get non-existent constructor with ID ' + id);
      }
      // TODO(bpstudds): Wrap constructor with injectDependencies.
      return Constructor;
    },

    /**
     * Creates a new object using the specified Constructor. Dependencies are injected into the
     * new object as specified by the Factory's options, and the Constructors
     * <code>_dependencies</code> property.
     * @param {String} id - The ID of the bound constructor to constructor.
     * @param {vargs...} constructorArgs - Arbitrary amount of arguments to pass to the constructor.
     * @returns {Object} The constructed object.
     */
    create: function(id, constructorArgs) {
      var args = Array.prototype.slice.call(arguments);
      id = args.shift();
      var Constructor;
      try {
        Constructor = this.getConstructor(id);
      } catch (e) {
        throw new Error('Tried to create un-registered class ' + id);
      }
      // Null required as first argument so constructor is applied correctly.
      // https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
      args.unshift(null);
      var obj = new (Function.prototype.bind.apply(Constructor, args))();

      this.injectDependencies(obj, Constructor);

      return obj;
    },

    /**
     * Injects the factory and any declared dependencies.
     * @param {Object} obj - The object to inject the dependncies to.
     * @param {Constructor} Class - The constructor of the object, used to determine the
     *     dependencies.
     */
    injectDependencies: function(obj, Class) {
      var factory = this;
      // Prefix if bound instances are private.
      var pi = this._privateInstances ? '_' : '';
      // Prefix if bound factory methods are private.
      var pm = this._privateMethods ? '_' : '';

      // Bind factory and factory methods.
      this._bindFactory && (obj[pi + 'factory'] = this);
      this._bindCreate && (obj[pm + 'create'] = factory.create);
      this._bindGetConstructor && (obj[pm + 'getConstructor'] = factory.getConstructor);
      this._bindGetInstance && (obj[pm + 'getInstance'] = factory.getInstance);

      // Bind declared dependency
      var dependencies = obj[pi + 'dependencies'] || (Class && Class[pi + 'dependencies']);
      if (this._bindDependencies && dependencies) {
        this.inject(dependencies, obj);
      }
    },

    inject: function(propertyToDependency, container, iter) {
      var rInject = this.inject.bind(this);
      var factory = this;
      Object.keys(propertyToDependency).forEach(function(propertyName) {
        var dependencyName = propertyToDependency[propertyName];

        if (typeof dependencyName !== 'string') {
          // dependencyName is an object containing nested dependencies.
          container[propertyName] = {};
          rInject(dependencyName, container[propertyName]);
        } else {
          try {
            container[propertyName] = factory.getInstance(dependencyName);
          } catch (e) {
            throw new Error('Tried to bind unregistered instance ' + dependencyName);
          }
        }
      });
    }

  });

  return Factory;

});
