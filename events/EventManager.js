define([
  'atlas/util/DeveloperError'
], function (DeveloperError) {
  "use strict";

  // summary:
  //      EventManager is a responsible for bubbling internal
  //      events up through the internal event hierarchy, as well as out 
  //      to the host application.
  // atlasManagers: Object
  //      A map of manager types to actual manager objects. The map is maintained
  //      on the main Atlas facade object, but the instances are created by
  //      each manager object upon creation.
  var EventManager = function(atlasManagers) {

    // _atlasManagers: Object
    //      Contains a map of manager types to manager objects. This object
    //      exists on Atlas.
    this._atlasManagers = atlasManagers;
    this._atlasManagers.event = this;

    // _hosts: Object
    //      Mapping of a listener object id to the host application callback
    //      Hosts registered here receive every event that occurs.
    this._hosts = {};

    // _externalEvent_Handlers: Object
    //      Mapping of external events to a list of callback functions handling
    //      the external event.
    //      handling that EventType.
    this._externalEvent_Handlers = {};


    // _internalEvent_Handlers: Object
    //      Mapping of internal events to a list of callback functions 
    //      handling that event type. This callback functions may be internal
    //      or external to Atlas.
    this._internalEvent_Handlers = {};

    // _nextHandlerId: Integer
    //        Counter to determine ID of next handler to register.
    this._nextHandlerId = 0;
  };

  EventManager.prototype.dispatchEvent = function (/*Event*/ event) {
    // summary:
    //      Bubble the given event through the EventTarget's Entity heirachy.
    // event: Event
    //      Event to be propagated.
    var nextEvent;
    var parent;
    while (event.target !== null) {
      if (event.cancelled) {
        break;
      }
      // Handling the event returns a new Event object that is exactly the same 
      // except for the .target and .cancelled parameters, which may 
      // possibly be changed when the target handles the event.
      nextEvent = event.target.handleEvent(event);
      parent = event.target.parent;
      event = nextEvent;
      event.target = parent;
    }
    if (!event.cancelHost) {
      // Propagate the event to the host application.
      for (var h in this._hosts) {
        if (this._hosts.hasOwnProperty(h)) {
          this._hosts[h].callback(event);
        }
      }
      // 'Publish' the event to any handlers.
      this.handleInternalEvent(event.type, event.args);
    }
  };

  EventManager.prototype.registerHost = function (context, callback) {
    // summary:
    //      Registers a Host application with the EventManager.
    // context: Object
    //      The context in which the callback function should execute, ie. the
    //      'this' variable used in the callback function.
    // callback: function(Event)
    //      The event handler function in the registering Host application.
    // returns:
    //      An EventListener object which can be used to deregister the host
    //      from the Event system.
    var listener = {
      id: 'id' + this._nextHandlerId,
      cancel: function(EventManager, id) {
        return function() {
          EventManager.deregisterHost(id);
        };
      }(this, 'id' + this._nextHandlerId)
    };
    // Add the Host callback to the _hosts map.
    this._hosts[listener.id] = {
      callback: callback.bind(context)
    };
    this._nextHandlerId++;
    return listener;
  };

  EventManager.prototype.deregisterHost = function (/*integer*/ id) {
    // summary:
    //      Used to deregister a Host application from the Event system.
    // id: integer
    //      The ID of the Host application to deregister. An ID is assigned
    //      when a Host registers.
    delete this._hosts[id];
  };

  EventManager.prototype.addEventHandler = function (/*string*/ eventSource, /*string*/ eventType, /*function*/ callback) {
    // summary:
    //      Allows for event handlers to be added for an Event. Events can be 
    //      external (Host) or internal (Atlas) events.
    // description:
    //      Host level handlers are interested in internal events and Atlas
    //      handlers are typically interested in external events.
    // eventSource: string
    //      Specifies whether the source of the Event is external or internal
    //      to Atlas. eg. the 'entity/show' event is external, but the
    //      'entity/show/done' is internal.
    //      Must be either 'extern' or 'intern'
    // eventType: string
    //      The event type to add a handler for.
    //      see: EventTypes
    // callback: function(/*string*/ eventType, /*Object*/ args)
    //       Callback function to handle the Host event.
    // example:
    //      constructRenderManager(theEventManager) {
    //         theEventManager.addEventHandler('extern', 'entity/show', show.bind(this));
    //      };
    var allHandlers;
    if (eventSource === 'extern') {
      allHandlers = this._externalEvent_Handlers;
    } else if (eventSource === 'intern') {
      allHandlers = this._internalEvent_Handlers;
    } else {
      throw new DeveloperError('Must specify whether event handler is for "intern" or "extern" events.');
    }
    // Create new handler object
    var newHandler = {
      id: this._nextHandlerId,
      callback: callback,
      cancel: function(em, es, id) {
        return function() {
          em.removeEventHandler(es, id);
        };
      }(this, eventSource, this._nextHandlerId)
    };
    this._nextHandlerId++;
    if (!(eventType in allHandlers)) { allHandlers[eventType] = []; }
    allHandlers[eventType].push(newHandler); //= {id: this._nextHandlerId, cb: callback};
    return newHandler;
  };

  EventManager.prototype.removeEventHandler = function (eventSource, id) {
    // TODO(bpstudds): Need to complete documentation.
    // TODO(bpstudds): Can this be done in a more efficient manner.
    // Retrieve either intern or extern event handlers.
    var allHandlers;
    if (eventSource == 'extern') {
      allHandlers = this._externalEvent_Handlers;
    } else if (eventSource == 'intern') {
      allHandlers = this._internalEvent_Handlers;
    } else {
      throw new DeveloperError('Can not handle event without specifying "extern" or "intern" event');
    }
    for (var i in allHandlers) {
      for (var j in allHandlers[i]) {
        if (allHandlers[i][j].id == id) {
          delete allHandlers[i][j];
          return;
        }
      }
    }
  };

  EventManager.prototype._handleEvent = function (/*string*/ eventSource, /*string*/ eventType, /*Object*/ args) {
    // TODO(bpstudds): Need to complete documentation.
    // Retrieve either intern or extern event handlers.
    console.debug('Handling', eventSource, eventType);
    var allHandlers;
    if (eventSource == 'extern') {
      allHandlers = this._externalEvent_Handlers;
    } else if (eventSource == 'intern') {
      allHandlers = this._internalEvent_Handlers;
    } else {
      throw new DeveloperError('Can not handle event without specifying "extern" or "intern" event');
    }
    // Retrieve the list of event handlers for the given event type. 
    var handlers = allHandlers[eventType];
    console.debug('   the handlers are', allHandlers);
    if (typeof handlers !== 'undefined') {
      for (var i in handlers) {
        handlers[i].callback(eventType, args);
      }
    }
  };

  EventManager.prototype.handleInternalEvent = function (/*string*/ type, /*Object*/ args) {
    // TODO(bpstudds): Need to complete documentation.
    return this._handleEvent('intern', type, args);
  };

  EventManager.prototype.handleExternalEvent = function (/*Event*/ type, /*Object*/ args) {
    // TODO(bpstudds): Need to complete documentation.
    return this._handleEvent('extern', type, args);
  };

  return EventManager;
});
