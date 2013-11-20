define([
    'doh/runner',
    'dam/TestCase',
    '../Event',
    '../EventTarget',
    // Code under test.
    '../EventManager'
], function (doh, TestCase, Event, EventTarget, EventManager) {
  var host;

  // An EventTarget heirarchy which Events can be bubbled up through.
  var child;
  var parent;
  var grandparent;

  var childListener;
  var parentListener;
  var grandparentListener;

  // An Event that will be emitted by the Child EventTarget.
  var anEvent;

  var testCallback = function(event) {
    this.callbackFired += 1;
  };

  var testCancellingCallback = function(event) {
    this.callbackFired += 1;
    return event.cancel();
  };

  var testCancelHostCallback = function(event) {
    this.callbackFired += 1;
    return event.cancel(true);
  };

  var testHostCallback = function(event) {
    this.hostCallbackFired += 1;
  };

  new TestCase({
    name: 'events/tests/EventManager',
    setUp: function() {
      // summary:
      //      Create an EventTarget hierarchy to test and 2 events to test with.
      child = new EventTarget();
      parent = new EventTarget();
      grandparent = new EventTarget();
      child.callbackFired = 0;
      parent.callbackFired = 0;
      grandparent.callbackFired = 0;

      // Host would not be an EventTarget, merely a handy object to use to 
      // simulate the host application.
      host = new EventTarget();
      host.hostCallbackFired = 0;

      child.parent = parent;
      parent.parent = grandparent;
      grandparent.parent = null;

      anEvent = new Event(child, 'testEvent'); 
    },

    tearDown: function() {
      child = null;
      parent = null;
      grandparent = null;
      anEvent = null;
    },

    testCreateEventManager: function() {
      doh.assertTrue(EventManager);
    },

    testRegisterHost: function() {
      var listener = EventManager.registerHost(host, testHostCallback);

      doh.assertTrue(listener);
      doh.assertTrue(EventManager.hosts[listener.id]);
    },

    testDeregisterHost: function() {
      var listener = EventManager.registerHost(host, testHostCallback);
      listener.cancel();

      doh.assertTrue(!EventManager.hosts[listener.id]);      
    },

    testDispatchEvent: function() {
      child.addEventListener('testEvent', testCallback);
      parent.addEventListener('testEvent', testCallback);
      grandparent.addEventListener('testEvent', testCallback);
      EventManager.registerHost(host, testHostCallback);
      EventManager.dispatchEvent(anEvent);

      // This event should travel all the way up the chain
      doh.assertTrue(child.callbackFired, 'Child did not handle event');
      doh.assertTrue(parent.callbackFired, 'Parent did not handle event');
      doh.assertTrue(grandparent.callbackFired, 'Grandparent did not handle event');
      doh.assertTrue(host.hostCallbackFired, 'Host did not handle event');
    },

    testCancelEvent: function() {
      child.addEventListener('testEvent', testCallback);
      parent.addEventListener('testEvent', testCancellingCallback);
      grandparent.addEventListener('testEvent', testCallback);
      EventManager.registerHost(host, testHostCallback);
      EventManager.dispatchEvent(anEvent);

      // This event should not travel past parent. Host should still handle
      // Event.
      doh.assertEqual(1, child.callbackFired, 'Child did not handle event');
      doh.assertEqual(1, parent.callbackFired, 'Parent did not handle event');
      doh.assertEqual(0, grandparent.callbackFired, 'Grandparent should not have handled event');
      doh.assertEqual(1, host.hostCallbackFired, 'Host did not handle event');
    },

    testEventHostCancel: function() {
      child.addEventListener('testEvent', testCallback);
      parent.addEventListener('testEvent', testCancelHostCallback);
      grandparent.addEventListener('testEvent', testCallback);
      EventManager.registerHost(host, testHostCallback);
      EventManager.dispatchEvent(anEvent);

      // This event should not travel past parent.
      doh.assertEqual(1, child.callbackFired, 'Child did not handle event');
      doh.assertEqual(1, parent.callbackFired, 'Parent did not handle event');
      doh.assertEqual(0, grandparent.callbackFired, 'Grandparent should not have handled event');
      doh.assertEqual(0, host.hostCallbackFired, 'Host did not handle event');
    },

    testMultipleHosts: function() {
      child.addEventListener('testEvent', testCallback);
      EventManager.registerHost(host, testHostCallback);
      EventManager.registerHost(host, testHostCallback);
      EventManager.registerHost(host, testHostCallback);
      EventManager.dispatchEvent(anEvent);

      doh.assertEqual(1, child.callbackFired, 'Child did not handle event');
      doh.assertEqual(3, host.hostCallbackFired, 'Host did not handle event');
    }
  }).register(doh);

});
