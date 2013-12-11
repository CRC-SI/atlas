define([
    'doh/runner',
    'dam/TestCase',
    '../Event',
    '../EventTarget',
    // Code under test.
    '../EventManager'
], function (doh, TestCase, Event, EventTarget, EventManager) {
  var host;
  var eventManager;

  // An EventTarget heirarchy which Events can be bubbled up through.
  var child;
  var parent;
  var grandparent;

  var childListener;
  var parentListener;
  var grandparentListener;

  // Events that will be emitted by the Child EventTarget.
  var anEvent;
  var entityRenderEvent;
  var entityRenderedEvent;


  var testCallback = function(event) {
    console.debug('testCallback fired', this);
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
      // Create an EventTarget hierarchy to test and 2 events to test with.
      child = new EventTarget();
      parent = new EventTarget();
      grandparent = new EventTarget();
      child.callbackFired = 0;
      parent.callbackFired = 0;
      grandparent.callbackFired = 0;

      atlasManagers = {
        dom: {},
        event: {},
        render: {}
      };

      eventManager = new EventManager(atlasManagers);

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
      eventManager = null;
      host = null;
    },

    testCreateEventManager: function() {
      doh.assertNotEqual('undefined', typeof eventManager);
    },

    testAddEventHandler: function() {
      listener0 = eventManager.addEventHandler('extern', 'entity/render', testCallback);
      listener1 = eventManager.addEventHandler('extern', 'entity/render', testHostCallback);
      listener2 = eventManager.addEventHandler('intern', 'entity/render/done', testCallback);
      listener3 = eventManager.addEventHandler('intern', 'entity/render/done', testHostCallback);

      doh.assertEqual(0, listener0.id, 'Incorrect listener ID assigned.');
      doh.assertEqual(1, listener1.id, 'Incorrect listener ID assigned.');
      doh.assertEqual(2, listener2.id, 'Incorrect listener ID assigned.');
      doh.assertEqual(3, listener3.id, 'Incorrect listener ID assigned.');
      doh.assertEqual(testCallback, eventManager._externalEvent_Handlers['entity/render'][listener0.id].callback, 'Incorrect callback assigned.');
      doh.assertEqual(testHostCallback, eventManager._externalEvent_Handlers['entity/render'][listener1.id].callback, 'Incorrect callback assigned.');
      doh.assertEqual(testCallback, eventManager._internalEvent_Handlers['entity/render/done'][listener2.id - 2].callback, 'Incorrect callback assigned.');
      doh.assertEqual(testHostCallback, eventManager._internalEvent_Handlers['entity/render/done'][listener3.id - 2].callback, 'Incorrect callback assigned.');
    },

    testAddEventHandler_badSource: function () {
      var exception;
      try {
        listener0 = eventManager.addEventHandler('iextern', 'entity/render', testCallback);
      } catch (e) {
        // Whatever
        exception = e;
      }
      doh.assertEqual('object', typeof exception, 'Exception not thrown when it should have been.');
    },

    testRemoveEventHandler: function () {
      listener0 = eventManager.addEventHandler('extern', 'entity/render', testCallback);
      listener0.cancel();
      doh.assertEqual('undefined', typeof eventManager._externalEvent_Handlers['entity/render'][listener0.id]);
    },

    testHandleExternalEvent: function () {
      var handler = {
        callbackFired: 0
      };
      listener = eventManager.addEventHandler('extern', 'entity/render', testCallback.bind(handler));
      eventManager.handleExternalEvent('entity/render', {});
      doh.assertEqual(1, handler.callbackFired, 'Handler callback did not fire');
    },

    testHandleInternalEvent: function () {
      var ahost = {
        callbackFired: 0
      };
      var theEvent = new Event(child, 'entity/render/done');
      var listener0 = eventManager.addEventHandler('intern', 'entity/render/done', testCallback.bind(ahost));
      eventManager.dispatchEvent(theEvent);
      doh.assertEqual(1, ahost.callbackFired, 'Host handler callback not called.');
    },

    testRegisterHost: function() {
      var listener = eventManager.registerHost(testHostCallback.bind(host));

      doh.assertTrue(listener);
      doh.assertTrue(eventManager._hosts[listener.id]);
    },

    testDeregisterHost: function() {
      var listener = eventManager.registerHost(testHostCallback.bind(host));
      listener.cancel();

      doh.assertTrue(!eventManager._hosts[listener.id]);      
    },

    testDispatchEvent: function() {
      child.addEventListener('testEvent', testCallback);
      parent.addEventListener('testEvent', testCallback);
      grandparent.addEventListener('testEvent', testCallback);
      eventManager.registerHost(testHostCallback.bind(host));
      eventManager.dispatchEvent(anEvent);

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
      eventManager.registerHost(testHostCallback.bind(host));
      eventManager.dispatchEvent(anEvent);

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
      eventManager.registerHost(testHostCallback.bind(host));
      eventManager.dispatchEvent(anEvent);

      // This event should not travel past parent.
      doh.assertEqual(1, child.callbackFired, 'Child did not handle event');
      doh.assertEqual(1, parent.callbackFired, 'Parent did not handle event');
      doh.assertEqual(0, grandparent.callbackFired, 'Grandparent should not have handled event');
      doh.assertEqual(0, host.hostCallbackFired, 'Host did not handle event');
    },

    testMultipleHosts: function() {
      child.addEventListener('testEvent', testCallback);
      eventManager.registerHost(testHostCallback.bind(host));
      eventManager.registerHost(testHostCallback.bind(host));
      eventManager.registerHost(testHostCallback.bind(host));
      eventManager.dispatchEvent(anEvent);

      doh.assertEqual(1, child.callbackFired, 'Child did not handle event');
      doh.assertEqual(3, host.hostCallbackFired, 'Host did not handle event');
    }
  }).register(doh);

});
