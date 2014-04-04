define([
  'atlas/util/Extends',
  'atlas/util/default',
  './BaseEditModule',
  'atlas/model/GeoEntity',
  'atlas/model/Vertex',
  'atlas/lib/utility/Log'
], function(extend, defaultValue, BaseEditModule, GeoEntity, Vertex, Log) {

  /**
   * Constructs a new TranslationModule.
   * @class Handles logic for movement of {@link atlas.model.GeoEntity} objects through user
   * interaction (e.g. dragging).
   *
   * @param {Object} atlasManagers - A map of Atlas manager types to the manager instance.
   * @param {Object} [args] - Arguments to creating the TranslationModule.
   * @param {Number} [args.moveSensitivity] - Minimum number of screen pixels to move so a drag is recognised.
   *
   * @extends {atlas.render.BaseEditModule}
   * @alias atlas.edit.TranslationModule
   * @constructor
   */
  var TranslationModule = function(atlasManagers, args) {
    args = defaultValue(args, {});
    TranslationModule.base.constructor.call(this, atlasManagers, args);

    /**
     * A map of entity ID to entity object to entities currently being dragged.
     * @type {Object.<String, atlas.model.GeoEntity>}
     * @private
     */
    this._entities = {};

    this._MOVE_SENSITIVITY = defaultValue(args.moveSensitivity, 5);

    this._atlasManagers = atlasManagers;
    this._reset();
  };
  // Inherit from BaseEditModule.
  extend(BaseEditModule, TranslationModule);

  /**
   * When translation begins, if the event is targeted on a selected {@link atlas.model.GeoEntity},
   * then all selected entities are included in the translation. If no object is selected before
   * translation, only the target entity is translated.
   */
  TranslationModule.prototype.start = function(args) {
    var target = this._atlasManagers.entity.getAt(args.position);
    // getAt returns an array at that point. Pick the first (topmost) Entity.
    if (!(target instanceof Array) || target.length <= 0 ) { return; }
    target = target[0];

    var selected = this._atlasManagers.selection.getSelection();
    // Set the target entities
    this._entities = {};
    this._entities[target.id] = target;
    Object.keys(selected).forEach(function (id) {
      this._entities[id] = selected[id];
    }, this);
    // Lock up camera
    this._atlasManagers.camera.lockCamera();
    // Initialise the translation.
    this._lastScreenCoords = {x: args.position.x, y: args.position.y};
    this._originalLocation = this._lastLocation = this._cartographicLocation(args.position);
  };

  /**
   * Translates from the last location to the current location of the event for all entities.
   */
  TranslationModule.prototype.update = function(args) {
    if (!this._entities) { return; }

    var screenDiff = new Vertex(args.position.x, args.position.y).subtract(this._lastScreenCoords).absolute();
    if (screenDiff.x < this._MOVE_SENSITIVITY && screenDiff.y < this._MOVE_SENSITIVITY) {
      return;
    }
    this._lastScreenCoords = {x: args.position.x, y: args.position.y};
    var cartLocation = this._cartographicLocation(args.position);
    this._translate(this._lastLocation, cartLocation);
    this._lastLocation = cartLocation;
  };

  /**
   * Translates from the last location to the current location of the event for all entities and then
   * stops translating.
   */
  TranslationModule.prototype.end = function(args) {
    if (!this._entities) { return; }
    this._lastScreenCoords = {x: args.x, y: args.y};
    //var cartLocation = this._cartographicLocation(args);
    //this._translate(this._lastLocation, cartLocation);
    this._reset();
    this._atlasManagers.camera.unlockCamera();
  };

  /**
   * Cancels the translation and moves all back to their original locations before translation began.
   */
  TranslationModule.prototype.cancel = function(args) {
    if (!this._entities) {
      Log.debug('No translation is taking place - cannot cancel', name, args);
    } else {
      this._atlasManagers.camera.unlockCamera();
      this._translate(this._lastLocation, this._originalLocation);
      this._reset();
    }
  };

  /**
   * Translates all entities from one location to another.
   * @param {atlas.model.Vertex} oldVertex - The starting coordinate.
   * @param {atlas.model.Vertex} newVertex - The ending coordinate.
   * @private
   */
  TranslationModule.prototype._translate = function(oldVertex, newVertex) {
    var diff = newVertex.subtract(oldVertex);

    // TODO(aramk) this._entities is null.
    for (var id in this._entities) {
      Log.debug('translating', this._entities[id]);
      this._entities[id].translate(diff);
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
    this._entities = undefined;
    this._entities = null;
    delete this._entities;
    this._lastLocation = null;
    this._originalLocation = null;
  };

  return TranslationModule;
});

