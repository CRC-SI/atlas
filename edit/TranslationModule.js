define([
  'atlas/util/Extends',
  'atlas/util/default',
  './BaseEditModule',
  'atlas/model/GeoEntity',
  'atlas/model/Vertex'
], function(extend, defaultValue, BaseEditModule, GeoEntity, Vertex) {

  /**
   * Constructs a new TranslationModule.
   * @class Handles logic for movement of {@link atlas/model/GeoEntity} objects through user
   * interaction (e.g. dragging).
   *
   * @param {Object} atlasManagers - A map of Atlas manager types to the manager instance.
   * @param {Object} [args] - Arguments to creating the TranslationModule.
   * @param {Number} [args.moveSensitivity] - Minimum number of screen pixels to move so a drag is recognised.
   *
   * @extends {atlas/render/BaseEditModule}
   * @alias atlas/edit/TranslationModule
   * @constructor
   */
  var TranslationModule = function(atlasManagers, args) {
    args = defaultValue(args, {});
    TranslationModule.base.constructor.call(this, atlasManagers, args);

    /**
     * A map of entity ID to entity object to entities currently being dragged.
     * @type {Object.<String, atlas/model/GeoEntity>}
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
   * When translation begins, if the event is targeted on a selected {@link atlas/model/GeoEntity},
   * then all selected entities are included in the translation. If no object is selected before
   * translation, only the target entity is translated.
   */
  TranslationModule.prototype.start = function(args) {
    /**
     * The entity which the event occurred on.
     * @type {@link atlas/model/GeoEntity}
     */
    var target = this._atlasManagers.entity.getAt(args)[0];
    if (!target) {
      return;
    }
    this._lastScreenCoords = {x: args.x, y: args.y};
    
    this._atlasManagers.camera.lockCamera();
    var id = target._id;
    var cartLocation = this._cartographicLocation(args);
    this._originalLocation = this._lastLocation = cartLocation;
    this._entities = {};
    this._entities[id] = target;
    console.debug(this._entities);
    // TODO(bpstudds) Handle multiple selections.
    //var selection = this._atlasManagers.selection.getSelection();
    //if (selection[id] !== undefined) {
    //  for (var selectId in selection) {
    //    this._entities[selectId] = selection[selectId];
    //  }
    //} else {
    //  this._entities[id] = target;
    //}
  };

  /**
   * Translates from the last location to the current location of the event for all entities.
   */
  TranslationModule.prototype.update = function(args) {
    if (this._entities === undefined) { return; }
    if (!this._entities) { return; }

    //var time = (new Date()).getTime();
    //var tics = time - this._lastTranslate;
    //if (tics < 500) return;
    //this._lastTranslate = time;
    var screenDiff = new Vertex(args.x, args.y).subtract(this._lastScreenCoords).absolute();
    if (screenDiff.x < this._MOVE_SENSITIVITY && screenDiff.y < this._MOVE_SENSITIVITY) {
      return;
    }
    this._lastScreenCoords = {x: args.x, y: args.y};
    var cartLocation = this._cartographicLocation(args);
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
      this._atlasManagers.camera.unlockCamera();

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

    for (var id in this._entities) {
      if (this._entities.hasOwnProperty(id)) {
        this._entities[id].translate(diff);
      }
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

