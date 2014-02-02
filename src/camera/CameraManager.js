define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/camera/Camera'
], function (DeveloperError, defaultValue, mixin, Camera) {

  /**
   * Constructs a new CameraManager object.
   * @class The CameraManager manages the current camera and exposes a API for creating
   * and removing 'Bookmarks' which contain a snapshot of a Camera position and orientation.
   * The Camera manager also links the current Camera object to the Atlas event system.
   *
   * @param {Object} atlasManagers - A mapping of Atlas manager types to the Manager instance.
   * @param {Object} [options] - Options to control the CameraManager's behaviour.
   *
   * @alias atlas.camera.CameraManager
   * @constructor
   */
  var CameraManager = function (atlasManagers, options) {
    this._options = mixin({
      forceCustomControl: true
    }, options);

    this._atlasManagers = atlasManagers;
    this._atlasManagers.camera = this;

    /**
     * The current Camera.
     * @type atlas.camera.Camera
     */
    this._current = null;

    /**
     * List of currently saved Bookmarks.
     * @type Object
     */
    this._bookmarks = null;
  };

  /**
   * Used to set up parts of the CameraManager that require other Atlas managers to already
   * be created.
   */
  CameraManager.prototype.setup = function () {
    this._bindEvents();
    // TODO(bpstudds): Properly override (Cesium) camera controls.
    //this._options.forceCustomControl && this._bindControlEvents();
  };

  // Binds event handlers with the Event Manager
  CameraManager.prototype._bindEvents = function () {
    var handlers = [
      {
        source: 'extern',
        name: 'camera/zoomTo',
        callback: function (args) {
          if (this._camera === null) {
            this._camera = new Camera();
          }
          this._camera.zoomTo(args.position, args.orientation, args.duration);
        }.bind(this)
      }
    ];
    this._atlasManagers.event.addEventHandlers(handlers);
  };

  CameraManager.prototype._bindControlEvents = function () {
    var handlers = [
      {
        source: 'intern',
        name: 'input/leftdown',
        callback: this._updateControl.bind(this)
      },
      {
        source: 'intern',
        name: 'input/rightdown',
        callback: this._updateControl.bind(this)
      },
      {
        source: 'intern',
        name: 'input/middledown',
        callback: this._updateControl.bind(this)
      },
      {
        source: 'intern',
        name: 'input/leftup',
        callback: this._stopControl.bind(this)
      },
      {
        source: 'intern',
        name: 'input/rightup',
        callback: this._stopControl.bind(this)
      },
      {
        source: 'intern',
        name: 'input/middleup',
        callback: this._stopControl.bind(this)
      }
    ];
    this._atlasManagers.event.addEventHandlers(handlers);
  };



  CameraManager.prototype._updateControl = function (event) {
    var pos = event.pos
    this._control = this._control || {};

    if (this._atlasManagers.entity.getAt(pos).length > 0) { return; }

    this._control.inControl = true;
    this._control.action = event.button;
    console.debug('CameraManager', 'updating control', this._control.action);
    this._control.curPos = pos;
    this._camera.inputHandlers[this._control.action] && this._camera.inputHandlers[this._control.action](event);
  };

  CameraManager.prototype._stopControl = function (event) {
    if (this._control && this._control.inControl) {
      console.debug('CameraManager', 'stop control', this._control.action);
      this._control.inControl = false;
      this._camera.inputHandlers[this._control.action](event);
    }
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
