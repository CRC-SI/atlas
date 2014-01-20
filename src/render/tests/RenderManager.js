define([
  'doh/runner',
  'dam/TestCase',
  'atlas/model/Feature',
  /* Code under test */
  '../RenderManager'
], function (doh, TestCase, Feature, RenderManager) {
  "use strict";

  var atlasManagers;
  var renderManager;
  var args;

  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/render/RenderManager',

    setUp: function () {
      // summary:
      atlasManagers = {
        dom: {},
        render: {},
        event: {}
      };
      renderManager = new RenderManager(atlasManagers);
      args = {
        renderManager: renderManager,
        eventManager: atlasManagers.event
      };
    },

    tearDown: function () {
      renderManager = {};
      atlasManagers = {
        dom: {},
        event: {
          test: "test"
        },
        render: {}
      };
    },

    testCreate: function () {
      doh.assertTrue(renderManager instanceof RenderManager);
      doh.assertEqual(atlasManagers.render, renderManager);
      doh.assertEqual({}, renderManager._entities);
    },

    testAddFeature: function () {

      var feature = new Feature(0, args);
      renderManager.addFeature(0, args);
      doh.assertTrue(renderManager._entities[0] instanceof Feature);
      doh.assertEqual(renderManager, renderManager._entities[0]._renderManager);
      doh.assertEqual(atlasManagers.event, renderManager._entities[0]._eventManager);
    },

    testAddFeatureObjId: function () {
      args.id = 'blah';
      console.log(args);
      renderManager.addFeature(args); 
      doh.assertTrue(renderManager._entities[args.id] instanceof Feature);
      doh.assertEqual(renderManager, renderManager._entities[args.id]._renderManager);
      doh.assertEqual(atlasManagers.event, renderManager._entities[args.id]._eventManager);
    },

    testAddFeatureNoId: function () {
      var exception = "";
      try {
        renderManager.addFeature(args); 
      } catch (e) {
        var exception = e;
      }
      doh.assertNotEqual("", exception);
    },

    testRemoveEntity: function () {
      renderManager.addFeature(0, args);
      console.log(renderManager);
      renderManager.removeEntity(0);
      doh.assertEqual(undefined, renderManager._entities[0]);
    },

    testAddFeatureObjNoId: function () {
      var exception = "";
      try {
        renderManager.addFeature({}); 
      } catch (e) {
        var exception = e;
      }
      doh.assertNotEqual("", exception);
    }
  }).register(doh);
});

