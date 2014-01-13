define([
  'atlas/util/Class'
], function (Class) {

  /**
   * @classDesc Describes the interface and generic methods for a Projection. A Projection
   * is used project the value of an Entity's parameter onto some renderable artifact.
   * @abstract
   * @class atlas.visualisation.AbstractProjection
   */
  var AbstractProjection = Class.extend(/** @lends atlas.visualisation.AbstractProjection.prototype */ {

    /**
     * The type of artifact being projected onto.
     */
    artifact: '',

    /**
     * The type of the projection, currently only 'continuous' is supported.
     * @type {String}
     */
    type: '',

    /**
     * A map of Entity ID to its parameter value to be projected.
     * @type {Object.<String, Number>}
     */
    values: {},

    /**
     * A map of Entity ID to the effect the projection has.
     * @type {Object.<String, Object>}
     * @property {Number} oldVal - The value of an Entity's artifact before this projection was applied.
     * @property {Number} newVal - The value of an Entity's artifact after this projection was applied.
     */
    effects: {},

    /**
     * Contains calculated statistical data for the set of
     * {@link atlas.visualisation.AbstractProjection#values|values} governing the projection.
     * @property {Number} min - The minimum value.
     * @property {Number} max - The maximum value.
     * @property {Number} sum - The sum of all values.
     * @property {Number} ave - The average of all values.
     */
    stats: {
      min: 0,
      max: 0,
      sum: 0,
      ave: 0
    },

    /**
     * Contains options configuring the behaviour of the Projection.
     * @type {Object}
     */
    options: {},

    /**
     * Constructs a new AbstractProjection
     * @ignore
     */
    _init: function () {
      this._super();
    },

    /**#@+
     * @memberOf atlas.visualisation.AbstractProjection
     */

    /**
     * Calculates the statistical properties for the set of parameter values of this Projection.
     * The statistical properties calculated depend on the
     * {@link atlas.visualisation.AbstractProjection#type|type} of the projection.
     * @returns {ContinuousStats|DiscreteStats}
     */
    _calculateValuesStatistics: function () {
      // TODO(bpstudds): Fill in this function (Copy/refactor from VisualisationManager).
    },

    /**
     * Calculates the projection parameters for each Entity's value in the Projection. The exact
     * parameters calculated depend on the {@link atlas.visualisation.AbstractProjection#type|type}
     * of the projection.
     * @returns {ContinousParams|DiscreteParams}
     */
    _calculateProjectionParameters: function () {
      // TODO(bpstudds): Fill in the function (Copy/refactor from VisualisationManager).
    }

  });

  return AbstractProjection;
});
