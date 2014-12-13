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
     * The target that triggered this event.
     * @type {atlas.model.EventTarget}
     */
    _target: null,

    /**
     * The current target of this event. When the event is bubbling up, this becomes the parent at
     * the current level.
     * @type {atlas.model.EventTarget}
     */
    _currentTarget: null,

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
     * Whether this event has been cancelled. Cancelled events can still be listened to, but will
     * not bubble up the hierarchy.
     * @type {Boolean}
     * @private
     */
    _isCancelled: false,

    _init: function(target, type, args) {
      this.setTarget(target);
      this.setCurrentTarget(target);
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

    setCurrentTarget: function(target) {
      if (target && !(target instanceof EventTarget)) {
        // TODO(aramk) We could also make this more lenient and check for existence of properties.
        throw new DeveloperError('Event target must be instance of EventTarget');
      }
      this._currentTarget = target;
    },

    getCurrentTarget: function() {
      return this._currentTarget;
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

    getArgs: function() {
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
      var event = new Event(this.getTarget(), this.getType(), this.getArgs());
      event.setCurrentTarget(this.getCurrentTarget());
      return event;
    }

  });

  return Event;
});

