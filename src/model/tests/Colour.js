define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../Colour'
], function (doh, TestCase, Colour) {

  /* Test globals go here */
  var colour = new Colour();


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/model/Colour',

    setUp: function () {
      // summary:
      colour = new Colour(1, 1, 1, 1);
    },

    test_limit: function() {
      // summary:
    }
  }).register(doh);
});

