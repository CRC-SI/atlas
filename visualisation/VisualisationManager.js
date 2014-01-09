define([
], function () {
  /**
   * An object describing a projection.
   * @typedef {Object} Projection
   * @property {String} artifact - The artifact to project onto, currently only 'height' supported.
   * @property {String} projection - The type of projection, currently only 'continuous' supported.
   * @property {Object.<String, Number>} values - A map of Entity ID to the values to be projected for the Entity.
   * @property {Object.<String, Object>} effects - A map of Entity ID to the effect the projection has.
   * @property {Object.<String, Object>} effects.oldVal - The value of an Entity's artifact before the projection was applied.
   * @property {Object.<String, Object>} effects.newVal - The value of an Entity's artifact after the projection was applied.
   * @property {Object} stats - Statistical data of the values.
   * @property {Number} stats.min - The minimum value.
   * @property {Number} stats.max - The maximum value.
   * @property {Number} stats.sum - The sum of all values.
   * @property {Number} stats.average - The average of the values.
   * @property {Object} options - Options to configure the exact behaviour of the projection.
   */

  /**
   * Constructs a new VisualisationManager
   * @param atlasManagers
   * @constructor
   */
  var VisualisationManager = function (atlasManagers) {
    this._atlasManagers = atlasManagers;

    /**
     * The defined projections currently effecting Atlas.
     * @type {Object.<String, Projection>}
     * @private
     */
    this._projections = {};
    this._effectedEntities = {};
  };

  VisualisationManager.SUPPORTED_ARTIFACTS = Object.keys[VisualisationManager.artifactRenderers];
  VisualisationManager.SUPPORTED_PROJECTIONS = ['continuous'];

  /**
   * Takes a given artifact mapping, generates a projection and applies it to currently
   * rendered entities.
   * @param {Object} args - An object describing the projection.
   * @param {String} args.artifact - The artifact to project onto, currently only 'height' supported.
   * @param {String} args.type - The type of projection, currently only 'continuous' supported.
   * @param {Object.<String, Number>} args.values - A map of Entity ID to the value to be projected for the Entity.
   * @param {Object} [args.options] - Options to configure the exact behaviour of the projection.
   * @returns {Projection|undefined} The Projection object, required to remove the Projection.
   */
  VisualisationManager.prototype.addProjection = function (args) {
    if (!(args.artifact in this._artifactRenderers)) { return undefined; }
    // TODO(bpstudds): Get the check for projection type working.
    //if (VisualisationManager.SUPPORTED_PROJECTIONS.indexOf(args.type) != -1) { return; }

    // Remove any projection already on this artifact.
    if (args.artifact in this._projections) {
      this.removeProjection(this._projections[args.artifact]);
    }
    var projection = {};
    projection.artifact = args.artifact;
    projection.type = args.type;
    projection.options = {};
    projection.effects = {};
    var datas = this._calculateProjectedValues(args);
    projection.stats = datas.stats;
    projection.values = datas.values;
    this._projections[projection.artifact] = projection;
    this._renderProjection(projection);

    return projection;
  };

  /**
   * Removes the artifacts of the given projection.
   * @param {Object} projection - The projection to remove.
   */
  VisualisationManager.prototype.removeProjection = function (projection) {
    if (projection.artifact in this._projections) {
      if (projection === this._projections[projection.artifact]) {
        this._unrenderProjection(projection);
        delete this._projections[projection.artifact];
      }
    }
  };

  /**
   * Takes the values for a Projection and calculates the statistical properties
   * required for the projection. It then calculates the projected values for
   * each entity.
   * @param {Projection} projection - The projection to calculate projected values for.
   * @returns {Object} The statistical data and the projected values, or null if no values are supplied.
   * @private
   */
  VisualisationManager.prototype._calculateProjectedValues = function (projection) {
    var ids = Object.getOwnPropertyNames(projection.values);
    if (ids.length > 0) {
      var data = {'sum': 0};
      var values = {};
      data.min = { 'id': ids[0], 'value': projection.values[ids[0]] };
      data.max = { 'id': ids[0], 'value': projection.values[ids[0]] };
      data.count = ids.length;
      // Calculate min, max, and sum values.
      ids.forEach(function (id) {
        var thisVal = projection.values[id];
        data.sum += parseInt(thisVal, 10) || 0;
        if (thisVal < data.min.value) { data.min = { 'id': id, 'value': thisVal };}
        if (thisVal > data.max.value) { data.max = { 'id': id, 'value': thisVal };}
      });
      data.average = data.sum / data.count;
      data.valueRange = data.max.value - data.min.value;

      ids.forEach(function (id) {
        var thisVal = projection.values[id];
        var value = {'id': id, 'value': thisVal };
        value.diffFromAverage = thisVal - data.average;
        value.ratioBetweenMinMax = (thisVal - data.min.value) / (data.valueRange);
        value.ratioFromAverage = (thisVal - data.average);
        value.ratioFromAverage /= (value.ratioFromAverage < 0 ?
            (data.average - data.min.value) : (data.max.value - data.average));
        values[id] = value;
      });
      return {'stats': data, 'values': values };
    }
    return null;
    // TODO(bpstudds): Handle non-numeric values.
  };

  /**
   * Renders the effects of the given projection.
   * @param {Object} projection - The projection to render.
   * @private
   */
  VisualisationManager.prototype._renderProjection = function (projection) {};

  /**
   * Unrenders the effects of the given projection.
   * @param {Object} projection - The projection to unrender
   * @private
   */
  VisualisationManager.prototype._unrenderProjection = function (projection) {};

  VisualisationManager.prototype.artifactRenderers = {
    'height': {
      render: function (entityId, newHeight) {
        var entity = this._atlasManagers.entity.getById(entityId);
        if (entity) {
          var oldHeight = entity.setHeight(newHeight);
          this._projections['height'].effects[entityId] = { old: oldHeight, cur: newHeight };
        }
      },
      unrender: function (entityId) {
        var entity = this._atlasManagers.entity.getById(entityId);
        if (entity) {
          var oldHeight = this._projections['height'].effects[entityId].old;
          entity.setHeight(oldHeight);
          delete this._projections['height'].effects[entityId];
        }
      }
    }
  };

  return VisualisationManager;
});
