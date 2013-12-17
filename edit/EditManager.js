define([

], function () {

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
     * @type {Object.<String,Object>}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.edit = this;
    
    /**
     * Contains a mapping of module name to Module object.
     * @type {Object.<String,Module>}
     */
    this._modules = {};

    this._listeners = {};
    
    /**
     * Lists the currently enabled modules by name.
     * @type {Object.<String>}
     */
    this._enabledModules = {};
  };
  
  // aram: initialisation that needs to occur after all managers are created.
  /**
   * Completes all initialisation.
   */
  EditManager.prototype.initialise = function () {};
  
  // aram: binds handles to events that the editmanager is interested in (on EventManager).
  /**
   * desc.
   * @private
   */
//  // THIS BINDS TO 'input/leftclick'
//  EditManager.prototype._bindEvents = function () {
//  };
  
  // aram: adds a new module
  /**
   * desc.
   * @param {String} name - desc.
   * @param {Object} module - desc.
   */
  EditManager.prototype.addModule = function (name, module) {
    this._modules[name] = module;
    this.disableModule(name);
  };
  
  // aram: enables an existing module, or adds a new one and then enable it.
  /**
   * desc.
   * @param {String} name - desc.
   * @param {Object} [module=null] - desc.
   */
  EditManager.prototype.enableModule = function (name, module) {
    var bindings = this._modules[name].getEventBindings();
    this._listeners[name] = {};
    for (var event in bindings) {
      this._listeners[name][event] = this._atlasManagers.event.addEventHandler('intern', event, bindings[event].bind(this))
    }
    this._enabledModules[name] = module;
  };
  
  /**
   * desc.
   * @param {String} module - desc.
   */
  EditManager.prototype.disableModule = function (name) {
    var bindings = this._modules[name].getEventBindings();
    // TODO(aramk) use "handler" or "listener" and not both?
    var listeners = this._listeners[name];
    for (var event in listeners) {
      var listener = listeners[event];
      listener.cancel('intern', listener.id);
    }
    delete this._enabledModules[name];
  };

  /**
   * desc.
   * @param {String} module - desc.
   */
  EditManager.prototype.setIsModuleEnabled = function (name, state) {
    if (state) {
      this.enableModule(name);
    } else {
      this.disableModule(name);
    }
  };
  
  /**
   *
   * @param {String} module - desc.
   * @param {Object} mode - desc.
   * @param {Boolean} [unset=false] - desc.
   */
  EditManager.prototype.setModuleMode = function (module, mode, unset) {};
  
  return EditManager;
});