define([
  'atlas/util/Class',
  'atlas/util/mixin',
  'atlas/lib/keycode'
], function(Class, mixin, Keycode) {

  /**
   * @typedef atlas.input.InputManager
   * @ignore
   */
  var InputManager;

  /**
   * @classdesc The InputManager is used to link user input events to the
   * Atlas event system.
   * @param {Object} atlasManagers - The map of all atlas manager objects.
   * @class atlas.input.InputManager
   */
  InputManager = Class.extend( /** @lends atlas.input.InputManager# */ {

    /**
     * The current DOM element the InputManager is bound to.
     * @type {HTMLElement}
     * @protected
     */
    _element: null,

    /**
     * The map of Atlas manager name to the current manager instance.
     * @{Object}
     * @protected
     */
    _atlasManagers: null,

    /**
     * An array of event handlers attached to Atlas' dom element.
     * @type {Array.<Object>}
     */
    _mouseHandlers: null,

    _init: function(atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.input = this;

      this._mouseHandlers = [];
    },

    /**
     * Completes all initialisation that requires other Atlas managers.
     * @param {String|HTMLElement} elem - The DOM ID or DOM element of the HTML element to receive events from.
     */
    setup: function(elem) {
      // TODO(bpstudds): Pretty sure InputManager should respond to an 'dom/set' event, rather than be imperative.
      this._element = typeof elem === 'string' ? document.getElementById(elem) : elem;
    },

    /**
     * Creates bindings in the Atlas event system to HTML DOM mouse events.
     */
    createHtmlMouseBindings: function() {
      // Buttons to add event handlers for.
      var buttonIds = ['left', 'middle', 'right'];

      // DRY constructing the event handler arguments.
      var makeArgs = function(name, e) {
        var args = {
          name: 'input/' + name,
          button: buttonIds[e.button],
          modifiers: {},
          position: { x: e.clientX, y: e.clientY },
          movement: { cx: e.movementX, cy: e.movementY }
        };
        e.shiftKey && (args.modifiers.shift = true);
        e.metaKey && (args.modifiers.meta = true);
        e.altKey && (args.modifiers.alt = true);
        e.ctrlKey && (args.modifiers.ctrl = true);
        return args;
      }.bind(this);

      // Construct HTML DOM mouse event listeners.
      // Mouse button down
      this._mouseHandlers.push({
        name: 'mousedown',
        cback: function(e) {
          var args = makeArgs(buttonIds[e.button] + 'down', e);
          this.handleInternalEvent(args.name, args);
        }.bind(this._atlasManagers.event)
      });

      // Mouse button up
      this._mouseHandlers.push({
        name: 'mouseup',
        cback: function(e) {
          var press = 'up',  // default to buttonUp
              args;
          if (e.movementX + e.movementY < InputManager.CLICK_SENSITIVITY) {
            press = 'click';
          }
          args = makeArgs(buttonIds[e.button] + 'up', e);
          this.handleInternalEvent(args.name, args);
        }.bind(this._atlasManagers.event)
      });

      // TODO(bpstudds): DRY this code up.
      this._mouseHandlers.push({
        name: 'mousemove',
        cback: function (e) {
          var args = makeArgs('mousemove', e);
          this.handleInternalEvent(args.name, args);
        }.bind(this._atlasManagers.event)
      });

      this._mouseHandlers.push({
        name: 'dblclick',
        cback: function (e) {
          var args = makeArgs('left/dblclick', e);
          this.handleInternalEvent(args.name, args);
        }.bind(this._atlasManagers.event)
      });

      // Add the event listeners to the current DOM element.
      this._mouseHandlers.forEach(function(handler) {
        this.addEventListener(handler.name, handler.cback);
      }, this._element);
    },

    /**
     * Creates bindings in the Atlas event system to HTML DOM keyboard events.
     */
    createHtmlKeyboardBindings: function() {
      // TODO(bpstudds): Provide cleaner API for accessing the DOM element.
      // TODO(bpstudds): Create Event for (eg) dom/attached and have this bind to that.
      var domEventNames = ['keydown', 'keypress', 'keyup'];
      domEventNames.forEach(function(name) {
        var thisEvent = 'input/' + name;
        document.addEventListener(name, function(e) {
          var translatedKey = Keycode.translate_event(e);
          var args = {
            'name': thisEvent,
            'key': translatedKey.code,
            'modifiers': {}
          };
          e.shiftKey && (args.modifiers.shift = true);
          e.metaKey && (args.modifiers.meta = true);
          e.altKey && (args.modifiers.alt = true);
          e.ctrlKey && (args.modifiers.ctrl = true);
          this.handleInternalEvent(args.name, args);
        }.bind(this._atlasManagers.event), false);
      }, this);
    }
  });

  /**
   * Maximum distance the mouse can move between buttonDown and buttonUp and
   * still be registered as a 'click'.
   * @type {number}
   * @static
   */
  InputManager.CLICK_SENSITIVITY = 3;

  return InputManager;
});
