define([
  './EventManager'
], function (EventManager) {
  // summary:
  //      EventTarget is a mixin class that provides an object with the ability to dispatch and 
  //      listen to events. This implementation is closer to dojo/on than the DOM Event model.

  var EventTarget = function() {
    // eventHandlers: Object
    //      Maps an EventListenerID to a tuple containing the Event type and 
    //      the event handling callback.
    this.eventHandlers = {};

    // nextEventListenerId: integer
    //      Each EventListener needs a unique ID. These are determined from this counter.
    this.nextEventListenerId = 0;

    // parent: EventTarget
    //      The parent object of this EventTarget.
    this.parent = null;
  };

  EventTarget.prototype.dispatchEvent = function(event) {
    // summary:
    //      Notify the EventManager that an event has been emitted. The EventManager
    //      then handles bubbling of the event.
    EventManager.dispatchEvent(event);
  };

  EventTarget.prototype.addEventListener = function(type, callback) {
    // summary:
    //      Allow an object to register to events emitted from this EventTarget.
    // type: String
    //      The type of Event being registered to.
    // callback: function(Event)
    //      A callback function to be called when the event occurs.
    // returns:
    //      An EventListener object used to de-register the EventListener from
    //      the EventTarget.

    // Use closure in place of lang.hitch for the cancel() function.
    var listener = {
      id: 'id' + this.nextEventListenerId,
      cancel: function(target, id) {
        return function() {
          target.removeEventListener(id);
        };
      }(this, 'id' + this.nextEventListenerId)
    };
    // Add the EventListener to the eventHandlers map.
    this.eventHandlers[listener.id] = {
      type: type,
      callback: callback.bind(this)
    };
    this.nextEventListenerId++;
    return listener;
  };


  EventTarget.prototype.removeEventListener = function(id) {
    // summary:
    //      Removes the identified event listerner from the EventTarget.
    // id: integer
    //      ID of EventListener to remove (ID assigned at EventListener creation).
    delete this.eventHandlers[id];
  };


  EventTarget.prototype.handleEvent = function(event) {
    // summary:
    //      Handle any events that bubble up to this EventTarget.
    // event: Event
    //      The Event that is to be handled.

    for (var id in this.eventHandlers) {
      if (this.eventHandlers.hasOwnProperty(id)) {
        if (this.eventHandlers[id].type == event.type) {
          event = this.eventHandlers[id].callback(event) || event;
        }
      }
    }

    return event;
  };

  return EventTarget;
});
