define([
  'atlas/lib/utility/Type',
  'atlas/model/Style',
  'atlas/model/Colour',
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/NumberFormatter',
  'atlas/util/mixin'
], function(Type, Style, Colour, Class, DeveloperError, NumberFormatter, mixin) {

  /**
   * @typedef atlas.visualisation.AbstractProjection
   * @ignore
   */
  var AbstractProjection;

  /**
   * Constructs a new AbstractProjection object.
   * @classDesc Describes the interface and generic methods for a Projection. A Projection
   * is used project the value of an Entity's parameter onto some renderable artifact.
   * @class atlas.visualisation.AbstractProjection
   * @param {Object} args - Arguments to construct the AbstractProjection
   * @param {string} [args.id] - An ID for the Projection. If one isn't provided, one will be generated.
   * @param {String} args.type - The type of projection, either 'discrete' or 'continuous'.
   * @param {String} args.title - The title of the Projection, used to generate the legend.
   * @param {String} args.caption - The caption of the projection, used to generate the legend.
   * @param {Object.<String, atlas.model.GeoEntity>} args.entities - A map of GeoEntity ID to GeoEntity instances that are affected by the projection.
   * @param {Object.<String, Number>} args.values - A map of GeoEntity ID to parameter value to be projected.
   * @param {Object} [args.configuration] - Optional configuration of the projection.
   */
  AbstractProjection = Class.extend(/** @lends atlas.visualisation.AbstractProjection# */ {

    /**
     * The type of artifact being projected onto.
     * @type {String}
     * @constant
     */
    ARTIFACT: null,

    /**
     * The types of projections supported by the Projection.
     * @type {Array.<String>}
     * @constant
     */
    SUPPORTED_PROJECTIONS: {'continuous': true, 'discrete': true},

    /**
     * The ID of the Projection. Can be automatically generated or passed in.
     * @type {string}
     * @protected
     */
    _id: null,

    /**
     * The title of the Projection. This is displayed on the Projection's legend.
     * @type {String}
     * @protected
     */
    _title: null,

    /**
     * The caption of the Projection. This is displayed on the Projection's legend.
     * @type {String}
     * @protected
     */
    _caption: null,

    /**
     * The type of the projection, currently only 'continuous' is supported.
     * @type {String}
     * @protected
     */
    _type: null,

    /**
     * Whether the Projection is currently being rendered.
     * @type {Boolean}
     */
    _rendered: false,

    /**
     * A map of GeoEntity ID to GeoEntity instance affected by the Projection. It is
     * assumed that every ID that appears in <code>_entities</code> appears in <code>_values</code>
     */
    _entities: null,

    /**
     * A map of Entity ID to its parameter value to be projected. It is
     * assumed that every ID that appears in <code>_values</code> appears in <code>_entities</code>
     * @type {Object.<String, Number>}
     * @protected
     */
    _values: null,

    /**
     * A map of Entity ID to the effect the projection has. It is assumed that every ID that appears
     * in {@link #_effects} appears in {@link #_entities}.
     * @type {Object.<String, atlas.visualisation.Effects>}
     * @protected
     */
    _effects: null,

    /**
     * An array of object describing the bins utilised in the Projection. The array of bin objects
     * must be sorted in ascending order, so a bin's <code>firstValue</code> is not smaller than
     * the previous' <code>lastValue</code>.
     * @type {Array.<Object>}
     * @property {Number} binId - The ID of a particular bin. Equivalent to the bin's index in the <code>_bins</code> array.
     * @property {Number|String} firstValue - The first value accepted by this bin, or 'smallest' if there is no lower bound.
     * @property {Number|String} lastValue - The last value accepted by this bin, or 'largest' if there is no upper bound.
     */
    _bins: null,

    /**
     * Contains calculated statistical data for the set of
     * {@link atlas.visualisation.AbstractProjection#values|values} governing the projection.
     * @property {Number} min - The minimum value.
     * @property {Number} max - The maximum value.
     * @property {Number} sum - The sum of all values.
     * @property {Number} ave - The average of all values.
     * @protected
     */
    _stats: null,

    /**
     * Contains a map of Entity ID to parameters required for the projection.
     * @protected
     */
    _attributes: null,

    /**
     * Contains options configuring the behaviour of the Projection.
     * @type {Object}
     * @protected
     */
    _configuration: null,

    /**
     * Used to format values (e.g. in legends).
     * @type {atlas.util.NumberFormatter}.
     */
    _formatter: null,

    /**
     * The number of bins to use by default for projections.
     * @type {Number}
     * @constant
     */
    DEFAULT_BINS: 1,

    /**
     * The default codomain to apply to the projection.
     * @abstract
     */
    DEFAULT_CODOMAIN: null,

    /**
     * Constructs a new AbstractProjection
     * @see {@link atlas.visualisation.AbstractProjection}
     * @ignore
     */
    _init: function(args) {
      args = mixin({
        title: '',
        caption: '',
        type: 'continuous',
        values: {},
        bins: 1,
        codomain: this.DEFAULT_CODOMAIN
      }, args);
      if (!args.entities) {
        throw new DeveloperError('Can not construct Projection without entities');
      }
      if (!this.SUPPORTED_PROJECTIONS[args.type]) {
        throw new DeveloperError('Tried to instantiate Projection with unsupported type',
            args.type);
      }

      this._id = args.id || AbstractProjection._generateNextId();
      this._title = args.title;
      this._caption = args.caption;
      this._type = args.type;
      this._entities = args.entities;
      this._initEffects();
      this._values = args.values;
      this._configuration = {
        bins: args.bins,
        codomain: args.codomain
      };
      this._formatter = new NumberFormatter();

      this._stats = this._calculateBinnedStatistics();
      // TODO(bpstudds): Do we need to calculate this for a discrete projection?
      this._attributes = this._calculateValueAttributes();
    },

    // -------------------------------------------
    // RENDERING
    // -------------------------------------------

    /**
     * Renders the effects of the Projection on all or a subset of the GeoEntities linked
     * to this projection.
     * @param {String|Array.<String>} [id] - Either a single GeoEntity ID or an array of IDs.
     */
    render: function(id) {
      this._mapToEntitiesById(this._render, id);
      this._rendered = true;
    },

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to render.
     * @param {Object} attributes - The attributes of the parameter value for the given GeoEntity.
     * @protected
     * @abstract
     */
    _render: function(entity, attributes) {
      throw new DeveloperError('Tried to call abstract method "_render" of AbstractProjection.');
    },

    /**
     * Renders the effects of the Projection on all or a subset of the GeoEntities linked
     * to this projection.
     * @param {String|Array.<String>} [id] - Either a single GeoEntity ID or an array of IDs.
     */
    unrender: function(id) {
      this._mapToEntitiesById(this._unrender, id);
      this._rendered = false;
    },

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} attributes - The attributes of the parameter value for the given GeoEntity.
     * @protected
     * @abstract
     */
    _unrender: function(entity, attributes) {
      throw new DeveloperError('Tried to call abstract method "_unrender" of AbstractProjection.');
    },

    /**
     * Process all (or a subset) of GeoEntities and applies a given function to them.
     * @param {atlas.visualisation.AbstractProjection~UpdateEntityCb} f - The function to apply to the GeoEntities.
     * @param {String|Array.<String>} [id] - Either a single GeoEntity ID, an array of IDs, or nothing.
     * @private
     */
    _mapToEntitiesById: function(f, id) {
      var ids = this._constructIdList(id);
      // Process each entity for the win.
      ids.forEach(function(id) {
        var theEntity = this._entities[id];
        var theAttributes = this._attributes[id];
        if (theEntity) {
          if (theAttributes) {
            f.call(this, theEntity, theAttributes);
          } else {
            if (this._rendered) {
              this._disableEntity(id);
            } else if (this._getEffect(id, 'disabled')) {
              this._enableEntity(id);
            }
          }
        }
      }, this);
    },

    /**
     * Disables the given entity by distinguishing it from projected entities.
     * @param {atlas.model.GeoEntity} id
     * @private
     */
    _disableEntity: function(id) {
      this._setEffect(id, 'disabled', true);
      var entity = this._entities[id],
          disabledStyle = new Style({fillColour: Colour.GREY, borderColour: Colour.GREY,
            borderWidth: 1}),
          prevStyle = entity.setStyle(disabledStyle);
      entity.show();
      this._setEffect(id, 'prevStyle', prevStyle);
    },

    /**
     * Enables the given entity by reversing the effects caused by {@link #_disableEntity}.
     * @param {atlas.model.GeoEntity} id
     * @private
     */
    _enableEntity: function(id) {
      this._removeEffect(id, 'disabled');
      var prevStyle = this._getEffect(id, 'prevStyle'),
          entity = this._entities[id];
      entity.setStyle(prevStyle);
      entity.show();
      this._removeEffect(id, 'prevStyle');
    },

    /**
     * @name atlas.visualisation.AbstractProjection~UpdateEntityCb
     * @function
     * @param {atlas.model.GeoEntity} entity - The GeoEntity being updated.
     * @param {Object} params - Data required to update the GeoEntity.
     */

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Updates the projection with a new set of values and configuration data.
     * @param {Object} args - The data to update the projection with.
     * @param {Object.<String, Number>} [args.values] - Updated or new values to project.
     * @param {Boolean} [args.addToExisting=false] - If true, existing data is updated. If false,
     *      any existing data related to the updated data is deleted
     */
    update: function(args) {
      args.addToExisting = args.addToExisting === undefined ? false : args.addToExisting;
      if (args.values) {
        this._values = args.addToExisting ? mixin(this._values, args.values) : args.values;
        // TODO(bpstudds): Allow for updating a subset of parameters.
        delete this._stats;
        delete this._attributes;
        if (this._legend) {
          this._legend = null;
        }
        // TODO(bpstudds): Allow for updating a subset of parameters.
        this._attributes = this._calculateValueAttributes();
      }
    },

    /**
     * Generates the configuration of the Projection's <code>bins</code>
     * @returns {Array.<Object>} An array of bin objects. The bin object contains parameters
     * of the bin, and an <code>accept(value)</code> function that returns <code>0</code> if
     * <code>value</code> fits in the bin, and <code>-1</code>/<code>1</code> if the value is
     * too small or too large respectively.
     * @protected
     */
    _configureBins: function() {
      var binConf = this._configuration.bins,
          bins = [];
      if (!binConf || typeof binConf === 'number') {
        // Create bins by splitting up the range of input parameter values into equal divisions.
        var numBins = binConf || 1,
            populationStats = this._calculatePopulationStatistics();
        bins = this._configureEqualSizedBins(numBins, populationStats.min.value,
            populationStats.max.value, true);
      } else if (binConf instanceof Array) {
        bins = this._configureBinsFromArray(binConf);
      } else if (binConf.numBins && binConf.firstValue !== undefined &&
          binConf.lastValue !== undefined) {
        bins = this._configureEqualSizedBins(binConf.numBins, binConf.firstValue, binConf.lastValue,
            true);
      }
      return bins;
    },

    /**
     * Constructs an array of objects describing the bins, with each bin accept a equal
     * range of values, depending on the total range specified (except for the largest bin
     * which can potential except values up to infinity).
     * @param {Number} numBins - The number of bins to construct.
     * @param {Number} firstValue - The first value accepted into the 'smallest' bin.
     * @param {Number} lastValue - The last value accepted into the 'largest' bin.
     * @param {Number} acceptFinal - Whether the 'largest' bin should the value <code>lastValue</code>
     * @returns {Array.<Object>} The array of bin objects.
     * @private
     */
    _configureEqualSizedBins: function(numBins, firstValue, lastValue, acceptFinal) {
      var bins = [],
          binFirst = firstValue,
          binStep = (lastValue - firstValue) / numBins;
      for (var i = 0; i < numBins; i++, binFirst += binStep) {
        bins.push({
          binId: i,
          numBins: numBins,
          firstValue: binFirst,
          lastValue: binFirst + binStep,
          range: binStep,
          accept: function(value) {
            if (this.firstValue <= value) {
              if (value < this.lastValue) {
                return 0;
              } else {
                return 1;
              }
            } else {
              return -1
            }
          }
        });
      }
      // Set the top bin to be unbounded to ensure the largest value is picked up.
      if (acceptFinal) {
        bins[numBins - 1].accept = function(value) {
          if (this.firstValue <= value) {
            if (value <= this.lastValue) {
              return 0;
            } else {
              return 1;
            }
          } else {
            return -1
          }
        };
      }
      return bins;
    },

    /**
     * Constructs an array of objects describing the bins using configurable data for
     * each bin.
     * @param binArray
     * @returns {Array}
     * @private
     */
    _configureBinsFromArray: function(binArray) {
      var bins = [],
          previousLastValue = Number.NEGATIVE_INFINITY,
          numBins = binArray.length;
      binArray.forEach(function(bin, i) {
        if (bin.firstValue === undefined || bin.firstValue === 'smallest') {
          bin.firstValue = Number.NEGATIVE_INFINITY;
        }
        if (bin.lastValue === undefined || bin.lastValue === 'largest') {
          bin.lastValue = Number.POSITIVE_INFINITY;
        }
        if (bin.firstValue < previousLastValue || bin.lastValue < bin.firstValue) {
          throw new DeveloperError('Incorrect bins configuration provided',
              this._configuration.bins);
        }
        bins.push({binId: i, numBins: numBins, firstValue: bin.firstValue,
          lastValue: bin.lastValue, range: (bin.lastValue - bin.firstValue),
          accept: function(x) {
            if (x < this.firstValue) {
              return -1;
            }
            if (x >= this.lastValue) {
              return 1;
            }
            return 0;
          }
        });
        previousLastValue = bin.lastValue;
      }, this);
      return bins;
    },

    /**
     * Calculates the statistical properties for all parameter values, segregating each value into
     * a bin as per the {@link atlas.visualisation.AbstractProjection#_bins|bins} configuration.
     * @returns {Array.<Object>}
     * @protected
     */
    _calculateBinnedStatistics: function() {
      this._bins = this._configureBins();
      var theStats = [],
          sortedValues = [];
      // Sort all of the projections parameter values.
      Object.keys(this._values).forEach(function(id) {
        sortedValues.push({id: id, value: this._values[id]});
      }, this);
      sortedValues.sort(function(a, b) {
        return a.value - b.value;
      });
      // Declare for value loop counter outside _bins.forEach as each bin should process values
      // where the previous one left off.
      var i = 0;
      this._bins.forEach(function(bin) {
        var binStats = {
          entityIds: [],
          count: 0,
          sum: 0,
          // This primes the min/max search below. If no values fit into the bin, min/max will be incorrect.
          min: {id: null, value: bin.lastValue},
          max: {id: null, value: bin.firstValue}
        };
        for (i; i < sortedValues.length; i++) {
          var thisId = sortedValues[i].id,
              thisValue = parseFloat(sortedValues[i].value) || 0;
          // Check value is still within the current bin.
          var inBin = bin.accept(thisValue);
          if (inBin === 1) {
            // thisValue to big for bin, break to next bin
            break;
          } else if (inBin === 0) {
            binStats.entityIds.push(thisId);
            // Calculate statistical properties.
            binStats.count++;
            binStats.sum += thisValue;
            if (thisValue < binStats.min.value) {
              binStats.min = { 'id': thisId, 'value': thisValue };
            }
            if (thisValue > binStats.max.value) {
              binStats.max = { 'id': thisId, 'value': thisValue };
            }
          } // else value to small for this bin, try next value.

          //if (thisValue < bin.firstValue) { continue; }
          //if (thisValue >= bin.lastValue) { break; }
        }
        // Calculate more stats
        binStats.average =
                binStats.count !== 0 ? binStats.sum / binStats.count : Number.POSITIVE_INFINITY;
        binStats.range = binStats.max.value - binStats.min.value;
        // TODO(bpstudds): Is this the most efficient way of doing this?
        theStats.push(mixin(binStats, bin));
      }, this);
      return theStats;
    },

    /**
     * Calculates the statistical properties for the full set of parameter values of
     * the Projection, without separating the values into bins.
     * The statistical properties calculated depend on the
     * {@link atlas.visualisation.AbstractProjection#type|type} of the projection.
     * @returns {Object}
     * @protected
     */
    _calculatePopulationStatistics: function() {
      // TODO(bpstudds): Add the ability to specify which IDs to update see HeightProjection#render.
      var ids = Object.keys(this._values);
      var stats = {'sum': 0};
      if (ids.length > 0) {
        stats.min = { id: ids[0], value: this._values[ids[0]] };
        stats.max = { id: ids[0], value: this._values[ids[0]] };
        stats.count = ids.length;
        // Calculate min, max, and sum values.
        ids.forEach(function(id) {
          var thisValue = this._values[id];
          stats.sum += parseInt(thisValue, 10) || 0;
          if (thisValue < stats.min.value) {
            stats.min = { 'id': id, 'value': thisValue };
          }
          if (thisValue > stats.max.value) {
            stats.max = { 'id': id, 'value': thisValue };
          }
        }, this);
        stats.average = stats.sum / stats.count;
        stats.range = stats.max.value - stats.min.value;
      }
      return stats;
    },

    /**
     * Calculates the projection parameters for each Entity's value in the Projection. The exact
     * parameters calculated depend on the {@link atlas.visualisation.AbstractProjection#type|type}
     * of the projection.
     * @returns {Object} The calculated parameters.
     * @protected
     */
    _calculateValueAttributes: function() {
      // Update the value statistics if necessary.
      this._stats = this._stats ? this._stats : this._calculateBinnedStatistics();
      var theAttributes = {};
      // Iterate through each bin...
      this._stats.forEach(function(bin) {
        // and each entity which has a value in the bin.
        bin.entityIds.forEach(function(id) {
          var thisValue = this._values[id],
              thisAttribute = {},
              divisor;
          if (thisValue !== undefined && thisValue !== null) {
            thisAttribute.binId = bin.binId;
            thisAttribute.numBins = bin.numBins;
            thisAttribute.absRatio = bin.range !== 0 ?
                (thisValue - bin.min.value) / (bin.range) : Number.POSITIVE_INFINITY;
            thisAttribute.diffFromAverage = thisValue - bin.average;
            thisAttribute.ratioFromAverage = (thisValue - bin.average);
            divisor = thisAttribute.ratioFromAverage < 0 ?
                (bin.average - bin.min.value) : (bin.max.value - bin.average);
            thisAttribute.ratioFromAverage =
                    divisor > 0 ? thisAttribute / divisor : Number.POSITIVE_INFINITY;
            // Push onto new attribute onto attribute collection.
            theAttributes[id] = thisAttribute;
          }
        }, this);
      }, this);
      return theAttributes;
    },

    /**
     * Constructs a list of IDs that are intended to be projected on. Either none, one, or an array
     * of IDs can be provided. If IDs are provided, a list of these IDs is returned. If no ID
     * are provided; a list of all IDs of Entities specified in the Projection is returned.
     * @param {String|Array.<String>} [id] - Either a single GeoEntity ID or an array of IDs.
     * @returns {Array.<String>} - An array of GeoEntity IDs.
     * @protected
     */
    _constructIdList: function(id) {
      if (!id) {
        return Object.keys(this._entities);
      } else if (Type.isArrayLiteral(id)) {
        return id;
      } else {
        return [id];
      }
    },

    /**
     * @param {Number} x
     * @returns {String} A formatted string of the rounded number.
     * @private
     */
    _round: function(x) {
      return this._formatter.exponentsToHTML(this._formatter.eNotationToTimes(
          this._formatter.round(x)));
    },

    // -------------------------------------------
    // GETTERS & SETTERS
    // -------------------------------------------

    /**
     * @returns {String} The caption of the Projection.
     */
    getCaption: function() {
      return this._caption;
    },

    /**
     * @returns {Object} The configuration of the Projection.
     */
    getConfiguration: function() {
      return this._configuration;
    },

    /**
     * @returns {string} The ID of the Projection.
     */
    getId: function() {
      return this._id;
    },

    /**
     * @returns {String} The type of the Projection.
     */
    getType: function() {
      return this._type;
    },

    /**
     * @returns {{title: String, caption: String, key: Object}}
     * An object literal with properties for the title and caption of the Projection.
     */
    getLegendData: function() {
      return {title: this.getTitle(), caption: this.getCaption(), key: {}};
    },

    /**
     * Sets the previous state, or the state of the render before the Projection is applied. ie.
     * sets what will be re-rendered when the Projection is removed.
     * @param {Object.<String, Object>} state
     */
    setPreviousState: function(state) {
      Object.keys(state).forEach(function(id) {
        this._setEffect(id, 'oldValue', state[id]);
      }, this);
    },

    /**
     * Returns the state before the Projection has been applied.
     * @returns {Object.<String, Object>}
     */
    getPreviousState: function() {
      var state = {};
      Object.keys(this._entities).forEach(function(id) {
        var effects = this._getEffects(id);
        if (effects) {
          state[id] = effects.oldValue;
        }
      }, this);
      return state;
    },

    /**
     * @returns {Object.<String, Object>} The current state. Override to return specific properties.
     */
    getCurrentState: function() {
      return {};
    },

    /**
     * @returns {String} The title of the projection.
     */
    getTitle: function() {
      return this._title;
    },

    /**
     * @returns {Object.<String, Number>} The map of Entity ID to value for the Projection.
     */
    getValues: function() {
      return this._values;
    },

    /**
     * @returns {Boolean} Whether the Projection is currently rendered.
     */
    isRendered: function() {
      return this._rendered;
    },

    /**
     * @param {String} id
     * @param {String} name
     * @param value
     * @private
     */
    _setEffect: function(id, name, value) {
      var effects = this._initEffect(id);
      effects[name] = value;
    },

    /**
     * @param {String} id
     * @param {String} name
     * @returns {atlas.visualisation.Effects}
     * @private
     */
    _getEffect: function(id, name) {
      var effects = this._getEffects(id);
      return effects && effects[name];
    },

    /**
     * @param {String} id
     * @param {atlas.visualisation.Effects} effects
     * @private
     */
    _setEffects: function(id, effects) {
      for (var name in effects) {
        this._setEffect(id, name, effects[name]);
      }
    },

    /**
     * @param {String} [id] - The ID of the entity.
     * @returns {atlas.visualisation.Effects}
     * @private
     */
    _getEffects: function(id) {
      return this._effects[id];
    },

    /**
     * @param {Object.<String, atlas.visualisation.Effects>} effects
     * @private
     */
    _setAllEffects: function(effects) {
      for (var id in effects) {
        this._setEffects(id, effects[id]);
      }
    },

    /**
     * @returns {Object.<String, atlas.visualisation.Effects>}
     * @private
     */
    _getAllEffects: function() {
      return this._effects;
    },

    /**
     * @param {String} id
     * @param {String} name
     * @private
     */
    _removeEffect: function(id, name) {
      var effects = this._initEffect(id);
      delete effects[name];
    },

    /**
     * @param {String} id
     * @private
     */
    _removeEffects: function(id) {
      delete this._effects[id];
    },

    /**
     * Sets up the necessary structure needed to store effects.
     * @private
     */
    _initEffects: function() {
      this._effects = {};
    },

    /**
     * Sets up the necessary structure needed to store effects for the given ID.
     * @param {String} id
     * @returns {atlas.visualisation.Effects}
     * @private
     */
    _initEffect: function(id) {
      var effects = this._effects[id];
      if (!effects) {
        effects = this._effects[id] = {};
      }
      return effects;
    }

  });

  /**
   * Used by AbstractProjection to generate the next GUID for a projection.
   */
  AbstractProjection._nextId = 100000;

  AbstractProjection._generateNextId = function() {
    var num = AbstractProjection._nextId++;
    return 'projection_' + num;
  };

  /**
   * @typedef {Object} atlas.visualisation.Effects
   * @property {Number} [oldValue] - The value of an Entity's artifact before this projection was
   * applied.
   * @property {Number} [newValue] - The value of an Entity's artifact after this projection was
   * applied.
   */

  return AbstractProjection;
});
