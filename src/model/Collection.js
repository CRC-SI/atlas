define([
  'atlas/core/ItemStore',
  // Base class
  'atlas/model/GeoEntity',
  'atlas/model/Handle',
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Log',
  'atlas/util/DeveloperError'
], function(ItemStore, GeoEntity, Handle, Types, Log, DeveloperError) {

  /**
   * @typedef atlas.model.Collection
   * @ignore
   */
  var Collection;

  /**
   * @classdesc A collection of {@link GeoEntity} objects which are treated as a single entity.
   *
   * @abstract
   * @extends atlas.model.GeoEntity
   * @class atlas.model.Collection
   */
  Collection = GeoEntity.extend(/** @lends atlas.model.Collection# */ {

    /**
     * All the entities managed by this collection.
     * @type {atlas.core.ItemStore<atlas.model.GeoEntity>}
     * @protected
     */
    _entities: null,

    /**
     * @param id
     * @param {Object} args
     * @param {Array.<String>} args.entities - A set of {@link GeoEntity} IDs.
     * @private
     */
    _init: function(id, args) {
      this._super(id, args);
      var entities = this._entities = new ItemStore();
      var entityIds = args.entities || [];
      entityIds.forEach(this.addEntity, this);
      this._initDelegation();
    },

    // -------------------------------------------
    // ENTITY MANAGEMENT
    // -------------------------------------------

    /**
     * @param {String} id - The ID of a {@link atlas.model.GeoEntity}.
     */
    addEntity: function(id) {
      var entity = this._entityManager.getById(id);
      if (this._entities.get(id)) {
        Log.warn('Entity with ID ' + id + ' already added to collection.');
      } else {
        this._entities.add(entity);
        // TODO(aramk) Update entity visibility based on collection.
      }
    },

    /**
     * @param {String} id
     * @returns {atlas.model.GeoEntity} The entity with the given ID that was removed, or null if
     * it doesn't exist in this collection and wasn't removed.
     */
    removeEntity: function(id) {
      var entity = this._entities.get(id);
      if (entity) {
        this._entities.remove(entity);
        entity.remove();
      } else {
        Log.warn('Entity with ID ' + id + ' already added to collection.');
      }
    },

    /**
     * @param {String} id
     * @returns {atlas.model.GeoEntity} The entity with the given ID, or null if it doesn't exist in
     * this collection.
     */
    getEntity: function(id) {
      return this._entities.get(id);
    },

    /**
     * @returns {atlas.core.ItemStore<atlas.model.GeoEntity>} The entities in this collection.
     */
    getEntities: function() {
      return this._entities.clone();
    },

    /**
     * Calls the given method on each {@link atlas.model.GeoEntity} in this collection, passing the
     * given arguments.
     * @param {String} method
     * @param {Array} args
     * @private
     */
    _forEntities: function(method, args) {
      this._entities.forEach(function(item) {
        item[method].apply(item, args);
      });
    },

    /**
     * Calls the given method on each {@link atlas.model.GeoEntity} in this collection. Passes the
     * returned value to the given callback.
     * @param {String} method
     * @param {Array} args
     * @param {Function} callback
     * @returns {Boolean} Whether the given callback succeeds for all entities.
     * @private
     */
    _everyEntity: function(method, args, callback) {
      this._entities.every(function(item) {
        var value = item[method].apply(item, args);
        return callback(value);
      });
    },

    _initDelegation: function() {
      var forMethods = ['createHandles', 'addHandles', 'modifyStyle', 'onSelect', 'onDeselect'];
      forMethods.forEach(function(method) {
        this[method] = function() {
          return this._forEntities(method, arguments);
        };
      }, this);
      var forSelfMethods = ['remove', 'show', 'hide'];
      forSelfMethods.forEach(function(method) {
        this[method] = function() {
          return this._forEntities(method, arguments);
        };
        this[method].apply(this, arguments);
      }, this);
      var everyMethods = ['isRenderable'];
      everyMethods.forEach(function(method) {
        this[method] = function() {
          return this._everyEntity(method, arguments);
        };
      }, this);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getCentroid: function() {
      if (!this._centroid) {
        // TODO(aramk)
      }
      return this._centroid;
    },

    getArea: function() {
      if (!Types.isNullOrUndefined(this._area)) {
        // TODO(aramk)
      }
      return this._area;
    },

    createHandle: function(vertex, index) {
      // TODO(aramk) Use a factory to use the right handle class.
      return new Handle(this._bindDependencies({target: vertex, index: index, owner: this}));
    },

    getStyle: function() {
      throw new DeveloperError('Collection does not have a style - request from each entity.');
    },

    getPreviousStyle: function() {
      throw new DeveloperError('Collection does not have a style - request from each entity.');
    },

    getGeometry: function() {
      throw new DeveloperError('Collection does not have a geometry - request from each entity.');
    },

    getAppearance: function() {
      throw new DeveloperError('Collection does not have an appearance - request from each entity.');
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    _build: function() {
      throw new DeveloperError('Collection does not have geometry - cannot _build().');
    }

  });

  return Collection;
});
