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

  var _checkFeature = function(id) {
    if (ab.features[id]) {
      throw new Error('Tried to create feature with already existing ID');
    }
    if (!Types.isString(id) && !Types.isNumber(id)) {
      throw new Error('Tried to create feature with a non-alphanumeric ID ' + id);
    }
  };

  var _checkForm = function(form) {
    var id = ab.currentFeatureId;
    if (id === null) {
      throw new Error('Tried to create ellipse without creating a Feature');
    }
    if (ab.features[id][form]) {
      throw new Error('Tried to override existing form ' + form + ' for feature ID ' + id + '.');
    }
  };

  var _addFormsToBuilder = function(scope) {
    scope.ellipse = AtlasBuilder.makeEllipse.bind(ab);
    scope.polygon = AtlasBuilder.makePolygon.bind(ab);
  };

  AtlasBuilder = function() {
    ab = {
      dom: {},
      features: {},
      currentFeatureId: null,

      // Build functions
      feature: AtlasBuilder.makeFeature.bind(ab),
      // TODO(bpstudds): Any other random things that are required.
      build: AtlasBuilder.build.bind(ab)
    };
    return ab;
  };

  AtlasBuilder.makeFeature = function(id) {
    _checkFeature(id);

    ab.features[id] = {};
    ab.currentFeatureId = id;

    _addFormsToBuilder(ab);
    return ab;
  };

  AtlasBuilder.makeEllipse = function(centroid, semimajor, semiminor) {
    _checkForm('ellipse');

    var id = ab.currentFeatureId;
    ab.features[id].ellipse = {
      centroid: centroid,
      semimajor: semimajor,
      semiminor: semiminor
    };
    return ab;
  };

  AtlasBuilder.makePolygon = function(vertices) {
    _checkForm('polygon');
    var id = ab.currentFeatureId;
    ab.features[id].polygon = {
      vertices: vertices
    };
    return ab;
  };

  AtlasBuilder.build = function() {
    // Create Atlas
    var atlas = new Atlas();
    var entityManager = atlas.getManager('entity');

    // TODO(bpstudds): Replace with the factory.

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
