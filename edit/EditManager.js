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
  
  /**
   * desc.
   */
  EditManager.prototype.initialize = function () {};
  
  /**
   * desc.
   * @private
   */
  EditManager.prototype._bindEvents = function () {};
  
  /**
   * desc.
   * @param {String} module - desc.
   */
  EditManager.prototype.enableModule = function (module) {};
  
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