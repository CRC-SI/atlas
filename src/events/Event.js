define([
  'atlas/util/DeveloperError'
], function (DeveloperError) {
  "use strict";

  /**
   * Event, like a regular DOM event, is a simple object that
   * encapsulates the information relevant to the event that occurred.
   *
   * @param {atlas.events.EventTarget} target - The target of the Event.
   * @param {string} type - The type of the Event.
   * @param {Object} [args] - Arguments relevant to the Event.
   *
   * @alias atlas.events.Event
   * @constructor
   */
  var Event = function(target, type, args) {
    if (type === undefined) {
      throw new DeveloperError('Can not create Event: Event must type.');
    }

    /**
     * Current target of this event.
     * @type {atlas.model.EventTarget}
     */
    this.target = target;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = type;

    /**
     * Optional event specific arguments or data.
     * @type {Object}
     */
    this.args = args;
  };

  /**
   * Prevents the Event from being handled by any more EventTargets (a combination
   * of preventDefault and stopPropagation from the DOM event model).
   * @param {boolean} [cancelHost=false] - If true, the EventManager will not propagate this Event to the host application.
   */
  Event.prototype.cancel = function(cancelHost) {
    this.cancelHost = this.cancelHost || cancelHost;
    this.cancelled = true;
  };

  return Event;
});

