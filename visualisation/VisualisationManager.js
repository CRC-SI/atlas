define([
], function () {

  /**
   * Constructs a new VisualisationManager
   * @param atlasManagers
   * @constructor
   */
  var VisualisationManager = function (atlasManagers) {
    this._projections = {};
    this._effectedEntities = {};
  };

  VisualisationManager.SUPPORTED_ARTIFACTS = Object.keys[VisualisationManager.artifactRenderers];
  VisualisationManager.SUPPORTED_PROJECTIONS = ['continuous'];

  /**
   * Takes a given artifact mapping, generates a projection and applies it to currently
   * rendered entities.
   * @param {Object} artifactMapping - An object describing the artifact and projection.
   */
  VisualisationManager.prototype.addProjection = function (artifactMapping) {
    if (!(artifactMapping.artifact in VisualisationManager.SUPPORTED_ARTIFACTS)) { return; }

    // Remove any projection already on this artifact.
    if (artifactMapping.artifact in this._projections) {
      this.removeProjection(this._projections[artifactMapping.artifact]);
    }
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
