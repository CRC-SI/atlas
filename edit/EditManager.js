define([

], function () {

  // TODO(aramk) refactor this into abstract atlas/core/ModularManager and use elsewhere (e.g. RenderManager).

  /**
   * Constructs a new EditManager object.
   * @class The EditManager encapsulates the relationship between user input, and modifying
   * the placement and geometry of GeoEntities. <code>Modules</code> are defined to contain
   * the logic of particular modifications, for example translation, scaling, and rotation.
   *
   * @param {Object} atlasManagers - Contains a mapping of Atlas manager names to manager instance.
   *
   * @alias atlas/edit/EditManager
   * @constructor
   */
  var EditManager = function (atlasManagers) {
    /**
     * Contains a mapping of Atlas manager names to the manager instance.
     * @type {Object.<String, Object.<String, Object>>}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.edit = this;

    /**
     * Contains a mapping of module name to Module object.
     * @type {Object.<String,Module>}
     */
    this._modules = {};

    /**
     * Contains a mapping of module name to a mapping of event strings to event handlers.
     * @type {Object.<String, Object>}
     * @private
     */
    this._listeners = {};

    /**
     * Lists the currently enabled modules by name.
     * @type {Object.<String>}
     */
    this._enabledModules = {};
  };

  /**
   * Initialisation that needs to occur after all managers are created.
   */
  EditManager.prototype.initialise = function () {};

  /**
   * Adds a new module with the given name.
   * @param {String} name - The name of the module.
   * @param {Object} module - The module.
   */
  EditManager.prototype.addModule = function (name, module) {
    this._modules[name] = module;
    this.disableModule(name);
  };

  EditManager.prototype.getModule = function (name) {
    return this._modules[name];
  };

  /**
   * Enables an existing module, or adds a new one and then enables it.
   * @param {String} name - The name of the module.
   * @param {Object} [module] - The module object.
   */
  EditManager.prototype.enableModule = function (name, module) {
    var module = this.getModule(name);
    var bindings = module.getEventBindings();
    this._listeners[name] = {};
    for (var event in bindings) {
      this._listeners[name][event] = this._atlasManagers.event.addEventHandler('intern', event, bindings[event].bind(module));
    }
    var existing = this.getModule(name);
    if (!existing && module) {
      this.addModule(name, module);
    }
    this._enabledModules[name] = this.getModule(name);
  };

  /**
   * Disables the module with the given name.
   * @param {String} name - The name of the module.
   */
  EditManager.prototype.disableModule = function (name) {
    var bindings = this.getModule(name).getEventBindings();
    // TODO(aramk) use "handler" or "listener" and not both?
    var listeners = this._listeners[name];
    for (var event in listeners) {
      listeners[event].cancel();
    }
    delete this._enabledModules[name];
  };

  /**
   * Enables or disables the module with the given name.
   * @param {String} name - The name of the module.
   * @param {Boolean} state - Whether the module is active.
   */
  EditManager.prototype.setIsModuleEnabled = function (name, state) {
    if (state) {
      this.enableModule(name);
    } else {
      this.disableModule(name);
    }
  };

  return EditManager;
});