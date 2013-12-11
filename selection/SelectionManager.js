define([
  'atlas/util/DeveloperError'
], function (DeveloperError) {

  /**
   * Constructs a new SelectionManager object.
   * @class The SelectionManager maintains a list of the currently
   * selected GeoEntities. It exposes an API to select and deselect
   * inidividual GeoEntities or a set of entities either specified
   * explicitly or by specifying a geographic area to select from.
   *
   * @param {Object} atlasManagers - A reference to the Atlas manager objects.
   * @returns {atlas/selection/SelectionManager}
   *
   * @alias atlas/selection/SelectionManager
   * @constructor
   */
  var SelectionManager = function (atlasManagers) {
    /**
     * Contains a map of entity ID to entity of all selected entities.
     * @type {Object}
     */
    this._selectedEntities = {};

    /**
     * Contains references to all of the currently defined Atlas manager
     * objects.
     * @type {Object}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.selection = this;
  };


  /**
   * Registers event handlers with the EventManager for relevant events.
   */
  SelectionManager.prototype.bindEvents = function () {
    // Create event handlers for pertinent events.
    var handlers = [
      {
        source: 'intern',
        name: 'entity/click',
        callback: function (name, args) {
          if (args) {
            this.selectEntity(args.entity, args.modifieds.contains('shift'));
          }
        }.bind(this)
      },
      {
        source: 'intern',
        name: 'entity/remove',
        callback: function (name, args) {
          // If the Entity has been removed, don't need to deselect it, just remove it from _selectedEntities.
          delete this._selectedEntities[args.id];
        }.bind(this)
      }
    ];
    // Register event handlers with the EventManager.
    this._atlasManagers.event.addEventHandlers(handlers);
  };

  /**
   * Causes an Entity to become selected.
   * @param {String} id - The ID of the GeoEntity to select.
   * @param {Boolean} [keepSelection=false] - If true, the existing selection will be added to rather than cleared.
   */
  SelectionManager.prototype.selectEntity = function (id, keepSelection) {
    console.debug('selecting entity', id);
    if (!keepSelection) {
      this.clearSelection();
    }
    var entity = this._atlasManagers.render.getEntity(id);
    if (entity) {
      this._selectedEntities[entity._id] = entity;
      entity.select();
    }
    console.debug('selected entity', id);
  };

  /**
   * Removes the given Entity from the current selection.
   * @param {String} id - The ID of the GeoEntity to deselect.
   */
  SelectionManager.prototype.deselectEntity = function (id) {
    if (id in this._selectedEntities) {
      this._selectedEntities[id].deselect();
      delete this._selectedEntities[id];
    }
  };

  /**
   * Deselects all currently selected GeoEntities.
   */
  SelectionManager.prototype.clearSelection = function () {
    console.debug('clearing selection', this._selectedEntities);
    for (var id in this._selectedEntities) {
      if (this._selectedEntities.hasOwnProperty(id)) {
        this._selectedEntities[id].deselect();
      }
    }
    this._selectedEntities = {};
    console.debug('cleared selection');
  };

  /**
   * Selects multiple GeoEntities.
   * @param {Array.<String>} ids - The IDs of all GeoEntities to be selected.
   * @param {Boolean} [keepSelection=false] - If true, the existing selection will be added to rather than cleared.
   */
  SelectionManager.prototype.selectEntities = function (ids, keepSelection) {
    console.debug('selecting entities', ids);
    if (!keepSelection) {
      this.clearSelection();
    }
    for (var i = 0; i < ids.length; i++) {
      var entity = this._atlasManagers.render.getEntity(ids[i]);
      entity.select();
      this._selectedEntities[entity._id] = entity;
    }
    console.debug('selected entities', ids);
  };

  /**
   * Selects multiple GeoEntities which are contained by the given Polygon.
   * @param {altas/model/Polygon} boundingBox - The polygon defining the area to select GeoEntities.
   * @param {Boolean} [intersects=false] - If true, GeoEntities which intersect but are not contained by the <code>boundingBox</code> are also selected.
   * @param {Boolean} [keepSelection=false] - If true, the existing selection will be added to rather than cleared.
   */
  SelectionManager.prototype.selectWithinPolygon = function () {
    throw new 'No idea how to do this yet.';
  };

  return SelectionManager;
});
