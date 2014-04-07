define([
  'atlas/lib/utility/Log',
  'atlas/model/Ellipse',
  'atlas/model/Feature',
  'atlas/model/GeoEntity',
  'atlas/model/Mesh',
  'atlas/model/Polygon',
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  // Base class.
  'atlas/util/Class'
], function (Log, Ellipse, Feature, GeoEntity, Mesh, Polygon, DeveloperError, mixin, Class) {

  var EntityManager = Class.extend({

    _atlasManagers: null,

    /**
     * Contains a mapping of ID to GeoEntity of all GeoEntities in atlas.
     * @type {Object.<String,atlas.model.GeoEntity>}
     */
    _entities: null,

    /**
     * Contains a mapping of GeoEntity subclass names to the constructor object
     * used to create that GeoEntity. Allows overriding of the default atlas GeoEntities
     * without having to subclass the EntityManager.
     * @type {Object.<String,Function>}
     */
    _entityTypes: {
      'Feature': Feature,
      'Polygon': Polygon,
      'Ellipse': Ellipse,
      'Mesh': Mesh
    },

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.entity = this;
      this._entities = {};
    },


    bindEvents: function () {
      Log.debug('atlas/entity/EntityManager', 'Binding events');
      this._atlasManagers.event.addEventHandler('extern', 'entity/bulk/show', function (args) {
        Log.debug('A entity/bulk/show is being handled.');
        this.bulkCreate(args.features);
      }.bind(this));
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

    /**
     * Allows overriding of the default Atlas GeoEntity types with implementation specific
     * GeoEntity types.
     * @param {Object.<String, GeoEntity>} constructors - A map of entity type names to entity constructors.
     */
    setGeoEntityTypes: function (constructors) {
      for (var key in constructors) {
        if (key in this._entityTypes) {
          this._entityTypes[key] = constructors[key];
        }
      }
    },

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
     * Allows for creation of multiple Features.
     * @param {Array} c3mls - An array of objects, with each object containing
     *    an entity description conforming to the C3ML standard.
     */
    bulkCreate: function (c3mls) {
      c3mls.forEach(function (c3ml) {
        var id = c3ml.id;
        var args = EntityManager._parseC3ML(c3ml);
        this._entities[id] = this.createFeature(id, args);
        args.show && this._entities[id].show();
      }, this);
    },

    /**
     * Takes a object conforming to C3ML and converts it to a format expected by
     * Atlas.
     * @param {Object} c3ml - The C3ML object.
     * @returns {Object} An Atlas readable object representing the C3ML object.
     * @protected
     */
    _parseC3ML: function (c3ml) {
      var geometry = {},
      // Map of C3ML type to parse of that type.
          parsers = {
            line: EntityManager._parseC3MLline,
            mesh: EntityManager._parseC3MLmesh,
            polygon: EntityManager._parseC3MLpolygon
          };
      // Generate the Geometry for the C3ML type if it is supported.
      parsers[c3ml.type] && (geometry = parsers[c3ml.type](c3ml));
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
    _parseC3MLline: function (c3ml) {
      return {
        line: {
          vertices: c3ml.coordinates,
          color: c3ml.color,
          height: c3ml.height,
          elevation: c3ml.altitude
        }
      }
    },

    /**
     * Parses a C3ML polygon object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3MLpolygon: function (c3ml) {
      return {
        polygon: {
          vertices: c3ml.coordinates,
          color: c3ml.color,
          height: c3ml.height,
          elevation: c3ml.altitude
        }
      }
    },

    /**
     * Parses a C3ML mesh object to an format supported by Atlas.
     * @param {Object} c3ml - The C3ML object to be parsed
     * @returns {Object} The parsed C3ML.
     * @private
     */
    _parseC3MLmesh: function (c3ml) {
      return {
        mesh: {
          positions: c3ml.positions,
          normals: c3ml.normals,
          triangles: c3ml.triangles,
          color: c3ml.color,
          geoLocation: c3ml.geoLocation,
          scale: c3ml.scale,
          rotation: c3ml.rotation
        }
      }
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
     */
    getInPoly: function (boundingPoly, intersects) {
      // TODO
      // See mutopia-gui cesium extensions. Aram converted the target point and visible polygons
      // to WKT and then used OpenLayers to find the intersecting entities.
      throw 'EntityManager.getInPoly not yet implemented.'
    },

    getInRect: function (start, end) {
      // TODO
      // See mutopia-gui cesium extensions. Aram converted the target point and visible polygons
      // to WKT and then used OpenLayers to find the intersecting entities.
      throw 'EntityManager.getInRect not yet implemented.'
    }
  });
  return EntityManager;
});
