define([
  'atlas/edit/BaseEditModule',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/Vertex'
], function(BaseEditModule, Log, Setter, Vertex) {

  /**
   * @typedef atlas.edit.TranslationModule
   * @ignore
   */
  var TranslationModule;

  /**
   * @classdesc Handles logic for movement of {@link atlas.model.GeoEntity} objects through user
   * interaction (e.g. dragging).
   * @extends atlas.render.BaseEditModule
   * @class atlas.edit.TranslationModule
   */
  TranslationModule = BaseEditModule.extend(/** @lends atlas.edit.TranslationModule# */ {

    /**
     * A map of entity ID to entity object to entities currently being dragged.
     * @type {Object.<String, atlas.model.GeoEntity>}
     * @private
     */
    // TODO(aramk) This isn't used at the moment - only _target is. We would want to check the
    // selected entities when dragging starts and move those, otherwise whatever entity we started
    // dragging.
    _entities: null,

    /**
     * @param {Object} managers - A map of Atlas manager types to the manager instance.
     * @param {Object} [args] - Arguments to creating the TranslationModule.
     * @param {Number} [args.moveSensitivity] - Minimum number of screen pixels to move so a drag is recognised.
     * @constructor
     * @private
     */
    _init: function(managers, args) {
      this._super(managers, args);
      args = Setter.def(args, {});
      this._MOVE_SENSITIVITY = Setter.def(args.moveSensitivity, 5);
      this._managers = managers;
      this._reset();
      // TODO(aramk) Abstract this into a method in BaseEditModule.
      var provideTarget = function (callback) {
        return function () {
          return callback.call(this, this._provideTarget.apply(this, arguments));
        }.bind(this)
      }.bind(this);
      this.bindEvents({
        'input/leftdown': provideTarget(this._start),
        'input/mousemove': function (args) {
          this._target && this._update(args);
        }.bind(this),
        'input/leftup': function (args) {
          this._target && this._stop(args);
        }.bind(this)
      });
    },

    // TODO(aramk) Currently, Event object is only used internally and EventManager is passing
    // it's name and arguments only.
    // _provideTarget: function (event) {
    //   event.setTarget(this._managers.entity.getAt(event.position)[0]);
    //   return event;
    // },

    _provideTarget: function (args) {
      args.target = this._managers.entity.getAt(args.position)[0];
      return args;
    },

    /**
     * When translation begins, if the event is targeted on a selected {@link atlas.model.GeoEntity},
     * then all selected entities are included in the translation. If no object is selected before
     * translation, only the target entity is translated.
     */
    _start: function(args) {
      if (!args.target || !this._managers.edit.entityCanBeEdited(args.target)) {
        return;
      }
      this._target = args.target;
      // Lock up camera
      this._managers.camera.lockCamera();
      // Initialise the translation.
      this._lastScreenCoords = {x: args.position.x, y: args.position.y};
      this._originalLocation = this._lastLocation = this._cartographicLocation(args.position);
    },

    /**
     * Translates from the last location to the current location of the event for all entities.
     */
    _update: function(args) {
      if (!this._target) {
        return;
      }

      var screenDiff = new Vertex(args.position.x,
          args.position.y).subtract(this._lastScreenCoords).absolute();
      if (screenDiff.x < this._MOVE_SENSITIVITY && screenDiff.y < this._MOVE_SENSITIVITY) {
        return;
      }
      this._translateFromEventArgs(args);
    },

    /**
     * Translates from the last location to the current location of the event for all entities and then
     * stops translating.
     */
    _stop: function(args) {
      if (!this._target) {
        return;
      }
      this._translateFromEventArgs(args);
      this._reset();
      this._managers.camera.unlockCamera();
    },

    _translateFromEventArgs: function (args) {
      this._lastScreenCoords = {x: args.position.x, y: args.position.y};
      var cartLocation = this._cartographicLocation(args.position);
      this._translate(this._lastLocation, cartLocation);
      this._lastLocation = cartLocation;
    },

    /**
     * Cancels the translation and moves all back to their original locations before translation began.
     */
    cancel: function(args) {
      if (!this._target) {
        Log.debug('No translation is taking place - cannot cancel', args);
      } else {
        this._managers.camera.unlockCamera();
        this._translate(this._lastLocation, this._originalLocation);
        this._reset();
      }
    },

    /**
     * Translates all entities from one location to another.
     * @param {atlas.model.GeoPoint} oldPos - The starting coordinate.
     * @param {atlas.model.GeoPoint} newPos - The ending coordinate.
     * @private
     */
    _translate: function(oldPos, newPos) {
      var diff = newPos.subtract(oldPos);
      // GeoEntity.translate expects a Vertex, not a GeoPoint.
      this._target.translate(diff);
    },

    /**
     * Converts a screen position into a cartographic.
     * @param {Object} screenPos - The screen position.
     * @returns {atlas.model.GeoPoint}
     * @private
     */
    _cartographicLocation: function(screenPos) {
      return this._managers.render.geoPointFromScreenCoords(screenPos);
    },

    /**
     * Resets the state of all instance variables to their original values.
     * @private
     */
    _reset: function() {
      this._entities = undefined;
      this._entities = null;
      delete this._entities;
      this._target = null;
      this._lastLocation = null;
      this._originalLocation = null;
    }

  });
  return TranslationModule;
});
