define([
], function () {
  // summary:
  //      Event, like a regular DOM event, is a simple object that
  //      encapsulates the information relevant to the event that occurred

  Event = function(/*EventTarget*/ target, /*String*/ type, /*Object?*/ args) {
    // target: Entity
    //      Current target of this event.
    // type: String
    //      Type of this event.
    // args: Object
    //      Optional event specific arguments or data.
    if (!target || !type) {
      throw 'Event must have target and type.';
    }
    this.target = target;
    this.type = type;
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

