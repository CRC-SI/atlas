define([
  'atlas/core/Manager',
  'atlas/core/ItemStore',
  'atlas/edit/TranslationModule',
  'atlas/edit/DrawModule',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/model/Feature',
  'atlas/util/DeveloperError'
], function(Manager, ItemStore, TranslationModule, DrawModule, Log, Setter, Types, Feature,
  DeveloperError) {

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
   * @param {Object} managers - Contains a mapping of Atlas manager names to manager instance.
   *
   * @class atlas.edit.EditManager
   */
  EditManager = Manager.extend(/** @lends atlas.edit.EditManager# */ {

    _id: 'edit',

    /**
     * Whether editing is currently enabled for <code>_entities</code>.
     * @type {Boolean}
     */
    _editing: null,

    /**
     * The {@link atlas.model.GeoEntity} objects that will be edited when editing is enabled.
     * @type {atlas.core.ItemStore}
     */
    _entities: null,

    /**
     * Additional meta-data associated with set of entities currently being edited.
     * @type {Object.<String, Object>}
     */
    _entitiesMeta: null,

    /**
     * The store of Handles that are part of the current editing session.
     * @type {atlas.core.ItemStore}
     */
    _handles: null,

    /**
     * Contains a mapping of module name to Module object.
     * @type {Object.<String, atlas.edit.BaseEditModule>}
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
     * The currently active editing sessions. This contains the argument objects passed to
     * {@link #enable}.
     * @type {Array.<Object>}
     */
    _sessions: null,

    /**
     * Whether the translation module was enabled when editing began.
     * @type {Boolean}
     */
    _wasTranslationModuleEnabled: false,

    _init: function() {
      this._super.apply(this, arguments);
      this._entities = new ItemStore();
      this._entitiesMeta = {};
      this._handles = new ItemStore();
      this._editing = false;
      this._enabledModules = {};
      this._listeners = {};
      this._modules = {};
      this._sessions = [];
    },

    /**
     * Initialisation that needs to occur after all managers are created.
     */
    setup: function() {
      this.addModule('translation', new TranslationModule(this._managers));
      this.addModule('draw', new DrawModule(this._managers));
      this.bindEvents();
    },

    bindEvents: function() {
      var editButtonHandle = null;
      var handlers = [
        {
          source: 'extern',
          name: 'editButton',
          callback: function(state) {
            // Bind the event for enabling editing with the keyboard only when needed and allow
            // unbinding. By default the key is unbound to avoid issues when typing.
            if (state && !editButtonHandle) {
              editButtonHandle = this._managers.event.addEventHandler('intern', 'input/keyup',
                  function(event) {
                    // TODO(bpstudds): Make an enum for the keyboard event key values.
                    if (event.key === 69 /* lowercase 'e' */) {
                      this.toggleEditing();
                    }
                  }.bind(this));
            } else if (editButtonHandle) {
              editButtonHandle.cancel();
              editButtonHandle = null;
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'entity/select',
          callback: function(event) {
            // TODO(bpstudds): Implement this functionality (in future feature branch).
            // TODO(aramk) Using this._entities instead of this._entityIds.
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'edit/enable',
          callback: function(args) {
            this.enable(args);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'edit/disable',
          callback: function(args) {
            this.disable();
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/left/dblclick',
          callback: function(args) {
            // TODO(aramk) Unbind when disabled.
            if (!this._editing) {
              return;
            }
            var targets = this._managers.render.getAt(args.position);
            if (targets.length === 0) {
              this.disable();
            }
          }.bind(this)
        }
      ];
      this._eventHandlers = this._managers.event.addEventHandlers(handlers);
    },

    entityCanBeEdited: function(entity) {
      return !!(this._handles.get(entity.getId()) || this._entities.get(entity.getId()));
    },

    // -------------------------------------------
    // EDITING STATE
    // -------------------------------------------

    /**
     * Starts an editing session on the given entities.
     * Handles are displayed for the selected Polygons and selection is locked.
     * @param {Object} args
     * @param {Array.<String>} [args.ids] A set of entity IDs to enable for editing.
     * @param {Object.<atlas.model.GeoEntity>} [args.entities] A set of entities to enable for
     * editing. If not provided, args.ids are used first, otherwise the currently selected entities
     * are used.
     * @param {Boolean} [args.show=true] Whether to show the entities as footprints.
     * @param {Boolean} [args.addHandles=true] Whether to add handles to entities.
     * @param {Function} [args.update] - A callback invoked as the object is edited (vertices are
     * modified).
     * @param {Function} [args.complete] - A callback invoked when editing is complete.
     * @param {Function} [args.cancel] - A callback invoked when editing is cancelled.
     * @returns {Array.<String>} The IDs of the entities for which editing was enabled.
     */
    enable: function(args) {
      args = Setter.mixin({
        show: true,
        addHandles: true
      }, args);
      var ids = args.ids;
      this._sessions.push(args);
      if (!args.entities) {
        if (args.ids) {
          args.entities = this._managers.entity.getByIds(ids);
        } else {
          args.entities = this._managers.selection.getSelection();
        }
      }
      Log.debug('EditManager enabled');
      this._editing = true;
      var addedEntities = this._entities.addArray(args.entities);
      // TODO(aramk) Only allow translation of handles (any) and args.entities.
      this._wasTranslationModuleEnabled = this.isModuleEnabled('translation');
      this.enableModule('translation');

      // Disable selection
      this._managers.event.handleExternalEvent('selection/disable');
      this._addEditingHandles(addedEntities, args);
      return ids;
    },

    /**
     * Ends an editing session.
     * NOTE: This does not do anything regarding specifically 'canceling' or 'saving'
     * any changes made, but the final state when ending is maintained.
     * @param {Object} [args]
     * @param {Array.<String>} [args.ids] A set of entity IDs to disable editing for. By default,
     *     all entities being edited are disabled.
     * @returns {Array.<String>} The IDs of the entities for which editing was disabled.
     */
    disable: function(args) {
      args = Setter.merge({
        ids: this._entities.getIds()
      }, args);
      var ids = args.ids;
      Log.debug('EditManager disabled');
      this._editing = false;
      this._removeEditingHandles(ids);
      this._entities.purge();
      this._entitiesMeta = {};
      this.setIsModuleEnabled('translation', this._wasTranslationModuleEnabled);
      this._managers.event.handleExternalEvent('selection/enable');
      this._endSessions(ids);
      return ids;
    },

    _removeEditingHandles: function(ids) {
      this._handles.map('remove');
      this._handles.purge();
      // Remove handles from entities before showing as extrusion to prevent re-build showing the
      // handles again. Restore the original display mode.
      ids.forEach(function(id) {
        var entity = this._entities.get(id);
        entity.clearHandles();
        var meta = this._entitiesMeta[entity.getId()];
        entity.setDisplayMode(meta.origDisplayMode);
      }, this);
    },

    _addEditingHandles: function(addedEntities, args) {
      // Render the editing handles for those entities which were not editing to begin with.
      addedEntities.forEach(function(entity) {
        var meta = {};
        meta.origDisplayMode = entity.getDisplayMode();
        this._entitiesMeta[entity.getId()] = meta;
        // Show the footprint if it's available when editing.
        args.show && entity.getForm && entity.getForm(Feature.DisplayMode.FOOTPRINT) &&
            entity.showAsFootprint();
        if (args.addHandles) {
          // Put the Handles into the EntityManager and render them.
          var handles = entity.addHandles();
          if (handles) {
            this._handles.addArray(handles);
            this._handles.map('show');
          }
        }
      }, this);
    },

    /**
     * Ends the open editing sessions of the given entities.
     * @param {Array.<String>} ids - The IDs of the entities.
     */
    _endSessions: function(ids) {
      // TODO(aramk) For now all editing sessions will be removed.
      this._sessions.forEach(function(session) {
        // TODO(aramk) Add support for other kinds of callbacks.
        var complete = session.complete;
        complete && complete();
      });
      this._sessions = [];
    },

    /**
     * Toggles the editing state.
     * @see {@link atlas.edit.EditManager#enable}
     * @see {@link atlas.edit.EditManager#disable}
     */
    toggleEditing: function() {
      this._editing ? this.disable() : this.enable();
    },

    /**
     * @return {Boolean} Whether editing is currently enabled.
     */
    isEditing: function() {
      return this._editing;
    },

    // -------------------------------------------
    // MODULE MANAGEMENT
    // -------------------------------------------

    /**
     * Adds a new module with the given name.
     * @param {String} name - The name of the module.
     * @param {atlas.edit.BaseEditModule} module - The module.
     */
    addModule: function(name, module) {
      this._modules[name] = module;
      module._name = name;
      // Ensures any persistent handlers are bound.
      this.enableModule(name);
      this.disableModule(name);
    },

    /**
     * @param {String} name - The name of the module to get.
     * @returns {atlas.edit.BaseEditModule} The requested module.
     */
    getModule: function(name) {
      return this._modules[name];
    },

    _delegateToModules: function(method, args) {
      if (!this._editing) {
        return;
      }
      Object.keys(this._enabledModules).forEach(function(modName) {
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
      if (!module) {
        throw new DeveloperError('No module found with name: ' + name);
      }
      if (this._enabledModules[name]) {
        // Already enabled - don't bind events twice.
        return;
      }

      var bindEvent = function(event, args) {
        var handler;
        var source = 'intern';
        if (Types.isFunction(args)) {
          handler = args;
        } else {
          handler = args.callback;
          source = args.source || source;
        }
        var handle = this._listeners[name][event];
        if (!handle) {
          // Avoid adding a handle if it already exists.
          handle = this._managers.event.addEventHandler(source, event, handler.bind(module));
          handle.persistent = !!args.persistent;
          this._listeners[name][event] = handle;
        }
      }.bind(this);

      var bindings = module.getEventBindings();
      this._listeners[name] = this._listeners[name] || {};
      for (var event in bindings) {
        if (bindings.hasOwnProperty(event)) {
          var value = bindings[event];
          bindEvent(event, value);
        }
      }
      this._enabledModules[name] = module;
    },

    /**
     * Disables the module with the given name.
     * @param {String} name - The name of the module.
     */
    disableModule: function(name) {
      var listeners = this._listeners[name];
      for (var event in listeners) {
        if (listeners.hasOwnProperty(event)) {
          var handle = listeners[event];
          if (!handle.persistent) {
            handle.cancel();
            delete listeners[event];
          }
        }
      }
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
    isModuleEnabled: function(name) {
      return (this._enabledModules[name] !== undefined);
    },

    /**
     * Toggles whether the module with the given name is active.
     * @param {String} name - The name of the module.
     */
    toggleModule: function(name) {
      return this._enabledModules[name] ? this.disableModule(name) : this.enableModule(name);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getEntities: function() {
      return this._entities;
    },

    /**
     * The store of Handles that are part of the current edit session.
     * @type {atlas.core.ItemStore}
     */
    getHandles: function() {
      return this._handles;
    }

  });

  return EditManager;
});
