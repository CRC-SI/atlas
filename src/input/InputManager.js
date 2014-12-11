define([
  'atlas/core/Manager',
  'atlas/events/Event',
  'atlas/lib/keycode'
], function(Manager, Event, Keycode) {

  /**
   * @typedef {Object} InternalEvent#InputEvent
   * @property {String} name - The name of the Atlas event.
   * @property {String} button - The name of the button (left, middle or right).
   * @property {Object.<String, Boolean>} modifiers - Boolean flags for control keys that were
   *     pressed when the event occurred.
   * @property {Boolean} modifiers.shift - Whether the Shift key was pressed.
   * @property {Boolean} modifiers.meta - Whether the Meta key was pressed.
   * @property {Boolean} modifiers.alt - Whether the Alt key was pressed.
   * @property {Boolean} modifiers.ctrl - Whether the Ctrl key was pressed.
   * @property {String} absPosition - Absolute mouse position in the browser winder.
   * @property {String} position - Mouse position relative to the top-left corner of the Atlas
   *     DOM element.
   * @property {Object.<String, Number>} movement - The change in the mouse's position since the
   *     last event.
   * @property {Number} movement.cx - The change in the mouse's X position.
   * @property {Number} movement.cx - The change in the mouse's Y position.
   */

  /**
   * @typedef atlas.input.InputManager
   * @ignore
   */
  var InputManager;

  /**
   * @classdesc The InputManager is used to link user input events to the
   * Atlas event system.
   * @param {Object} managers - The map of all atlas manager objects.
   * @class atlas.input.InputManager
   */
  InputManager = Manager.extend(/** @lends atlas.input.InputManager# */ {

    _id: 'input',

    /**
     * The current DOM element the InputManager is bound to.
     * @type {HTMLElement}
     * @protected
     */
    _element: null,

    /**
     * An array of event handlers attached to Atlas' dom element.
     * @type {Array.<Object>}
     */
    _mouseHandlers: null,

    /**
     * The last client X coord of the mouse.
     * @type {number}
     * @private
     */
    __lastX: 0,

    /**
     * The last client Y coord of the mouse.
     * @type {number}
     * @private
     */
    __lastY: 0,

    _init: function(managers) {
      this._super(managers);
      this.__lastX = this.__lastY = 0;

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
     *
     * @fires InternalEvent#input/leftdown
     * @fires InternalEvent#input/leftup
     * @fires InternalEvent#input/middledown
     * @fires InternalEvent#input/middleup
     * @fires InternalEvent#input/rightdown
     * @fires InternalEvent#input/rightup
     * @fires InternalEvent#input/mousemove
     * @fires InternalEvent#input/left/dblclick
     */
    createHtmlMouseBindings: function() {
      // Buttons to add event handlers for.
      var buttonIds = ['left', 'middle', 'right'];
      var eventManager = this._managers.event;

      /**
       * The left mouse button was pressed.
       * @event InternalEvent#input/leftdown
       * @type {InputEvent}
       */
      /**
       *
       * The left mouse button was unpressed.
       * @event InternalEvent#input/leftup
       * @type {InputEvent}
       */
      /**
       * The middle mouse button was pressed.
       * @event InternalEvent#input/middledown
       * @type {InputEvent}
       */
      /**
       * The middle mouse button was unpressed.
       * @event InternalEvent#input/middleup
       * @type {InputEvent}
       */
      /**
       * The right mouse button was pressed.
       * @event InternalEvent#input/rightdown
       * @type {InputEvent}
       */
      /**
       * The right mouse button was unpressed.
       * @event InternalEvent#input/rightup
       * @type {InputEvent}
       */
      /**
       * The mouse was moved.
       * @event InternalEvent#input/mousemove
       * @type {InputEvent}
       */
      /**
       * The left mouse button was double-clicked.
       * @event InternalEvent#input/left/dblclick
       * @type {InputEvent}
       */

      /**
       * Helper function to construct the arguments for Atlas mouse events.
       * @param {String} name - The name of the Atlas event.
       * @param {Event} e - The DOM event.
       * @returns {Object}
       */
      var makeMouseEventArgs = function(name, e) {
        var absPosition = {x: e.clientX, y: e.clientY};
        var relPosition = this._managers.dom.translateEventCoords(absPosition),
            x = relPosition.x,
            y = relPosition.y;
        var args = {
          name: 'input/' + name,
          button: buttonIds[e.button],
          modifiers: {},
          absPosition: absPosition,
          position: relPosition,
          movement: {dx: x - this.__lastX, dy: y - this.__lastY}
        };
        e.shiftKey && (args.modifiers.shift = true);
        e.metaKey && (args.modifiers.meta = true);
        e.altKey && (args.modifiers.alt = true);
        e.ctrlKey && (args.modifiers.ctrl = true);
        return args;
      }.bind(this);

      /**
       * Helper function to construct an Atlas mouse event.
       * @param {String} name - The name of the Atlas event.
       * @param {Event} e - The DOM event.
       * @returns {atlas.event.Event}
       */
      var makeMouseEvent = function(name, e) {
        var args = makeMouseEventArgs(name, e);
        return new Event(null, args.name, args);
      };

      // -------------------------------------------
      // Construct mouse event handlers
      // -------------------------------------------
      var /** atlas.event.Event*/ event, press;

      // Mouse button down
      this._mouseHandlers.push({
        name: 'mousedown',
        cback: function(e) {
          event = makeMouseEvent(buttonIds[e.button] + 'down', e);
          this.__lastX = event.position.x;
          this.__lastY = event.position.y;
          eventManager.dispatchEvent(event);
        }
      });

      // Mouse button up
      this._mouseHandlers.push({
        name: 'mouseup',
        cback: function(e) {
          event = makeMouseEvent(buttonIds[e.button] + 'up', e);
          if (Math.abs(event.movement.dx + event.movement.dy) < InputManager.CLICK_SENSITIVITY) {
            // If mouse moved less than the sensitivity, also emit a click event.
            var args = makeMouseEventArgs('input/' + buttonIds[e.button] + 'click', e);
            eventManager.dispatchEvent(new Event(null, args.name, args));
          }
          eventManager.dispatchEvent(event);
        }
      });

      // Mouse move handler
      this._mouseHandlers.push({
        name: 'mousemove',
        cback: function(e) {
          eventManager.dispatchEvent(makeMouseEvent('mousemove', e));
        }
      });

      // Double click handler
      this._mouseHandlers.push({
        name: 'dblclick',
        cback: function(e) {
          // TODO(bpstudds): This will convert all double click events to left dbl click.
          eventManager.dispatchEvent(makeMouseEvent('left/dblclick', e));
        }
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
        }.bind(this._managers.event), false);
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
