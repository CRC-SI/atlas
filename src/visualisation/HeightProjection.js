define([
  'atlas/lib/utility/Log',
  // Base class
  'atlas/visualisation/AbstractProjection',
  'atlas/util/DeveloperError'
], function(Log, AbstractProjection, DeveloperError) {

  /**
   * @classdesc The HeightProjection represents a projection of Entity parameter values onto
   * the Entity's height.
   * @class atlas.visualisation.HeightProjection
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.HeightProjection.prototype */ {
    ARTIFACT: 'height',

    DEFAULT_CODOMAIN: {startProj: 50, endProj: 100},

    getCurrentState: function () {
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
      var oldHeight = entity.getHeight(),
          oldElevation = entity.getElevation(),
      // TODO(bpstudds): Handle the case where an entity sits on two entities.
      // TODO(bpstudds): Handle the case where there's a hierarchy of 'parents'
          newElevation = this._getModifiedElevation(oldElevation, entity.getCentroid(),
              entity.parent),
          newHeight = this._regressProjectionValueFromCodomain(attributes,
              this._configuration.codomain);
      this._setEffects(entity.getId(), {
        oldValue: {height: oldHeight, elevation: oldElevation},
        newValue: {height: newHeight, elevation: newElevation}
      });
      // Update the mapping of old building top to new building top elevation.
      this._setModifiedElevation(entity, oldElevation + oldHeight, newElevation + newHeight);
      entity.setElevation(newElevation);
      entity.setHeight(newHeight);
      entity.isVisible() && entity.show();
    },

    /**
     * Gets the modified top elevation of an entity so an entity sitting on top
     * of it get be moved appropriately so it stacks on top of it.
     * @param {Number} oldElevation - The bottom elevation of the Entity to be moved.
     * @param {atlas.model.GeoPoint} centroid - The centroid of the entity.
     * @param {atlas.model.GeoEntity} parent - The ID of the parent of the entity being moved.
     * @private
     */
    _getModifiedElevation: function(oldElevation, centroid, parent) {
      var newElevations,
          result = oldElevation,
          modifiedElevations = this._modifiedElevations[parent];

      newElevations = modifiedElevations ? modifiedElevations[oldElevation] : null;
      if (newElevations) {
        // A 'stacked elevation' exists.
        if (newElevations.length === 1) {
          result = newElevations[0].newElevation;
        } else {
          var centroidVertex = centroid.toVertex();
          // Find the elevation with the closest centroid.
          var minId = 0,
              minValue = centroidVertex.distanceSquared(newElevations[minId].centroid.toVertex());
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
     * top elevation is created; so any entity that is stacked ontop can be moved
     * appropriately.
     * @param {atlas.model.GeoEntity} entity - The entity being modified.
     * @param {Number} oldElevation - The old elevation of the top of the Entity.
     * @param {Number} newElevation - The new elevation of the top of the Entity.
     * @private
     */
    _setModifiedElevation: function(entity, oldElevation, newElevation) {
      var parent = entity.parent || null;

      if (!this._modifiedElevations[parent]) {
        this._modifiedElevations = {};
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
      var id = entity.getId(),
          oldValue = this._getEffect(id, 'oldValue');
      if (oldValue) {
        entity.setElevation(oldValue.elevation);
        entity.setHeight(oldValue.height);
        entity.isVisible() && entity.show();
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
          attributes.absRatio : attributes.binId / attributes.numBins;
      if ('fixedProj' in codomain) {
        return codomain.fixedProj;
      } else if ('startProj' in codomain && 'endProj' in codomain) {
        return codomain.startProj + regressionFactor * (codomain.endProj - codomain.startProj);
      }
      throw new DeveloperError('Unsupported codomain supplied.');
    }
  });
});
