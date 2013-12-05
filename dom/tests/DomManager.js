define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../DomManager',
], function (doh, TestCase, DomManager) {

  /* Test globals go here */
  var domManager;


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/dom/DomManager',

    setUp: function () {
      // summary:
      atlasManagers = {
        dom: {},
        render: {},
        event: {}
      };
      domManager = new DomManager(atlasManagers);
    },

    testToggleVisibility: function() {
      // summary:
    },

    testPopulateDom: function() {
      // summary:
    },

    testSetDom: function() {
      // summary:
    },

    testHide: function() {
      // summary:
    },

    testShow: function() {
      // summary:
    }
  }).register(doh);
});

