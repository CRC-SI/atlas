// Camera.js
define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/model/GeoPoint'
], function(Class, DeveloperError, defaultValue, mixin, GeoPoint) {

  /**
   * @classdesc The Camera object controls the position and orientation of the camera.
   * It exposes an API to set position and orientation, zoom to a given GeoEntity
   * or a bookmarked location, and to manual move the Camera.
   * @author Brendan Studds
   *
   * @param {Object} args - The arguments for the constructor.
   * @param {Object} [args.position] - The initial position of the Camera.
   * @param {Object} [args.orientation] - The initial orientation of the Camera.
   * @class atlas.camera.Camera
   * @abstract
   */
  var Camera = mixin(Class.extend(/** @lends atlas.camera.Camera# */ {

    /**
     * The current position of the Camera.
     * @type {atlas.model.GeoPoint}
     */
    _position: null,

    // TODO(aramk) I updated these, but noticed there is no distinction in tilt from looking north
    // or south, since we rarely want to be tilted towards south. This means orientation isn't unique.
    /**
     * The current orientation of the Camera.
     * @type {Object}
     * // TODO(aramk) Normalise this around [-180, 180].
     * @property {Number} [tilt=90] - The tilt (or pitch) about the Camera's
     * transverse axis (across the latitude) in decimal degrees in the range [-90, 90].
     * At 90 degrees the Camera is facing the earth, at -90 degrees it is facing the opposite way
     * and at 0 degrees it is either facing north or south.
     * // TODO(aramk) Is there a reason we're using bearing not heading?
     * @property {Number} [bearing=0] - The bearing (or yaw) about the normal axis (across the
     * longitude) from the surface to the camera in decimal degrees in the range [-180, 180].
     * At 0 degrees the Camera is facing the earth, at -90 degrees it is facing West, at 90
     * degrees it is facing East, and at 180/-180 it is facing away from the earth.
     * @property {Number} [rotation=0] - The rotation (or roll) about the orientation
     * vector of the Camera in decimal degrees in the range [-180, 180].
     */
    _orientation: null,

    _init: function(args) {
      args = mixin({}, args);
      this._setPosition(args.position);
      this._setOrientation(args.orientation);
      this.inputHandlers = {
        left: this.pan.bind(this),
        right: this.zoom.bind(this),
        middle: this.track.bind(this)
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    setPosition: function(position) {
      this._setPosition(position);
      this._animate({duration: 0});
    },

    _setPosition: function (position) {
      this._position = mixin(this._position || Camera.DEFAULT_POSITION(), position);
    },

    getPosition: function() {
      return this._position;
    },

    /**
     * @returns {atlas.model.Vertex}
     */
    getDirection: function() {
      throw new DeveloperError('Not yet implemented.');
    },

    /**
     * @returns {atlas.model.Vertex}
     */
    getUp: function() {
      throw new DeveloperError('Not yet implemented.');
    },

    getOrientation: function() {
      return this._orientation;
    },

    setOrientation: function(orientation) {
      this._setOrientation(orientation);
      this._animate({duration: 0});
    },

    _setOrientation: function (orientation) {
      this._orientation = mixin(this._orientation || Camera.DEFAULT_ORIENTATION(), orientation);
    },

    /**
     * Internal function to handle the renderer specifics to change the Camera's
     * orientation and position. This function should be called by the public API functions that
     * have varying input depending on purpose.
     * @param {Object} args
     * @param {Object} [args.duration=0] The amount of time to take for the animation.
     * @abstract
     */
    _animate: function(args) {
      throw new DeveloperError('Can not call abstract method Camera._animate');
    },

    // -------------------------------------------
    // GENERAL MOVEMENT
    // -------------------------------------------

    pan: function(input) {
      throw new DeveloperError('Camera.pan not yet implemented.');
      var newCamera = {
        position: this._position.add(input.position),
        orientation: this._orientation,
        duration: 0
      };
      this._animate(newCamera);
    },

    zoom: function(input) {
      throw new DeveloperError('Camera.zoom not yet implemented.');
      var zoom = {x: 1, y: 1};
      var moveY = input.movement.cY;
      moveY /= 300;
      zoom.z = 1 - moveY;
      var newCamera = {
        position: this._position.componentWiseMultiply(zoom),
        orientation: this._orientation,
        duration: 0
      };
      this._animate(newCamera);
    },

    roll: function(angle) {
      throw new DeveloperError('Camera.roll not yet implemented.');
    },

    tilt: function(angle) {
      throw new DeveloperError('Camera.tilt not yet implemented.');
    },

    track: function(movement) {

    },

    // -------------------------------------------
    // TARGETED MOVEMENT
    // -------------------------------------------

    /**
     * Moves the camera to the given location and sets the Camera's direction.
     * @param {Object} args
     * @param {atlas.model.GeoPoint} args.position - The new position of the Camera.
     * @param {Object} [args.orientation] - The new orientation of the Camera.
     * @param {Number} [args.duration=0] - The duration of the zoom animation in milliseconds.
     */
    zoomTo: function(args) {
      args = mixin({}, args);
      if (args.position === undefined) {
        throw new DeveloperError('Can not move camera without specifying position');
      }
      this._setPosition(args.position);
      this._setOrientation(args.orientation || this._orientation);
      this._animate(args);
    },

    /**
     * Turns the camera so it's orientation vector points at the given position.
     * @param {GeoPoint} point
     */
    pointAt: function(point) {
      throw new DeveloperError('Camera.pointAt not yet implemented.');
    },

    /**
     * Moves the camera to the given Bookmarked location.
     */
    goTo: function() {
      throw new DeveloperError('Camera.goTo not yet implemented.');
    },

    /**
     * Immediately moves the Camera so it is facing downwards.
     * The rotation and bearing remain unchanged.
     */
    pointDown: function() {
      var newOrientation = {
        x: 0,
        y: this._orientation.y,
        z: this._orientation.z
      };
      this.setOrientation(newOrientation);
    }
  }), {

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    DEFAULT_POSITION: function () {
      return new GeoPoint(-37, 144, 20000);
    },
    DEFAULT_ORIENTATION: function () {
      return mixin({}, {tilt: 90, bearing: 0, rotation: 0});
    }

  });
  return Camera;
});
