define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/events/Event',
  'atlas/events/EventTarget',
  'atlas/lib/utility/Log'
], function(Class, DeveloperError, Event, EventTarget, Log) {

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
   * @param {Object} atlasManagers - A reference to the Atlas manager objects.
   * @returns {atlas.selection.SelectionManager}
   *
   * @class atlas.selection.SelectionManager
   */
  SelectionManager = Class.extend(/** @lends atlas.selection.SelectionManager# */ {
    /**
     * Contains a map of entity ID to entity of all selected entities.
     * @type {Object}
     */
    _selection: null,

    /**
     * Contains references to all of the currently defined Atlas manager
     * objects.
     * @type {Object}
     */
    _atlasManagers: null,

    _init: function(atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.selection = this;
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
        if (args.ids instanceof Array) {
          this[method + 'Entities'](args.ids, args.keepSelection);
        } else {
          this[method + 'Entity'](args.id, args.keepSelection);
        }
      }.bind(this);
      var handlers = [
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
          source: 'intern',
          name: 'input/leftclick',
          callback: function(args) {
            if (!args.modifiers) args.modifiers = {};
            // var worldPosition = this._atlasManagers.render.convertScreenCoordsToLatLng(args);
            // var picked = this._atlasManagers.entity.getAt(worldPosition);
            var selectedEntities = this._atlasManagers.entity.getAt(args.position),
                keepSelection = 'shift' in args.modifiers,
                changed;
            if (selectedEntities.length > 0) {
              changed = this.selectEntity(selectedEntities[0].getId(), keepSelection);
            } else if (!keepSelection) {
              changed = this.clearSelection();
            }
            if (changed && changed.length > 0) {
              this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
                  'entity/selection/change', {ids: changed}));
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/left/dblclick',
          callback: function(args) {
            // TODO(bpstudds): Move this handler to EntityManager.
            var entities = this._atlasManagers.entity.getAt(args.position);
            if (entities.length > 0) {
              // Only capture the double click on the first entity.
              var entity = entities[0];
              this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
                  'entity/dblclick', {
                    id: entity.getId()
                  }));
            }
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
      this._atlasManagers.event.addEventHandlers(handlers);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

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
    // TODO(aramk) Make it less ambiguous by only accepting IDs.
    selectEntity: function(id, keepSelection) {
      return this.selectEntities([id], keepSelection);
    },

    /**
     * Removes the given Entity from the current selection.
     * @param {String} id - The ID of the GeoEntity to deselect.
     */
    deselectEntity: function(id) {
      return this.deselectEntities([id]);
    },

    /**
     * Selects multiple GeoEntities.
     * @param {Array.<String>} ids - The IDs of all GeoEntities to be selected.
     * @param {Boolean} [keepSelection=false] - If true, the GeoEntities will be added to current
     *      selection. If false, the current selection will be cleared before
     *      the GeoEntities are selected.
     */
    selectEntities: function(ids, keepSelection) {
      Log.debug('selecting entities', ids);
      var entities = this._atlasManagers.entity.getByIds(ids),
          toSelectIds = [],
          toSelectEntities = {};
      if (entities.length > 0) {
        entities.forEach(function(entity) {
          var id = entity.getId();
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
          if (!keepSelection) {
            this.clearSelection();
          }
          toSelectIds.forEach(function(id) {
            var entity = toSelectEntities[id];
            entity.onSelect();
            this._selection[id] = entity;
          }.bind(this));

          this._atlasManagers.event.dispatchEvent(
            new Event(null, 'entity/select', {ids: toSelectIds})
          );
        }
      }
      Log.debug('selected entities', toSelectIds);
      return toSelectIds;
    },

    /**
     * Deselects multiple GeoEntities.
     * @param {Array.<String>} ids - The IDs of all GeoEntities to be deselected.
     * @returns {Array.<atlas.model.GeoEntity>} The deselected GeoEntities.
     */
    deselectEntities: function(ids) {
      var entities = this._atlasManagers.entity.getByIds(ids);
      var deselected = [];
      if (entities.length > 0) {
        entities.forEach(function(entity) {
          var id = entity.getId();
          if (this.isSelected(id)) {
            entity.onDeselect();
            deselected.push(id);
            delete this._selection[id];
          }
        }.bind(this));
        this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(), 'entity/deselect',
            {ids: deselected}));
        Log.debug('deselected entities', ids);
      }
      return deselected;
    },

    /**
     * Deselects all currently selected GeoEntities.
     */
    clearSelection: function() {
      if (Object.keys(this._selection).length > 0) {
        return this.deselectEntities(Object.keys(this._selection));
      } else {
        return null;
      }
    },

    /**
     * @param {String} id.
     * @return {Boolean} Whether the GeoEntity with the given ID is selected.
     */
    isSelected: function(id) {
      return id in this._selection;
    },

    /*
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

    /*
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
    }
  });

  return SelectionManager;
});
