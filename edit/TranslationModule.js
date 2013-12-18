define([
  'atlas/util/Extends',
  './BaseEditModule',
  'atlas/model/GeoEntity'
], function(extend, BaseEditModule, GeoEntity) {

  /**
   * Constructs a new TranslationModule.
   * @class Handles logic for movement of {@link atlas/model/GeoEntity} objects through user
   * interaction (e.g. dragging).
   *
   * @extends {atlas/render/BaseEditModule}
   * @alias atlas/edit/TranslationModule
   * @constructor
   */
  var TranslationModule = function(atlasManagers) {
    this._reset();
    this._atlasManagers = atlasManagers;
  };
  // Inherit from BaseEditModule.
  extend(TranslationModule, BaseEditModule);

  /**
   * When translation begins, if the event is targeted on a selected {@link atlas/model/GeoEntity},
   * then all selected entities are included in the translation. If no object is selected before
   * translation, only the target entity is translated.
   */
  TranslationModule.prototype.start = function(name, args) {
    var cartLocation = this._cartographicLocation(args);
    /**
     * The entity which the event occurred on.
     * @type {@link atlas/model/GeoEntity}
     */
    var target = this._atlasManagers.entity.getAt(cartLocation);
    if (!target) {
      return;
    }
    var id = target.id;
    this._originalLocation = this._lastLocation = cartLocation;
    var selection = this._atlasManagers.selection.getSelection();
    if (selection[id] !== undefined) {
      for (var selectId in selection) {
        this._entities[selectId] = selection[selectId];
      }
    } else {
      this._entities[id] = target;
    }
  };

  /**
   * Translates from the last location to the current location of the event for all entities.
   */
  TranslationModule.prototype.update = function(name, args) {
    var cartLocation = this._cartographicLocation(args);
    this._translate(this._lastLocation, cartLocation);
    this._lastLocation = cartLocation;
  };

  /**
   * Translates from the last location to the current location of the event for all entities and then
   * stops translating.
   */
  TranslationModule.prototype.end = function(name, args) {
    this.update(name, args);
    this._reset();
  };

  /**
   * Cancels the translation and moves all back to their original locations before translation began.
   */
  TranslationModule.prototype.cancel = function(name, args) {
    if (Object.keys(this._entities).length === 0) {
      this._translate(this._lastLocation, this._originalLocation);
      this._reset();
    } else {
      console.debug('No translation is taking place - cannot cancel', name, args);
    }
  };

  /**
   * Translates all entities from one location to another.
   * @param {atlas/model/Vertex} oldVertex - The starting coordinate.
   * @param {atlas/model/Vertex} newVertex - The ending coordinate.
   * @private
   */
  TranslationModule.prototype._translate = function(oldVertex, newVertex) {
    var diff = newVertex.subtract(oldVertex);
    for (var entity in this._entities) {
      entity.translate(diff);
    }
  };

  /**
   * Converts a screen position into a cartographic Vertex.
   * @param {Object} screenPos - The screen position.
   * @private
   */
  TranslationModule.prototype._cartographicLocation = function(screenPos) {
    return this._atlasManagers.render.convertScreenCoordsToLatLng(screenPos);
  };

  /**
   * Resets the state of all instance variables to their original values.
   * @private
   */
  TranslationModule.prototype._reset = function() {
    this._entities = {};
    this._lastLocation = null;
    this._originalLocation = null;
  };

  return TranslationModule;
});