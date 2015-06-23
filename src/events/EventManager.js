define([
  'atlas/core/Manager',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Types',
  'atlas/lib/Q',
  'atlas/util/DeveloperError',
  'underscore'
], function(Manager, Log, Types, Q, DeveloperError, _) {

  /**
   * An object that declares a callback function listening for a particular event.
   * @typedef {Object} atlas.events.EventManager.EventHandle
   *
   * @property {Number} id - The ID of the event handler.
   * @property {String} name - The name of the event being handled.
   * @property {Function} callback - Function to handle the event when it is published.
   * @property {Function} cancel - Function to cancel the event.
   * @property {Function} isCancelled - Function that returns a Boolean of whether the event has
   *     been cancelled with the <code>cancel</code> function.
   */

  /**
   * @typedef atlas.events.EventManager
   * @ignore
   */
  var EventManager;

  /**
   * @classdesc EventManager is responsible for bubbling internal events up through the
   * internal event hierarchy, as well as out to the host application.
   *
   * @class atlas.events.EventManager
   */
  EventManager = Manager.extend(/** @lends atlas.events.EventManager# */ {

    _id: 'event',

    /**
     * Mapping of listener object IDs to the host application callback. Hosts
     * registered in this map receive every event that occurs (that is not cancelled).
     *
     * @type {Object}
     */
    _hosts: null,

    /**
     * Mapping of external event names to a map of handler IDs to the handler object.
     *
     * @type {Object.<String, Object.<String, Object>>}
     */
    _externalEventHandlers: null,

    /**
     * Mapping of internal event names to a map of handler IDs to the handler object.
     *
     * @type {Object.<String, Object.<String, Object>>}
     */
    _internalEventHandlers: null,

    /**
     * Counter to determine the ID of the next handler that is registered.
     *
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
     *
     * @param {atlas.events.Event} event - The Event to be propagated.
     */
    dispatchEvent: function(event) {
      // If debug logging is enabled, log all dispatched events except mousemove.
      if (event.getType() !== 'input/mousemove') {
        Log.debug('Dispatching event: ',
            event.getType(), event.getArgs(), event.getTarget(), event.getCurrentTarget());
      }

      // Propagate the event up the target hierarchy.
      while (event.getCurrentTarget()) {
        var nextEvent;
        var parent;
        if (event.isCancelled()) {
          break;
        }
        // Handling the event returns a new Event object that is exactly the same except for the
        // target and cancelled parameters, which may possibly be changed when the target handles
        // the event.
        nextEvent = event.getCurrentTarget().handleEvent(event);
        parent = event.getCurrentTarget().getParent();
        event = nextEvent;
        // Parent may be given as a string if it was not resolved at the time the entity was
        // created.
        if (Types.isString(parent)) {
          parent = this._managers.entity.getById(parent);
        }
        event.setCurrentTarget(parent);
      }

      if (!event.cancelHost) {
        // Propagate the event to the host application.
        for (var h in this._hosts) {
          if (this._hosts.hasOwnProperty(h)) {
            this._hosts[h].callback(event);
          }
        }
        // 'Publish' the event to any handlers.
        this.handleInternalEvent(event.getType(), event.getArgs());
      }
    },

    /**
     * Registers a Host application with the EventManager.
     *
     * @param {Function} callback - The event handler function in the registering Host application.
     * @returns {atlas.events.EventManager.EventHandle} An EventHandle which can be used
     *     to deregister the Host from the event system.
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
     *
     * @param  {Number} id - The ID of the Host application to remove.
     */
    _deregisterHost: function(id) {
      delete this._hosts[id];
    },

    /**
     * Allows for adding an array of event handlers.
     *
     * @param {Object} handlers - An array of Objects describing the handlers to be added.
     *     The objects should have properties 'source', 'name', and 'callback' as per
     *     {@link atlas.events.EventManager#addEventHandler}.
     *
     * @returns {Object.<String, atlas.events.EventManager.EventHandle>} A map of Event names to
     *     the corresponding EventHandle.
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
     * Allows for adding an array of event handler mappings.
     *
     * Note: This method is for the "new" event handler declaration format. It is intended to
     * replace the old <code>addEventHandlers</code> method, and should adopt its name once the old
     * method is phased out.
     *
     * @param {Object} handlers - A map with intern and extern event handler mappings.
     * @param {Object.<String, atlas.events.EventManager.EventHandler>} handlers.intern - A mapping
     *     of internal event names to callbacks.
     * @param {Object.<String, atlas.events.EventManager.EventHandler>} handlers.extern - A mapping
     *     of external event names to callbacks.
     *
     * @returns {Object.<String, atlas.events.EventManager.EventHandle>} A map of event names to
     *     the corresponding EventHandles.
     */
    addNewEventHandlers: function(handlers) {
      var eventHandlers = {};
      Object.keys(handlers).forEach(function(source) {
        Object.keys(handlers[source]).forEach(function(name) {
          var callback = handlers[source][name];
          eventHandlers[name] = this.addEventHandler(source, name, callback);
        }, this);
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
     *
     * @example
     * <code>
     * constructRenderManager(theEventManager) {
     *     theEventManager.addEventHandler('extern', 'entity/show', show.bind(this));
     * };
     * </code>
     *
     * @returns {atlas.events.EventManager.EventHandle} An EventHandle for the event
     *     that can be used to cancel the callback subscription.
     */
    addEventHandler: function(source, name, callback) {
      // Select the map of event handlers to add to.
      var allHandlers;
      if (source === 'extern') {
        allHandlers = this._externalEventHandlers;
      } else if (source === 'intern') {
        allHandlers = this._internalEventHandlers;
      } else {
        throw new DeveloperError('Must specify whether event handler is for "intern" or' +
            '"extern" events.');
      }
      // Create new handler object
      var id = this._nextHandlerId++;
      var isCancelled = false;
      var newHandler = {
        id: id,
        name: name,
        callback: callback,
        cancel: function() {
          if (!isCancelled) {
            this._removeEventHandler(source, name, id);
            isCancelled = true;
          }
        }.bind(this),
        isCancelled: function() {
          return isCancelled;
        }
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
     *
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
        throw new DeveloperError('Can not remove event without specifying "extern" ' +
            'or "intern" event');
      }
      var handlers = allHandlers[name];
      if (handlers[id] === undefined) {
        throw new DeveloperError('Event handler with name ' + name + ' and ID ' + id +
            ' not found.');
      }
      delete handlers[id];
    },

    /**
     * @param {String} source - The source of the Event for the EventHandler being removed.
     * @return {Object.<String, Object.<String, Object>>} The event handlers for the given source.
     */
    _getEventHandlers: function(source) {
      if (source === 'extern') {
        return this._externalEventHandlers;
      } else if (source === 'intern') {
        return this._internalEventHandlers;
      } else {
        throw new DeveloperError('Must specify whether event handler is for "intern" or' +
            '"extern" events.');
      }
    },

    /**
     * Removes the event handlers for the given source.
     * @param {String} [source] - The source of the Event for the EventHandler being removed. If not
     *     provided, all sources are removed.
     * @param {String} [name] - The name of the event used to register the handler. If not provided,
     *     all names are removed.
     */
    removeHandlers: function(source, name) {
      var allHandlers = [];
      if (source) {
        allHandlers.push(this._getEventHandlers(source));
      } else {
        allHandlers.push(this._getEventHandlers('intern'));
        allHandlers.push(this._getEventHandlers('extern'));
      }
      _.each(allHandlers, function(handlers) {
        var names = name ? [name] : _.keys(handlers);
        _.each(names, function(eventName) {
          var eventHandlers = handlers[eventName];
          _.each(eventHandlers, function(handler) {
            handler.cancel();
          });
        });
      });
    },

    /**
     * Calls the registered event handlers for the given event.
     *
     * @param {String} source - The source of the event, either 'extern' or 'intern'.
     * @param {String} name - The name of the event to handle.
     * @param {Object} [args] - Optional event arguments that are passed to the event
     *     handler callback.
     */
    _handleEvent: function(source, name, args) {
      // Retrieve either intern or extern event handlers.
      var allHandlers;
      if (source === 'extern') {
        allHandlers = this._externalEventHandlers;
      } else if (source === 'intern') {
        allHandlers = this._internalEventHandlers;
      } else {
        throw new DeveloperError('Can not handle event without specifying "extern" or ' +
            '"intern" event');
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
     *
     * @param {String} name - The name of the event.
     * @param {Object} args - Optional event arguments that are passed to the event
     *     handler callback.
     */
    handleInternalEvent: function(name, args) {
      this._handleEvent('intern', name, args);
    },

    /**
     * Convenience function to handle an external event.
     *
     * @param {String} name - The name of the event.
     * @param {Object} args - Optional event arguments that are passed to the event handler
     *     callback.
     */
    handleExternalEvent: function(name, args) {
      this._handleEvent('extern', name, args);
    },

    destroy: function() {
      this._super();
      this.removeHandlers();
    }

  });

  return EventManager;
});
