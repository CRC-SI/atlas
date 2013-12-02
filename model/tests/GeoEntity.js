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
      console.error("setup", geoEntity.dispatchEvent);
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

    /*
    testEventTargetness: function() {
      // Members
      doh.assertNotEqual('undefined', typeof(geoEntity.eventHandlers));
      doh.assertNotEqual('undefined', typeof(geoEntity.nextEventListenerId));
      doh.assertNotEqual('undefined', typeof(geoEntity.parent));

      // Functions
      doh.assertEqual('function', typeof(geoEntity.dispatchEvent()));
      doh.assertEqual('function', typeof(geoEntity.addEventListener()));
      doh.assertEqual('function', typeof(geoEntity.removeEventListener()));
      doh.assertEqual('function', typeof(geoEntity.handleEvent()));
    }
    */
  }).register(doh);

});
