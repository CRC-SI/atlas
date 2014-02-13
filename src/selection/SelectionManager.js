define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/events/Event',
  'atlas/events/EventTarget',
  'atlas/lib/utility/Log'
], function(Class, DeveloperError, Event, EventTarget, Log) {

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
  var SelectionManager = Class.extend(/** @lends atlas.selection.SelectionManager# */ {
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
          name: 'input/leftdown',
          callback: function(args) {
            if (args) {
              if (!args.modifiers) args.modifiers = {};
              // var worldPosition = this._atlasManagers.render.convertScreenCoordsToLatLng(args);
              // var picked = this._atlasManagers.entity.getAt(worldPosition);
              var pickedPrimitives = this._atlasManagers.entity.getAt(args.position),
                  keepSelection = 'shift' in args.modifiers;
              if (pickedPrimitives.length > 0) {
                this.selectEntity(pickedPrimitives[0], keepSelection);
              } else {
                !keepSelection && this.clearSelection();
              }
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
     * Returns the map of currently selected GeoEntities.
     * @returns {Object.<String,atlas.model.GeoEntity>}
     */
    getSelection: function() {
      return this._selection;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Causes an Entity to become selected.
     * @param {String|GeoEntity} id - The ID of the GeoEntity to select.
     * @param {Boolean} [keepSelection=false] - If true, the GeoEntity will be added to the current
     *      selection. If false, the current selection will be cleared before
     *      the GeoEntity is selected.
     */
    selectEntity: function(id, keepSelection) {
      // Do nothing if entity is already selected.
      if (this.isSelected(id)) {
        return;
      }
      var entity = typeof id === 'string' ?
          this._atlasManagers.entity.getById(id) : id;
      if (entity) {
        if (!keepSelection) {
          this.clearSelection();
        }
        this._selection[entity.getId()] = entity;
        entity.onSelect();
        this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
            'entity/select/complete', {
              entity: entity
            }));
        Log.debug('selected entity', id);
      }
    },

    /**
     * Removes the given Entity from the current selection.
     * @param {String} id - The ID of the GeoEntity to deselect.
     */
    deselectEntity: function(id) {
      if (id in this._selection) {
        var entity = this._selection[id];
        entity.onDeselect();
        this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
            'entity/deselect/complete', {
              entity: entity
            }));
        delete this._selection[id];
        Log.debug('deselected entity', id);
      }
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
          selected = [];
      if (entities.length > 0) {
        // Clear selection first if required.
        if (!keepSelection) {
          this.clearSelection();
        }
        entities.forEach(function(entity) {
          var id = entity.getId();
          if (!this.isSelected(id)) {
            selected.push(id);
            entity.onSelect();
            this._selection[id] = entity;
          }
        }.bind(this));
        if (selected.length > 0) {
          this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
              'entity/select/multiple/complete', {
                ids: selected
              }));
        }
      }
      Log.debug('selected entities', selected);
      return selected;
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
          //if (entity.id in this._selection) {
          entity.onDeselect();
          deselected.push(entity);
          delete this._selection[entity.getId()];
          //}
        }.bind(this));
        this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
            'entity/deselect/multiple/complete', {
              entities: deselected
            }));
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
     * @return Whether the GeoEntity with the given ID is selected.
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
