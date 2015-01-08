define([
  'atlas/lib/utility/Strings',
  'atlas/lib/utility/Types',
  'atlas/core/Atlas',
  'atlas/model/Ellipse',
  'atlas/model/Feature',
  'atlas/model/Line',
  'atlas/model/Polygon'
], function(Strings, Types, Atlas, Ellipse, Feature, Line, Polygon) {

  var formConstructors = {
    'ellipse': Ellipse,
    'line': Line,
    'polygon': Polygon
  };

  /**
   * @typedef atlas.test.lib.AtlasBuilder
   * @ignore
   */
  var AtlasBuilder;

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
   * Adds the builder functions to the current builder scope that may be overridden.
   * @param {Object} scope - The scope of the current builder.
   */
  var _addFormBuildersToScope = function() {
    _Builder.prototype.build = AtlasBuilder.build;
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
      args.show = false;
      // Create forms on the Feature. Replace with Factory.
      Object.keys(formConstructors).forEach(function(formName) {
        if (args[formName]) {
          args[formName].show = false;
          args[formName] = new formConstructors[formName](id + formName, args[formName]);
        }
      });
      entityManager.createFeature(id, args);
    });

    return atlas;
  };

  /**
   * Internal builder class. This is the object that is actually used as the builder.
   * The use of an internal builder allows calling the builder without using "new", while
   * maintaining a separate scope for each builder action.
   * @ignore
   */
  var _Builder = function() {
    /* jshint unused: false */

    /**
     * Properties to assign to the DOM Manager of the constructed Atlas.
     * [UNUSED]
     * @type {Object}
     * @private
     */
    this.dom = {};

    /**
     * Contains a map of Feature IDs to Feature prototypes that will be created on
     * the constructed Atlas.
     * @type {Object.<String, Object>}
     * @private
     */
    this.features = {};

    /**
     * The ID of the Feature prototype currently be configured in the Builder scope.
     * @type {String}
     * @private
     */
    this.currentFeatureId = null;
  };

  /**
   * Adds a new empty Feature to the current Builder scope.
   *
   * @param {String} id - The ID to assign to the Feature.
   *
   * @returns {atlas.test.lib.AtlasBuilder}
   */
  _Builder.prototype.feature = function(id) {
    this._validateFeatureId(id);

    this.features[id] = {};
    this.currentFeatureId = id;

    return this;
  };

  _Builder.prototype._form = function(name, components) {
    this._validateForm(name);
    var id = this.currentFeatureId;
    this.features[id][name] = components;

    return this;
  };

  // Add make functions for the defined forms utilising _makeForm.
  Object.keys(formConstructors).forEach(function(form) {
    _Builder.prototype[form] = function(components) {
      return this._form(form, components);
    };
  });

  /**
   * Checks that the given ID doesn't already exist and is a valid ID. Throws an error if the ID is
   * invalid.
   * @param {String} id - The Feature ID to validate.
   */
  _Builder.prototype._validateFeatureId = function(id) {
    if (this.features[id]) {
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
  _Builder.prototype._validateForm = function(form) {
    if (!formConstructors[form]) {
      throw new Error('Tried to create invalid form ' + form + '.');
    }
    var id = this.currentFeatureId;
    if (!id || !this.features[id]) {
      throw new Error('Tried to create ' + form + ' without creating a Feature');
    }
    if (this.features[id][form]) {
      throw new Error('Tried to override existing form ' + form + ' for feature ID ' + id + '.');
    }
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
