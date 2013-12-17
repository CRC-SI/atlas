define([
  'atlas/util/Extends',
  './BaseEditModule',
  'atlas/model/GeoEntity'
], function (extend, BaseEditModule, GeoEntity) {

  /**
   * Constructs a new TranslationModule.
   * @class Handles logic for movement through user interaction.
   *
   * @alias atlas/edit/TranslationModule
   * @constructor
   */
  var TranslationModule = function (atlasManagers) {
    this._reset();
    this._atlasManagers = atlasManagers;
  };

  // Inherit from TranslationModule.
  extend(TranslationModule, BaseEditModule);

  // Stores Entities being translated, initial location
  TranslationModule.prototype.start = function (name, event) {
    var target = event.target;
    if (!(target instanceof GeoEntity)) {
      return;
    }
    var id = target.id;
    // TODO(aramk) define where here is by reading fields from the event object.
    this._originalLocation = this._lastLocation = here;
    var selection = this._atlasManagers.selection.getSelection();
    // TODO(aramk) verify this is the field containing the clicked on entity.
    if (selection[id] !== undefined) {
      this._entities = selection;
    } else {
      this._entities[id] = target;
    }
  };

  // Updates 'initial' location, renders entities at current location
  // Have function on GeoEntity to temporarily change location data and re-render
  TranslationModule.prototype.update = function (name, event) {
    var currentLocation = here;
    // TODO(aramk) use the actual structure for coords.
    this._move(this._lastLocation, currentLocation);
    this._lastLocation = currentLocation;
  };

  // Changes actual location of entities, renders them there.
  // Have function on GeoEntity to permantely update location data and re-render
  TranslationModule.prototype.end = function (name, event) {
    this.update(name, event);
    this._reset();
  };

  TranslationModule.prototype.cancel = function (name, event) {
    this._move(this._lastLocation, this._originalLocation);
    this._reset();
  };

  TranslationModule.prototype._move = function (oldCoord, newCoord) {
    var diffLocation = diffCoord(oldCoord, newCoord);
    for (var entity in this._entities) {
      // TODO(aramk) this assumes that move takes a location as a diff, not absolute value.
      entity.move(diffLocation);
      // TODO(aramk) shouldn't move already render the model?
      entity.show();
    }
  };

  TranslationModule.prototype._reset = function () {
    this._entities = {};
    this._lastLocation = null;
    this._originalLocation = null;
  };

  // TODO(aramk) where possible, refactor common arithmetic into a class if one doesn't already exist.
  function diffCoord(x, y) {
    return [y[0] - x[0], y[1] - x[1]];
  }

  return TranslationModule;
});