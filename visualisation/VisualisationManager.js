define([
  'atlas/visualisation/AbstractProjection',
  'atlas/util/DeveloperError'
], function (Projection, DeveloperError) {

  /**
   * Constructs a new VisualisationManager
   * @param {Object.<String, Object>} atlasManagers - A map of Atlas manager names to
   *      the current instance of that manager.
   *
   * @alias atlas.visualisation.VisualisationManager
   * @constructor
   */
  var VisualisationManager = function (atlasManagers) {
    // TODO(bpstudds): Refactor this class to 'GeoChartFactory'? or 'ProjectionFactory'?
    this._atlasManagers = atlasManagers;

    /**
     * The defined projections currently affecting Atlas.
     * @type {Object.<String, atlas.visualisation.AbstractProjection>}
     * @private
     */
    this._projections = {};
  };

  VisualisationManager.SUPPORTED_ARTIFACTS = ['height'];
  VisualisationManager.SUPPORTED_PROJECTIONS = ['continuous'];

  /**
   * Takes a given artifact mapping, generates a projection and applies it to currently
   * rendered entities.
   * @param {Object} args - An object describing the projection.
   * @param {String} args.artifact - The artifact to project onto, currently only 'height' supported.
   * @param {String} args.type - The type of projection, currently only 'continuous' supported.
   * @param {Object.<String, Number>} args.values - A map of Entity ID to the value to be projected for the Entity.
   * @param {Object} [args.options] - Options to configure the exact behaviour of the projection.
   * @returns {atlas.visualisation.AbstractProjection|undefined} The Projection object, required to remove the Projection.
   */
  VisualisationManager.prototype.addProjection = function (args) {
//    if (!args.artifact || !(args.artifact in this._artifactRenderers)) {
//      throw new DeveloperError('Artifact', args.artifact, 'is not supported.');
//    }
//    if (!args.type || VisualisationManager.SUPPORTED_PROJECTIONS.indexOf(args.type) === -1) {
//      throw new DeveloperError('Projection type', args.type, 'is not supported.');
//    }
//
//    // Remove any projection already on this artifact.
//    if (args.artifact in this._projections) {
//      this.removeProjection(this._projections[args.artifact]);
//    }
//    var projection = {};
//    projection.artifact = args.artifact;
//    projection.type = args.type;
//    projection.options = {};
//    projection.effects = {};
//    var datas = this._calculateProjectedValues(args);
//    projection.stats = datas.stats;
//    projection.values = datas.values;
//    this._projections[projection.artifact] = projection;
//    this._renderProjection(projection);
//
//    return projection;
    // TODO(bpstudds): Allow the creation of Projections, need to finish HeightProjection first.
    // TODO(bpstudds): The VisMan should inject the actual entity object into values when constructing the Projection.
  };

  /**
   * Removes the effects of the given projection.
   * @param {String} artifact - The artifact of the projection object to be removed.
   */
  VisualisationManager.prototype.removeProjection = function (artifact) {
    if (artifact in this._projections) {
      var theProjection = this._projections[artifact];
      theProjection && theProjection.unrender();
      this._projections[artifact] = null;
    }
  };

  /**
   * Renders the effects of the given projection.
   * @param {Object} projection - The projection to render.
   * @private
   */
  VisualisationManager.prototype._renderProjection = function (projection) {
    // TODO(bpstudds): Refactor to render _all_ current projections.
    var ids = Object.keys(projection.values);
    ids.forEach(function (id) {
      this._artifactRenderers[projection.artifact]
          .render.bind(this)(id, projection.values[id], projection);
    }, this);
  };

  /**
   * Unrenders the effects of the given projection.
   * @param {Object} projection - The projection to unrender
   * @private
   */
  VisualisationManager.prototype._unrenderProjection = function (projection) {
    // TODO(bpstudds): Refactor to unrender _all_ current projections.
    var ids = Object.keys(projection.values);
    ids.forEach(function (id) {
      this._artifactRenderers[projection.artifact].unrender.bind(this)(id);
    }, this);
  };

  return VisualisationManager;
});
