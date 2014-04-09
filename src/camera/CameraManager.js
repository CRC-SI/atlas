define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/camera/Camera',
  'atlas/model/GeoPoint',
  'atlas/lib/utility/Log'
], function (Class, DeveloperError, defaultValue, mixin, Camera, GeoPoint, Log) {

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
  var CameraManager = Class.extend( /** @lends atlas.camera.CameraManager# */ {
    /**
     * The current Camera.
     * @type atlas.camera.Camera
     */
    _current: null,

    /**
     * List of currently saved Bookmarks.
     * @type Object
     */
    _bookmarks: null,

    _init: function (atlasManagers, options) {
      this._options = mixin({
        forceCustomControl: true
      }, options);

      this._atlasManagers = atlasManagers;
      this._atlasManagers.camera = this;
    },

    /**
     * Used to set up parts of the CameraManager that require other Atlas managers to already
     * be created.
     */
    setup: function () {
      this._bindEvents();
      // TODO(bpstudds): Properly override (Cesium) camera controls.
      //this._options.forceCustomControl && this._bindControlEvents();
    },

    // Binds event handlers with the Event Manager
    _bindEvents: function () {
      var handlers = [
        {
          source: 'extern',
          name: 'camera/zoomTo',
          callback: function (args) {
            if (this._camera === null) {
              this._camera = new Camera();
            }

            this._camera.zoomTo({
              position: new GeoPoint(args.position),
              orientation: args.orientation,
              duration: args.duration
            });
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'camera/current',
          callback: function (args) {
            var camera = this._camera;
            var stats = {
              position: camera.getPosition(),
              orientation: camera.getOrientation(),
              direction: camera.getDirection()
            };
            args.callback(stats);
          }.bind(this)
        }
      ];
      this._atlasManagers.event.addEventHandlers(handlers);
    },

    _bindControlEvents: function () {
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
    },

    getCameraMetrics: function () {
      return {
        position: this._current._position,
        orientation: this._current._orientation
      };
    },

    _updateControl: function (event) {
      var pos = event.pos
      this._control = this._control || {};

      if (this._atlasManagers.entity.getAt(pos).length > 0) { return; }

      this._control.inControl = true;
      this._control.action = event.button;
      Log.debug('CameraManager', 'updating control', this._control.action);
      this._control.curPos = pos;
      this._camera.inputHandlers[this._control.action] && this._camera.inputHandlers[this._control.action](event);
    },

    _stopControl: function (event) {
      if (this._control && this._control.inControl) {
        Log.debug('CameraManager', 'stop control', this._control.action);
        this._control.inControl = false;
        this._camera.inputHandlers[this._control.action](event);
      }
    },

    createBookmark: function () {
      var bookmark = {
        id: this._bookmarks.length,
        camera: this.getCameraMetrics
      };
      Log.debug('Created bookmark ' + id);
      this._bookmarks.push(bookmark);
      return bookmark;
    },

    removeBookmark: function () {
      throw new DeveloperError('CameraManager.removeBookmark not yet implemented.');
    },

    gotoBookmark: function (id) {
      if (!this._bookmarks[id]) {
        Log.debug('Tried to go to non-existent bookmark ' + id);
        return;
      }
      this._current.zoomTo(mixin({duration: 0}, this._bookmarks[id]));
    },

    lockCamera: function () {},

    unlockCamera: function () {}
  });

  return CameraManager;
});
