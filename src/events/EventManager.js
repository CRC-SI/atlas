define([
  'atlas/core/Manager',
  'atlas/util/Class',
  'atlas/util/DeveloperError'
], function(Manager, Class, DeveloperError) {
  "use strict";

  /**
   * @classdesc EventManager is responsible for bubbling internal events up through the
   * internal event hierarchy, as well as out to the host application.
   *
   * @param {Object} managers - A map of manager types to actual manager objects.
   *       The map is maintained on the main Atlas facade object, but the instances
   *       are created by each manager object upon creation.
   *
   * @class atlas.events.EventManager
   */
  var EventManager = Manager.extend(/** @lends atlas.events.EventManager# */ {

    _id: 'event',

    /**
     * Mapping of listener object IDs to the host application callback. Hosts
     * registered in this map receive every event that occurs (that is not cancelled).
     * @type {Object}
     */
    _hosts: null,

    /**
     * Mapping of extern event names to a list of callback functions handling
     * the extern event.
     * @type {Object}
     */
    _externalEventHandlers: null,

    /**
     * Mapping of internal event names to a list of callback functions handling
     * that event type. These callbacks may be internal or external to Atlas.
     * @type {Object}
     */
    _internalEventHandlers: null,

    /**
     * Counter to determine the ID of the next handler that is registered.
     * @type {Number}
     */
    _nextHandlerId: null,

    _init: function(managers) {
      this._super(managers);
      this._internalEventHandlers = {};
      this._externalEventHandlers = {};
    },

    /**
     * Bubbles the given Event through its <code>target</code> Entity hierarchy.
     * @param {atlas.events.Event} event - The Event to be propagated.
     */
    dispatchEvent: function(event) {
      // Propagate the event up the target hierarchy.
      while (event.target) {
        var nextEvent,
            parent;
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
    },

    /**
     * Registers a Host application with the EventManager.
     * @param {Function} callback - The event handler function in the registering Host application.
     * @returns {Object} An EventListener object which can be used to deregister the Host from the event system.
     */
    registerHost: function(callback) {
      // Create the EventListener object.
      var listener = {
        id: 'id' + this._nextHandlerId,
        cancel: function(eventManager, id) {
          return function() {
            eventManager._deregisterHost(id);
          };
        }(this, 'id' + this._nextHandlerId)
      };
      // Add the Host callback to the _hosts map.
      this._hosts[listener.id] = {
        callback: callback
      };
      this._nextHandlerId++;
      return listener;
    },

    /**
     * Used to deregister a Host application from the Event system. Called by
     * the EventListener object returned when registering a Host.
     * @param  {Number} id - The ID of the Host application to remove.
     */
    _deregisterHost: function(id) {
      delete this._hosts[id];
    },

    /**
     * Allows for adding an array of event handlers.
     * @param {Object} handlers - An array of Objects describing the handlers to be added.
     *       The objects should have properties 'source', 'name', and 'callback' as per
     *       {@link atlas.events.EventManager#addEventHandler}.
     * @returns {Object.<String, Object>} The map of event name to EventHandler object.
     */
    addEventHandlers: function(handlers) {
      var eventHandlers = {};
      handlers.forEach(function(handler) {
        eventHandlers[handler.name] =
            this.addEventHandler(handler.source, handler.name, handler.callback);
      }, this);
      return eventHandlers;
    },

    /**
     * Allows for event handlers to be added for an Event. Events can be external
     * (Host) or internal (Atlas) events.
     *
     * @param {String} source - The source of the event, either 'extern' or 'intern'.
     * @param {String} name - The name of the event.
     * @param {Function} callback - Callback function to handle the event.
     * @example
     * <code>
     * constructRenderManager(theEventManager) {
     *    theEventManager.addEventHandler('extern', 'entity/show', show.bind(this));
     * };
     * </code>
     * @returns {Object} An EventListener object that can be used to cancel the EventHandler.
     */
    addEventHandler: function(source, name, callback) {
      // Select the map of event handlers to add to.
      var allHandlers;
      if (source === 'extern') {
        allHandlers = this._externalEventHandlers;
      } else if (source === 'intern') {
        allHandlers = this._internalEventHandlers;
      } else {
        throw new DeveloperError('Must specify whether event handler is for "intern" or "extern" events.');
      }
      // Create new handler object
      var id = this._nextHandlerId++;
      var newHandler = {
        id: id,
        name: name,
        callback: callback,
        cancel: function() {
          this._removeEventHandler(source, name, id);
        }.bind(this)
      };
      // Add name of handlers dictionary if it doesn't exist.
      if (!(name in allHandlers)) {
        allHandlers[name] = {};
      }
      // Add the handler for the event type.
      allHandlers[name][id] = newHandler;
      return newHandler;
    },

    /**
     * Removes the given event handler from the event system. Called by the
     *       EventListener object returned by
     *       {@link atlas.events.EventManager#addEventListener|addEventListener}.
     * @param {String} source - The source of the Event for the EventHandler being removed.
     * @param {String} name - The name of the event used to register the handler.
     * @param {String} id - The ID of the EventHandler being removed.
     */
    _removeEventHandler: function(source, name, id) {
      // Retrieve either intern or extern event handlers.
      var allHandlers;
      if (source === 'extern') {
        allHandlers = this._externalEventHandlers;
      } else if (source === 'intern') {
        allHandlers = this._internalEventHandlers;
      } else {
        throw new DeveloperError('Can not remove event without specifying "extern" or "intern" event');
      }
      var handlers = allHandlers[name];
      if (handlers[id] === undefined) {
        throw new DeveloperError('Event handler with name ' + name + ' and ID ' + id +
            ' not found.');
      }
      delete handlers[id];
    },

    /**
     * Calls the registered event handlers for the given event.
     * @param {String} source - The source of the event, either 'extern' or 'intern'.
     * @param {String} name - The name of the event to handle.
     * @param {Object} [args] - Optional event arguments that are passed to the event handler callback.
     */
    _handleEvent: function(source, name, args) {
      // Retrieve either intern or extern event handlers.
      var allHandlers;
      if (source === 'extern') {
        allHandlers = this._externalEventHandlers;
      } else if (source === 'intern') {
        allHandlers = this._internalEventHandlers;
      } else {
        throw new DeveloperError('Can not handle event without specifying "extern" or "intern" event');
      }
      // Retrieve the list of event handlers for the given event type.
      var handlers = allHandlers[name];
      if (handlers) {
        for (var id in handlers) {
          handlers[id].callback(args);
        }
      }
    },

    /**
     * Convenience function to handle an internal event.
     * @param {String} name - The name of the event.
     * @param {Object} args - Optional event arguments that are passed to the event handler callback.
     */
    handleInternalEvent: function(name, args) {
      this._handleEvent('intern', name, args);
    },

    /**
     * Convenience function to handle an external event.
     * @param {String} name - The name of the event.
     * @param {Object} args - Optional event arguments that are passed to the event handler callback.
     */
    handleExternalEvent: function(name, args) {
      this._handleEvent('extern', name, args);
    }
  });

  return EventManager;
});

