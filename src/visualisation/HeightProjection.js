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
        // And it's children.
        this._entities[id].getChildren().forEach(function (child) {
          state[child.getId()] = {
            height: child.getHeight(),
            elevation: child.getElevation()
          }
        })
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
      var sortedIds = Object.keys(this._entities).sort(function (a, b) {
        return this._entities[a].getElevation() - this._entities[b].getElevation();
      }.bind(this));

      sortedIds.forEach(function(id) {
        var entity = this._entities[id];
        this._render(entity, this._attributes[id]);
      }, this);
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
          newHeight = this._regressProjectionValueFromCodomain(attributes, this._configuration.codomain),
          heightDelta = newHeight - oldHeight;
      entity.setHeight(newHeight);
      entity.isVisible() && entity.show();
      entity.getChildren().forEach(function (child) {
        var elevation = child.getElevation();
        child.setElevation(elevation + heightDelta);
        child.isVisible() && child.show();
      });
      this._effects[entity.getId()] = {
        'oldValue': {height: oldHeight, elevation: oldElevation},
        'newValue': {height: newHeight, elevation: oldElevation}
      };
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
