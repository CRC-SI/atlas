define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../Color'
], function(doh, TestCase, Color) {

  /* Test globals go here */
  var color = new Color();


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/material/Color',

    setUp: function() {
      // summary:
      color = new Color(1, 1, 1, 1);
    },

    test_limit: function() {
      // summary:
    }
  }).register(doh);
});

