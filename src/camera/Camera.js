// Camera.js
define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/model/Vertex'
], function(Class, DeveloperError, defaultValue, mixin, Vertex) {

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
     * @type {Object}
     * @property {Number} lat - The initial latitude in decimal degrees in the
     * range [-90, 90].
     * @property {Number} lng - The initial longitude in decimal degrees in the
     * range [-180, 180].
     * @property {Number} elevation - The initial elevation above the Earth's
     * surface in metres.
     */
    _position: null,

    // TODO(aramk) I updated these, but noticed there is no distinction in tilt from looking north
    // or south.
    /**
     * The current orientation of the Camera.
     * @type {Object}
     * @property {Number} [tilt=90] - The tilt (or pitch) about the Camera's
     * transverse axis (across the latitude) in decimal degrees in the range [-90, 90].
     * At 90 degrees the Camera is facing the earth, at -90 degrees it is facing the opposite way
     * and at 0 degrees it is either facing north or south.
     * @property {Number} [bearing=0] - The bearing (or yaw) about the normal axis (across the
     * longitude) from the surface to the camera in decimal degrees in the range [-180, 180].
     * At 0 degrees the Camera is facing the earth, at -90 degrees it is facing West, at 90
     * degrees it is facing East, and at 180/-180 it is facing away from the earth.
     * @property {Number} [rotation=0] - The rotation (or roll) about the orientation
     * vector of the Camera in decimal degrees in the range [-180, 180].
     */
    _orientation: null,

    _init: function(args) {
      args = mixin({
        position: Camera.DEFAULT_POSITION,
        orientation: {tilt: 0, bearing: 0, rotation: 0}
      }, args);
      this._position = args.position;
      this._orientation = args.orientation;
      this.inputHandlers = {
        left: this.pan.bind(this),
        right: this.zoom.bind(this),
        middle: this.track.bind(this)
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getPosition: function() {
      return this._position;
    },

    setPosition: function(position) {
      var newCamera = {
        position: position,
        orientation: this.getOrientation(),
        duration: 0
      };
      this._animateCamera(newCamera);
    },

    getOrientation: function() {
      return this._orientation;
    },

    setOrientation: function(orientation) {
      var newCamera = {
        position: this.getPosition(),
        orientation: orientation,
        duration: 0
      };
      this._animateCamera(newCamera);
    },

    /**
     * Internal function to handle the renderer specifics to change the Camera's
     * orientation and position. It updates <code>_position</code> and <code>_orientation</code>
     * based on the input parameters.
     * This function should be called by the public API functions that have varying input depending
     * on purpose.
     * @param {Object} newCamera - The new camera data compatible with the constructor.
     * @abstract
     */
    _animateCamera: function(newCamera) {
      throw new DeveloperError('Can not call abstract method Camera._animateCamera');
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
      this._animateCamera(newCamera);
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
      this._animateCamera(newCamera);
    },

    roll: function(movement) {
      throw new DeveloperError('Camera.roll not yet implemented.');
    },

    tilt: function(movement) {
      throw new DeveloperError('Camera.tilt not yet implemented.');
    },

    track: function(movement) {

    },

    // -------------------------------------------
    // TARGETED MOVEMENT
    // -------------------------------------------

    /**
     * Moves the camera to the given location and sets the Camera's direction.
     * @param {Object} position - The new position of the Camera.
     * @param {Object} [orientation] - The new orientation of the Camera.
     * @param {Number} [duration=0] - The duration of the zoom animation in milliseconds.
     */
    zoomTo: function(position, orientation, duration) {
      if (position === undefined) {
        throw new DeveloperError('Can not move camera without specifying position');
      } else if (position.position) {
        orientation = position.orientation;
        duration = position.duration;
        position = position.position;
      }
      var nextCamera = {
        position: position,
        orientation: mixin({tilt: 0, bearing: 0, rotation: 0}, orientation),
        duration: defaultValue(duration, 0)
      };
      this._animateCamera(nextCamera);
    },

    /**
     * Turns the camera so it's orientation vector points at the given GeoEntities centroid.
     * @param {GeoEntity} geoEntity - The GeoEntity to face.
     */
    pointAt: function(geoEntity) {
      var newCamera = {
        position: this._position
      };
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
      this.zoomTo(this._position, newOrientation, 0);
    }
  }), {

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    DEFAULT_POSITION: {lat: -37, lng: 144, elevation: 20000},
    DEFAULT_ORIENTATION: {tilt: 90, bearing: 0, rotation: 0}

  });
  return Camera;
});
