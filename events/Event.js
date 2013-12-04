define([
  'atlas/util/DeveloperError'
], function (DeveloperError) {
  "use strict";
  // summary:
  //      Event, like a regular DOM event, is a simple object that
  //      encapsulates the information relevant to the event that occurred

  Event = function(/*EventTarget*/ target, /*String*/ type, /*Object?*/ args) {
    if (typeof target === 'undefined' || typeof type === 'undefined') {
      throw new DeveloperError('Can not create Event: Event must have both target and type.');
    }
    // target: Entity
    //      Current target of this event.
    this.target = target;

    // type: String
    //      Type of this event.
    this.type = type;

    // args: Object
    //      Optional event specific arguments or data.
    this.args = args;
  };

  Event.prototype.cancel = function(/*Boolean?*/ cancelHost) {
    // summary:
    //      Prevents the Event from being handled by any more EventTargets (combination
    //      of preventDefault and stopPropagation from DOM event model).
    // cancelHost: Boolean?
    //      If true, the EventManager will not propagate this Event to the host application.
    //      Set to False by default.
    this.cancelHost = this.cancelHost || cancelHost;
    this.cancelled = true;
  };
  
  return Event;
});

