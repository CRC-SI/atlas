define([
  'atlas/edit/TranslationModule',
  'atlas/lib/utility/Log',
  'atlas/util/Class'
], function(TranslationModule, Log, Class) {

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
     * Whether editing is enabled is currently enabled for <code>_entities</code>.
     * @type {boolean}
     */
    _editing: null,

    /**
     * The GeoEntities that will be edited when editing is enabled.
     * @type {Array.<atlas.model.GeoEntity>}
     */
    _entities: null,

    /**
     * The IDs of the GeoEntities that will be edited when editing is enabled.
     * @type {Array.<String>}
     */
    _entityIds: null,

    /**
     * The Handle that is the current focus of dragging.
     * @type {atlas.model.Handle?}
     */
    _dragTarget: null,

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
     * @type {Object.<String, Object>}
     */
    _enabledModules: null,

    /**
     * An array of event listeners that are continuously active.
     * @type {Object.<String, Object>}
     */
    _eventHandlers: null,

    /**      if (this._dragTarget === undefined) { return; }
     * An array of event listeners for user input. <code>_inputEventHandlers</code> is non-null
     * when editing is enabled. When editing is disabled, the only event being listened for
     * is the event to enable and disable editing.
     * @type {Object.<String, Object>}
     */
    _mouseEventHandlers: null,

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.edit = this;

      this._editing = false;
      this._enabledModules = {};
      this._listeners = {};
      this._modules = {};
      this._entityIds = [];
      this._entities = [];
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
            if (event.key === 69) {
              // TODO(bpstudds) Flesh out this.
              this.toggleEditing();
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'entity/select',
          callback: function (event) {
            // TODO(bpstudds): Implement this functionality (in future feature branch).
            this._entityIds = event.ids
          }.bind(this)
        }
      ];
      this._eventHandlers = this._atlasManagers.event.addEventHandlers(handlers);
    },

    bindMouseInput: function () {
      if (this._mouseEventHandlers) { return; }
      var handlers = [
        {
          source: 'intern',
          name: 'input/leftdown',
          callback: function(e) {
            this.onLeftDown(e);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/mousemove',
          callback: function(e) {
            this.onMouseMove(e);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/leftup',
          callback: function(e) {
            this.onLeftUp(e);
          }.bind(this)
        }
      ];
      this._mouseEventHandlers = this._atlasManagers.event.addEventHandlers(handlers);
    },

    unbindMouseInput: function () {
      if (!this._mouseEventHandlers) { return; }

      Object.keys(this._mouseEventHandlers).forEach(function (key) {
        this._mouseEventHandlers[key].cancel();
      }, this);
      this._mouseEventHandlers = null;
    },

    // -------------------------------------------
    // EDITING STATE
    // -------------------------------------------

    /**
     * Enable the editing state. This starts editing on the currently selected entities
     * and locks the selection.
     */
    enable: function () {
      Log.debug('EditManager enabled');
      this._editing = true;
      this.bindMouseInput();
      this._entityIds.forEach(function (id) {
        this._entities.push(this._atlasManagers.entity.getById(id));
      }, this);

      // Render the editing handles.
      this._entities.forEach(function (entity) {
        // TODO(bpstudds): Feature is a GeoEntity but it delegates is breaking this.
        entity.getEditingHandles().forEach(function (handle) {
          handle.render();
        })
      });
    },

    /**
     * Disables the editing state. This stops editing and unlocks selection.
     * NOTE: This does not do anything regarding specifically 'canceling' or 'saving'
     * an edit.
     */
    disable: function () {
      Log.debug('EditManager disabled');
      this._editing = false;
      this.unbindMouseInput();
      // Remove editing handles.
      this._entities.forEach(function (entity) {
        entity.getEditingHandles().forEach(function (handle) {
          handle.unrender();
        })
      });
      this._entities = [];
    },

    /**
     * Toggles the editing state.
     * @see {@link atlas.edit.EditManager#enable}
     * @see {@link atlas.edit.EditManager#disable}
     */
    toggleEditing: function () {
      this._editing ? this.disable() : this.enable();
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
        module[method] && module[method].apply(module, args);
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
     * @param {string} name - The name of the module.
     * @returns {boolean} Whether the module is enabled.
     */
    isModuleEnabled: function (name) {
      return (this._enabledModules[name] !== undefined);
    },

    /**
     * Toggles whether the module with the given name is active.
     * @param {String} name - The name of the module.
     */
    toggleModule: function (name) {
      return this._enabledModules[name] ? this.disableModule(name) : this.enableModule(name);
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
      // Check whether a Handle was clicked.
     this._dragTarget = this._atlasManagers.entity.getAt(e.position).handle;
      if (this._dragTarget === undefined) { return; }

      e.target =  this._dragTarget;
      this._delegateToModules('start', e);
    },

    onMouseMove: function (e) {
      if (this._dragTarget === undefined) { return; }
      this._delegateToModules('update', e);
    },

    onLeftUp: function (e) {
      if (this._dragTarget === undefined) { return; }
      this._delegateToModules('end', e);
    }

  });

  return EditManager;
});
