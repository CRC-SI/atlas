define([
    'doh/runner',
    'dam/TestCase',
    // Code under test.
    '../GeoEntity'
], function (doh, TestCase, GeoEntity) {

  var id;
  var geoEntity;

  new TestCase({
    name: 'atlas/model/tests/GeoEntity',

    setUp: function() {
      // summary:
      //      Create an GeoEntity object to test presence of functions.
      id = 12345;
      args = {
        eventManager: 'em',
        renderManager: 'rm'
      };
      geoEntity = new GeoEntity(id, args); 
    },

    tearDown: function() {
      geoEntity = null;
    },

    testCreateEventManager: function() {
      doh.assertTrue(geoEntity instanceof GeoEntity);
      doh.assertEqual(id, geoEntity._id);
    },

    testParameters: function() {
      doh.assertEqual(null, geoEntity._centroid);
      doh.assertEqual(0, geoEntity._area);
      doh.assertEqual(false, geoEntity._visible);
    },

    testSetRenderable: function() {
      doh.assertTrue(!geoEntity.isRenderable());
      geoEntity.setRenderable();
      doh.assertTrue(geoEntity.isRenderable());
      geoEntity.setRenderable(true);
      doh.assertTrue(geoEntity.isRenderable());
      geoEntity.setRenderable(false);
      doh.assertTrue(!geoEntity.isRenderable());
    },

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
