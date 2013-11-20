define([
], function () {
  // summary:
  //      EventManager is a singleton that is responsible for bubbling internal
  //      events up through the internal event hierarchy, as well as out 
  //      to the host application.
  
  // _instance: EventManager
  //      Singleton instance of the EventManager.
  var _instance;

  var eventManagerSingleton = function() {
    // hosts: Object
    //      Mapping of a listener object id to the host application callback
    this.hosts = {};

    // nextHostId: Integer
    //        Counter to determine ID of next host to register.
    this.nextHostId = 0;
  };

  eventManagerSingleton.prototype.dispatchEvent = function (/*Event*/ event) {
    // summary:
    //      Bubble the given event through the EventTarget's Entity heirachy.
    // event: Event
    //      Event to be propagated.
    var nextEvent;
    while (event.target !== null) {
      if (event.cancelled) {
        break;
      }
      nextEvent = event.target.handleEvent(event);
      var parent = event.target.parent;
      event = nextEvent;
      event.target = parent;
    }
    if (!event.cancelHost) {
      // Propagate the event to the host application.
      for (var h in this.hosts) {
        if (this.hosts.hasOwnProperty(h)) {
          this.hosts[h].callback(event);
        }
      }
    }
  };

  eventManagerSingleton.prototype.registerHost = function (context, callback) {
    // summary:
    //      Registers a Host application with the event system.
    // context: Object
    //      The context in which the callback function should execute, the
    //      'this' variable used in the callback function.
    // callback: function(Event)
    //      The event handler function in the registering Host application.
    // returns:
    //      An EventListener object which can be used to deregister the host
    //      from the Event system.
    var listener = {
      id: 'id' + this.nextHostId,
      cancel: function(EventManager, id) {
        return function() {
          EventManager.deregisterHost(id);
        };
      }(_instance, 'id' + this.nextHostId)
    };
    // Add the Host callback to the hosts map.
    this.hosts[listener.id] = {
      callback: callback.bind(context)
    };
    this.nextHostId++;
    return listener;
  };

  eventManagerSingleton.prototype.deregisterHost = function (/*integer*/ id) {
    // summary:
    //      Used to deregister a Host application from the Event system.
    // id: integer
    //      The ID of the Host application to deregister. An ID is assigned
    //      when a Host registers.
    delete this.hosts[id];
  };

  return (_instance = (_instance || new eventManagerSingleton()));
});
