define([
  'atlas/core/ItemStore',
  'atlas/lib/OpenLayers',
  'atlas/lib/Q',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  // Base class
  'atlas/model/GeoEntity',
  'atlas/model/GeoPoint',
  'atlas/model/Handle',
  'atlas/model/Rectangle',
  'atlas/util/ConvexHullFactory',
  'atlas/util/DeveloperError',
  'atlas/util/WKT',
  'underscore'
], function(ItemStore, OpenLayers, Q, Log, Setter, GeoEntity, GeoPoint, Handle, Rectangle,
            ConvexHullFactory, DeveloperError, WKT, _) {

  /**
   * @typedef atlas.model.Collection
   * @ignore
   */
  var Collection;

  /**
   * @classdesc A collection of {@link GeoEntity} objects which are treated as a single entity. In
   * general, the entities are able to change independently unless the change is invoked on the
   * collection, in which case in propagates to all entities.
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
     * Whether selecting an entity selects the entire collection.
     * @type {Boolean}
     */
    _groupSelect: false,

    /**
     * @param {String} id
     * @param {Object} data
     * @param {Array.<String>} data.entities - A set of {@link GeoEntity} IDs.
     * @param {Boolean} [data.groupSelect=false] - Whether selecting an entity selects the entire
     *     collection.
     * @param {Object} args
     * @private
     */
    _setup: function(id, data, args) {
      // Necessary for calling setElevation().
      this._entities = new ItemStore();
      this._initDelegation();
      this._initEvents();
      data = Setter.mixin({groupSelect: false}, data);
      // Add entities before setup to ensure style is recursively set on entities.
      var entityIds = data.entities || [];
      entityIds.forEach(this.addEntity, this);
      this._super(id, data, args);
      this.setGroupSelect(data.groupSelect);
      this._initSelection();
    },

    _setupStyle: function(data, args) {
      var style = this._parseStyle(data, args);
      style && this.setStyle(style);
    },

    // -------------------------------------------
    // ENTITY MANAGEMENT
    // -------------------------------------------

    /**
     * @param {String} id - The ID of a {@link atlas.model.GeoEntity}.
     */
    addEntity: function(id) {
      var entity = this._entityManager.getById(id);
      if (!entity) {
        throw new Error('Entity with id "' + id + '" not found - cannot add to collection');
      }
      if (this._entities.get(id)) {
        Log.warn('Entity with ID ' + id + ' already added to collection.');
      } else {
        this._entities.add(entity);
        entity.setParent(this);
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
        this._entities.remove(id);
        entity.setParent(null);
      } else {
        Log.warn('Entity with ID ' + id + ' is not in collection.');
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

    getChildren: function() {
      return this._entities.asArray();
    },

    /**
     * Calls the given method on each recursive {@link atlas.model.GeoEntity} in this collection,
     * passing the given arguments. If the method doesn't exist, it isn't called. This method
     * is safe from stack overflows from recursive methods provided all recursion is performed with
     * this method.
     * @param {String} methodName
     * @param {Array} args
     * @param {Object} [options]
     * @param {String} [options.iterator='forEach'] - The name of a valid method on Array for
     *     iteration.
     * @param {Object} [options.recursive=true] - Whether to iterate over recursive children. If
     *     false, only direct children are used.
     * @param {Function} [options.filter] - A filter function which is used to determine whether a
     *     child should be explored and returned.
     * @private
     */
    _forEntities: function(methodName, args, options) {
      // Avoid recursion to avoid stack overflows. All recursive children are handled below so
      // recursions on collections are ignored.
      if (this._inRecursion) return;
      var children;
      if (!options || options.recursive !== false) {
        children = this.getRecursiveChildren(options);
      } else {
        var filter = options && options.filter;
        children = this.getChildren();
        if (filter) children = children.filter(filter);
      }
      var iterator = (options && options.iterator) || 'forEach';
      return children[iterator](function(item, i) {
        var isCollection = item instanceof Collection;
        if (isCollection) item._inRecursion = true;
        var eventsEnabled = item.getEventsEnabled();
        // For performance we prevent events within collections from being fired.
        // TODO(aramk) This causes features within collections not to be considered selected when
        // using SelectionManager to check. However, since this collection is selected, the
        // selection of children can be inferred.
        item.setEventsEnabled(false);
        var value;
        var method = item[methodName];
        if (method) {
          value = method.apply(item, args);
        }
        if (isCollection) item._inRecursion = false;
        item.setEventsEnabled(eventsEnabled);
        return value;
      });
    },

    /**
     * Calls the given method on each {@link atlas.model.GeoEntity} in this collection, passing the
     * given arguments.
     * @param {String} methodName
     * @param {Array} args
     * @private
     */
    _getEntityValues: function(methodName, args) {
      var values = [];
      this._entities.forEach(function(item) {
        var value;
        var method = item[methodName];
        if (method) {
          value = method.apply(item, args);
          if (value !== undefined) {
            values.push(value);
          }
        }
      });
      return values;
    },

    _initDelegation: function() {
      // TODO(aramk) getHandles should create a new ItemStore and add all.

      // Call on all entities.
      var forMethods = ['createHandles', 'addHandles', 'clearHandles', 'setHeight',
          'enableExtrusion', 'disableExtrusion'];
      forMethods.forEach(function(method) {
        this[method] = function() {
          return this._forEntities(method, arguments);
        };
      }, this);
      // Call on all entities and the collection.
      var forSelfMethods = ['remove', 'translate', 'scale', 'setStyle', 'modifyStyle'];
      forSelfMethods.forEach(function(method) {
        var selfMethod = this[method];
        this[method] = function() {
          this._forEntities(method, arguments);
          return selfMethod.apply(this, arguments);
        };
      }, this);
    },

    // -------------------------------------------
    // EVENTS
    // -------------------------------------------

    /**
     * Listen for events on the entities and removes them from this collection if they are removed.
     * @private
     *
     * @listens InternalEvent#entity/remove
     */
    _initEvents: function() {
      // If the original target is this feature, don't dispatch the event since it would be a
      // duplicate.
      var isOwnEvent = function(event) {
        return event.getTarget() === this;
      }.bind(this);
      // This responds to events which bubble up from children entities.
      this.addEventListener('entity/remove', function(event) {
        if (isOwnEvent(event)) return;
        var id = event.getTarget().getId();
        if (this.getEntity(id)) {
          this.removeEntity(id);
        }
        // Prevent this event from bubbling up further since the ancestors of this entity shouldn't
        // need to worry about its children.
        event.cancel();
      }.bind(this));
    },

    /**
     * Listens for selection events on the entities and handles group selection.
     *
     * @listens InternalEvent#entity/select
     * @listens InternalEvent#entity/deselect
     * @listens InternalEvent#entity/highlight
     * @listens InternalEvent#entity/unhighlight
     */
    _initSelection: function() {
      var collection = this;
      var actions = {
        select: {'select': true, 'deselect': false},
        highlight: {'highlight': true, 'unhighlight': false},
      };
      _.each(actions, function(group, groupName) {
        _.each(group, function(value, actionName) {
          var eventName = 'entity/' + actionName;
          var handle = this.addEventListener(eventName, function(event) {
            if (this._groupSelect) {
              var parent = this.getParent();
              // If the parent also supports group selection, defer this logic and allow the event
              // to continue bubbling up so we reduce the number of redundant setSelected() calls
              // on children.
              if (!(parent instanceof Collection && parent.getGroupSelect())) {
                if (groupName === 'select') {
                  collection.setSelected(value);
                } else if (groupName === 'highlight') {
                  collection.setHighlighted(value);
                }
              }
            } else {
              // Prevent the event from bubbling up to parents and causing selections.
              event.cancel();
            }
          }.bind(this));
          this._bindEventHandle(handle);
        }, this);
      }, this);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getCentroid: function() {
      // Centroid is not cached as we are unable to determine when children have changed.
      return this._calcCentroid();
    },

    _calcCentroid: function() {
      var wkt = WKT.getInstance();
      if (this._entities.isEmpty()) {
        return null;
      } else {
        // If the collection only contains a single child, use centroid of that child which is more
        // accurate.
        var singleChild = this._getSingleChild();
        if (singleChild) {
          return singleChild.getCentroid();
        }
        // We use the footprint since the centroid of the OpenLayers.Geometry.Collection does not
        // produce a valid estimate.
        var footprint = this.getOpenLayersFootprintGeometry();
        return footprint ? wkt.geoPointFromOpenLayersPoint(footprint.getCentroid()) : null;
      }
    },

    getOpenLayersFootprintGeometry: function() {
      var wkt = WKT.getInstance();
      var vertices = [];
      var children = this.getRecursiveChildren();
      if (children.length == 0) {
        return null;
      }
      children.forEach(function(entity) {
        // Don't attempt to generate footprints for collections.
        if (entity instanceof Collection) {
          return;
        }
        var geometry = entity.getOpenLayersGeometry();
        if (!geometry) {
          return;
        }
        var geometryVertices = wkt.geoPointsFromOpenLayersGeometry(geometry);
        if (geometryVertices.length === 0) {
          return;
        }
        geometryVertices.forEach(function(vertex) {
          vertices.push(vertex);
        });
      });
      var hullVertices = ConvexHullFactory.getInstance().fromVertices(vertices);
      return wkt.openLayersPolygonFromGeoPoints(hullVertices);
    },

    /**
     * @return {GeoEntity|null} The only child in the collection, or null if more than one child
     *     exists. Excludes children which are themselves collections.
     */
    _getSingleChild: function() {
      var children = this.getRecursiveChildren();
      var singleChild = null;
      _.some(children, function(child) {
        if (!(child instanceof Collection)) {
          if (singleChild) {
            singleChild = false;
            return true;
          } else {
            singleChild = child;
          }
        }
      });
      return singleChild;
    },

    getOpenLayersGeometry: function(args) {
      var components = this._entities.map(function(entity) {
        return entity.getOpenLayersGeometry(args);
      });
      return new OpenLayers.Geometry.Collection(components);
    },

    createHandle: function(vertex, index) {
      // TODO(aramk) Use a factory to use the right handle class.
      return new Handle(this._bindDependencies({target: vertex, index: index, owner: this}));
    },

    getGeometry: function() {
      throw new DeveloperError('Collection does not have a geometry - request from each entity.');
    },

    getAppearance: function() {
      throw new DeveloperError('Collection does not have an appearance - request from each ' +
          'entity.');
    },

    getElevation: function() {
      // Take the minimum elevation for all entities.
      var values = this._getEntityValues('getElevation');
      if (values.length === 0) {
        return null;
      } else {
        return Math.min.apply(null, values);
      }
    },

    getHeight: function() {
      // Take the maximum height for all entities.
      var values = this._getEntityValues('getHeight');
      if (values.length === 0) {
        return null;
      } else {
        return Math.max.apply(null, values);
      }
    },

    /**
     * @param {Object} [args]
     * @param {Object} [args.useCentroid=false] - Whether to use centroids instead of the entire
     *     geometry to calculate the bounding box of children. The latter can be very expensive for
     *     large numbers of entities.
     * @returns {atlas.model.Rectangle} The bounding box surrounding all entities of this
     *     collection. NOTE: This may not be correct around boundaries where latitude/longitude
     *     change signs.
     */
    getBoundingBox: function(args) {
      args = Setter.merge({
        useCentroid: false
      }, args);
      var children = this.getRecursiveChildren();
      if (args.useCentroid) {
        var centroids = [];
        _.each(children, function(entity) {
          var centroid = entity.getCentroid();
          if (centroid) {
            centroids.push(centroid);
          }
        });
        return Rectangle.fromPoints(centroids);
      } else {
        var childBoundingBoxes = [];
        _.each(children, function(entity) {
          var boundingBox = entity.getBoundingBox();
          if (boundingBox) {
            childBoundingBoxes.push(boundingBox);
          }
        });
        if (childBoundingBoxes.length > 0) {
          return Rectangle.fromRectangles(childBoundingBoxes);
        } else {
          return null;
        }
      }
    },

    toJson: function() {
      var json = Setter.merge(this._super(), {
        type: 'collection',
        children: this._entities.map(function(entity) {
          return entity.getId();
        })
      });
      // To prevent applying transformations twice on children, remove those on the collection.
      // Children have absolute transformations (not relative to the collection). The
      // transformations on the collection are for reference at runtime only.
      delete json.translation;
      delete json.scale;
      delete json.rotation;
      return json;
    },

    ready: function() {
      return Q.all(this.getChildren().map(function(entity) { return entity.ready() }));
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    show: function() {
      if (!this.isVisible()) {
        this._forEntities('show', arguments);
      }
      this._super.apply(this, arguments);
    },

    hide: function() {
      if (this.isVisible()) {
        this._forEntities('hide', arguments);
      }
      this._super.apply(this, arguments);
    },

    setElevation: function() {
      var result = this._super.apply(this, arguments);
      if (result === null) return result;
      this._forEntities('setElevation', arguments);
      return result;
    },

    setSelected: function() {
      var result = this._super.apply(this, arguments);
      if (result === null) return result;
      this._forEntities('setSelected', arguments);
      return result;
    },

    setHighlighted: function() {
      var result = this._super.apply(this, arguments);
      if (result === null) return result;
      this._forEntities('setHighlighted', arguments);
      return result;
    },

    rotate: function(rotation, centroid) {
      // Rotation should be applied on each child entity around the same centroid - by default, that
      // of the collection.
      centroid = centroid || this.getCentroid();
      this._super(rotation, centroid);
      this._entities.forEach(function(entity) {
        entity.rotate(rotation, centroid);
      });
    },

    _build: function() {
      // Collection does not have geometry to build.
    },

    // Ignore all style since it's handled by the entities. Otherwise, setting the style for this
    // feature applies it to the form and this changes it from the pre-select style.
    _updateHighlightStyle: function() {
    },

    /**
     * @param {Boolean} groupSelect - Whether selecting an entity selects the entire collection.
     * @param {Object} [options]
     * @param {Boolean} [options.recursive=true] - Whether to call this method on the entities
     *     of this collection.
     * @returns {Boolean|null} The previous value of groupSelect, or null if unchanged.
     */
    setGroupSelect: function(groupSelect, options) {
      var prevValue = this._groupSelect;
      if (prevValue === groupSelect) return null;
      this._groupSelect = groupSelect;
      // Group select must be applied to all child collections to ensure events bubble up to
      // parent collections.
      if (!options || options.recursive !== false) {
        this._forEntities('setGroupSelect', [groupSelect, options], {
          filter: function(entity) {
            return entity instanceof Collection && entity.getGroupSelect() !== groupSelect;
          }
        });
      }
      return prevValue;
    },

    /**
     * @return {Boolean} Whether selecting an entity selects the entire collection.
     */
    getGroupSelect: function() {
      return this._groupSelect;
    }

  });

  return Collection;
});
