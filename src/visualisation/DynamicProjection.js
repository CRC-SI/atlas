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
    _static: null,

    /**
     * The indexed, dynamic data to be rendered.
     * @type {Array.<Object.<Number, Object>>}  // [{index: mapOfEntityToValue}]
     * @protected
     */
    _data: null,

    /**
     * The current state of the render. One of 'playing', 'paused', or 'stopped'.
     * @type {String}
     * @protected
     */
    _state: null,

    /**
     * The number of frames to render per second (FPS).
     * @type {Number}
     * @protected
     */
    _fps: null,

    /**
     * NOT USED
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
      this._static = staticPrj;
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

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Signals the DynamicRender to start or resume rendering.
     */
    start: function() {
      if (this._state === 'playing') { return; }

      // Initialise the index to render from and cache the initial state of the renderer.
      if (this._state === 'ended') {
        this._index = this._data[0].index;
        this._initial = this._static.getPreviousState();
      }
      // Either start or resume rendering.
      this._render();
    },

    /**
     * Signals the DynamicRender to pause rendering. The effects of the current frame will
     * be preserved.
     */
    pause: function() {
      if (this._state !== 'playing') { return; }
      clearInterval(this._interval);
      this._state = 'paused';
    },

    /**
     * Signals the DynamicRender to stop rendering, The effects of the current frame will
     * be removed and the state of the render returned to what it was before the dynamic rendering
     * occurred.
     */
    stop: function() {
      if (this._state === 'stopped') { return; }
      this._state = 'stopped';
      clearInterval(this._interval);
      this._static.setPreviousState(this._initial);
      this._static.unrender();
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Function that encapsulates the rendering loop.
     * @private
     */
    _render: function() {
      this._state = 'playing';
      console.debug('starting render at index', this._index);

      // Use window timeout for the rendering loop.
      // TODO(bpstudds): Are there more efficient ways to do the rendering
      this._interval = setInterval( function () {
        // Render first because quicker?
        // Get the values to use for the next render. this._index is preset as appropriate by
        // start(). If there are no values, pause the projection
        var values = this._getValuesForIndex(this._index);
        if (!values) {
          this.pause();
          // Override state set by pause() as the renderer can't be restarted.
          this._state = 'ended';
          return;
        }
        this._static.update({values: values});
        this._static.render();
        this._index += this._delta;
      }.bind(this), 1000 / this._fps);
    }

  });

  return DynamicProjection;
});
