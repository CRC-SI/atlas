define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/camera/Camera'
], function (DeveloperError, defaultValue, Camera) {

  /**
   * Constructs a new CameraManager object.
   * @class The CameraManager manages the current camera and exposes a API for creating
   * and removing 'Bookmarks' which contain a snapshot of a Camera position and orientation.
   * The Camera manager also links the current Camera object to the Atlas event system.
   *
   * @param {Object} atlasManagers - A mapping of Atlas manager types to the Manager instance.
   *
   * @alias atlas/camera/CameraManager
   * @constructor
   */
  var CameraManager = function (atlasManagers) {
    this._atlasManagers = atlasManagers;
    this._atlasManagers.camera = this;

    /**
     * The current Camera.
     * @type atlas/camera/Camera
     */
    this._current = null;

    /**
     * List of currently saved Bookmarks.
     * @type Object
     */
    this._bookmarks = null;
  };

  // Does initialisation work after it is guaranteed all managers are created.
  CameraManager.prototype.initialise = function () {
    this._bindEvents();
  };

  // Binds event handlers with the Event Manager
  CameraManager.prototype._bindEvents = function () {
    var handlers = [
      {
        source: 'extern',
        name: 'camera/zoomTo',
        callback: function (name, args) {
          if (this._camera === null) {
            this._camera = new Camera();
          }
          this._camera.zoomTo(args.position, args.orientation, args.duration);
        }.bind(this)
      }
    ];
    this._atlasManagers.event.addEventHandlers(handlers);
  };

  CameraManager.prototype.createBookmark = function () {
    throw new DeveloperError('CameraManager.createBookmark not yet implemented.');
  };

  CameraManager.prototype.removeBookmark = function () {
    throw new DeveloperError('CameraManager.removeBookmark not yet implemented.');
  };

  CameraManager.prototype.gotoBookmark = function () {
    throw new DeveloperError('CameraManager.gotoBookmark not yet implemented.');
  };

  CameraManager.prototype.lockCamera = function () {};

  CameraManager.prototype.unlockCamera = function () {};

  return CameraManager;
});
