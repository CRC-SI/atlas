define([
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  // Base class
  'atlas/visualisation/AbstractProjection',
  'atlas/util/AtlasMath',
  'atlas/util/DeveloperError'
], function(Log, Setter, Feature, AbstractProjection, AtlasMath, DeveloperError) {

  /**
   * @classdesc The HeightProjection represents a projection of Entity parameter values onto
   * the Entity's height.
   * @class atlas.visualisation.HeightProjection
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.HeightProjection# */ {

    ARTIFACT: 'height',
    DEFAULT_CODOMAIN: {startProj: 50, endProj: 100},

    /**
     * A map of parent IDs to a map of old elevations before projection to an array of objects
     * containing meta-data, including the new elevations after projection.
     * @type {Object.<String, Array.<Object.<Number, Object>>>}
     */
    _modifiedElevations: null,

    /**
     * Whether to maintain stacked entities vertically by modifying their elevation as their heights
     * change.
     * @type {Boolean}
     */
    _stack: true,

    _init: function(args) {
      this._super(args);
      args = Setter.mixin({
        stack: true
      }, args)
      this._stack = args.stack;
    },

    getCurrentState: function() {
      // Otherwise return the current state of the actual render.
      var state = {};
      Object.keys(this._entities).forEach(function(id) {
        // Set previous state for this entity
        state[id] = {
          height: this._entities[id].getHeight(),
          elevation: this._entities[id].getElevation()
        };
      }, this);
      return state;
    },

    render: function(id) {
      var ids = this._constructIdList(id);
      this.setPreviousState(this.getCurrentState());
      this._modifiedElevations = {};
      var sortedIds = ids.sort(function(a, b) {
        return this._entities[a].getElevation() - this._entities[b].getElevation();
      }.bind(this));
      this._super(sortedIds);
    },

    _render: function(entity, attributes) {
      var oldHeight = entity.getHeight();
      var oldElevation = entity.getElevation();
      // TODO(bpstudds): Handle the case where an entity sits on two entities.
      // TODO(bpstudds): Handle the case where there's a hierarchy of 'parents'
      var newElevation;
      var parent = entity.getParent();
      if (this._stack === false || !parent && oldHeight === 0 && oldElevation === 0) {
        // If the entity had a height of 0 and no parent, the old top elevation of 0 will be
        // incorrectly mapped to a new non-zero top elevation, causing other similar entities to
        // stack. Avoid this by setting the new elevation to the old one.
        newElevation = oldElevation;
      } else {
        newElevation = this._getModifiedElevation(oldElevation, entity.getCentroid(), parent);
      }
      // Footprints can have elevation but not height. Generating height will cause an invalid
      // top elevation as applying height on the footprint will have no effect.
      var isFootprint = false;
      if (entity.isExtrusion) {
        isFootprint = !entity.isExtrusion();
      } else if (entity instanceof Feature &&
          entity.getDisplayMode() === Feature.DisplayMode.FOOTPRINT) {
        isFootprint = true;
      }
      var newHeight = isFootprint ? oldHeight : this._regressProjectionValueFromCodomain(attributes,
          this._configuration.codomain);
      this._setEffects(entity.getId(), {
        oldValue: {height: oldHeight, elevation: oldElevation},
        newValue: {height: newHeight, elevation: newElevation}
      });
      // Update the mapping of old building top to new building top elevation.
      this._setModifiedElevation(entity, oldElevation + oldHeight, newElevation + newHeight);
      entity.setElevation(newElevation);
      entity.setHeight(newHeight);
    },

    /**
     * Gets the modified top elevation of an entity so an entity sitting on top
     * of it is moved appropriately so it stacks on top of it.
     * @param {Number} oldElevation - The bottom elevation of the Entity to be moved.
     * @param {atlas.model.GeoPoint} centroid - The centroid of the entity.
     * @param {atlas.model.GeoEntity} parent - The ID of the parent of the entity being moved.
     * @private
     */
    _getModifiedElevation: function(oldElevation, centroid, parent) {
      var newElevations;
      var result = oldElevation;
      var parent = parent || null;
      var modifiedElevations = this._modifiedElevations[parent];
      newElevations = modifiedElevations ? modifiedElevations[oldElevation] : null;
      if (newElevations) {
        // A 'stacked elevation' exists.
        if (newElevations.length === 1) {
          result = newElevations[0].newElevation;
        } else {
          // There are several siblings which had the given top elevation before projection.
          // Find the sibling which was below this entity by finding the closest centroid to the
          // given centroid.
          var centroidVertex = centroid.toVertex();
          var minId = 0;
          var minValue = centroidVertex.distanceSquared(newElevations[minId].centroid.toVertex());
          for (var i = 1; i < newElevations.length; i++) {
            var temp = centroidVertex.distanceSquared(newElevations[i].centroid.toVertex());
            if (temp < minValue) {
              minId = i;
              minValue = temp;
            }
          }
          result = newElevations[minId].newElevation;
        }
      }
      return result;
    },

    /**
     * When an entity's height is modified, a map of the old top elevation to the new
     * top elevation is created; so any entity that is stacked on top can be moved
     * appropriately. Only sibling entities sharing the same parent are stacked. Entities without a
     * parent are considered siblings.
     * @param {atlas.model.GeoEntity} entity - The entity being modified.
     * @param {Number} oldElevation - The old elevation of the top of the Entity.
     * @param {Number} newElevation - The new elevation of the top of the Entity.
     * @private
     */
    _setModifiedElevation: function(entity, oldElevation, newElevation) {
      var parent = entity.getParent() || null;
      if (!this._modifiedElevations[parent]) {
        this._modifiedElevations[parent] = {};
      }
      if (!this._modifiedElevations[parent][oldElevation]) {
        this._modifiedElevations[parent][oldElevation] = [];
      }
      this._modifiedElevations[parent][oldElevation]
          .push({centroid: entity.getCentroid(), newElevation: newElevation});
    },

    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} attributes - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender: function(entity, attributes) {
      var id = entity.getId();
      var oldValue = this._getEffect(id, 'oldValue');
      if (oldValue) {
        entity.setElevation(oldValue.elevation);
        entity.setHeight(oldValue.height);
      } else {
        Log.warn('Cannot unrender height and elevation - oldValue not defined', oldValue);
      }
    },

    _regressProjectionValueFromCodomain: function(attributes, codomain) {
      // Check if this is a continuous or discrete projection to set the regression factor.
      // Check if the codomain has been binned and select the correct one.
      if (codomain instanceof Array) {
        codomain = codomain[attributes.binId];
      }
      // TODO(bpstudds): Allow for more projection types then continuous and discrete?
      var regressionFactor = this._type === 'continuous' ?
          attributes.absRatio : (attributes.binId / attributes.numBins);
      if ('fixedProj' in codomain) {
        return codomain.fixedProj;
      } else if ('startProj' in codomain && 'endProj' in codomain) {
        return AtlasMath.lerp(codomain.startProj, codomain.endProj,
            Setter.range(regressionFactor, 0, 1));
      } else {
        throw new DeveloperError('Unsupported codomain supplied.');
      }
    }
  });
});
