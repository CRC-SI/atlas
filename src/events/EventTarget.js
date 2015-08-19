define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class'
], function(Setter, Class) {

  /**
   * @classdesc EventTarget is a mixin class that provides an object with the ability to dispatch
   * and listen to events. This implementation is close to dojo/on than the DOM Event model.
   *
   * @param {atlas.events.EventManager} [em=null] - The EventManager object managing the event
   * system.
   * @param {atlas.events.EventTarget} [parent=null] - The parent of the EventTarget.
   * @class atlas.events.EventTarget
   */
  return Class.extend(/** @lends atlas.events.EventTarget# */ {

    /**
     * @type {atlas.events.EventManager}
     * @protected
     */
    _eventManager: null,

    /**
     * Maps an EventListenerID to a tuple containing the Event type and
     * the event handler callback.
     * @type {Object}
     * @private
     */
    _eventHandlers: null,

    /**
     * Each EventListener needs a unique ID. These are determined from this counter.
     * @type {Number}
     * @private
     */
    _nextEventListenerId: 0,

    /**
     * @type {atlas.events.EventTarget}
     * @protected
     */
    _parent: null,

    _init: function(eventManager, parent) {
      this._eventManager = Setter.def(eventManager, null);
      this._eventHandlers = {};
      parent && this.setParent(parent);
    },

    /**
     * Initialise the {@link atlas.events.EventTarget} post-construction.
     * @param {atlas.events.EventManager} eventManager
     * @param {atlas.events.EventTarget} parent - The parent of this
     * {@link atlas.events.EventTarget}.
     */
    initEventTarget: function(eventManager, parent) {
      this._eventManager = eventManager;
      this.parent = parent;
    },

    /**
     * Notify the EventManager that an event has been emitted. The EventManager
     * then handles the propagation of the event through the {@link atlas.events.EventTarget}
     * hierarchy.
     * @param {atlas.events.Event} event - The Event object to be propagated.
     */
    dispatchEvent: function(event) {
      var newEvent = event.clone();
      newEvent.setTarget(this);
      newEvent.setCurrentTarget(this);
      this._eventManager && this._eventManager.dispatchEvent(newEvent);
    },

    /**
     * Allows an object to register to events emmited from this {@link atlas.events.EventTarget}.
     * @param {String} type - The name of the event being registered to.
     * @param {Function} callback - A callback function to be called when the event occurs.
     * @param {Object} [options]
     * @param {Boolean} [options.ignoreBubbled=false] - Whether to ignore bubbled events which did
     * not originate from this {@link atlas.events.EventTarget}.
     * @returns {Object} An EventListener object used to de-register the EventListener from the
     * event.
     */
    addEventListener: function(type, callback, options) {
      options = Setter.merge({
        ignoreBubbled: false
      }, options);
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
        type: type,
        // Prevent any events dispatched in the handler from causing infinite loops if the handler
        // is invoked before it completes execution.
        callback: this._wrapEventListenerCallback(callback, options).bind(this)
      };
      this._nextEventListenerId++;
      return listener;
    },

    /**
     * @param {Function} callback
     * @param {Object} options - See {@link #addEventListener}.
     * @return {Function} A wrapped version of the given callback that ensures the callback will be
     * ignored if it is called recursively.
     */
    _wrapEventListenerCallback: function(callback, options) {
      var isHandling = false;
      return function(event) {
        if (isHandling) return;
        if (options.ignoreBubbled && event.getTarget() !== this) return;
        isHandling = true;
        callback.apply(this, arguments);
        isHandling = false;
      }.bind(this);
    },

    /**
     * Removes the identified event listener from this {@link atlas.events.EventTarget}. This
     * function is called by the EventListener object returned by
     * {@link atlas.events.EventTarget#addEventListener|addEventListener}.
     * @param {Number} id - The ID of the EventListener to remove.
     * @protected
     */
    _removeEventListener: function(id) {
      delete this._eventHandlers[id];
    },

    /**
     * Handles events that bubble up to this {@link atlas.events.EventTarget}.
     * @param {atlas.events.Event} event - The Event to be handled.
     * @returns {atlas.events.Event} The Event to be propagated to the next
     *     EventTarget in the hierarchy.
     */
    handleEvent: function(event) {
      for (var id in this._eventHandlers) {
        if (this._eventHandlers.hasOwnProperty(id) &&
            this._eventHandlers[id].type === event.getType()) {
          event = this._eventHandlers[id].callback(event) || event;
        }
      }
      return event;
    },

    /**
     * @param {atlas.model.GeoEntity} parent
     */
    setParent: function(parent) {
      this._parent = parent;
    },

    /**
     * @return {atlas.model.GeoEntity}
     */
    getParent: function() {
      return this._parent;
    },

    /**
     * @return {Array.<atlas.model.GeoEntity>}
     */
    getChildren: function() {
      // TODO(aramk) At the moment, only a Collection has children. This method is here for future
      // use if we decide all models can have children.
      return [];
    },

    getRecursiveChildren: function() {
      var children = [];
      var childrenMap = {};
      var stack = this.getChildren();
      var child;
      while (stack.length > 0) {
        child = stack.pop();
        if (childrenMap[child.getId()]) continue;
        children.push(child);
        childrenMap[child.getId()] = true;
        child.getChildren().forEach(function(recursiveChild) {
          stack.push(recursiveChild);
        });
      }
      return children;
    },

    /**
     * Removes this {@link atlas.events.EventTarget}, any registered event handlers, and from its
     * parent (if any).
     */
    remove: function() {
      for (var id in this._eventHandlers) {
        this._removeEventListener(id);
      }
    }

  });
});
