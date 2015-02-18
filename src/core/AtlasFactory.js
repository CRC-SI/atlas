define([
  'atlas/lib/utility/Class',
], function(Class) {

  function def(val, defaultOption) {
    if (val === undefined || val === null) {
      return defaultOption;
    }
    return val;
  }

  var AtlasFactory;

  AtlasFactory = Class.extend(/** @lends atlas.core.AtlasFactor# */ {

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

    bindInstance: function(id, instance) {
      this._instances[id] = instance;
    },

    getInstance: function(id) {
      var instance = this._instances[id];
      if (!instance) {
        throw new Error('Tried to get non-existent instance with ID ' + id);
      }
      return instance;
    },

    bindConstructor: function(id, Constructor) {
      this._constructors[id] = Constructor;
    },

    getConstructor: function(id) {
      var Constructor = this._constructors[id];
      if (!Constructor) {
        throw new Error('Tried to get non-existent constructor with ID ' + id);
      }
      // TODO(bpstudds): Wrap constructor with injectDependencies.
      return Constructor;
    },

    create: function(className, constructorArgs) {
      var args = Array.prototype.slice.call(arguments);
      className = args.shift();
      var Class;
      try {
        Class = this.getConstructor(className);
      } catch (e) {
        throw new Error('Tried to create un-registered class ' + className);
      }
      // Null required in arguments so constructor is applied correctly.
      // https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
      args.unshift(null);
      var obj = new (Function.prototype.bind.apply(Class, args))();

      this.injectDependencies(Class, obj);

      return obj;
    },

    injectDependencies: function(Class, obj) {
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
      var dependencies = Class[pi + 'dependencies'];
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

    //   for propertyName in deps:
    //     if deps[propertyName] is object
    //       container[propertyName] = {};
    //       inject(deps[propertyName], container[propertyName])
    //     else
    //       container[propertyName] = getInstance[propertyName]
    // }

  });

  return AtlasFactory;

});
