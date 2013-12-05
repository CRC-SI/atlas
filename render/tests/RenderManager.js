define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../RenderManager',
], function (doh, TestCase, RenderManager) {

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
      renderManager = new RenderManager();
    },

    tearDown: function () {
      renderManager = {};
      var atlasManagers = {
        dom: {},
        event: {},
        render: {}
      };
    },

    testHideTerrain: function() {
      // summary:
    },

    testSetTerrain: function() {
      // summary:
    },

    testHide: function() {
      // summary:
    },

    testShow: function() {
      // summary:
    },

    testShowTerrain: function() {
      // summary:
    },

    testRemove: function() {
      // summary:
    },

    testSetMapImagery: function() {
      // summary:
    },

    testAdd: function() {
      // summary:
    },

    test_isEntity: function() {
      // summary:
    }
  }).register(doh);
});

