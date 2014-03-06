define([
  'atlas/util/DeveloperError',
  // Base class
  'atlas/visualisation/AbstractProjection'
], function (DeveloperError, AbstractProjection) {

  /**
   * @classdesc The HeightProjection represents a projection of Entity parameter values onto
   * the Entity's height.
   * @author Brendan Studds
   * @class atlas.visualisation.HeightProjection
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.HeightProjection.prototype */ {
    ARTIFACT: 'height',

    DEFAULT_CODOMAIN: {startProj: 50, endProj: 100},

    /**
     * Returns the state before the Projection has been applied, or if the Projection has not been
     * applied, the current state of the actual render.
     * @returns {Object.<String, Object>}
     */
    getPreviousState: function () {
      // If changes have been made, superclass AbstractProjection can handle getting the previous state.
      if (Object.keys(this._effects).length > 0) { return this._super(); }
      // Other, the HeightProjection needs to return the current state of the actual render.
      var state = {};
      Object.keys(this._entities).forEach(function (id) {
        // Set previous state for this entity
        state[id] = {
          height: this._entities[id].getHeight(),
          elevation: this._entities[id].getElevation()
        };
      }, this);
      return state;
    },

    /**
     * Renders the effects of the Projection on all or a subset of the GeoEntities linked
     * to this projection.
     * @param {String|Array.<String>} [id] - Either a single GeoEntity ID or an array of IDs.
     */
    render: function () {
      this._preRenderState = this.getPreviousState();
      this._modifiedElevations = {};
      var sortedIds = Object.keys(this._entities).sort(function (a, b) {
            return this._entities[a].getElevation() - this._entities[b].getElevation();
          }.bind(this));

      sortedIds.forEach(function (id) {
        var entity = this._entities[id];
        this._render(entity, this._attributes[id]);
      }, this);
      this._rendered = true;
    },

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to render.
     * @param {Object} attributes - The attributes of the parameter value for the given GeoEntity.
     * @private
     */
    _render: function (entity, attributes) {
      var oldHeight = entity.getHeight(),
          oldElevation = entity.getElevation(),
          newElevation = this._getModifiedElevation(oldElevation, entity.getCentroid(), entity.parent),
          newHeight = this._regressProjectionValueFromCodomain(attributes, this._configuration.codomain),
          elevationDelta = newElevation - oldElevation,
          heightDelta = newHeight - oldHeight;
      this._effects[entity.getId()] = {
        'oldValue': {height: oldHeight, elevation: oldElevation},
        'newValue': {height: newHeight, elevation: newElevation}
      };
      // Update the mapping of old building top to new building top elevation.
      this._setModifiedElevation(entity, oldElevation + oldHeight, newElevation + newHeight);
      entity.setElevation(newElevation);
      entity.setHeight(newHeight);
      entity.isVisible() && entity.show();

    },

    /**
     *
     * @param oldElevation
     * @param centroid
     * @private
     */
    _getModifiedElevation: function (oldElevation, centroid, parent) {
      var newElevations,
          parent = parent || 'no-parent',
          returns = oldElevation;

      // TODO(bpstudds): Doesn't necessarily have a parent but still stacked?
      if (this._modifiedElevations[parent] &&
          (newElevations = this._modifiedElevations[parent][oldElevation]) ){
        // A 'stacked elevation' exists.
        if (newElevations.length === 1) {
          returns = newElevations[0].newElevation;
        } else {
          // Find the elevation with the closest centroid.
          var minId = 0,
              minValue = centroid.distanceSquared(newElevations[minId].centroid);
          for (var i = 1; i < newElevations.length; i++) {
            var temp = centroid.distanceSquared(newElevations[i].centroid);
            if (temp < minValue) {
              minId = i;
              minValue = temp;
            }
          }
          returns = newElevations[minId].newElevation;
        }
      }
      return returns;
    },

    _setModifiedElevation: function (entity, oldElevation, newElevation) {
      var parent = entity.parent || 'no-parent';

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

    unrender: function (entity, attributes) {
      this.setPreviousState(this._preRenderState);
      this._super(entity, attributes);
    },

    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} attributes - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender: function (entity, attributes) {
      var id = entity.getId();
      var oldHeight = this._effects[id].oldValue.height,
          oldElevation = this._effects[id].oldValue.elevation;
      entity.setElevation(oldElevation);
      entity.setHeight(oldHeight);
      entity.isVisible() && entity.show();
      delete this._effects[id];
    },

    _regressProjectionValueFromCodomain: function (attributes, codomain) {
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
        return codomain.startProj + regressionFactor * codomain.endProj;
      }
      throw new DeveloperError('Unsupported codomain supplied.');
    }
  });
});
