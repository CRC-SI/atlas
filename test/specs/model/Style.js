define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../Style'
], function(doh, TestCase, Style) {

  /* Test globals go here */
  var style = new Style();


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/model/Style',

    setUp: function() {
      // summary:
      style = new Style();
    }
  }).register(doh);
});

