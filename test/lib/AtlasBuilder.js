define([
  'atlas/lib/utility/Types',
  'atlas/core/Atlas',
  'atlas/model/Ellipse',
  'atlas/model/Feature',
  'atlas/model/Polygon'
], function(Types, Atlas, Ellipse, Feature, Polygon) {

  /**
   * @typedef atlas.test.AtlasBuilder
   * @ignore
   */
  var AtlasBuilder;

  /**
   * The scope of the builder.
   */
  var ab;

  /**
   * Checks that the given ID doesn't already exist and is a valid ID. Throws an error if the ID is
   * invalid.
   * @param {String} id - The Feature ID to validate.
   */
  var _validateFeatureId = function(id) {
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
   * @param {String} form - The form name.
   */
  var _validateForm = function(form) {
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
  var _addFormBuildersToScope = function(scope) {
    scope.ellipse = AtlasBuilder.makeEllipse.bind(scope);
    scope.polygon = AtlasBuilder.makePolygon.bind(scope);
  };

  AtlasBuilder = function() {
    ab = {
      dom: {},
      features: {},
      currentFeatureId: null,

      // Build functions
      feature: AtlasBuilder.makeFeature.bind(this),
      // TODO(bpstudds): Any other random things that are required.
      build: AtlasBuilder.build.bind(this)
    };
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
    _validateFeatureId(id);

    ab.features[id] = {};
    ab.currentFeatureId = id;

    _addFormBuildersToScope(ab);
    return ab;
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
    _validateForm('ellipse');

    var id = ab.currentFeatureId;
    ab.features[id].ellipse = {
      centroid: centroid,
      semimajor: semimajor,
      semiminor: semiminor
    };
    return ab;
  };

  /**
   * Adds a Polygon to the current Feature in the Builder scope.
   *
   * @param {Array.<Object.<x, y>>} vertices - Array of vertices to assign to the Polygon.
   *
   * @returns {atlas.test.lib.AtlasBuilder}
   */
  AtlasBuilder.makePolygon = function(vertices) {
    _validateForm('polygon');
    var id = ab.currentFeatureId;
    ab.features[id].polygon = {
      vertices: vertices
    };
    return ab;
  };

  /**
   * Finalises and builds the Atlas as defined by the current Builder scope.
   * @returns {atlas.core.Atlas} The built Atlas.
   */
  AtlasBuilder.build = function() {
    // TODO(bpstudds): Replace with the factory.
    // Create Atlas
    var atlas = new Atlas();
    var entityManager = atlas.getManager('entity');
    // Create Features
    Object.keys(ab.features).forEach(function(id) {
      var args = ab.features[id];
      entityManager.createFeature(id, args);
    });
    // Clear builder scope
    ab = null;
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
