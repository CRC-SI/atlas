define([
  'atlas/util/default',
  './EventManager'
], function (defaultValue, EventManager) {
  "use strict";

  /**
   * Constructs a new EventTarget object.
   * @class EventTarget is a mixin class that provides an object with the
   * ability to dispatch and listen to events. This implementation is close to
   * dojo/on than the DOM Event model.
   *
   * @param {atlas.events.EventManager} [em=null] - The EventManager object managing the event system.
   * @param {atlas.events.EventTarget} [parent=null] - The parent of the EventTarget.
   * @returns {atlas.events.EventTarget}

   * @alias atlas.events.EventTarget
   * @constructor
   */
  var EventTarget = function(em, parent) {

    /**
     * The EventManager for this EventTarget.
     * @type {atlas.events.EventManager}
     */
    this._eventManager = defaultValue(em, null);

    /**
     * The parent object of the EventTarget.
     * @type {atlas.events.EventTarget}
     */
    this.parent = defaultValue(parent, null);

    /**
     * Maps an EventListnerID to a tuple containing the Event type and
     * the event handler callback.
     * @type {Object}
     */
    this._eventHandlers = {};

    /**
     * Each EventListener needs a unique ID. These are determined from this counter.
     * @type {Number}
     */
    this._nextEventListenerId = 0;
  };

  /**
   * Initialise the EventTarget post-construction.
   * @param {atlas.events.EventManager} em - The EventManager object managing the event system.
   * @param {atlas.events.EventTarget} parent - The parent EventTarget of the EventTarget.
   */
  EventTarget.prototype.initEventTarget = function (em, parent) {
    this._eventManager = em;
    this.parent = typeof parent;
  };

  /**
   * Notify the EventManager that an event has been emitted. The EventManager
   * then handles the propagation of the event through the EventTarget hierarchy.
   * @param  {atlas.events.Event} event - The Event object to be propagated.
   */
  EventTarget.prototype.dispatchEvent = function(event) {
    this._eventManager.dispatchEvent(event);
  };

  /**
   * Allows an object to register to events emmited from the EventTarget.
   * @param {String} name - The name of the event being registered to.
   * @param {Function} callback - A callback function to be called when the event occurs.
   * @returns {Object} An EventListener object used to de-register the EventListener from the event.
   */
  EventTarget.prototype.addEventListener = function(name, callback) {
    // Use closure in place of lang.hitch for the cancel() function.
    var listener = {
      id: 'id' + this._nextEventListenerId,
      cancel: function(target, id) {
        return function() {
          target._removeEventListener(id);
        };
      }(this, 'id' + this._nextEventListenerId)
    };
    // Add the EventListener to the eventHandlers map.
    this._eventHandlers[listener.id] = {
      name: name,
      callback: callback.bind(this)
    };
    this._nextEventListenerId++;
    return listener;
  };


  /**
   * Removes the identified event listener from the EventTarget. This function
   * is called by the EventListener object returned by
   * {@link atlas.events.EventTarget#addEventListener|addEventListener}.
   * @param  {Number} id - The ID of the EventListener to remove.
   */
  EventTarget.prototype._removeEventListener = function(id) {
    delete this._eventHandlers[id];
  };


  /**
   * Handles events that bubble up to the EventTarget.
   * @param  {atlas.events.Event} event - The Event to be handled.
   * @returns {atlas.events.Event} The Event to be propagated to the next
   *       EventTarget in the hierarchy.
   */
  EventTarget.prototype.handleEvent = function(event) {
    for (var id in this._eventHandlers) {
      if (this._eventHandlers.hasOwnProperty(id)) {
        if (this._eventHandlers[id].type === event.type) {
          event = this._eventHandlers[id].callback(event) || event;
        }
      }
    }

    return event;
  };

  return EventTarget;
});
