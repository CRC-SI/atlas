define([
    'doh/runner',
    // Code under test.
    '../Event'
], function (doh, Event) {
  var bareEvent;
  var argedEvent;
  var target = { object: "target" };
  var type = "testEvent";
  var args = { arg1: "arg1", arg2: 0 };

  var tests = [
    {
      name: "initEvent",
      setUp: function() {
        bareEvent = new Event(target, type);
        argedEvent = new Event(target, type, args);
      },
      runTest: function() {
        doh.assertTrue(bareEvent);
        doh.assertTrue(argedEvent);
      }
    },
    
    function createBasic() {
      doh.assertEqual(bareEvent.target, target);
      doh.assertEqual(bareEvent.type, type);
      doh.assertTrue(!bareEvent.args);
      doh.assertTrue(!bareEvent.cancelled);
      doh.assertTrue(!bareEvent.cancelHost);
    },

    function createEventWithArgs() {
      doh.assertEqual(argedEvent.target, target);
      doh.assertEqual(argedEvent.type, type);
      doh.assertEqual(argedEvent.args, args);
      doh.assertTrue(!argedEvent.cancelled);
      doh.assertTrue(!argedEvent.cancelHost);
    },

    function createIncorrectly() {
      try {
        var incorrectEvent = new Event();
      } catch(err) {
        doh.assertTrue(1);
        return;
      }
      doh.assertTrue(0);
    },

    function cancelEvent() {
      bareEvent.cancel();
      doh.assertTrue(bareEvent.cancelled);
      doh.assertTrue(!bareEvent.cancelHost);
      bareEvent.cancel(false);
      doh.assertTrue(bareEvent.cancelled);
      doh.assertTrue(!bareEvent.cancelHost);
      bareEvent.cancel(true);
      doh.assertTrue(bareEvent.cancelled);
      doh.assertTrue(bareEvent.cancelHost);
    }
  ];
  
  doh.register('events/Event', tests);
  return tests;
});
