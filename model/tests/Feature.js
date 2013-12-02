define([
    'doh/runner',
    'dam/TestCase',
    // Code under test.
    '../Feature'
], function (doh, TestCase, Feature) {

  var feature;
  var id = 12345;

  new TestCase({
    name: 'atlas/model/tests/Feature',

    setUp: function() {
      // summary:
      //      Create a Feature object.
      feature = new Feature(id, null, null, null);
    },

    tearDown: function() {
      feature = null;
    },

    testCreateFeature: function() {
      doh.assertTrue(feature);
    },

    testParameters: function() {
      doh.assertEqual(id, feature.id);
      //doh.assertEqual(0, geoEntity.area);
      //doh.assertEqual(false, geoEntity.visible);
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
