define([
  'atlas/events/EventTarget',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError'
], function(EventTarget, Class, DeveloperError) {

  /**
   * @typedef atlas.events.Event
   * @ignore
   */
  var Event;

  /**
   * Event, like a regular DOM event, is a simple object that
   * encapsulates the information relevant to the event that occurred.
   *
   * @param {atlas.events.EventTarget} target - The target of the Event.
   * @param {string} type - The type of the Event.
   * @param {Object} [args] - Arguments relevant to the Event.
   *
   * @class atlas.events.Event
   * @constructor
   */
  Event = Class.extend({

    /**
     * Current target of this event.
     * @type {atlas.model.EventTarget}
     */
    _target: null,

    /**
     * Type of this event.
     * @type {string}
     * @private
     */
    _type: null,

    /**
     * Optional event specific arguments or data.
     * @type {Object}
     * @private
     */
    _args: null,

    /**
     * Whether this event has been cancelled.
     * @type {Boolean}
     * @private
     */
    _isCancelled: false,

    _init: function(target, type, args) {
      this.setTarget(target);
      this.setType(type);
      this.setArgs(args);
    },

    setTarget: function(target) {
      if (target && !(target instanceof EventTarget)) {
        // TODO(aramk) We could also make this more lenient and check for existence of properties.
        throw new DeveloperError('Event target must be instance of EventTarget');
      }
      this._target = target;
    },

    getTarget: function() {
      return this._target;
    },

    setType: function(type) {
      if (type === undefined) {
        throw new DeveloperError('Can not create Event: Event must type.');
      }
      this._type = type;
    },

    getType: function() {
      return this._type;
    },

    setArgs: function(args) {
      this._args = args;
    },

    getArgs: function () {
      return this._args;
    },

    /**
     * Prevents the Event from being handled by any more EventTargets (a combination
     * of preventDefault and stopPropagation from the DOM event model).
     * @param {boolean} [cancelHost=false] - If true, the EventManager will not propagate this Event to the host application.
     */
    cancel: function(cancelHost) {
      this._cancelHost = this._cancelHost || cancelHost;
      this._isCancelled = true;
    },

    /**
     * @returns {Boolean} Whether this event has been cancelled.
     */
    isCancelled: function() {
      return this._isCancelled;
    },

    clone: function() {
      return new Event(this.getTarget(), this.getType(), this.getArgs());
    }

  });

  return Event;
});

