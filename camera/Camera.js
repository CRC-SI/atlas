// Camera.js
define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/cesium/Vertex'
], function (DeveloperError, defaultValue, Vertex) {

  /**
   * Constructs a new Camera object.
   * @class The Camera object controls the position and orientation of the camera.
   * It exposes an API to set position and orientation, zoom to a given GeoEntity
   * or a bookmarked location, and to manual move the Camera.
   *
   * @param {atlas/model/Vertex} [position] - The initial position of the Camera.
   * @param {Number} [position.x=-37] - The initial latitude (on the Earth's surface) in decimal degrees in the range [-90, 90].
   * @param {Number} [position.y=144] - The initial longitude (on the Earth's surface) in decimal degrees in the range [-180, 180].
   * @param {Number} [position.z=20000] - The initial elevation above the Earth's surface.
   * @param {atlas/model/Vertex} [orientation] - The initial orientation of the Camera.
   * @param {Number} [orientation.x=0] - The tilt (or pitch) about the Camera's transverse axis in decimal degrees in the range [0, 180]. At 0 degrees the Camera is pointing at the point directly below it, at 180 degrees it is looking the opposite direction.
   * @param {Number} [orientation.y=0] - The bearing (or yaw) about the normal axis from the surface to the camera in decimal degrees in the range [0, 360]. At 0 (and 360) degrees the Camera is facing North, 90 degrees it is facing East, etc.
   * @param {Number} [orientation.z=0] - The rotation (or roll) about the orientation vector of the Camera in decimal degrees in the range [-180, 180].
   * @returns {atlas/camera/Camera}
   *
   * @alias atlas/camera/Camera
   * @constructor
   * @abstract
   */
  var Camera = function (position, orientation) {
    /*
     * The current position of the Camera
     * @type atlas/model/Vertex
     */
    this._position = defaultValue(position, new Vertex(-37, 144, 20000));

    /**
     * The current orientation of the Camera.
     * @type atlas/model/Vertex
     */
    this._orientation = defaultValue(orientaion, new Vertex(0, 0, 0));
  };

  /**
   * Internal function to handle the renderer specifics to change the Camera's
   * orientation and position.
   * This function should be called by the outwards facing API functions that convert
   * params to a concise format.
   * @param {Object} newCamera - Parameters required to move the Camera.
   * @param {atlas/model/Vertex} newCamera.position - The new position of the Camera.
   * @param {Number} newCamera.position.x - The latitude (on the Earth's surface) in decimal degrees in the range [-90, 90].
   * @param {Number} newCamera.position.y - The longitude (on the Earth's surface) in decimal degrees in the range [-180, 180].
   * @param {Number} newCamera.position.z - The elevation above the Earth's surface.
   * @param {atlas/model/Vertex} newCamera.orientation - The new orientation of the Camera.
   * @param {Number} newCamera.orientation.x - The tilt (or pitch) about the Camera's transverse axis in decimal degrees in the range [0, 180]. At 0 degrees the Camera is pointing at the point directly below it, at 180 degrees it is looking the opposite direction.
   * @param {Number} newCamera.orientation.y - The bearing (or yaw) about the normal axis from the surface to the camera in decimal degrees in the range [0, 360]. At 0 (and 360) degrees the Camera is facing North, 90 degrees it is facing East, etc.
   * @param {Number} newCamera.orientation.z - The rotation (or roll) about the orientation vector of the Camera in decimal degrees in the range [-180, 180].   * @param {atlas/model/Vertex} position - The new position.
   * @param {Number} newCamera.duration - The duration of the zoom animation in milliseconds.
   */
  Camera.prototype._animateCamera = function () {
    throw new DeveloperError('Can not call abstract method Camera._animateCamera');
  }

  /**
   * Moves the camera to the given location and sets the Camera's direction.
   * @param {atlas/model/Vertex} position - The new position of the Camera.
   * @param {Number} position.x=-37 - The latitude (on the Earth's surface) in decimal degrees in the range [-90, 90].
   * @param {Number} position.y=144 - The longitude (on the Earth's surface) in decimal degrees in the range [-180, 180].
   * @param {Number} position.z=20000 - The elevation above the Earth's surface.
   * @param {atlas/model/Vertex} [orientation] - The new orientation of the Camera.
   * @param {Number} [orientation.x=0] - The tilt (or pitch) about the Camera's transverse axis in decimal degrees in the range [0, 180]. At 0 degrees the Camera is pointing at the point directly below it, at 180 degrees it is looking the opposite direction.
   * @param {Number} [orientation.y=0] - The bearing (or yaw) about the normal axis from the surface to the camera in decimal degrees in the range [0, 360]. At 0 (and 360) degrees the Camera is facing North, 90 degrees it is facing East, etc.
   * @param {Number} [orientation.z=0] - The rotation (or roll) about the orientation vector of the Camera in decimal degrees in the range [-180, 180].
   * @param {Number} [duration=0] - The duration of the zoom animation in milliseconds.
   */
  Camera.prototype.zoomTo = function (position, orientation, duration) {
    if (position === undefined) {
      throw new DeveloperError('Can not move camera without specifying position');
    }
    var nextCamera = {
      position: position,
      orientation: defaultValue(orientation, new Vertex(0,0,0)),
      duration: defaultValue(duration, 0.0)
    };
    this.animateCamera(nextCamera);
  };

  /**
   * Turns the camera so it's orientation vector points at the given GeoEntities centroid.
   * @param {GeoEntity} geoEntity - The GeoEntity to face.
   */
  Camera.prototype.pointAt = function (geoEntity) {
    var newCamera = {
      position: this._position
    }
    throw new DeveloperError('Camera.pointAt not yet implemented.');
  };

  /**
   * Moves the camera to the given Bookmarked location.
   *
   */
  Camera.prototype.goTo = function () {
    throw new DeveloperError('Camera.goTo not yet implemented.');
  };

  /**
   * Immediately moves the Camera so it is facing downwards.
   * The rotation and bearing remain unchanged.
   */
  Camera.prototype.pointDown = function () {
    var newOrientation = {
      x: 0,
      y: this._orientation.y,
      z: this._orientation.z
    };
    this.zoomTo(this._position, newOrientation, 0);
  };

  //Camera.prototype.XYZ = function () {};

  return Camera;
});
