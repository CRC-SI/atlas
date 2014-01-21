define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../Material'
], function (doh, TestCase, Material) {

  /* Test globals go here */
  var material = new Material();


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/model/Material',

    setUp: function () {
      // summary:
      material = new Material();
    }
  }).register(doh);
});

