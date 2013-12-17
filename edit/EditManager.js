define([
  ''
], function () {

  /**
   * Constructs a new EditManager object.
   * @class EditManager ...
   *
   * @param {Object} atlasManagers - Contains a mapping of Atlas manager names to manager instance.
   * 
   * @alias atlas/edit/EditManager
   * @constructor
   */
  var EditManager = function (atlasManagers) {
    this._atlasManagers = atlasManagers;
    this._atlasManagers.edit = this;
    
    /**
     * Contains a mapping of module name to Module object.
     * @type {Object.<String,Module>}
     */
    this._modules = {};
    
    /**
     * Lists the currently enabled modules.
     * @type {Array.<String>}
     */
    this._enabledModules = [];
  }
  
  // aram: initialisation that needs to occur after all managers are created.
  /**
   * desc.
   */
  EditManager.prototype.initialise = function () {};
  
  // aram: binds handles to events that the editmanager is interested in (on EventManager).
  /**
   * desc.
   * @private
   */
  EditManager.prototype._bindEvents = function () {};
  
  // aram: adds a new module
  /**
   * desc.
   * @param {String} moduleName - desc.
   * @param {Object} module - desc.
   */
  EditManager.prototype.addModule = function (moduleName, module) {};
  
  // aram: enables an existing module, or adds a new one and then enable it.
  /**
   * desc.
   * @param {String} moduleName - desc.
   * @param {Object} [module=null] - desc.
   */
  EditManager.prototype.enableModule = function (moduleName, module) {};
  
  /**
   * desc.
   * @param {String} module - desc.
   */
  EditManager.prototype.disableModule = function (module) {};
  
  // I don't know about this name. Maybe rename it.
  /**
   * desc.
   * @param {String} module - desc.
   */
  EditManager.prototype.setModuleEnabled = function (module) {};
  
  /**
   *
   * @param {String} module - desc.
   * @param {Object} mode - desc.
   * @param {Boolean} [unset=false] - desc.
   */
  EditManager.prototype.setModuleMode = function (module, mode, unset) {};
  
  return EditManager;
});