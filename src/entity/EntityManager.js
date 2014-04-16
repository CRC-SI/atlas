define([
  'atlas/lib/utility/Log',
  'atlas/model/Ellipse',
  'atlas/model/Feature',
  'atlas/model/GeoEntity',
  'atlas/model/Mesh',
  'atlas/model/Polygon',
  'atlas/model/Line',
  'atlas/model/Vertex',
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  // Base class.
  'atlas/util/Class'
], function (Log, Ellipse, Feature, GeoEntity, Mesh, Polygon, Line, Vertex, DeveloperError, mixin, Class) {

  //noinspection JSUnusedGlobalSymbols
  var EntityManager = Class.extend({

    _atlasManagers: null,

    /**
     * Contains a mapping of ID to GeoEntity of all GeoEntities in atlas.
     * @type {Object.<String,atlas.model.GeoEntity>}
     */
    _entities: null,

    /**
     * A map of handle ID to Handle objects.
     * @type {Object.<String, atlas.model.Handle>}
     */
    _handles: null,

    /**
     * Contains a mapping of GeoEntity subclass names to the constructor object
     * used to create that GeoEntity. Allows overriding of the default atlas GeoEntities
     * without having to subclass the EntityManager.
     * @type {Object.<String,Function>}
     */
    _entityTypes: {
      'Feature': Feature,
      'Polygon': Polygon,
      'Line': Line,
      'Ellipse': Ellipse,
      'Mesh': Mesh
    },

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.entity = this;
      this._entities = {};
      this._handles = {};
    },

    /**
     * Performs any manager setup that requires the presence of other managers.
     * @param args
     */
    setup: function (args) {
      if (args.constructors) {
        this.setGeoEntityTypes(args.constructors);
      }
      this.bindEvents();
    },

    bindEvents: function () {
      var handlers = [
        {
          source: 'extern',
          name: 'entity/show/bulk',
          callback: function (args) {
            Log.time('entity/show/bulk');
            var ids;
            if (args.features){
              ids = this.bulkCreate(args.features);
            } else if (args.ids) {
              ids = args.ids;
            } else {
              throw new Error('Either features or ids must be provided for bulk show.');
            }
            if (args.callback) {
              args.callback(ids);
            }
            this.getByIds(ids).forEach(function (entity) {
              entity.show();
            }, this);
            Log.timeEnd('entity/show/bulk');
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/hide/bulk',
          callback: function (args) {
            Log.time('entity/hide/bulk');
            this.getByIds(args.ids).forEach(function (entity) {
              entity.hide();
            }, this);
            Log.timeEnd('entity/hide/bulk');
          }.bind(this)
        }
        // TODO(bpstudds): Is this stupid?
//        {
//          source: 'intern',
//          name: 'entity/remove',
//          callback: function (event) {
//            event.id && this.remove(event.id);
//          }.bind(this)
//        },
//        {
//          source: 'intern',
//          name: 'handle/remove',
//          callback: function (event) {
//            event.id && this.removeHandle(event.id);
//          }.bind(this)
//        }
      ];
      this._atlasManagers.event.addEventHandlers(handlers);
    },

    /**
     * Allows overriding of the default Atlas GeoEntity types with implementation specific
     * GeoEntity types.
     * @param {Object.<String, Function>} constructors - A map of entity type names to entity constructors.
     */
    setGeoEntityTypes: function (constructors) {
      for (var key in constructors) {
        if (key in this._entityTypes) {
          //noinspection JSUnfilteredForInLoop
          this._entityTypes[key] = constructors[key];
        }
      }
    },

    // -------------------------------------------
    // CREATE ENTITIES
    // -------------------------------------------

    /**
     * Creates and adds a new Feature object to atlas-cesium.
     * @param {String} id - The ID of the Feature to add.
     * @param {Object} args - Arguments describing the Feature to add.
     * @param {String|Array.<atlas.model.Vertex>} [args.line=null] - Either a WKT string or array
     * of vertices.
     * @param {String|Array.<atlas.model.Vertex>} [args.footprint=null] - Either a WKT string or array
     * of vertices.
     * @param {Object} [args.mesh=null] - A object in the C3ML format describing the Features' Mesh.
     * @param {Number} [args.height=0] - The extruded height when displaying as a extruded polygon.
     * @param {Number} [args.elevation=0] - The elevation (from the terrain surface) to the base of
     * the Mesh or Polygon.
     * @param {Boolean} [args.show=false] - Whether the feature should be initially shown when
     * created.
     * @param {String} [args.displayMode='footprint'] - Initial display mode of feature.
     */
    createFeature: function (id, args) {
      if (typeof id === 'object') {
        args = id;
        id = args.id;
      }
      if (id === undefined) {
        throw new DeveloperError('Can not create Feature without specifying ID');
      } else if (id in this._entities) {
        throw new DeveloperError('Can not create Feature with a duplicate ID');
      } else {
        // Add EventManger to the args for the feature.
        args.eventManager = this._atlasManagers.event;
        // Add the RenderManager to the args for the feature.
        args.renderManager = this._atlasManagers.render;
        // Add the EntityManager to the args for the feature.
        args.entityManager = this;
        Log.debug('Creating entity', id);
        return (this._entities[id] = new this._entityTypes.Feature(id, args));
      }
    },

    /**
     * Allows for creation of multiple Features. Skips features which already exist.
     * @param {Array} c3mls - An array of objects, with each object containing
     *    an entity description conforming to the C3ML standard.
     * @returns {Array} The IDs of the created entities.
     */
    bulkCreate: function (c3mls) {
      var ids = [];
      c3mls.forEach(function (c3ml) {
        var id = c3ml.id;
        var entity = this.getById(id);
        if (!entity) {
          var args = this._parseC3ML(c3ml);
          this.createFeature(id, args);
          args.show && this._entities[id].show();
          ids.push(id);
        }
      }, this);
      return ids;
    },

    /**
     * Takes a object conforming to C3ML and converts it to a format expected by
     * Atlas.
     * @param {Object} c3ml - The C3ML object.
     * @returns {Object} An Atlas readable object representing the C3ML object.
     * @protected
     */
    _parseC3ML: function (c3ml) {
      var geometry,
      // Map of C3ML type to parse of that type.
          parsers = {
            line: this._parseC3MLline,
            mesh: this._parseC3MLmesh,
            polygon: this._parseC3MLpolygon
          };
      // Generate the Geometry for the C3ML type if it is supported.
      parsers[c3ml.type] && (geometry = parsers[c3ml.type](c3ml, this));
      return mixin({
        id: c3ml.id,
        type: c3ml.type,
        parent: c3ml.parent,
        children: c3ml.children
      }, geometry);
    },

    /**
     * Parses a C3ML line object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3MLline: function (c3ml, _this) {
      return {
        line: {
          vertices: _this._parseCoordinates(c3ml.coordinates),
          color: c3ml.color,
          height: c3ml.height,
          elevation: c3ml.altitude
        },
        show: true
      };
    },

    /**
     * Parses a C3ML polygon object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3MLpolygon: function (c3ml, _this) {
      return {
        polygon: {
          vertices: _this._parseCoordinates(c3ml.coordinates),
          color: c3ml.color,
          height: c3ml.height,
          elevation: c3ml.altitude
        },
        show: true
      };
    },

    /**
     * Parses a C3ML mesh object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3MLmesh: function (c3ml, _this) {
      return {
        mesh: {
          positions: c3ml.positions,
          normals: c3ml.normals,
          triangles: c3ml.triangles,
          color: c3ml.color,
          geoLocation: c3ml.geoLocation,
          scale: c3ml.scale,
          rotation: c3ml.rotation
        },
        show: true
      };
    },

    /**
     * Takes an array of {x, y, z} coordinates and converts it to an array of
     * {@see atlas.model.Vertex|Vertices}.
     * @param {Object} coordinates - The {x, y, z} coordinates to convert.
     * @returns {Array.<atlas.model.Vertex>} The convert coordinates.
     * @protected
     */
    _parseCoordinates: function (coordinates) {
      var vertices = [];
      for (var i = 0; i < coordinates.length; i++) {
        vertices.push(this._coordinateAsVertex(coordinates[i]));
      }
      return vertices;
    },

    /**
     * Converts a coordinate object to a {@link atlas.model.Vertex|Vertex}.
     * @param  {Object} coordinate - The coordinate to be converted.
     * @param {Number} coordinate.x - The latitude, given in decimal degrees.
     * @param {Number} coordinate.y - The longitude, given in decimal degrees.
     * @param {Number} coordinate.z - The altitude, given in metres.
     * @returns {atlas.model.Vertex}
     * @protected
     */
    _coordinateAsVertex: function (coordinate) {
      return new Vertex(coordinate.x, coordinate.y, coordinate.z);
    },

    /**
     * @deprecated <code>EntityManager#createFeature</code> adds new Feature as it creates them.
     * Adds a new GeoEntity into the EntityManager.
     * @param {String} id - The ID of the new GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The new GeoEntity;
     * @returns {Boolean} True if the GeoEntity was added, false otherwise.
     */
    add: function (id, entity) {
      if (id in this._entities) {
        Log.log('tried to add entity', id, 'which already exists.');
        return false;
      }
      if (!entity instanceof GeoEntity) {
        throw new DeveloperError('Can not add entity which is not a subclass of atlas/model/GeoEntity.');
      }
      Log.debug('entityManager: added entity', id);
      this._entities[id] = entity;
      return true;
    },

    /**
     * Removes the given GeoEntity from the EntityManager.
     * @param {String} id - The ID of the GeoEntity to remove.
     */
    remove: function (id) {
      if (id in this._entities) {
        Log.debug('entityManager: deleted entity', id);
        this._entities[id].cleanUp();
        delete this._entities[id];
      }
    },

    // -------------------------------------------
    // ENTITY RETRIEVAL
    // -------------------------------------------

    /**
     * Returns the GeoEntity instances that are rendered and visible.
     * @returns {Object.<String, atlas.model.GeoEntity>} A map of visible GeoEntity ID to GeoEntity.
     */
    getVisibleEntities: function () {
      var visible = {};
      Object.keys(this._entities).forEach(function(id) {
        var entity = this._entities[id];
        if (entity.isVisible()) {
          visible[id] = entity;
        }
      }, this);
      return visible;
    },

    /**
     * Returns the GeoEntity instance corresponding to the given ID.
     * @param {String} id - The ID of the GeoEntity to return.
     * @returns {atlas.model.GeoEntity|undefined} The corresponding GeoEntity or
     * <code>undefined</code> if there is no such GeoEntity.
     */
    getById: function (id) {
      // TODO(bpstudds): Accept either a single id or an array of IDs and return an either a
      //      single entity or an array or Entities
      return this._entities[id];
    },

    /**
     * Returns the GeoEntity instances corresponding to the given IDs.
     * @param {Array.<String>} ids - The ID of the GeoEntity to return.
     * @returns {Array.<atlas.model.GeoEntity>} The corresponding GeoEntity instances mapped by their
     * IDs.
     */
    getByIds: function (ids) {
      var entities = [];
      ids.forEach(function (id) {
        var entity = this.getById(id);
        entity && entities.push(entity);
      }.bind(this));
      return entities;
    },

    /**
     * Returns the GeoEntity that intersects the given Vertex or undefined.
     * @param {atlas.model.Vertex} point - The point of interest.
     * @returns {Array.<atlas.model.GeoEntity>} The GeoEntities located at the given screen coordinates.
     */
    getAt: function (point) {
      // TODO
      // See mutopia-gui cesium extensions. Aram converted the target point and visible polygons
      // to WKT and then used OpenLayers to find the intersecting entities.
      throw 'EntityManager.getAt not yet implemented.'
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
    getInPoly: function (boundingPoly, intersects) {
      // TODO
      // See mutopia-gui cesium extensions. Aram converted the target point and visible polygons
      // to WKT and then used OpenLayers to find the intersecting entities.
      throw 'EntityManager.getInPoly not yet implemented.'
    },

    /**
     * Returns the GeoEntities located within a given rectangle defined by two opposing
     * corner points. The points are specified using latitude and longitude.
     * @param {atlas.model.GeoPoint} point1
     * @param {atlas.model.GeoPoint} point2
     * @returns {Array.<atlas.model.GeoEntity>} The array of GeoEntities within the rectangle.
     * @abstract
     */
    getInRect: function (point1, point2) {
      // TODO
      // See mutopia-gui cesium extensions. Aram converted the target point and visible polygons
      // to WKT and then used OpenLayers to find the intersecting entities.
      throw 'EntityManager.getInRect not yet implemented.'
    }
  });

  return EntityManager;
});
