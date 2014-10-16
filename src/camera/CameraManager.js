define([
  'atlas/camera/Camera',
  'atlas/core/Manager',
  'atlas/model/GeoPoint',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/util/DeveloperError'
], function(Camera, Manager, GeoPoint, Log, Setter, DeveloperError) {

  /**
   * @typedef atlas.camera.CameraManager
   * @ignore
   */
  var CameraManager;

  /**
   * @classdesc The CameraManager manages the current camera and exposes a API for creating
   * and removing 'Bookmarks' which contain a snapshot of a Camera position and orientation.
   * The Camera manager also links the current Camera object to the Atlas event system.
   *
   * @param {Object} managers - A mapping of Atlas manager types to the Manager instance.
   * @param {Object} [options] - Options to control the CameraManager's behaviour.
   *
   * @class atlas.camera.CameraManager
   * @extends atlas.core.Manager
   */
  CameraManager = Manager.extend(/** @lends atlas.camera.CameraManager# */ {

    _id: 'camera',

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

    _init: function(managers, options) {
      this._super(managers);
      this._options = Setter.mixin({
        forceCustomControl: true
      }, options);
    },

    /**
     * Used to set up parts of the CameraManager that require other Atlas managers to already
     * be created.
     */
    setup: function() {
      this._current = new Camera({renderManager: this._managers.render});
      this._bindEvents();
      // TODO(bpstudds): Properly override (Cesium) camera controls.
      //this._options.forceCustomControl && this._bindControlEvents();
    },

    // Binds event handlers with the Event Manager
    _bindEvents: function() {
      var handlers = [
        {
          source: 'extern',
          name: 'camera/zoomTo',
          callback: function(args) {
            if (args.position) {
              args.position = new GeoPoint(args.position);
              this._current.zoomTo(args);
            } else if (args.address) {
              this._current.zoomToAddress(args.address);
            } else {
              return new Error('Invalid arguments for event "camera/zoomTo"');
            }
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'camera/current',
          callback: function(args) {
            args.callback(this._current);
          }.bind(this)
        }
      ];
      this._managers.event.addEventHandlers(handlers);
    },

    _bindControlEvents: function() {
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
      this._managers.event.addEventHandlers(handlers);
    },

    getCurrentCamera: function () {
      return this._current;
    },

    // TODO(aramk) This might be superseded by getStats() on Camera.
    getCameraMetrics: function() {
      return {
        position: this._current._position,
        orientation: this._current._orientation
      };
    },

    _updateControl: function(event) {
      var pos = event.pos
      this._control = this._control || {};

      if (this._managers.entity.getAt(pos).length > 0) {
        return;
      }

      this._control.inControl = true;
      this._control.action = event.button;
      Log.debug('CameraManager', 'updating control', this._control.action);
      this._control.curPos = pos;
      var handler = this._current.inputHandlers[this._control.action];
      handler && handler(event);
    },

    _stopControl: function(event) {
      if (this._control && this._control.inControl) {
        Log.debug('CameraManager', 'stop control', this._control.action);
        this._control.inControl = false;
        this._current.inputHandlers[this._control.action](event);
      }
    },

    createBookmark: function() {
      var bookmark = {
        id: this._bookmarks.length,
        camera: this.getCameraMetrics
      };
      Log.debug('Created bookmark ' + id);
      this._bookmarks.push(bookmark);
      return bookmark;
    },

    removeBookmark: function() {
      throw new DeveloperError('CameraManager.removeBookmark not yet implemented.');
    },

    gotoBookmark: function(id) {
      if (!this._bookmarks[id]) {
        Log.debug('Tried to go to non-existent bookmark ' + id);
        return;
      }
      this._current.zoomTo(Setter.mixin({duration: 0}, this._bookmarks[id]));
    },

    lockCamera: function() {
    },

    unlockCamera: function() {
    }
  });

  return CameraManager;
});
