define([
  'atlas/core/Manager',
  'atlas/util/DeveloperError',
  'atlas/events/Event',
  'atlas/events/EventTarget',
  'atlas/lib/utility/Log',
  'underscore'
], function(Manager, DeveloperError, Event, EventTarget, Log, _) {

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

    _init: function() {
      this._super.apply(this, arguments);
      this._selection = {};
    },

    setup: function() {
      this.bindEvents();
    },

    /**
     * Registers event handlers with the EventManager for relevant events.
     */
    bindEvents: function() {
      var handlers = {
        intern: {
          'input/leftclick': this._onLeftClick.bind(this),
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
      };
      this.eventHandlers = this._managers.event.addNewEventHandlers(handlers);
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
     * @param {Boolean} enable - True to enable the selection manager, false to disable.
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
     */
    selectEntity: function(id, keepSelection) {
      this.selectEntities([id], keepSelection);
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
     */
    selectEntities: function(ids, keepSelection) {
      var entities = this._managers.entity.getByIds(ids);
      var toSelectIds = [];
      var toSelectEntities = {};
      var existingSelection = this.getSelectionIds();
      if (entities.length > 0) {
        entities.forEach(function(entity) {
          var id = entity.getId();
          // Even though the entity may be selected directly, it may not be registered as selected
          // until the event is caught by this manager, hence the need to check the registry rather
          // than the entity.
          if (!entity.isSelected() || !this.isSelected(id)) {
            toSelectIds.push(id);
            toSelectEntities[id] = entity;
          }
        }.bind(this));
        // Clear selection afterwards once we know what was selected. Clearing before checking with
        // isSelect() would result in previously selected entities being confused as newly selected.
        // If nothing was actually selected in addition to what was already selected, don't clear
        // the current selection.
        if (toSelectIds.length > 0) {
          Log.debug('Selecting entities', toSelectIds);
          if (!keepSelection) {
            this.clearSelection();
          }
          var selectedIds = [];
          toSelectIds.forEach(function(id) {
            var entity = toSelectEntities[id];
            var result = entity.setSelected(true);
            if (entity.isSelected(id)) {
              this._selection[id] = entity;
            }
            if (result !== null) {
              selectedIds.push(id);
            }
          }.bind(this));
          Log.debug('Selected entities', selectedIds);
        }
      }
      this._handleSelectionChange(existingSelection);
    },

    /**
     * Deselects multiple GeoEntities.
     * @param {Array.<String>} ids - The IDs of all GeoEntities to be deselected.
     */
    deselectEntities: function(ids) {
      var entities = this._managers.entity.getByIds(ids);
      var deselectedIds = [];
      var existingSelection = this.getSelectionIds();
      if (entities.length > 0) {
        entities.forEach(function(entity) {
          var id = entity.getId();
          var result = entity.setSelected(false);
          if (!entity.isSelected(id)) {
            delete this._selection[id];
          }
          if (result !== null) {
            deselectedIds.push(id);
          }
        }.bind(this));
        if (deselectedIds.length > 0) {
          Log.debug('Deselected entities', deselectedIds);
        }
      }
      this._handleSelectionChange(existingSelection);
    },

    /**
     * Toggles selection for the given entities.
     * @param {Array.<String>} ids - The IDs of the entities to toggle.
     */
    toggleEntities: function(ids) {
      var existingSelection = this.getSelectionIds();
      var toSelectIds = _.difference(ids, existingSelection);
      var toDeselectIds = _.intersection(ids, existingSelection);
      this.selectEntities(toSelectIds, true);
      this.deselectEntities(toDeselectIds, true);
    },

    _handleSelectionChange: function(existingSelection) {
      var currentSelection = this.getSelectionIds();
      var newSelection = _.difference(currentSelection, existingSelection);
      var newDeselection = _.difference(existingSelection, currentSelection);
      if (newSelection.length > 0 || newDeselection.length > 0) {
        this._managers.event.dispatchEvent(new Event(new EventTarget(),
            'entity/selection/change', {
              selected: newSelection,
              deselected: newDeselection
            }));
      }
    },

    /**
     * Deselects all currently selected GeoEntities.
     * @param {Object} [args]
     * @param {Boolean} [args.disableEvents=false] - Whether to prevent triggering and handling
     *     events while handing the selection. For large numbers of entities this can improve
     *     performance.
     * @listens ExternalEvent#entity/deselect/all
     */
    clearSelection: function(args) {
      var disableEvents = args && args.disableEvents === true;
      this._disableEventsDuringCallback(function() {
        this.deselectEntities(this.getSelectionIds(), args);
      }.bind(this), disableEvents);
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
     * @param {atlas.model.Polygon} boundingBox - The polygon defining the area to select
     *    GeoEntities.
     * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are
     *    not contained by the <code>boundingBox</code> are also selected.
     * @param {Boolean} [keepSelection=false] - If true, the current selection will be added
     *     to rather than cleared.
     */
    selectWithinPolygon: function() {
      throw new DeveloperError('Function not yet implemented');
    },

    /**
     * Selects multiple GeoEntities which are contained by rectangular area.
     * @param {atlas.model.Vertex} start - The first point defining the rectangular selection area.
     * @param {atlas.model.Vertex} finish - The second point defining the rectangular selection
     *    area.
     * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are not
     *    contained by the <code>boundingBox</code> are also selected.
     * @param {Boolean} [keepSelection=false] - If true, the current selection will be added
     *     to rather than cleared.
     */
    selectBox: function() {
      throw new DeveloperError('Function not yet implemented');
    },

    /**
     * Selects or deselects the specified entities.
     *
     * @param {Boolean} selected - True if selection, false if deselection.
     * @param {InternalEvent#event:entity/select | InternalEvent#event:entity/deselect} event
     *
     * @listens InternalEvent#entity/select
     * @listens InternalEvent#entity/deselect
     */
    _onSelection: function(selected, event) {
      var methodName = (selected ? '' : 'de') + 'selectEntities';
      this[methodName](event.ids, true, null);
    },

    _disableEventsDuringCallback: function(callback, disable) {
      if (!disable) { return callback() }
      var enabled = atlas._managers.event.isEnabled();
      atlas._managers.event.setEnabled(false);
      try {
        callback();
      } catch(err) {
        Log.error('Error during callback while events were disabled', err);
      }
      atlas._managers.event.setEnabled(enabled);
    },

    /**
     * Handles an external request for selection and deselection.
     *
     * @param {String} method - Either 'select' or 'deselect' depending on the request.
     * @param {ExternalEvent#event:entity/select | ExternalEvent#event:entity/deselect} event
     * @param {Boolean} [event.disableEvents=false] - Whether to prevent triggering and handling
     *     events while handing the selection. For large numbers of entities this can improve
     *     performance.
     *
     * @listens ExternalEvent#entity/select
     * @listens ExternalEvent#entity/deselect
     */
    _handleSelection: function(method, event) {
      if (!this.isEnabled()) return;

      var disableEvents = event && event.disableEvents === true;
      this._disableEventsDuringCallback(function() {
        if (event.ids instanceof Array) {
          this[method + 'Entities'](event.ids, event.keepSelection);
        } else {
          this[method + 'Entity'](event.id, event.keepSelection);
        }
      }.bind(this), disableEvents);
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
      var targetEntities = this._managers.entity.getEntitiesFromArgs(event);
      var ids = _.map(targetEntities, function(entity) { return entity.getId() });
      var keepSelection = !!event.modifiers.shift;
      if (targetEntities.length > 0) {
        if (keepSelection) {
          this.toggleEntities(ids);
        } else {
          this.selectEntities(ids, keepSelection);
        }
      } else if (!keepSelection) {
        this.clearSelection();
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
