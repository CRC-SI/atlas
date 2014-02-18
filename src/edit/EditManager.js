define([
  'atlas/edit/TranslationModule'
], function(TranslationModule) {

  // TODO(aramk) refactor this into abstract atlas.core.ModularManager and use elsewhere (e.g. RenderManager).

  /**
   * Constructs a new EditManager object.
   * @class The EditManager encapsulates the relationship between user input, and modifying
   * the placement and geometry of GeoEntities. <code>Modules</code> are defined to contain
   * the logic of particular modifications, for example translation, scaling, and rotation.
   *
   * @param {Object} atlasManagers - Contains a mapping of Atlas manager names to manager instance.
   *
   * @alias atlas.edit.EditManager
   * @constructor
   */
  var EditManager = function(atlasManagers) {
    /**
     * Contains a mapping of Atlas manager names to the manager instance.
     * @type {Object.<String, Object.<String, Object>>}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.edit = this;

    /**
     * Contains a mapping of module name to Module object.
     * @type {Object.<String,Object>}
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
  EditManager.prototype.setup = function() {
    this.addModule('translation', new TranslationModule(this._atlasManagers));
    // TODO(aramk) Disabled translation by default.
//    this.enableModule('translation');
  };

  /**
   * Adds a new module with the given name.
   * @param {String} name - The name of the module.
   * @param {Object} module - The module.
   */
  EditManager.prototype.addModule = function(name, module) {
    this._modules[name] = module;
    this.disableModule(name);
  };

  EditManager.prototype.getModule = function(name) {
    return this._modules[name];
  };

  /**
   * Enables an existing module.
   * @param {String} name - The name of the module.
   */
  EditManager.prototype.enableModule = function(name) {
    var module = this.getModule(name);
    if (!module) return;

    var bindings = module.getEventBindings();
    if (!this._listeners[name]) this._listeners[name] = {};
    for (var event in bindings) {
      if (bindings.hasOwnProperty(event)) {
        this._listeners[name][event] = this._atlasManagers.event.addEventHandler('intern', event,
            bindings[event].bind(module));
      }
    }
    this._enabledModules[name] = module;
  };

  /**
   * Disables the module with the given name.
   * @param {String} name - The name of the module.
   */
  EditManager.prototype.disableModule = function(name) {
    // TODO(aramk) use "handler" or "listener" and not both?
    var listeners = this._listeners[name];
    for (var event in listeners) {
      if (listeners.hasOwnProperty(event)) {
        listeners[event].cancel();
      }
    }
    delete this._enabledModules[name];
  };

  /**
   * Enables or disables the module with the given name.
   * @param {String} name - The name of the module.
   * @param {Boolean} state - Whether the module is active.
   */
  EditManager.prototype.setIsModuleEnabled = function(name, state) {
    if (state) {
      this.enableModule(name);
    } else {
      this.disableModule(name);
    }
  };

  return EditManager;
});
