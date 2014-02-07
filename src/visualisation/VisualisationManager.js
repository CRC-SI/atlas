define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/model/Colour',
  'atlas/visualisation/AbstractProjection',
  'atlas/visualisation/ColourProjection',
  'atlas/visualisation/HeightProjection'
], function (Class, DeveloperError, Colour, AbstractProjection, ColourProjection, HeightProjection) {

  /**
   * @classdesc The VisualisationManager is responsible for tracking, applying
   * and removing Projections.
   * @param {Object.<String, Object>} atlasManagers - A map of Atlas manager names to
   *      the current instance of that manager.
   * @class atlas.visualisation.VisualisationManager
   */
  //var VisualisationManager = function (atlasManagers) {
  var VisualisationManager = Class.extend( /** @lends atlas.visualisation.VisualisationManager# */{

    // TODO(bpstudds): Refactor this class to 'GeoChartFactory'? or 'ProjectionFactory'?
    _atlasManagers: null,

    /**
     * The defined projections currently affecting Atlas.
     * @type {Object.<String, atlas.visualisation.AbstractProjection>}
     * @private
     */
    _projections: null,

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.visualisation = this;
      this._projections = {};
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Adds a Projection to be managed by the VisualisationManager. Only one projection can be active
     * per artifact. If a Projection that is bound to an artifact that is already in use, the old
     * Projection is unrendered and removed.
     * @param {atlas.visualisation.AbstractProjection} projection - The New Projection instance to add.
     * @returns {atlas.visualisation.AbstractProjection|undefined} The existing Projection bound
     *    to same artifact as the new Projection, if it exists.
     */
    add: function (projection) {
      if (!(projection instanceof AbstractProjection)) {
        throw new DeveloperError('Tried to add an object to the VisualisationManager which is not a subclass of atlas.visualisation.AbstractProjection');
      }
      var target = projection.ARTIFACT,
          old = this._projections[projection.ARTIFACT],
          ret;
      if (old !== undefined) {
        console.debug('Overriding projection on', target, 'with new projection.');
        old.unrender();
        ret = old;
      }
      this._projections[target] = projection;
      return ret;
    },

    /**
     * Removes the projection affecting the given artifact.
     * @param {String} artifact - The artifact of the projection object to be removed.
     * @returns {atlas.visualisation.AbstractProjection|null} The Projection removed, or null
     *    if a projection does not existing for the given artifact.
     */
    remove: function (artifact) {
      var removedProjection = this._projections[artifact];
      if (removedProjection) {
        removedProjection.unrender();
        this._projections[artifact] = null;
      }
      return removedProjection;
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Renders the effects of the Projection currently Affect the given artifact.
     * @param {Object} artifact - The artifact to render.
     */
    render: function (artifact) {
      // TODO(bpstudds): Add function to render all currently managed Projections.
      // TODO(bpstudds): Add support for rendering a subset of entities.
      if (!this._projections[artifact]) {
        throw new DeveloperError('Tried to render projection', artifact, 'without adding a projection object.');
      } else {
        this._projections[artifact].render();
      }
    },

    /**
     * Unrenders the effects of the Projection currently affecting the given artifact.
     * @param {Object} artifact - The artifact to unrender.
     */
    unrender: function (artifact) {
      // TODO(bpstudds): Add function to unrender all currently managed Projections.
      // TODO(bpstudds): Add support for un-rendering a subset of entities.
      if (!this._projections[artifact]) {
        throw new DeveloperError('Tried to unrender projection', artifact, 'without adding a projection object.');
      } else {
        this._projections[artifact].unrender();
      }
    },

    _testHeight: function (valueMap) {
      var ids = Object.keys(valueMap),
          entities = this._atlasManagers.entity.getByIds(ids),
          codomain = {startProj: Math.random() * 20, endProj: 20 + Math.random() * 300},
          heightProj = new HeightProjection({type: 'continuous', codomain: codomain, values: valueMap, entities: entities});
      this.add(heightProj);
      heightProj.render();
    },

    _testColour: function (valueMap) {
      var ids = Object.keys(valueMap),
          entities = this._atlasManagers.entity.getByIds(ids),
          codomain = {startProj: Colour.BLUE, endProj: Colour.RED},
          colourProj = new ColourProjection({type: 'continuous', codomain: codomain, values: valueMap, entities: entities});
      this.add(colourProj);
      colourProj.render();
    }
  });
  return VisualisationManager;
});
