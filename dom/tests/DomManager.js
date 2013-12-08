define([
  'doh/runner',
  'dam/TestCase',
  /* Code under test */
  '../DomManager',
], function (doh, TestCase, DomManager) {
  "use strict";

  var domManager;
  var atlasManagers;

  var createDomTestBed = function () {
    // Define some DOM elements to test with.
    var htmlBody = document.body;
    var docFrag = document.createDocumentFragment();
    var container = document.createElement('div');
    var cesium = document.createElement('div');
    var earth = document.createElement('div');
    var testDiv = document.createElement('div');
    // And set up the DOM elements.
    testDiv.id = 'testDiv';
    container.id = 'testBed';
    container.classList.add('hidden');
    cesium.id = 'cesium';
    earth.id = 'earth';
    container.appendChild(cesium);
    container.appendChild(earth);
    docFrag.appendChild(container);
    htmlBody.appendChild(docFrag);
  };

  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/dom/DomManager',

    setUp: function () {
      // summary:

      // Create DOM elements for testing.
      createDomTestBed();
      // Mock atlas managers as required.
      atlasManagers = {
        dom: {},
        render: {},
        event: {}
      };
      // Mock populateDom function on DomManager.
      DomManager.prototype.populateDom = function (id) {
        console.debug('populating');
        var elem = document.getElementById(id);
        var testDiv = document.createElement('div');
        testDiv.id = 'testDiv';
        elem.appendChild(testDiv);
      };
      // Create DomManager objct.
      domManager = new DomManager(atlasManagers);
    },

    tearDown: function () {
      domManager = {};
      atlasManagers = {};
      // Remove test bed DOM elements.
      var testBed = document.getElementById('testBed');
      document.body.removeChild(testBed);
    },

    testCreateDefault: function () {
      // summary:
      //      Tests that the DomManager is correctly initialised when a DOM id
      //      is not passed to the constructor.
      doh.assertTrue(domManager instanceof DomManager);
      doh.assertTrue(atlasManagers.dom === domManager);
      doh.assertEqual(false, domManager._visible);
      doh.assertEqual("", domManager._currentDomId);
    },

    testCreate: function() {
      // summary:
      //      Tests that the DomManager correctly initialises when a DOM id is
      //      passed to the constructor. Tests that the given dom is 'populated'
      //      and is visible.
      domManager = new DomManager(atlasManagers, 'cesium');
      var cesium = document.getElementById('cesium');
      var testDiv = document.getElementById('testDiv');

      doh.assertTrue(domManager instanceof DomManager);
      doh.assertTrue(atlasManagers.dom === domManager);
      doh.assertEqual(true, domManager._visible);
      doh.assertEqual('cesium', domManager._currentDomId);
      // Check mock DOM element created.
      doh.assertNotEqual(null, testDiv, 'Test div not created.');
      doh.assertEqual(testDiv, cesium.children[0], 'Test div not placed correctly');
      doh.assertFalse(cesium.classList.contains('hidden'), 'Div should be initially visible');
    },

    testShowHide: function() {
      var cesium = document.getElementById('cesium');
      domManager = new DomManager(atlasManagers, 'cesium');

      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be initially visible');
      domManager.hide();
      doh.assertTrue(cesium.classList[0] == 'hidden', 'Div should be hidden');
      domManager.show();
      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be visible');
    },

    testToggleVisibility: function() {
      var cesium = document.getElementById('cesium');
      domManager = new DomManager(atlasManagers, 'cesium');
      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be initially visible');
      domManager.toggleVisibility();
      doh.assertTrue(cesium.classList[0] == 'hidden', 'Div should be hidden');
      domManager.toggleVisibility();
      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be visible');
    },

    testSetDom: function () {
      // summary:
      //      Dom is initially not shown, check that it is shown when the DOM
      //      is first set.

      domManager.setDom('cesium');
      var testDiv = document.getElementById('testDiv');
      doh.assertNotEqual(null, testDiv, 'Test div not created.');
      doh.assertEqual(testDiv, cesium.children[0], 'Test div not placed correctly');
      doh.assertFalse(cesium.classList.contains('hidden'), 'Div should be visible');
    },

    testMoveDom: function () {

    }


  }).register(doh);
});

