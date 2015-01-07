define([
  'atlas/lib/utility/Types',
  'atlas/core/Atlas',
  'atlas/model/Ellipse',
  'atlas/model/Feature',
  'atlas/model/Polygon'
], function(Types, Atlas, Ellipse, Feature, Polygon) {

  /**
   * @typedef atlas.test.lib.AtlasBuilder
   * @ignore
   */
  var AtlasBuilder;

  /**
   * Checks that the given ID doesn't already exist and is a valid ID. Throws an error if the ID is
   * invalid.
   * @param {Object} ab - The Builder scope to check in.
   * @param {String} id - The Feature ID to validate.
   */
  var _validateFeatureId = function(ab, id) {
    if (ab.features[id]) {
      throw new Error('Tried to create feature with already existing ID');
    }
    if (!Types.isString(id) && !Types.isNumber(id)) {
      throw new Error('Tried to create feature with a non-alphanumeric ID ' + id);
    }
  };

  /**
   * Checks that the given form does not already exist, and that a Feature is currently being
   * configured in the Builder scope. Throws an error if the form is invalid.
   * @param {Object} ab - The Builder scope to check in.
   * @param {String} form - The form name.
   */
  var _validateForm = function(ab, form) {
    var id = ab.currentFeatureId;
    if (id === null) {
      throw new Error('Tried to create ellipse without creating a Feature');
    }
    if (ab.features[id][form]) {
      throw new Error('Tried to override existing form ' + form + ' for feature ID ' + id + '.');
    }
  };

  /**
   * Adds the Form builder function to the current builder scope.
   * @param {Object} scope - The scope of the current builder.
   */
  var _addFormBuildersToScope = function() {
    Object.keys(AtlasBuilder).forEach(function(key) {
      if (AtlasBuilder.hasOwnProperty(key)) {
        var newKey = key;
        if (key.match(/make*/)) {
          newKey = newKey.substring(4);
          newKey = newKey.toLowerCase();
        }
        _Builder.prototype[newKey] = AtlasBuilder[key];
      }
    });
  };

  /**
   * Internal builder class. This is the object that is actually used as the builder.
   * The use of an internal builder allows calling the builder without using "new", while
   * maintaining a separate scope for each builder action.
   * @ignore
   */
  var _Builder = function() {
    /* jshint unused: false */
    this.dom = {};
    this.features = {};
    this.currentFeatureId = {};
  };

  /**
   * A Builder for an Atlas instance.
   *
   * @class  atlas.test.lib.AtlasBuilder
   */
  AtlasBuilder = function() {
    // This is done on "construction" to allow form constructors (and 'build') to be overridden
    // by Atlas implementations. Note: this won't matter when the entity Factory is implemented
    _addFormBuildersToScope();
    var ab = new _Builder();

    return ab;
  };

  /**
   * Adds a new empty Feature to the current Builder scope.
   *
   * @param {String} id - The ID to assign to the Feature.
   *
   * @returns {atlas.test.lib.AtlasBuilder}
   */
  AtlasBuilder.makeFeature = function(id) {
    _validateFeatureId(this, id);

    this.features[id] = {};
    this.currentFeatureId = id;

    return this;
  };

  /**
   * Adds an Ellipse to the current Feature in the Builder scope.
   *
   * @param {Object.<x, y>} centroid - The centroid to assign to the Ellipse.
   * @param {Number} semimajor - The semi major axis to assign to the Ellipse.
   * @param {Number} [semiminor] - The semi minor axis to assign to the Ellipse.
   *
   * @returns {atlas.test.lib.AtlasBuilder}
   */
  AtlasBuilder.makeEllipse = function(centroid, semimajor, semiminor) {
    _validateForm(this, 'ellipse');

    var id = this.currentFeatureId;
    this.features[id].ellipse = {
      centroid: centroid,
      semimajor: semimajor,
      semiminor: semiminor
    };

    return this;
  };

  /**
   * Adds a Polygon to the current Feature in the Builder scope.
   *
   * @param {Array.<Object.<x, y>>} vertices - Array of vertices to assign to the Polygon.
   *
   * @returns {atlas.test.lib.AtlasBuilder}
   */
  AtlasBuilder.makePolygon = function(vertices) {
    _validateForm(this, 'polygon');
    var id = this.currentFeatureId;
    this.features[id].polygon = {
      vertices: vertices
    };
    return this;
  };

  /**
   * Finalises and builds the Atlas as defined by the current Builder scope.
   * @returns {atlas.core.Atlas} The built Atlas.
   */
  AtlasBuilder.build = function() {
    // TODO(bpstudds): Replace with the factory.
    // Create Atlas
    var features = this.features;
    var atlas = new Atlas();
    var entityManager = atlas.getManager('entity');
    // Create Features
    Object.keys(features).forEach(function(id) {
      var args = features[id];
      entityManager.createFeature(id, args);
    });

    return atlas;
  };

  // An example of how it would be used.
  /* jshint unused: false */
  // var atlas = AtlasBuilder()
  //   .feature('id1')
  //     .ellipse({x: 0, y: 0}, 50)
  //   .feature('id2')
  //     .polygon([{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}])
  //   .dom('elementId') // or maybe dom().fake()
  //   .build();

  return AtlasBuilder;
});
