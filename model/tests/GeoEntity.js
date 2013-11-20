define([
    'doh/runner',
    'dam/TestCase',
    // Code under test.
    '../GeoEntity'
], function (doh, TestCase, GeoEntity) {

  var geoEntity;

  new TestCase({
    name: 'atlas/model/tests/GeoEntity',

    setUp: function() {
      // summary:
      //      Create an GeoEntity object to test presence of functions.
      geoEntity = new GeoEntity(); 
    },

    tearDown: function() {
      geoEntity = null;
    },

    testCreateEventManager: function() {
      doh.assertTrue(geoEntity);
    },

    testParameters: function() {
      doh.assertEqual(null, geoEntity.centroid);
      doh.assertEqual(0, geoEntity.area);
      doh.assertEqual(false, geoEntity.visible);
    }
  }).register(doh);

});
