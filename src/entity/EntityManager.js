define([
  'atlas/core/Manager',
  'atlas/core/ItemStore',
  'atlas/events/Event',
  'atlas/lib/Q',
  'atlas/lib/utility/Counter',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Strings',
  'atlas/lib/utility/Types',
  'atlas/lib/topsort',
  'atlas/model/Collection',
  'atlas/model/Ellipse',
  'atlas/model/Feature',
  'atlas/model/GeoEntity',
  'atlas/model/Mesh',
  'atlas/model/Point',
  'atlas/model/Polygon',
  'atlas/model/Line',
  'atlas/model/Image',
  'atlas/model/GeoPoint',
  'atlas/model/Vertex',
  'atlas/util/DeveloperError',
  'underscore'
], function(Manager, ItemStore, Event, Q, Counter, Log, Setter, Strings, Types, topsort, Collection,
            Ellipse, Feature, GeoEntity, Mesh, Point, Polygon, Line, Image, GeoPoint, Vertex,
            DeveloperError, _) {

  /**
   * @typedef atlas.entity.EntityManager
   * @ignore
   */
  var EntityManager;

  /**
   * Maintains a collection of created {@link atlas.model.GeoEntity} objects and provides an
   * external interface to create, update and delete them.
   * @class atlas.entity.EntityManager
   */
  EntityManager = Manager.extend(/** @lends atlas.entity.EntityManager# */{

    _id: 'entity',

    /**
     * All added {@link atlas.model.GeoEntity} objects.
     * @type {atlas.core.ItemStore}
     */
    _entities: null,

    /**
     * Contains a mapping of GeoEntity subclass names to the constructor object
     * used to create that GeoEntity. Allows overriding of the default atlas GeoEntities
     * without having to subclass the EntityManager.
     * @type {Object.<String,Function>}
     */
    _entityTypes: {
      Ellipse: Ellipse,
      Feature: Feature,
      Image: Image,
      Line: Line,
      Mesh: Mesh,
      Point: Point,
      Polygon: Polygon,
      Collection: Collection
    },

    /**
     * A map of feature ID to their display mode at the time of calling 'entity/display-mode'.
     * Records are removed when calling 'entity/display-mode/reset'.
     * @type {Object.<String, atlas.model.Feature.DisplayMode>}
     */
    _origDisplayModes: null,

    /**
     * Counter used for generating unique IDs.
     * @type {Counter}
     */
    _idCounter: null,

    /**
     * A map of the entity IDs to entities which are currently hovered over.
     * @type {Object.<String, atlas.mode.GeoEntity>}
     */
    _hoveredEntities: null,

    /**
     * Whether to highlight entities when hovering over them.
     * @type {Boolean}
     */
    _highlightOnHover: false,

    _init: function(managers) {
      this._super(managers);
      this._origDisplayModes = {};
      this._entities = new ItemStore();
      this._hoveredEntities = new ItemStore();
      this._idCounter = new Counter({count: 1});
    },

    /**
     * Performs any manager setup that requires the presence of other managers.
     * @param {Object} args
     */
    setup: function(args) {
      var constructors = args && args.constructors;
      if (constructors) {
        this.setGeoEntityTypes(constructors);
      }
      this.bindEvents();
    },

    /**
     * Allows overriding of the default Atlas GeoEntity types with implementation specific
     * GeoEntity types.
     * @param {Object.<String, Function>} constructors - A map of entity type names to entity
     *     constructors.
     */
    setGeoEntityTypes: function(constructors) {
      for (var key in constructors) {
        if (key in this._entityTypes) {
          //noinspection JSUnfilteredForInLoop
          this._entityTypes[key] = constructors[key];
        }
      }
    },

    // -------------------------------------------
    // EVENTS
    // -------------------------------------------

    bindEvents: function() {
      var handlers = [
        {
          source: 'extern',
          name: 'entity/create',
          callback: this.createFeature.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/show',
          callback: this.toggleEntityVisibility.bind(this, true)
        },
        {
          source: 'extern',
          name: 'entity/hide',
          callback: this.toggleEntityVisibility.bind(this, false)
        },
        {
          source: 'extern',
          name: 'entity/remove',
          callback: function(args) {
            Log.time('entity/remove');
            var entity = this.getById(args.id);
            entity && entity.remove();
            Log.timeEnd('entity/remove');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/create/bulk',
          callback: function(args) {
            Log.time('entity/create/bulk');
            var promise = null;
            if (args.features) {
              promise = Q(this.bulkCreate(args.features, args));
            } else {
              promise = Q.reject('No features argument provided for bulk create.');
            }
            promise.fin(function(ids) {
              Log.timeEnd('entity/create/bulk');
            });
            if (args.callback) {
              if (args.callbackPromise) {
                args.callback(promise);
              } else {
                promise.then(args.callback);
              }
            } else {
              // Catch and report errors.
              promise.done();
            }
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/hide/bulk',
          callback: function(args) {
            Log.time('entity/hide/bulk');
            this.getByIds(args.ids).forEach(function(entity) {
              entity.hide();
            }, this);
            Log.timeEnd('entity/hide/bulk');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/remove/bulk',
          callback: function(args) {
            Log.time('entity/remove/bulk');
            args.ids.forEach(function(id) {
              this.remove(id);
            }, this);
            Log.timeEnd('entity/remove/bulk');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/remove/all',
          callback: function(args) {
            Log.time('entity/remove/all');
            this.removeAll();
            Log.timeEnd('entity/remove/all');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/display-mode',
          callback: function(args) {
            // Set all features to 'footprint' display mode.
            Log.time('entity/display-mode');
            var features = args.ids ? this._getFeaturesByIds(args.ids) : this.getFeatures();
            features.forEach(function(feature) {
              var id = feature.getId();
              // Save a reference to the previous display mode to allow resetting.
              if (!this._origDisplayModes[id]) {
                this._origDisplayModes[id] = feature.getDisplayMode();
              }
              feature.setDisplayMode(args.displayMode);
            }, this);
            Log.timeEnd('entity/display-mode');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/display-mode/reset',
          callback: function(args) {
            // Resets all features to their original display mode (at the time of using entity/mode
            args = args || {};
            Log.time('entity/display-mode/reset');
            var features = this._getFeaturesByIds(args.ids || Object.keys(this._origDisplayModes));
            features.forEach(function(feature) {
              var id = feature.getId();
              var origDisplayMode = this._origDisplayModes[id];
              if (origDisplayMode) {
                feature.setDisplayMode(origDisplayMode);
                delete this._origDisplayModes[id];
              }
            }, this);
            Log.timeEnd('entity/display-mode/reset');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/rotate',
          callback: function(args) {
            if (!args || !args.ids) { return; }
            var features = this._getFeaturesByIds(args.ids);
            features.forEach(function(feature) {
              feature.rotate(args.rotate);
            });
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/left/dblclick',
          /**
           * @param {InternalEvent#event:input/left/dblclick} args
           * @listens InternalEvent#input/left/dblclick
           * @fires InternalEvent#entity/dblclick
           * @ignore
           */
          callback: function(args) {
            var entities = this.getAt(args.position);
            if (entities.length > 0) {
              // Only capture the double click on the first entity.
              var entity = entities[0];

              /**
               * The {@link atlas.model.GeoEntity} was double-clicked.
               *
               * @event InternalEvent#entity/dblclick
               * @type {atlas.events.Event}
               * @property {String} args.id - ID of entity under the mouse.
               */
              this._managers.event.dispatchEvent(new Event(entity, 'entity/dblclick', {
                id: entity.getId()
              }));
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/mousemove',
          /**
           * @param {InternalEvent#event:input/mousemove} args
           * @listens InternalEvent#input/mousemove
           * @fires InternalEvent#entity/mousemove
           * @ignore
           */
          callback: _.debounce(function(args) {
            // Debounce to prevent excessive calls to getAt().
            var position = args.position;
            var entities = this.getAt(position);
            var newHoveredEntities = {};
            entities.forEach(function(entity) {
              var id = entity.getId();
              var isMouseOver = this._hoveredEntities.get(id);
              if (!isMouseOver) {
                /**
                 * The mouse was moved into the {@link atlas.model.GeoEntity}.
                 *
                 * @event InternalEvent#entity/mouseenter
                 * @type {atlas.events.Event}
                 * @property {String} args.id - The ID of the entity.
                 */
                this._managers.event.dispatchEvent(new Event(entity, 'entity/mouseenter', {
                  id: id
                }));
                this._highlightOnHover && entity.setHighlighted(true);
              }
              /**
               * The mouse was moved over the {@link atlas.model.GeoEntity}.
               *
               * @event InternalEvent#entity/mousemove
               * @type {atlas.events.Event}
               * @property {String} args.id - The ID of the entity.
               */
              this._managers.event.dispatchEvent(new Event(entity, 'entity/mousemove', {
                id: id
              }));
              newHoveredEntities[id] = entity;
              this._highlightOnHover && entity.setHighlighted(true);
            }, this);
            this._hoveredEntities.forEach(function(entity, id) {
              if (!newHoveredEntities[id]) {
                /**
                 * The mouse was moved out of the {@link atlas.model.GeoEntity}.
                 *
                 * @event InternalEvent#entity/mouseleave
                 * @type {atlas.events.Event}
                 * @property {String} args.id - The ID of the entity.
                 */
                this._managers.event.dispatchEvent(new Event(entity, 'entity/mouseleave', {
                  id: id
                }));
                this._highlightOnHover && entity.setHighlighted(false);
              }
            }, this);
            this._hoveredEntities.purge();
            _.each(newHoveredEntities, function(entity, id) {
              this._hoveredEntities.add(entity);
            }, this);
          }.bind(this), 20)
        }
      ];
      this._eventHandlers = this._managers.event.addEventHandlers(handlers);
    },

    setHighlightOnHover: function(enabled) {
      if (this._highlightOnHover !== enabled) {
        this._highlightOnHover = enabled;
        if (!enabled) {
          this._hoveredEntities.forEach(function(entity, id) {
            entity.setHighlighted(false);
          }, this);
          this._hoveredEntities
        }
      }
    },

    getHighlightOnHover: function() {
      return this._highlightOnHover;
    },

    // -------------------------------------------
    // CREATE ENTITIES
    // -------------------------------------------

    /**
     * Creates and adds a new Feature object to Atlas.
     * @param {String} id - The ID of the Feature to add.
     * @param {Object} data - Arguments describing the Feature to add.
     * @param {String|Array.<atlas.model.GeoPoint>} [data.line=null] - Either a WKT string or array
     *     of vertices.
     * @param {String|Array.<atlas.model.GeoPoint>} [data.footprint=null] - Either a WKT string or
     *     array of vertices.
     * @param {Object} [data.mesh=null] - A object in the C3ML format describing the Features' Mesh.
     * @param {Number} [data.height=0] - The extruded height when displaying as a extruded polygon.
     * @param {Number} [data.elevation=0] - The elevation (from the terrain surface) to the base of
     *     the Mesh or Polygon.
     * @param {Boolean} [data.show=true] - Whether the feature should be initially shown when
     *     created.
     * @param {String} [data.displayMode='footprint'] - Initial display mode of feature.
     * @returns {atlas.model.Feature} A feature constructed from the given arguments.
     */
    createFeature: function(id, data, args) {
      if (typeof id === 'object') {
        data = id;
        id = data.id;
      }
      data = Setter.merge({
        show: true
      }, data);
      if (id === undefined) {
        var msg = 'Can not create Feature without specifying ID';
        Log.error(msg);
        throw new DeveloperError(msg);
      } else if (this.getById(id)) {
        var msg = 'Can not create Feature with a duplicate ID: ' + id;
        Log.error(msg);
        throw new DeveloperError(msg);
      } else {
        Log.debug('Creating entity', id);
        args = this._bindDeps(args);
        return new this._entityTypes.Feature(id, data, args);
      }
    },

    /**
     * @param {String} - The ID of the entity.
     * @param {Object} data - Data passed to the entity class constructor.
     * @param {Object} args - Arguments passed to the entity class constructor.
     * @return {atlas.model.GeoEntity} - An entity constructe from the given arguments
     */
    createEntity: function(id, data, args) {
      args = this._bindDeps(args);
      var Constructor = this._getEntityConstructor(data.type);
      return new Constructor(id, data, args);
    },

    /**
     * @type {String} type
     * @returns {Class} The entity class for the given type.
     */
    _getEntityConstructor: function(type) {
      type = this._sanitizeType(type);
      return this._entityTypes[Strings.toTitleCase(type)];
    },

    /**
     * @param {String|null} id - The ID of the collection. If null, a unique ID is generated.
     * @param {Object} data
     * @param {Array.<String>} data.entities - A series of entity IDs to add as children in the
     *     collection.
     * @param {Array.<String>} [data.children] - An alias property for "entities".
     * @return {atlas.model.Collection}
     */
    createCollection: function(id, data) {
      var args = this._bindDeps();
      data.entities = data.children || data.entities;
      if (id == null) {
        id = this.generateUniqueId();
      }
      return new this._entityTypes.Collection(id, data, args);
    },

    /**
     * Adds manager references to the given object as dependencies later passed to models.
     * @param {Object} args
     * @return {Object} The object passed in with the added dependencies.
     */
    _bindDeps: function(args) {
      // TODO(aramk) Use dependency injection to ensure all entities that are created have these
      // if they need them.
      return Setter.merge(args || {}, {
        eventManager: this._managers.event,
        renderManager: this._managers.render,
        entityManager: this
      });
    },

    /**
     * Creates entities in bulk.
     * @param {Array} c3mls - An array of objects, with each object containing
     *     an entity description conforming to the C3ML standard. If an entity with a given ID is
     *     already rendered, it is ignored.
     * @param {Object} [options]
     * @param {Boolean} [options.batch=true] - Whether to batch the render. If false, all entities
     *     are rendered synchronously.
     * @param {Number} [options.batchSize=50] - The size of a single batch which is rendered
     *     synchronously.
     * @param {Number} [options.batchDelay=100] - The delay in milliseconds between completing
     *     one batch and proceeding with the next.
     * @param {Number} [options.batchTimeout=1000] - The maximum time in milliseconds to wait for a
     *     batch to complete rendering before moving onto the next.
     * @param {Boolean} [args.waitForReady=true] - Whether to wait until the models are ready before
     *     declaring each batch task as complete.
     * @returns {Array} The IDs of the created entities.
     */
    bulkCreate: function(c3mls, options) {
      options = Setter.merge({
        batch: true,
        batchSize: 50,
        batchDelay: 100,
        batchTimeout: 1000,
        waitForReady: true
      }, options);
      if (options.batch === false) {
        // Handles rendering in a single batch.
        options.batchSize = c3mls.length;
      }

      var edges = [];
      var sortMap = {};
      var c3mlMap = {};
      // Topologically sort the c3ml based on the "children" field.
      c3mls.forEach(function(c3ml) {
        var id = c3ml.id;
        var children = this._getChildrenIds(c3ml);
        if (children) {
          children.forEach(function(childId) {
            edges.push([id, childId]);
            sortMap[id] = sortMap[childId] = true;
          });
        }
        if (c3mlMap[id]) {
          throw new Error('Duplicate IDs for c3mls: ' + id);
        }
        c3mlMap[id] = c3ml;
      }, this);
      var sortedIds = topsort(edges);
      // Reverse the list so that each entity is created before its parents to ensure they're
      // available when requested.
      sortedIds.reverse();
      // Add any entities which are not part of a hierarchy and weren't in the topological sort.
      c3mls.forEach(function(c3ml) {
        var id = c3ml.id;
        if (!sortMap[id]) {
          sortedIds.push(id);
        }
      });
      var sortedC3mls = [];
      _.each(sortedIds, function(id) {
        var c3ml = c3mlMap[id];
        // Entities referenced by ID may be rendered in a previous draw call and already exist so
        // we don't need to create them.
        if (!this.getById(id) && !c3ml) {
          throw new Error('No C3ML entity found for ID ' + id);
        } else if (c3ml) {
          sortedC3mls.push(c3ml);
        }
      }, this);
      return this._bulkCreate(sortedC3mls, options);
    },

    /**
     * @param {Array.<Object>} c3mls - The C3ML entities to create.
     * @param {Object} options - See {@link #bulkCreate}.
     * @return {Promise.<Array.<String>>} - A promise containing the IDs of created entities.
     */
    _bulkCreate: function(c3mls, options) {
      var idMap = {};
      var tasks = [];
      var batchItems = [];
      var createBatchTask = function() {
        if (batchItems.length > 0) {
          var task = this._createBatchTask(batchItems, options);
          tasks.push(task);
          batchItems = [];
        }
      }.bind(this);
      _.each(c3mls, function(c3ml) {
        var item = this._addBatchItem(c3ml, idMap, options);
        if (item) {
          batchItems.push(item);
          idMap[c3ml.id] = c3ml;
          if (batchItems.length >= options.batchSize) { createBatchTask() }
        }
      }, this);
      // For any remaining entities.
      createBatchTask();

      var origTaskCount = tasks.length;
      // Use the task count to estimate the number of entities (some might have been skipped)
      // but never exceed the actual number of entities.
      var entityTotalCount = Math.min(origTaskCount * options.batchSize, c3mls.length);
      var df = Q.defer();

      var notifyProgress = function() {
        var taskDoneCount = (origTaskCount - tasks.length);
        var entityDoneCount = Math.min(taskDoneCount * options.batchSize, entityTotalCount);
        var percent = entityDoneCount / entityTotalCount;
        df.notify({
          value: entityDoneCount,
          total: entityTotalCount,
          percent: percent
        });
      };

      var runTask = function() {
        var task = tasks.pop();
        if (!task) {
          df.resolve(_.keys(idMap));
          return;
        };
        var sendNextTask = _.once(function() {
          notifyProgress();
          runTask();
        });
        var promise = Q(this._runBatchTask(task, options));
        promise.fail(function(e) {
          Log.error('Error while bulk rendering a batch', e, e.stack);
        }).fin(function() {
          setTimeout(sendNextTask, options.batchDelay);
        }).done();
      }.bind(this);

      runTask();
      return df.promise;
    },

    /**
     * @param {Object} c3ml - A C3ML entity.
     * @param {Object.<String, Boolean>} idMap - A map of the entity IDs which have been prepared
     *     for bulk creation.
     * @param {Object} options - See {@link #bulkCreate}.
     * @param {Object} An item processed for batch creation. If false, this C3ML entity is ignored.
     */
    _addBatchItem: function(c3ml, idMap, options) {
      return c3ml;
    },

    /**
     * @param {Array.<Object>} items - A batch of items returned from {@link #_addBatchItem}.
     * @param {Object} options - See {@link #bulkCreate}.
     * @return {Function} A function to run the batch task.
     */
    _createBatchTask: function(items, options) {
      return function() {
        var promises = [];
        _.each(items, function(c3ml) {
          try {
            var data = this._parseC3ml(c3ml);
            var entity = this.createEntity(c3ml.id, data);
            if (options.waitForReady) {
              promises.push(entity.ready());
            }
          } catch (e) {
            Log.error('Failed to render entity during bulk render', e);
          }
        }, this);
        if (options.waitForReady) {
          return Q.all(promises);
        }
      }.bind(this);
    },

    /**
     * @param {Function} task - A function to run the batch task returned from
     *     {@link #_createBatchTask}.
     * @param {Object} options - See {@link #bulkCreate}.
     * @return {Promise} A promise which is resolved once the task has completed running.
     */
    _runBatchTask: function(task, options) {
      return task();
    },

    /**
     * @param {Object} c3ml
     * @return {Array.<String>} The child IDs for the given C3ML document.
     */
    _getChildrenIds: function(c3ml) {
      var type = this._sanitizeType(c3ml.type);
      var forms = c3ml.forms;
      if (type === 'collection' && c3ml.children) {
        return c3ml.children;
      } else if (type === 'feature' && forms) {
        return Object.keys(forms).map(function(formType) {
          return forms[formType];
        });
      } else {
        return [];
      }
    },

    _getParserForType: function(type) {
      // Map of C3ML type to parse of that type.
      var parsers = {
        point: this._parseC3mlPoint,
        line: this._parseC3mlLine,
        mesh: this._parseC3mlMesh,
        polygon: this._parseC3mlPolygon,
        image: this._parseC3mlImage,
        feature: this._parseC3mlFeature,
        collection: this._parseC3mlCollection
      };
      return parsers[type];
    },

    _sanitizeType: function(type) {
      return type.toLowerCase();
    },

    /**
     * Takes an object conforming to the C3ML standard and converts it to a format expected by the
     * Feature constructor.
     * @param {Object} c3ml - The C3ML object.
     * @returns {Object} An Atlas readable object representing the C3ML object.
     * @protected
     */
    _parseC3ml: function(c3ml) {
      // Generate the Geometry for the C3ML type if it is supported.
      var type = this._sanitizeType(c3ml.type);
      if (!type) {
        throw new Error('C3ML must have type parameter.');
      }
      var parser = this._getParserForType(type);
      if (parser) {
        // TODO(aramk) Eventually the C3ML/AEON format will be directly supported by all model
        // constructors. For now, just feed in all the data we have.
        return Setter.mixin(c3ml, parser.call(this, c3ml));
      } else {
        throw new Error('Could not find suitable parser for C3ml type: ' + type);
      }
    },

    // TODO(aramk) For all parsers - reuse the objects passed rather than creating new ones.
    // Mix in new parameters.

    _parseC3mlFeature: function(c3ml) {
      // TODO(aramk) For now, feature still accepts the forms in the root object.
      var forms = c3ml.forms;
      Setter.mixin(c3ml, forms);
      delete c3ml.forms;
      return c3ml;
    },

    _parseC3mlCollection: function(c3ml) {
      return {
        entities: c3ml.children
      };
    },

    /**
     * Parses a C3ML point object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3mlPoint: function(c3ml) {
      // Position is either a string or an array containing a single coordinate.
      // var position = c3ml.position || c3ml.coordinates;
      // if (Types.isArrayLiteral(position) && position.length === 1) {
      //   position = position[0];
      // }
      return {
        position: c3ml.position,
        vertices: c3ml.coordinates,
        latitude: c3ml.latitude,
        longitude: c3ml.longitude,
        elevation: c3ml.elevation,
        color: c3ml.color,
      };
    },

    /**
     * Parses a C3ML image object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3mlImage: function(c3ml) {
      return {
        vertices: c3ml.coordinates,
        image: c3ml.image
      };
    },

    /**
     * Parses a C3ML line object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3mlLine: function(c3ml) {
      return {
        vertices: c3ml.coordinates,
        color: c3ml.color,
        height: c3ml.height,
        elevation: c3ml.altitude
      };
    },

    /**
     * Parses a C3ML polygon object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3mlPolygon: function(c3ml) {
      return {
        // TODO(aramk) We need to standardize which one we use - were using "vertices" internally
        // but "coordinates" in c3ml.
        vertices: c3ml.coordinates,
        holes: c3ml.holes,
        color: c3ml.color,
        height: c3ml.height,
        elevation: c3ml.altitude
      };
    },

    /**
     * Parses a C3ML mesh object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3mlMesh: function(c3ml) {
      return {
        positions: c3ml.positions,
        normals: c3ml.normals,
        triangles: c3ml.triangles,
        color: c3ml.color,
        geoLocation: c3ml.geoLocation,
        scale: c3ml.scale,
        rotation: c3ml.rotation,
        gltf: c3ml.gltf,
        gltfUrl: c3ml.gltfUrl
      };
    },

    /**
     * Adds a new GeoEntity into the EntityManager.
     * @param {atlas.model.GeoEntity} entity - The new GeoEntity;
     */
    add: function(entity) {
      var id = entity.getId();
      if (this._entities.get(id)) {
        throw new Error('Tried to add entity ' + id + ' which already exists.');
      }
      if (!(entity instanceof GeoEntity)) {
        throw new DeveloperError('Can not add entity which is not a subclass of ' +
            'atlas/model/GeoEntity.');
      }
      Log.debug('entityManager: added entity', id);
      this._entities.add(entity);
    },

    /**
     * Removes the given GeoEntity from the EntityManager.
     * @param {String} id - The ID of the GeoEntity to remove.
     */
    remove: function(id) {
      if (this._entities.get(id)) {
        Log.debug('entityManager: deleted entity', id);
        var entity = this._entities.remove(id);
        // If entity manager will be destroyed, avoid unnecessary removal logic for performance.
        if (!this._isDestroyed) {
          // Call this last to prevent infinite loops if this method is called from within.
          entity.remove();
        }
      }
    },

    /**
     * @return {Array.<atlas.model.GeoEntity>} The removed entities.
     */
    removeAll: function() {
      var entities = this.getEntities();
      entities.forEach(function(entity) {
        this.remove(entity.getId());
      }, this);
      return entities;
    },

    // -------------------------------------------
    // ENTITY RETRIEVAL
    // -------------------------------------------

    /**
     * Returns the {@link atlas.model.GeoEntity} instances that are rendered and visible.
     * @returns {Object.<String, atlas.model.GeoEntity>} A map of IDs to visible entities.
     */
    getVisibleEntities: function(args) {
      args = Setter.mixin({}, args);
      if (!args.ids) {
        args.ids = this._entities.getIds();
      }
      var visible = {};
      var ids = args.ids;
      var filter = args.filter;
      ids.forEach(function(id) {
        var entity = this.getById(id);
        if (filter && !filter(entity)) {
          return;
        }
        if (entity.isVisible()) {
          visible[id] = entity;
        }
      }, this);
      return visible;
    },

    /**
     * Returns the {@link atlas.model.Feature} instances that are rendered and visible.
     * @returns {Object.<String, atlas.model.GeoEntity>} A map of IDs to visible features.
     */
    getVisibleFeatures: function() {
      return this.getVisibleEntities({
        filter: function(entity) {
          return entity instanceof Feature;
        }
      });
    },

    /**
     * Returns the GeoEntity instance corresponding to the given ID.
     * @param {String} id - The ID of the GeoEntity to return.
     * @returns {atlas.model.GeoEntity|undefined} The corresponding GeoEntity or
     *     <code>undefined</code> if there is no such GeoEntity.
     */
    getById: function(id) {
      return this._entities.get(id);
    },

    /**
     * @param {Array.<String>} ids - The ID of the GeoEntity to return.
     * @returns {Array.<atlas.model.GeoEntity>} The corresponding GeoEntity instances mapped by
     *     their IDs.
     */
    getByIds: function(ids) {
      var entities = [];
      ids = ids || [];
      ids.forEach(function(id) {
        var entity = this.getById(id);
        entity && entities.push(entity);
      }.bind(this));
      return entities;
    },

    /**
     * @returns {Array.<atlas.model.GeoEntity>}
     */
    getEntities: function() {
      return this._entities.asArray();
    },

    getEntitiesFromArgs: function(args) {
      if (args.entities) {
        return this.getByIds(args.entities);
      } else {
        return this.getAt(args.position);
      }
    },

    /**
     * @param {Array} items
     * @param {Function} type - The constructor to filter by.
     * @returns {Array} A new array containing only the items which are of the given type.
     * @private
     */
    _filterByType: function(items, type) {
      return items.filter(function(item) {
        return item instanceof type;
      });
    },

    /**
     * @param {Array} items
     * @returns {Array.<atlas.model.Feature>} A new array containing only the items which are of
     * type {@link atlas.model.Feature}.
     * @private
     */
    _filterFeatures: function(items) {
      return this._filterByType(items, Feature);
    },

    _getFeaturesByIds: function(ids) {
      return this._filterFeatures(this.getByIds(ids));
    },

    /**
     * @returns {Array.<atlas.model.Feature>}
     */
    getFeatures: function() {
      return this._filterFeatures(this.getEntities());
    },

    /**
     * @param {atlas.model.Vertex} point - The screen coordinates.
     * @returns {Array.<atlas.model.GeoEntity>} The GeoEntities located at the given screen
     * coordinates.
     */
    getAt: function(point) {
      // Get the Entities at the given screen coordinates.
      var ids = this._managers.render.getAt(point);
      // Translate entity IDs to entity objects.
      var entities = [];
      ids.forEach(function(id) {
        var entity = this.getById(id);
        if (entity instanceof GeoEntity) {
          entities.push(entity);
        }
      }, this);
      return entities;
    },

    /**
     * Returns the GeoEntities located within the given Polygon.
     * @param {atlas.model.Polygon} boundingPoly - The polygon defining the geographic area to
     * retrieve GeoEntities.
     * @param {Boolean} [intersects] - If true, GeoEntities which intersect the boundingBox are
     * returned as well. Otherwise, only wholly contains GeoEntities are returned.
     * @returns {atlas.model.GeoEntity|undefined} The GeoEntities located in the bounding box,
     * or <code>undefined</code> if there are no such GeoEntities.
     * @abstract
     */
    getInPoly: function(boundingPoly, intersects) {
      throw new DeveloperError('EntityManager.getInPoly not yet implemented.');
    },

    /**
     * Returns the GeoEntities located within a given rectangle defined by two opposing
     * corner points. The points are specified using latitude and longitude.
     * @param {atlas.model.GeoPoint} point1
     * @param {atlas.model.GeoPoint} point2
     * @returns {Array.<atlas.model.GeoEntity>} The array of GeoEntities within the rectangle.
     * @abstract
     */
    getInRect: function(point1, point2) {
      throw new DeveloperError('EntityManager.getInRect not yet implemented.');
    },

    /**
     * @return {Number} A unique ID for a {@link atlas.model.GeoEntity} which has not been added to
     *     this manager.
     */
    generateUniqueId: function() {
      var id = null;
      while (!id || this.getById(id)) {
        id = this._idCounter.increment();
      }
      return id;
    },

    // -------------------------------------------
    // ENTITY MODIFICATION
    // -------------------------------------------

    /**
     * Sets the Visibility on a group of entities.
     * @param {Boolean} visible - Whether the entities should be visible.
     * @param {Object} args - Specifies the IDs of the GeoEntities to change.
     * @param {String} [args.id] - The ID of a single GeoEntity to change.
     * @param {Array.<String>} [args.ids] - An array of GeoEntity IDs to change. This overrides
     *     <code>args.id</code> if it is given.
     */
    toggleEntityVisibility: function(visible, args) {
      var ids = args.ids || [args.id];
      var action = visible ? 'show' : 'hide';

      Log.time('entity/' + action);
      ids.forEach(function(id) {
        var entity = this.getById(id);
        if (!entity) throw new Error('Tried to ' + action + ' non-existent entity ' + id);

        visible ? entity.show() : entity.hide();
      }, this);
      Log.timeEnd('entity/' + action);
    },

    destroy: function() {
      this._super();
      this.removeAll();
    }

  });

  return EntityManager;
});
