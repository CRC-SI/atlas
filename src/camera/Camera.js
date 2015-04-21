define([
  'atlas/model/GeoPoint',
  'atlas/lib/Q',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError',
  'atlas/util/Geocoder'
], function(GeoPoint, Q, Log, Setter, Class, DeveloperError, Geocoder) {

  /**
   * @typedef atlas.camera.Camera
   * @ignore
   */
  var Camera;

  /**
   * @classdesc The Camera object controls the position and orientation of the camera.
   * It exposes an API to set position and orientation, zoom to a given GeoEntity
   * or a bookmarked location, and to manual move the Camera.
   *
   * @param {Object} args - The arguments for the constructor.
   * @param {Object} [args.position] - The initial position of the Camera.
   * @param {atlas.camera.Camera.Orientation} [args.orientation] - The initial orientation of the Camera.
   * @class atlas.camera.Camera
   * @abstract
   */
  Camera = Setter.mixin(Class.extend(/** @lends atlas.camera.Camera# */ {

    /**
     * The current position of the Camera.
     * @type {atlas.model.GeoPoint}
     */
    _position: null,

    /**
     * The current orientation of the Camera.
     * @type {atlas.camera.Camera.Orientation}
     */
    _orientation: null,

    _init: function(args) {
      args = Setter.mixin({}, args);
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

    /**
     * @param {atlas.model.GeoPoint} position
     */
    setPosition: function(position) {
      this._setPosition(position);
      this._animate({position: this._position, duration: 0});
    },

    /**
     * @param {atlas.model.GeoPoint} position
     * @private
     */
    _setPosition: function(position) {
      this._position =
          new GeoPoint(Setter.merge(this._position || Camera.getDefaultPosition(), position));
    },

    /**
     * @returns {atlas.model.GeoPoint}
     */
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
     * @param {atlas.model.Vertex} direction
     */
    setDirection: function(direction) {
      throw new DeveloperError('Not yet implemented.');
    },

    /**
     * @returns {atlas.model.Vertex}
     */
    getUp: function() {
      throw new DeveloperError('Not yet implemented.');
    },

    /**
     * @returns {atlas.camera.Camera.Orientation}
     */
    getOrientation: function() {
      return this._orientation;
    },

    /**
     * @param {atlas.camera.Camera.Orientation} orientation
     */
    setOrientation: function(orientation) {
      this._setOrientation(orientation);
      this._animate({position: this._position, orientation: this._orientation, duration: 0});
    },

    /**
     * @param {atlas.camera.Camera.Orientation} orientation
     * @private
     */
    _setOrientation: function(orientation) {
      this._orientation =
          Setter.mixin(this._orientation || Camera.getDefaultOrientation(), orientation);
    },

    /**
     * @returns {Object} stats
     * @returns {atlas.model.GeoPoint} stats.position
     * @returns {atlas.camera.Camera.Orientation} stats.orientation
     * @returns {atlas.model.Vertex} stats.direction
     * @returns {atlas.model.Vertex} stats.up
     */
    getStats: function() {
      return {
        position: this.getPosition(),
        orientation: this.getOrientation(),
        direction: this.getDirection(),
        up: this.getUp()
      };
    },

    /**
     * Internal function to handle the renderer specifics to change the Camera's
     * orientation and position. This function should be called by the public API functions that
     * have varying input depending on purpose.
     * @param {Object} args
     * @param {atlas.model.GeoPoint} args.position
     * @param {atlas.camera.Camera.Orientation} [args.orientation]
     * @param {atlas.model.Vertex} [args.direction] - Either orientation or both direction and up
     * vertices must be provided.
     * @param {atlas.model.Vertex} [args.up]
     * @param {Object} [args.duration=0] - The amount of time in milliseconds to take for the
     * animation.
     * @param {atlas.camera.PathType} [args.path] - The type of path to follow if
     * animating.
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

    /**
     * @param {Object} args
     * @param {Object} [args.direction=1] - The direction of the zoom. Any negative value for
     *      will zoom in and any other value will zoom out.
     * @param {Object} [args.distance] - The distance to travel during zooming. If unspecified, an
     *      appropriate amount is used based on the camera position.
     * @param {Object} [args.duration=500] - The time taken for zooming in milliseconds.
     */
    zoom: function(args) {
      args = Setter.merge({
        direction: -1,
        duration: 500
      }, args);
      var direction = args.direction < 0 ? -1 : 1;
      Q.when(this.getStats()).then(function(stats) {
        var position = new GeoPoint(stats.position);
        var distance = this._getZoomDistance(position);
        var newPosition = position.translate(new GeoPoint(0, 0, direction * distance));
        if (newPosition.elevation <= 5) {
          newPosition.elevation = 5;
        }
        var newCamera = {
          position: newPosition,
          // Align the camera to the ground.
          orientation: {tilt: -90, bearing: 0, rotation: 0},
          duration: args.duration
        };
        this.zoomTo(newCamera);
      }.bind(this)).done();
    },

    /**
     * @param {atlas.model.GeoPoint} position
     * @return {Number} An appropriate zoom distance in metres to apply to the given position for
     *     zooming in and out based on the elevation.
     */
    _getZoomDistance: function(position) {
      // Zoom at least 50m.
      return Math.max(position.elevation / 2, 50);
    },

    roll: function(angle) {
      throw new DeveloperError('Camera.roll not yet implemented.');
    },

    tilt: function(angle) {
      throw new DeveloperError('Camera.tilt not yet implemented.');
    },

    track: function(movement) {
      throw new DeveloperError('Camera.track not yet implemented.');
    },

    // -------------------------------------------
    // TARGETED MOVEMENT
    // -------------------------------------------

    /**
     * Moves the camera to the given location and sets the Camera's direction.
     * @param {Object} args
     * @param {atlas.model.GeoPoint} [args.position] - The new position of the Camera.
     * @param {atlas.model.Rectangle} [args.rectangle] - The bounding box of the Camera.
     * @param {atlas.camera.Camera.Orientation} [args.orientation] - The new orientation of the
     *     Camera.
     * @param {Number} [args.duration=0] - The duration of the zoom animation in milliseconds.
     */
    zoomTo: function(args) {
      args = Setter.mixin({}, args);
      if (args.position === undefined && args.rectangle === undefined) {
        throw new DeveloperError('Can not move camera without specifying position');
      }
      // Use the setters which don't apply the animation to also sanitize inputs.
      this._setPosition(args.position);
      this._setOrientation(args.orientation || this._orientation);
      // Use the target position and orientation rather than the public methods which return the
      // actual current positions. Only provide them if they were already present in the args so
      // we don't use them unnecessarily.
      if (args.orientation) {
        args.orientation = this._orientation;
      }
      if (args.position) {
        args.position = this._position;
      }
      this._animate(args);
    },

    /**
     * Moves the camera to the given address.
     * @param {String} address
     */
    zoomToAddress: function(address) {
      // TODO(aramk) Add "address" as a possible input to zoomTo() and delegate it to this method.
      // Make this method private.
      Geocoder.getInstance().getInfo({address: address}).then(function(result) {
        this.zoomTo({position: result.position});
      }.bind(this), function() {
        Log.warn('Could not zoom to address - no results', address);
      });
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

    getDefaultPosition: function() {
      return new GeoPoint({longitude: 144, latitude: -37, elevation: 20000});
    },

    getDefaultOrientation: function() {
      return {tilt: -90, bearing: 0, rotation: 0};
    },

    /**
     * The type of path to animate when moving the camera.
     * @typedef {Object} atlas.camera.PathType
     */
    PathType: {
      LINEAR: 'linear',
      SINUSOIDAL: 'sinusoidal'
    }

  });

  /**
   * @typedef {Object} atlas.camera.Camera.Orientation
   * @property {Number} [tilt=-90] - The tilt (or pitch) about the Camera's
   * transverse axis (across the latitude) in decimal degrees in the range [-90, 90].
   * At -90 degrees the Camera is facing the earth, at 90 degrees it is facing the opposite way
   * and at 0 degrees it is facing the horizon.
   * @property {Number} [bearing=0] - The bearing (or yaw) about the normal axis (across the
   * longitude) from the surface to the camera in decimal degrees in the range [-180, 180].
   * At 0 degrees the Camera is facing the earth, at -90 degrees it is facing west, at 90
   * degrees it is facing east, and at 180/-180 it is facing away from the earth.
   * @property {Number} [rotation=0] - The rotation (or roll) about the orientation
   * vector of the Camera in decimal degrees in the range [-180, 180].
   */

  return Camera;
});
