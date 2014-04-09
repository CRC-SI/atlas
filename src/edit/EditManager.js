define([
  'atlas/core/ItemStore',
  'atlas/edit/TranslationModule',
  'atlas/lib/utility/Log',
  'atlas/model/Handle',
  'atlas/util/Class'
], function(ItemStore, TranslationModule, Log, Handle, Class) {

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
     * @type {atlas.core.ItemStore}
     */
    _entities: null,

    /**
     * The IDs of the GeoEntities that will be edited when editing is enabled.
     * @type {Array.<String>}
     */
    _entityIds: null,

    /**
     * The store of Handles that are part of the current edit session.
     * @type {atlas.core.ItemStore}
     */
    _handles: null,

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

    /**
     * An array of event listeners for user input. <code>_inputEventHandlers</code> is non-null
     * when editing is enabled. When editing is disabled, the only event being listened for
     * is the event to enable and disable editing.
     * @type {Object.<String, Object>}
     */
    _mouseEventHandlers: null,

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.edit = this;

      this._entities = new ItemStore();
      this._handles = new ItemStore();
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
      this.enableModule('translation');
      this.bindEvents();
    },

    bindEvents: function () {
      var handlers = [
        {
          source: 'intern',
          name: 'input/keyup',
          callback: function (event) {
            // TODO(bpstudds): Make an enum for the keyboard event key values.
            if (event.key === 69 /* lowercase 'e' */) {
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
        }/*,
        {
          source: 'intern',
          name: 'entity/deselect',
          callback: function (event) {
            this._entities.purge();
          }.bind(this)
        }*/
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
     * Starts an editing session on the currently selected entities.
     * Handles are displayed for the selected Polygons and selection is locked.
     */
    enable: function () {
      Log.debug('EditManager enabled');
      this._editing = true;
      this.bindMouseInput();
      this._entities.addArray(this._atlasManagers.selection.getSelection());

      // Render the editing handles.
      this._entities.forEach(function (entity) {
        entity.showAsFootprint();
        // Put the Handles into the EntityManager and render them.
        this._handles.addArray(entity.getEditingHandles());
        this._handles.map('render');
      }, this);
    },

    /**
     * Ends an editing session.
     * NOTE: This does not do anything regarding specifically 'canceling' or 'saving'
     * any changes made, but the final state when ending is maintained.
     */
    disable: function () {
      Log.debug('EditManager disabled');
      this._editing = false;
      // End the editing session
      this.unbindMouseInput();
      this._handles.map('remove');
      this._entities.map('showAsExtrusion');
      // Remove stored elements
      this._handles.purge();
      this._entities.purge();
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
      // getAt always returns an array, but we only care about the top most Entity.
      var targetId = this._atlasManagers.render.getAt(e.position)[0],
          target = this._handles.get(targetId);
      if (!target) { return; }

      this._dragTarget = target;
      e.target =  this._dragTarget;
      this._delegateToModules('startDrag', arguments);
    },

    onMouseMove: function (e) {
      if (!this._dragTarget) { return; }
      e.target = this._dragTarget;
      this._delegateToModules('updateDrag', arguments);
    },

    onLeftUp: function (e) {
      if (!this._dragTarget) { return; }

      e.target = this._dragTarget;
      this._dragTarget = null;
      this._delegateToModules('endDrag', arguments);
    }

  });

  return EditManager;
});
