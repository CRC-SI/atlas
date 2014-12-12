define([
  'atlas/core/Manager',
  'atlas/util/DeveloperError',
  'atlas/events/Event',
  'atlas/events/EventTarget',
  'atlas/lib/utility/Arrays',
  'atlas/lib/utility/Log'
], function(Manager, DeveloperError, Event, EventTarget, Arrays, Log) {

  /**
   * @typedef atlas.selection.SelectionManager
   * @ignore
   */
  var SelectionManager;

  /**
   * @classdesc The SelectionManager maintains a list of the currently
   * selected GeoEntities. It exposes an API to select and deselect
   * individual GeoEntities or a set of entities either specified
   * explicitly or by specifying a geographic area to select from.
   *
   * @param {Object} managers - A reference to the Atlas manager objects.
   * @returns {atlas.selection.SelectionManager}
   *
   * @class atlas.selection.SelectionManager
   */
  SelectionManager = Manager.extend(/** @lends atlas.selection.SelectionManager# */ {

    _id: 'selection',

    /**
     * Whether the SelectionManager is enabled.
     * @type {boolean}
     */
    _enabled: true,

    /**
     * Contains a map of entity ID to entity of all selected entities.
     * @type {Object}
     */
    _selection: null,

    /**
     * Map of subscribed events to handler methods.
     */
    _handlers: {
      intern: {
        'input/leftclick': this._onLeftClick.bind(this),
        'input/left/dblclick': this._onDoubleClick.bind(this),
        'entity/select': this._onSelection.bind(this, true),
        'entity/deselect': this._onSelection.bind(this, false),
        'entity/remove': this._onRemove.bind(this)
      },
      extern: {
        'selection/enable': this.setEnabled.bind(this, true),
        'selection/disable': this.setEnabled.bind(this, false),
        'entity/deselect/all': this.clearSelection.bind(this),
        'entity/select': this._handleSelection.bind(this, 'select'),
        'entity/deselect': this._handleSelection.bind(this, 'deselect')
      }
    },

    _init: function(managers) {
      this._super(managers);
      this._selection = {};
    },

    setup: function() {
      this.bindEvents();
    },

    /**
     * Registers event handlers with the EventManager for relevant events.
     */
    bindEvents: function() {
      // Create event handlers for pertinent events.
      var handleSelection = function(args, method) {
        if (!this.isEnabled()) { return; }

        if (args.ids instanceof Array) {
          this[method + 'Entities'](args.ids, args.keepSelection);
        } else {
          this[method + 'Entity'](args.id, args.keepSelection);
        }
      }.bind(this);
      var handlers = [
        {
          source: 'extern',
          name: 'selection/enable',
          callback: function() {
            this.setEnabled(true);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'selection/disable',
          callback: function() {
            this.setEnabled(false);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/select',
          callback: function(args) {
            handleSelection(args, 'select');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/deselect',
          callback: function(args) {
            handleSelection(args, 'deselect');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/deselect/all',
          callback: function(args) {
            this.clearSelection();
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/leftclick',
          callback: function(args) {
            if (!this.isEnabled()) { return; }
            if (!args.modifiers) args.modifiers = {};
            var selectedEntities = this._managers.entity.getAt(args.position),
                keepSelection = 'shift' in args.modifiers,
                preSelectionIds = this.getSelectionIds();
            if (selectedEntities.length > 0) {
              this.selectEntity(selectedEntities[0].getId(), keepSelection, args.position);
            } else if (!keepSelection) {
              this.clearSelection();
            }
            var postSelectionIds = this.getSelectionIds();
            var changedSelectedIds = Arrays.difference(postSelectionIds, preSelectionIds);
            var changedDeselectedIds = Arrays.difference(preSelectionIds, postSelectionIds);
            if (changedSelectedIds.length > 0 || changedDeselectedIds.length > 0) {
              this._managers.event.dispatchEvent(new Event(new EventTarget(),
                  'entity/selection/change', {selected: changedSelectedIds,
                  deselected: changedDeselectedIds}));
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'entity/select',
          callback: function(args) {
            this.selectEntities(args.ids, true, null);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'entity/deselect',
          callback: function(args) {
            this.deselectEntities(args.ids, true, null);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'entity/remove',
          callback: function(args) {
            // If the Entity has been removed don't need to deselect it, just remove it from _selection.
            delete this._selection[args.id];
          }.bind(this)
        }
      ];
      // Register event handlers with the EventManager.
      this._managers.event.addNewEventHandlers(this._handlers);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {boolean} Whether the SelectionManager is enabled.
     */
    isEnabled: function() {
      return this._enabled;
    },

    /**
     * Sets whether the SelectionManager is enabled.
     * @param enable - True to enable the selection manager, false to disable.
     *
     * @listens ExternalEvent#selection/enable
     * @listens ExternalEvent#selection/disable
     */
    setEnabled: function(enable) {
      this._enabled = enable;
    },

    /**
     * Returns an array of the currently selected GeoEntities.
     * @returns {Array.<atlas.model.GeoEntity>}
     */
    getSelection: function() {
      var selection = [];
      for (var id in this._selection) {
        if (this._selection.hasOwnProperty(id)) {
          selection.push(this._selection[id]);
        }
      }
      return selection;
    },

    /**
     * Returns an array of the IDs of currently selected GeoEntities.
     * @returns {Array.<String>}
     */
    getSelectionIds: function() {
      return Object.keys(this._selection);
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Causes an Entity to become selected.
     * @param {String} id - The ID of the GeoEntity to select.
     * @param {Boolean} [keepSelection=false] - If true, the GeoEntity will be added to the current
     *      selection. If false, the current selection will be cleared before
     *      the GeoEntity is selected.
     * @param {atlas.model.Vertex} mousePosition - The position of the mouse when GeoEntities are
     *      selected. Null if a mouse action did not result in the selection.
     */
    selectEntity: function(id, keepSelection, mousePosition) {
      this.selectEntities([id], keepSelection, mousePosition);
    },

    /**
     * Removes the given Entity from the current selection.
     * @param {String} id - The ID of the GeoEntity to deselect.
     */
    deselectEntity: function(id) {
      this.deselectEntities([id]);
    },

    /**
     * Selects multiple GeoEntities.
     * @param {Array.<String>} ids - The IDs of all GeoEntities to be selected.
     * @param {Boolean} [keepSelection=false] - If true, the GeoEntities will be added to current
     *      selection. If false, the current selection will be cleared before
     *      the GeoEntities are selected.
     * @param {atlas.model.Vertex} mousePosition - The position of the mouse when GeoEntities are
     *      selected. Null if a mouse action did not result in the selection.
     */
    selectEntities: function(ids, keepSelection, mousePosition) {
      var entities = this._managers.entity.getByIds(ids),
          toSelectIds = [],
          toSelectEntities = {};
      if (entities.length > 0) {
        entities.forEach(function(entity) {
          var id = entity.getId();
          // Even though the entity may be selected directly, it may not be registered as selected
          // until the event is caught by this manager, hence the need to check the registry rather
          // than the entity.
          if (!this.isSelected(id)) {
            toSelectIds.push(id);
            toSelectEntities[id] = entity;
          }
        }.bind(this));
        // Clear selection afterwards once we know what was selected. Clearing before checking with
        // isSelect() would result in previously selected entities being confused as newly selected.
        // If nothing was actually selected in addition to what was already selected, don't clear
        // the current selection.
        if (toSelectIds.length > 0) {
          Log.debug('selecting entities', toSelectIds);
          if (!keepSelection) {
            this.clearSelection();
          }
          toSelectIds.forEach(function(id) {
            var entity = toSelectEntities[id];
            this._selection[id] = entity;
            entity.setSelected(true);
          }.bind(this));
          Log.debug('selected entities', toSelectIds);
        }
      }
    },

    /**
     * Deselects multiple GeoEntities.
     * @param {Array.<String>} ids - The IDs of all GeoEntities to be deselected.
     */
    deselectEntities: function(ids) {
      var entities = this._managers.entity.getByIds(ids);
      var deselectedIds = [];
      if (entities.length > 0) {
        entities.forEach(function(entity) {
          var id = entity.getId();
          if (this.isSelected(id)) {
            delete this._selection[id];
            entity.setSelected(false);
            deselectedIds.push(id);
          }
        }.bind(this));
        if (deselectedIds.length > 0) {
          Log.debug('deselected entities', deselectedIds);
        }
      }
    },

    /**
     * Deselects all currently selected GeoEntities.
     *
     * @listens ExternalEvent#entity/deselect/all
     */
    clearSelection: function() {
      this.deselectEntities(this.getSelectionIds());
    },

    /**
     * @param {String} id.
     * @return {Boolean} Whether the GeoEntity with the given ID is selected.
     */
    isSelected: function(id) {
      return id in this._selection;
    },

    /**
     * Selects multiple GeoEntities which are contained by the given Polygon.
     * @param {atlas.model.Polygon} boundingBox - The polygon defining the area to select GeoEntities.
     * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are
     *      not contained by the <code>boundingBox</code> are also selected.
     * @param {Boolean} [keepSelection=false] - If true, the current selection will be added
     *      to rather than cleared.
     */
    selectWithinPolygon: function() {
      throw new DeveloperError('Function not yet implemented');
    },

    /**
     * Selects multiple GeoEntities which are contained by rectangular area.
     * @param {atlas.model.Vertex} start - The first point defining the rectangular selection area.
     * @param {atlas.model.Vertex} finish - The second point defining the rectangular selection area.
     * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are not
     *      contained by the <code>boundingBox</code> are also selected.
     * @param {Boolean} [keepSelection=false] - If true, the current selection will be added
     *      to rather than cleared.
     */
    selectBox: function() {
      throw new DeveloperError('Function not yet implemented');
    },

    /**
     * Selects or deselects the specified entities.
     *
     * @param {boolean} selected - True if selection, false if deselection.
     * @param {InternalEvent#event:entity/select | InternalEvent#event:entity/deselect} event
     *
     * @listens InternalEvent#entity/select
     * @listens InternalEvent#entity/deselect
     */
    _onSelection: function(selected, event) {
      (selected ? this.selectEntities : this.deselectEntities)(event.ids, true, null);
    },

    /**
     * Handles an external request for selection and deselection.
     *
     * @param {String} method - Either 'select' or 'deselect' depending on the request.
     * @param {ExternalEvent#event:entity/select | ExternalEvent#event:entity/deselect} event
     *
     * @listens ExternalEvent#entity/select
     * @listens ExternalEvent#entity/deselect
     */
    _handleSelection: function(method, event) {
      if (!this.isEnabled()) return;

      if (args.ids instanceof Array) {
        this[method + 'Entities'](event.ids, event.keepSelection);
      } else {
        this[method + 'Entity'](event.id, event.keepSelection);
      }
    },

    /**
     * Handles a left click event.
     *
     * @param {InternalEvent#event:input/leftclick} event
     *
     * @listens InternalEvent#input/leftclick
     */
    _onLeftClick: function(event) {
      if (!this.isEnabled()) return;
      if (!event.modifiers) event.modifiers = {};
      var selectedEntities = this._managers.entity.getAt(event.position),
          keepSelection = 'shift' in event.modifiers,
          preSelectionIds = this.getSelectionIds();
      if (selectedEntities.length > 0) {
        this.selectEntity(selectedEntities[0].getId(), keepSelection, event.position);
      } else if (!keepSelection) {
        this.clearSelection();
      }
      var postSelectionIds = this.getSelectionIds();
      var changedSelectedIds = Arrays.difference(postSelectionIds, preSelectionIds);
      var changedDeselectedIds = Arrays.difference(preSelectionIds, postSelectionIds);
      if (changedSelectedIds.length > 0 || changedDeselectedIds.length > 0) {
        this._managers.event.dispatchEvent(new Event(new EventTarget(),
            'entity/selection/change', {
              selected: changedSelectedIds,
              deselected: changedDeselectedIds
            }));
      }
    },

    /**
     * Handles a left double-click event.
     *
     * @param {InternalEvent#event:input/left/dblclick} event
     *
     * @listens InternalEvent#input/left/dblclick
     * @fires InternalEvent#entity/dblclick
     */
    _onDoubleClick: function(event) {
      // TODO(bpstudds): Move this handler to EntityManager.
      var entities = this._managers.entity.getAt(args.position);
      if (entities.length > 0) {
        // Only capture the double click on the first entity.
        var entity = entities[0];

        /**
         * The {@link atlas.model.GeoEntity} was double-clicked.
         *
         * @event InternalEvent#entity/dblclick
         * @type {Object}
         * @property {String} id - The ID of the double-clicked entity.
         */
        this._managers.event.dispatchEvent(new Event(entity, 'entity/dblclick', {
          id: entity.getId()
        }));
      }
    },

    /**
     * Removes an entity from the current selection if it is deleted.
     *
     * @param {InternalEvent#event:entity/remove} event
     *
     * @listens InternalEvent#entity/remove
     */
    _onRemove: function(event) {
      delete this._selection[event.id];
    }

  });

  return SelectionManager;
});
