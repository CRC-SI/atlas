define([
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Setter'
], function(Class, Setter) {

  /**
   * @type {atlas.utility.Factory}
   * @ignore
   */
  var Factory;

  /**
   * @classdesc The Factory simplifies creating Atlas classes and their provided subclasses by
   * maintaining a map of class name to the appropriate class constructor, as well as instances of
   * "global" class instances that may be depended on by other classes.
   *
   * Class instances and constructors can be bound to the Factory. A module definition can also be
   * used to define a large number of class constructors that should be bound.
   *
   * The Factory can be used to request class instances or constructors (when their ID is known),
   * without having to know or care whether it is an Atlas class or provider subclass. Additionally,
   * the Factory can be used to create registered class via their ID, alleviating the need for the
   * constructing class to know about the concrete constructed class.
   *
   * @param {Object.<String, Constructor>} moduleDefinition - A map of constructor ID to constructor
   *     object that should be bound to the Factory. These can be overridden via
   *     <code>bindConstructor</code> or <code>setFromModule</code>.
   * @param {Object} [options] - Options that govern the Factory's behaviour.
   * @param {Boolean} [options.privateInstances=true] - If true, injected instances property names
   *     should be prefixed with an underscore.
   * @param {Boolean} [options.privateMethods=false] - If true, injected method property names
   *     should be prefixed with an underscore.
   * @param {Boolean} [options.bindDependencies=true] - If true, declared Constructor dependencies
   *     will be bound to constructed instances with property names.
   * @param {Boolean} [options.bindFactory=true] - If true, the current Factory instance will be
   *     bound onto created instances as <code>factory</code> prefixed as per
   *     <code>privateInstances</code>.
   * @param {Boolean} [options.bindCreate=false] - If true, Factory.create will be bound onto
   *     created instances as <code>create</code> prefixed as per <code>privateMethods</code>.
   * @param {Boolean} [options.bindCreate=false] - If true, Factory.create will be bound onto
   *     created instances as <code>create</code> prefixed as per <code>privateMethods</code>.
   * @param {Boolean} [options.bindGetConstructor=false] - If true, the Factory.getConstructor will
   *     be bound onto created instances as <code>getConstructor</code> prefixed as per
   *     <code>privateMethods</code>.
   * @param {Boolean} [options.bindGetInstance=false] - If true, Factory.getInstance will
   *     be bound onto created instances as <code>getInstance</code> prefixed as per
   *     <code>privateMethods</code>.
   *
   * @class atlas.utility.Factory
   */
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

    /**
     * Options configuring the behaviour of the Factory.
     *
     * @type {Object.<String, Boolean>}
     * @private
     */
    _options: null,

    _init: function(moduleDefinition, options) {
      this._options = Setter.merge({
        privateInstances: true,
        privateMethods: false,
        bindDependencies: true,
        bindFactory: true,
        bindCreate: false,
        bindGetConstructor: false,
        bindGetInstance: false
      }, options);

      this._constructors = {};
      this._instances = {};

      if (moduleDefinition) {
        this.setFromModule(moduleDefinition);
      }
    },

    /**
     * Initialises the Factory with the given constructors. The constructors
     *
     * @param {Object.<String, Constructor>} moduleDef - A map of constructor ID to the Constructor
     *     to be bound in the Factory.
     */
    setFromModule: function(moduleDef) {
      Object.keys(moduleDef).forEach(function(name) {
        this.bindConstructor(name, moduleDef[name]);
      }, this);
    },

    /**
     * Binds the the given Instance to the given ID. If the ID is already bound with an instance,
     * it is silently overridden with the given instance.
     *
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
     *
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
     * Binds the given constructor to the given ID. If the ID is already bound to a constructor,
     * that constructor is silently overridden with the given constructor.
     *
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
     *
     * @param {Strign} id - ID of the constructor to return.
     * @returns {Constructor} The requested Constructor.
     */
    getConstructor: function(id) {
      var Constructor = this._constructors[id];
      if (!Constructor) {
        throw new Error('Tried to get non-existent constructor with ID ' + id);
      }
      return Constructor;
    },

    /**
     * Creates a new object using the specified Constructor. Dependencies are injected into the
     * new object as specified by the Factory's options, and the Constructors
     * <code>_dependencies</code> property.
     *
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
        throw new Error('Tried to create unregistered class ' + id);
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
     *
     * @param {Object} obj - The object to inject the dependencies to.
     * @param {Constructor} Class - The constructor of the object, used to determine the
     *     dependencies.
     */
    injectDependencies: function(obj, Class) {
      var factory = this;
      // Prefix if bound instances are private.
      var pi = this._options.privateInstances ? '_' : '';
      // Prefix if bound factory methods are private.
      var pm = this._options.privateMethods ? '_' : '';

      // Bind factory and factory methods.
      this._options.bindFactory && (obj[pi + 'factory'] = this);
      this._options.bindCreate && (obj[pm + 'create'] = factory.create);
      this._options.bindGetConstructor && (obj[pm + 'getConstructor'] = factory.getConstructor);
      this._options.bindGetInstance && (obj[pm + 'getInstance'] = factory.getInstance);

      // Bind declared dependencies.
      if (this._options.bindDependencies) {
        var dependencies = obj[pi + 'dependencies'] || (Class && Class[pi + 'dependencies']);
        dependencies && this._inject(dependencies, obj);
      }
    },

    _inject: function(propertyToDependency, container, iter) {
      var rInject = this._inject.bind(this);
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
