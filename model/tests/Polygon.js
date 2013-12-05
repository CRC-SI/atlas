define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../Polygon',
], function (doh, TestCase, Polygon) {

  /* Test globals go here */
  var polygon = new Polygon();


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/model/Polygon',

    setUp: function () {
      // summary:
      polygon = new Polygon(id, vertices, args);
    },

    testSetHeight: function() {
      // summary:
    },

    testSetElevation: function() {
      // summary:
    },

    testInsertVertex: function() {
      // summary:
    },

    testEdit: function() {
      // summary:
    },

    testRemove: function() {
      // summary:
    },

    testRemoveVertex: function() {
      // summary:
    },

    testGetArea: function() {
      // summary:
    },

    testGetCentroid: function() {
      // summary:
    },

    testAddVertex: function() {
      // summary:
    },

    testFromWKT: function() {
      // summary:
    }
  }).register(doh);
});

