define([
  'atlas/util/DeveloperError',
  'atlas/events/Event',
  'atlas/events/EventTarget'
], function(DeveloperError, Event, EventTarget) {

  /**
   * Constructs a new SelectionManager object.
   * @class The SelectionManager maintains a list of the currently
   * selected GeoEntities. It exposes an API to select and deselect
   * individual GeoEntities or a set of entities either specified
   * explicitly or by specifying a geographic area to select from.
   *
   * @param {Object} atlasManagers - A reference to the Atlas manager objects.
   * @returns {atlas.selection.SelectionManager}
   *
   * @alias atlas.selection.SelectionManager
   * @constructor
   */
  var SelectionManager = function(atlasManagers) {
    /**
     * Contains a map of entity ID to entity of all selected entities.
     * @type {Object}
     */
    this._selection = {};

    /**
     * Contains references to all of the currently defined Atlas manager
     * objects.
     * @type {Object}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.selection = this;
  };

  SelectionManager.prototype.setup = function() {
    this.bindEvents();
  };

  /**
   * Registers event handlers with the EventManager for relevant events.
   */
  SelectionManager.prototype.bindEvents = function() {
    // Create event handlers for pertinent events.
    var handlers = [
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
  };

  /**
   * Causes an Entity to become selected.
   * @param {String|GeoEntity} id - The ID of the GeoEntity to select.
   * @param {Boolean} [keepSelection=false] - If true, the GeoEntity will be added to the current
   *      selection. If false, the current selection will be cleared before
   *      the GeoEntity is selected.
   */
  SelectionManager.prototype.selectEntity = function(id, keepSelection) {
    // Do nothing if entity is already selected.
    if (id in this._selection) { return; }
    var entity = typeof id === 'string' ?
        this._atlasManagers.entity.getById(id) : id;
    if (entity) {
      if (!keepSelection) {
        this.clearSelection();
      }
      this._selection[entity.getId()] = entity;
      entity.onSelect();
      this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(), 'entity/select', {
        entity: entity
      }));
      console.debug('selected entity', id);
    }
  };

  /**
   * Selects multiple GeoEntities.
   * @param {Array.<String>} ids - The IDs of all GeoEntities to be selected.
   * @param {Boolean} [keepSelection=false] - If true, the GeoEntities will be added to current
   *      selection. If false, the current selection will be cleared before
   *      the GeoEntities are selected.
   */
  SelectionManager.prototype.selectEntities = function(ids, keepSelection) {
    console.debug('selecting entities', ids);
    var entities = this._atlasManagers.entity.getByIds(ids);
    if (entities.length > 0) {
      // Clear selection first if required.
      if (!keepSelection) {
        this.clearSelection();
      }
      entities.forEach(function(entity) {
        entity.onSelect();
        this._selection[entity.getId()] = entity;
      }.bind(this));
      this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(), 'entity/select/multiple',
        {
        entities: entities
      }));
    }
    console.debug('selected entities', ids);
  };

  /**
   * Removes the given Entity from the current selection.
   * @param {String} id - The ID of the GeoEntity to deselect.
   */
  SelectionManager.prototype.deselectEntity = function(id) {
    if (id in this._selection) {
      var entity = this._selection[id];
      entity.onDeselect();
      this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(), 'entity/deselect', {
        entity: entity
      }));
      delete this._selection[id];
      console.debug('deselected entity', id);
    }
  };

  /**
   * Deselects multiple GeoEntities.
   * @param {Array.<String>} ids - The IDs of all GeoEntities to be deselected.
   */
  SelectionManager.prototype.deselectEntities = function(ids) {
    var entities = this._atlasManagers.entity.getByIds(ids);
    var deselected = [];
    if (ids.length > 0) {
      entities.forEach(function(entity) {
        //if (entity.id in this._selection) {
          entity.onDeselect();
          deselected.push(entity);
          delete this._selection[entity.getId()];
        //}
      }.bind(this));
      this._atlasManagers.event.dispatchEvent(new Event(new EventTarget(),
        'entity/deselect/multiple', {
          entities: deselected
        }));
      console.debug('deselected entities', ids);
    }
  };

  /**
   * Returns the map of currently selected GeoEntities.
   * @returns {Object.<String,atlas.model.GeoEntity>}
   */
  SelectionManager.prototype.getSelection = function() {
    return this._selection;
  };

  /**
   * Deselects all currently selected GeoEntities.
   */
  SelectionManager.prototype.clearSelection = function() {
    if (Object.keys(this._selection).length > 0) {
      console.debug('clearing selection', this._selection);
      this.deselectEntities(Object.keys(this._selection));
    }
  };

  /*
   * Selects multiple GeoEntities which are contained by the given Polygon.
   * @param {atlas.model.Polygon} boundingBox - The polygon defining the area to select GeoEntities.
   * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are
   *      not contained by the <code>boundingBox</code> are also selected.
   * @param {Boolean} [keepSelection=false] - If true, the current selection will be added
   *      to rather than cleared.
   */
  SelectionManager.prototype.selectWithinPolygon = function() {
    throw 'No idea how to do this yet.';
  };

  /*
   * Selects multiple GeoEntities which are contained by rectangular area.
   * @param {atlas.model.Vertex} start - The first point defining the rectangular selection area.
   * @param {atlas.model.Vertex} finish - The second point defining the rectangular selection area.
   * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are not
   *      contained by the <code>boundingBox</code> are also selected.
   * @param {Boolean} [keepSelection=false] - If true, the current selection will be added
   *      to rather than cleared.
   */
  SelectionManager.prototype.selectBox = function() {
    throw 'No idea how to do this yet.';
  };

  return SelectionManager;
});
