define([
    'doh/runner',
    // Code under test.
    '../Event'
], function(doh, Event) {
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
      doh.assertEqual(bareEvent.getTarget(), target);
      doh.assertEqual(bareEvent.getType(), type);
      doh.assertTrue(!bareEvent.getArgs());
      doh.assertTrue(!bareEvent.isCancelled());
    },

    function createEventWithArgs() {
      doh.assertEqual(argedEvent.getTarget(), target);
      doh.assertEqual(argedEvent.getType(), type);
      doh.assertEqual(argedEvent.getArgs(), args);
      doh.assertTrue(!argedEvent.isCancelled());
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
      doh.assertTrue(bareEvent.isCancelled());
      doh.assertTrue(!bareEvent.cancelHost);
      bareEvent.cancel(false);
      doh.assertTrue(bareEvent.isCancelled());
      doh.assertTrue(!bareEvent.cancelHost);
      bareEvent.cancel(true);
      doh.assertTrue(bareEvent.isCancelled());
      doh.assertTrue(bareEvent.cancelHost);
    }
  ];
  
  doh.register('events/Event', tests);
  return tests;
});
