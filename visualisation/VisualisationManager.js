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

  VisualisationManager.SUPPORTED_ARTIFACTS = ['height'];
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


  return VisualisationManager;
});
