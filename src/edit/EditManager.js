define([
  'atlas/edit/TranslationModule',
  'atlas/util/Class'
], function(TranslationModule, Class) {

  // TODO(aramk) refactor this into abstract atlas.core.ModularManager and use elsewhere (e.g. RenderManager).
  /**
   * @typedef atlas.edit.EditManager
   * @ignore
   */
  var EditManager;

  /**
   * @classdesc The EditManager encapsulates the relationship between user input, and modifying
   * the placement and geometry of GeoEntities. <code>Modules</code> are defined to contain
   * the logic of particular modifications, for example translation, scaling, and rotation.
   *
   * @param {Object} atlasManagers - Contains a mapping of Atlas manager names to manager instance.
   *
   * @class atlas.edit.EditManager
   */
  EditManager = Class.extend( /** @lends atlas.edit.EditManager# */ {
    /**
     * Contains a mapping of Atlas manager names to the manager instance.
     * @type {Object.<String, Object.<String, Object>>}
     */
    _atlasManagers: null,

    /**
     * Whether editing is enabled.
     * @type {boolean}
     */
    _editing: null,

    /**
     * Contains a mapping of module name to Module object.
     * @type {Object.<String,Object>}
     */
    _modules: null,

    /**
     * Contains a mapping of module name to a mapping of event strings to event handlers.
     * @type {Object.<String, Object>}
     * @private
     */
    _listeners: null,

    /**
     * Lists the currently enabled modules by name.
     * @type {Object.<String>}
     */
    _enabledModules: null,

    /**
     * An array of event listeners for user input. <code>_inputEventHandlers</code> is non-null
     * when editing is enabled. When editing is disabled, the only event being listened for
     * is the event to enable and disable editing.
     */
    _inputEventHandlers: null,

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.edit = this;

      this._editing = false;
      this._enabledModules = {};
      this._listeners = {};
      this._modules = {};
    },

    /**
     * Initialisation that needs to occur after all managers are created.
     */
    setup: function() {
      this.addModule('translation', new TranslationModule(this._atlasManagers));
      // TODO(aramk) Disabled translation by default.
      //    this.enableModule('translation');
      this.bindEvents();
    },

    bindEvents: function () {
      var handlers = [
        {
          source: 'intern',
          name: 'input/keyup',
          callback: function (event) {
            // TODO(bpstudds): Make an enum for the keyboard event key values.
            if (event.modifiers.ctrl && event.key === 69) {
              // TODO(bpstudds) Flesh out this.
              console.log('toggling editing');
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/leftdown',
          callback: function (e) {
            this.onLeftDown(e);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/mousemove',
          callback: function (e) {
            this.onMouseMove(e);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/leftup',
          callback: function (e) {
            this.onLeftUp(e);
          }
        },
        {
          source: 'intern',
          name: 'entity/select',
          callback: function (event) {
            // TODO(bpstudds) Flesh out this.
          }.bind(this)
        }
      ];
      this._atlasManagers.event.addEventHandlers(handlers);
    },

    // -------------------------------------------
    // EDITING STATE
    // -------------------------------------------

    enable: function () {
      this._editing = true;
    },

    disable: function () {
      this._editing = false;
    },

    toggleEditing: function () {
      this._editing = !this._editing;
    },

    // -------------------------------------------
    // MODULE MANAGEMENT
    // -------------------------------------------

    /**
     * Adds a new module with the given name.
     * @param {String} name - The name of the module.
     * @param {Object} module - The module.
     */
    addModule: function(name, module) {
      this._modules[name] = module;
      this.disableModule(name);
    },

    getModule: function(name) {
      return this._modules[name];
    },

    _delegateToModules: function (method, args) {
      if (!this._editing) { return; }
      Object.keys(this._enabledModules).forEach(function (modName) {
        var module = this._enabledModules[modName];
        module[method].apply(module, args);
      }, this);
    },

    /**
     * Enables an existing module.
     * @param {String} name - The name of the module.
     */
    enableModule: function(name) {
      var module = this.getModule(name);
      if (!module) return;

      /*var bindings = module.getEventBindings();
      if (!this._listeners[name]) this._listeners[name] = {};
      for (var event in bindings) {
        if (bindings.hasOwnProperty(event)) {
          this._listeners[name][event] = this._atlasManagers.event.addEventHandler('intern', event,
              bindings[event].bind(module));
        }
      }*/
      this._enabledModules[name] = module;
    },

    /**
     * Disables the module with the given name.
     * @param {String} name - The name of the module.
     */
    disableModule: function(name) {
      // TODO(aramk) use "handler" or "listener" and not both?
//      var listeners = this._listeners[name];
//      for (var event in listeners) {
//        if (listeners.hasOwnProperty(event)) {
//          listeners[event].cancel();
//        }
//      }
      delete this._enabledModules[name];
    },

    /**
     * Enables or disables the module with the given name.
     * @param {String} name - The name of the module.
     * @param {Boolean} state - Whether the module is active.
     */
    setIsModuleEnabled: function(name, state) {
      if (state) {
        this.enableModule(name);
      } else {
        this.disableModule(name);
      }
    },

    /**
     * Toggles whether the module with the given name is active.
     * @param {String} name - The name of the module.
     */
    toggleModule: function (name) {
      if (this._enabledModules[name]) {
        this.disableModule(name);
      } else {
        this.enableModule(name);
      }
    },

    // -------------------------------------------
    // EVENT HANDLERS
    // -------------------------------------------

    /**
     * Handles initiating a mouse drag with a left click. If a Handle is not clicked,
     * nothing occurs.
     * @param e
     */
    onLeftDown: function (e) {
      // TODO(bpstudds): Check whether a Handle was clicked.
      this._delegateToModules('start', e);
    },

    onMouseMove: function (e) {
      // TODO(bpstudds): This should only be active if a drag has started.
      this._delegateToModules('update', e);
    },

    onLeftUp: function (e) {
      // TODO(bpstudds): This should only be active if a drag has started.
      this._delegateToModules('end', e);
    }

  });

  return EditManager;
});
