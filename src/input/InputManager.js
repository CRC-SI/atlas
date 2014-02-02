define([
  'atlas/util/Class',
  'atlas/util/mixin',
  'atlas/lib/keycode'
], function (
  Class,
  mixin,
  Keycode) {

  /**
   * @classdesc The InputManager is used to link user input events to the
   * Atlas  event system.
   * @author Brendan Studds
   *
   * @param {Object} atlasManagers - The map of all atlas manager objects.
   *
   * @class atlas.input.InputManager
   */
  var InputManager = mixin(Class.extend({

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

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.input = this;
    },

    /**
     * Completes all initialisation that requires other Atlas managers.
     * @param {String|HTMLElement} elem - The DOM ID or DOM element of the HTML element to receive events from.
     */
    setup: function (elem) {
      // TODO(bpstudds): Pretty sure InputManager should respond to an 'dom/set' event, rather than be imperative.
      this._element = typeof elem === 'string' ? document.getElementById(elem) : elem;
      //this.createHtmlMouseBindings();
      //this.createHtmlKeyboardBindings();
    },

    /**
     * Creates bindings in the Atlas event system to HTML DOM mouse events.
     */
    createHtmlMouseBindings:  function () {
      // Buttons to add event handlers for.
      var buttonIds = ['left', 'middle', 'right'];

      // DRY constructing the event handler arguments.
      var makeArgs = function (name, e) {
        var args = {
          name: 'input/' + name,
          button: buttonIds[e.button],
          modifiers: [],
          position: { x: e.screenX, y: e.screenY },
          movement: { cx: e.movementX, cy: e.movementY }
        };
        e.shiftKey && args.modifiers.push('shift');
        e.metaKey && args.modifiers.push('meta');
        e.altKey && args.modifiers.push('alt');
        e.ctrlKey && args.modifiers.push('ctrl');
        return args;
      };

      // Construct HTML DOM mouse event listeners.
      this._mouseHandlers = [];
      ['down', 'up'].forEach(function (press) {
        this._mouseHandlers.push({
          name: 'mouse' + press,
          cback: function (e) {
            var args = makeArgs(buttonIds[e.button] + press, e);
            console.debug('event', args.name, 'occured');
            this.handleInternalEvent(args.name, args);
          }.bind(this._atlasManagers.event)
        });
      }, this);

      // TODO(bpstudds): DRY this code up.
      this._mouseHandlers.push({
        name: 'mousemove',
        cback: function (e) {
          var args = makeArgs('mousemove', e);
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
    createHtmlKeyboardBindings:  function () {
      // TODO(bpstudds): Provide cleaner API for accessing the DOM element.
      // TODO(bpstudds): Create Event for (eg) dom/attached and have this bind to that.
      var domEventNames = ['keydown', 'keypress', 'keyup'];
      domEventNames.forEach(function (name) {
        var thisEvent = 'input/' + name;
        this._element.addEventListener(name, function (e) {
          var translatedKey = Keycode.translate_event(e);
          var args = {
            'name': thisEvent,
            'key': translatedKey.code,
            'modifiers': []
          };
          e.shiftKey && args.modifiers.push('shift');
          e.metaKey && args.modifiers.push('meta');
          e.altKey && args.modifiers.push('alt');
          e.ctrlKey && args.modifiers.push('ctrl');
          console.debug('event', args.name, 'occured');
          this.handleInternalEvent(args.name, args);
        }.bind(this._atlasManagers.event), false);
      }, this);
    }
  }), // End class instances definition.

//////
// STATICS
    {
      // Nope
    }

  ); // End class static definition.

  return InputManager;
});
