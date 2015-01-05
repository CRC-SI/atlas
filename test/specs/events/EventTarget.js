define([
    'doh/runner',
    'dam/TestCase',
    '../Event',
    // Code under test
    '../EventTarget'
], function(doh, TestCase, Event, EventTarget) {
  var child;
  var parent;
  var grandparent;
  var anEvent;
  var handledEvent;
  var unhandledEvent;

  var testCallback = function(event) {
    this.callbackFired += 1;
  };


  new TestCase({
    name: 'events/tests/EventTarget',
    setUp: function() {
      // Create an EventTarget hierarchy to test and 2 events to test with.
      child = new EventTarget();
      parent = new EventTarget();
      grandparent = new EventTarget();
      child.parent = parent;
      parent.parent = grandparent;
      child.callbackFired = 0;

      unhandledEvent = new Event(child, 'notHandled');
      handledEvent = new Event(child, 'testEvent');
    },

    tearDown: function() {
      // Destroy the created EventTargets and Events.
      child = null;
      parent = null;
      grandparent = null;
      handledEvent = null;
      unhandledEvent = null;
    },

    testCreate: function() {
      doh.assertTrue(child);
      doh.assertTrue(parent);
      doh.assertTrue(grandparent);
      doh.assertEqual(parent, child.parent);
      doh.assertEqual(grandparent, parent.parent);
      doh.assertEqual(null, grandparent.parent);
    },

    testAddEventListener: function() {
      var initialEventListenerId = child._nextEventListenerId;
      var listener = child.addEventListener('testEvent', testCallback);

      // Ensure that handlers are created properly
      doh.assertEqual('string', typeof(listener.id), 'Event listener created without ID.');
      doh.assertTrue(child._eventHandlers[listener.id], 'Expected handler not in hashmap');
      doh.assertEqual('testEvent', child._eventHandlers[listener.id].type, 'Unexpected handler type.');
      doh.assertTrue(child._eventHandlers[listener.id].callback, 'Unexpected handler callback');
      doh.assertEqual(1, child._nextEventListenerId - initialEventListenerId, 'Unexpected change in nextListenerId');
    },

    testRemoveEventHandler: function() {
      var initialEventListenerId = child._nextEventListenerId;
      var listener = child.addEventListener('testEvent', testCallback);

      listener.cancel();
      doh.assertTrue(!child._eventHandlers[listener.id], 'Event handler not correctly removed.');
    },

    testHandleEvent: function() {
      // Set up handlers
      child.addEventListener('testEvent', testCallback);

      // Test behaviour
      child.handleEvent(unhandledEvent);
      doh.assertTrue(!child.callbackFired);
      child.handleEvent(handledEvent);
      doh.assertTrue(!this.callbackFired, 'Callback fired in wrong context');
      doh.assertEqual(1, child.callbackFired, 'Callback not properly called 1');
      child.handleEvent(handledEvent);
      doh.assertEqual(2, child.callbackFired, 'Callback not properly called 2');
    }
  }).register(doh);

});
