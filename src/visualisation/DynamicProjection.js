define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/mixin'
], function (Class, DeveloperError, mixin) {

  /**
   * Dynamic Rendering will use the existing Projection classes to provide the  ‘rendering’
   * part of Dynamic Rendering. The dynamic nature will be facilitated by the <code>DynamicRenderer</code>
   * that takes data in a specific format, basically consisting of a set of inputs for
   * a <code>*Projection</code> object indexed by some independent variable (typically time).
   * @author Brendan Studds
   *
   * @param {atlas.visualisation.AbstractProjection} static - The configured projection object to use.
   * @param {Object} data - The indexed, dynamic data to be rendered.
   */
  return DynamicProjection = Class.extend( /** @lends atlas.visualisation.DynamicProjection */ {

    /**
     * The (static) *Projection instance to use to render each frame of the dynamic projection.
     * @type {atlas.visualisation.AbstractProjection}
     * @protected
     */
    _projector: null,

    /**
     * The indexed, dynamic data to be rendered.
     * @type {Array.<Object.<Number, Object>>}
     * @protected
     */
    _data: null,

    /**
     * The current state of the render. One of 'playing', 'paused', 'stopped', or 'ended'.
     * @type {String}
     * @protected
     */
    _state: null,

    /**
     * The number of projection frames to render per second (FPS).
     * @type {Number}
     * @protected
     */
    _fps: null,

    /**
     * The change to apply to the index value between each successive frame.
     * @type {Number}
     * @protected
     */
    _delta: null,

    _init: function (staticPrj, data, args) {
      if (!staticPrj) {
        throw new DeveloperError('Static projection required to construct Dynamic projection.')
      }
      if (!data) {
        throw new DeveloperError('Data required to construct Dynamic projection.')
      }
      args = mixin({
        fps: 1,
        delta: 1
      }, args);
      this._projector = staticPrj;
      this._data = data;
      this._fps = args.fps;
      this._delta = args.delta;

      // Make sure data is sorted.
      for (var i = 1; i < data.length; i++) {
        if (this._data[i].index > this._data[i - 1].index) {
          this._data.sort(function (a, b) {
            return a.index > b.index;
          });
          break;
        }
      }
      this._state = 'ended';
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {'String'} The status of the renderer.
     */
    getStatus: function () {
      return this._state;
    },

    _getValuesForIndex: function (index) {
      index = Math.floor(index);
      return this._data[index].values;
      // TODO(bpstudds): Support interpolation of the data.
      var previousIndex, nextIndex;
      for (var i = 0; i < this._data.length; i++) {
        previousIndex = this._data[i].index;
        nextIndex = this._data[i + 1].index;
        if (previousIndex <= index && index < nextIndex) {
          return this._data[i].values;
        }
      }
      throw null;
    },

    /**
     * Sets the number of frames to be rendered per second.
     * @param {Number} fps - Frames per second to rendered, must between 1 and 30fps.
     */
    setFps: function (fps) {
      if (fps >= 1 && fps < 30) {
        this._fps = fps;
      }
    },

    /**
     * Sets the delta to apply to the index between each frame.
     * @param {Number} delta - The per frame delta of the index.
     */
    setDelta: function (delta) {
      this._delta = delta;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Signals the DynamicRender to start or resume rendering.
     */
    start: function () {
      if (this._state === 'playing') { return; }

      // Initialise the index to render from and cache the initial state of the renderer.
      if (this._state === 'ended') {
        this._index = this._data[0].index;
        this._initial = this._projector.getPreviousState();
      }
      // Either start or resume rendering.
      this._render();
    },

    /**
     * Signals the DynamicRender to pause rendering. The effects of the current frame will
     * be preserved.
     */
    pause: function () {
      if (this._state !== 'playing') { return; }
      clearInterval(this._interval);
      this._state = 'paused';
    },

    /**
     * Signals the DynamicRender to stop rendering, The effects of the current frame will
     * be removed and the state of the render returned to what it was before the dynamic rendering
     * occurred.
     */
    stop: function () {
      if (this._state === 'stopped') { return; }
      this._state = 'stopped';
      clearInterval(this._interval);
      this._projector.setPreviousState(this._initial);
      this._projector.unrender();
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Encapsulates the rendering loop. Starts a window interval that every tick, increases
     * the <code>index</code>, retrieves/interpolates <code>values</code> for that tick based
     * on the <code>data</code>, and then uses the static <code>projector</code> to render those
     * data.
     * @private
     */
    _render: function () {
      this._state = 'playing';
      console.debug('starting render at index', this._index);

      // Use window timeout for the rendering loop.
      // TODO(bpstudds): Are there more efficient ways to do the rendering
      this._interval = setInterval( function () {
        // Get the values to use for the next render. this._index is preset as appropriate by
        // start(). If there are no values, pause the projection
        var values = this._getValuesForIndex(this._index);
        if (!values) {
          // TODO(bpstudds): Make restarting the render optional.
          if (this._restart = true) {
            this._index = this._data[0].index;
          } else {
            this.pause();
            // Override state set by pause() as the renderer can't be restarted.
            this._state = 'ended';
            return;
          }
        }
        this._projector.update({values: values});
        this._projector.render();
        this._index += this._delta;
      }.bind(this), 1000 / this._fps);
    }

  });

  return DynamicProjection;
});
