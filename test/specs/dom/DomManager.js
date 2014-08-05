define([
  'doh/runner',
  'dam/TestCase',
  // Code under test
  '../DomManager'
], function (doh, TestCase, DomManager) {
  "use strict";

  var domManager;
  var managers;

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
      managers = {
        dom: {},
        render: {},
        event: {}
      };
      // Mock populateDom function on DomManager.
      DomManager.prototype.populateDom = function (id) {
        console.debug('  populating');
        var elem = document.getElementById(id);
        var testDiv = document.createElement('div');
        testDiv.id = 'testDiv';
        elem.appendChild(testDiv);
        console.debug('  populated');
      };
      // Create DomManager objct.
      domManager = new DomManager(managers);
    },

    tearDown: function () {
      domManager = {};
      managers = {};
      // Remove test bed DOM elements.
      var testBed = document.getElementById('testBed');
      document.body.removeChild(testBed);
    },

    /**
     * Tests that the DomManager is correctly initialised when a DOM ID
     * is not passed to the constructor.
     */
    testCreateDefault: function () {
      doh.assertTrue(domManager instanceof DomManager);
      doh.assertTrue(managers.dom === domManager);
      doh.assertEqual(false, domManager._visible);
      doh.assertEqual(null, domManager._currentDomId);
    },

    /**
     * Tests that the DomManager correctly initialises when a DOM ID is
     * passed to the constructor. Tests that the given dom is 'populated'
     * and is visible.
     */
    testCreate: function() {
      domManager = new DomManager(managers, 'cesium');
      var cesium = document.getElementById('cesium');
      var testDiv = document.getElementById('testDiv');

      doh.assertTrue(domManager instanceof DomManager);
      doh.assertTrue(managers.dom === domManager);
      doh.assertEqual(true, domManager._visible);
      doh.assertEqual('cesium', domManager._currentDomId);
      // Check mock DOM element created.
      doh.assertNotEqual(null, testDiv, 'Test div not created.');
      doh.assertEqual(testDiv, cesium.children[0], 'Test div not placed correctly');
      doh.assertFalse(cesium.classList.contains('hidden'), 'Div should be initially visible');
    },

    /**
     * Tests that the show and hide functions work.
     */
    testShowHide: function() {
      var cesium = document.getElementById('cesium');
      domManager = new DomManager(managers, 'cesium');

      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be initially visible');
      domManager.hide();
      doh.assertTrue(cesium.classList[0] == 'hidden', 'Div should be hidden');
      domManager.show();
      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be visible');
    },

    /**
     * Tests that the toggleVisisbility function works.
     */
    testToggleVisibility: function() {
      var cesium = document.getElementById('cesium');
      domManager = new DomManager(managers, 'cesium');
      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be initially visible');
      domManager.toggleVisibility();
      doh.assertTrue(cesium.classList[0] == 'hidden', 'Div should be hidden');
      domManager.toggleVisibility();
      doh.assertFalse(cesium.classList[0] == 'hidden', 'Div should be visible');
    },

    /**
     * Tests setting Atlas' DOM element. Checks that the test div is placed into
     * the div with id passed into setDom. Checks that the DOM element is visible.
     */
    testSetDom: function () {
      domManager.setDom('cesium');
      var testDiv = document.getElementById('testDiv');
      doh.assertNotEqual(null, testDiv, 'Test div not created.');
      doh.assertEqual(testDiv, cesium.children[0], 'Test div not placed correctly');
      doh.assertFalse(cesium.classList.contains('hidden'), 'Div should be visible');
    },

    /**
     * Tests setting Atlas' DOM element without showing Atlas.
     */
    testSetDomHidden: function () {
      domManager.setDom('cesium', false);
      var testDiv = document.getElementById('testDiv');
      doh.assertNotEqual(null, testDiv, 'Test div not created.');
      doh.assertEqual(testDiv, cesium.children[0], 'Test div not placed correctly');
      doh.assertTrue(cesium.classList.contains('hidden'), 'Div should not be visible');
    },

    /**
     * Tests moving Atlas' DOM element. Checks that the test div is placed into
     * the new element and removed from the previous. 
     * Checks that the DOM element is visible.
     */
    testMoveDom: function () {
      domManager.setDom('cesium');
      // Initialise DOM in cesium.
      var testDiv = document.getElementById('testDiv');
      doh.assertNotEqual(null, testDiv, 'Test div was not created.');
      doh.assertEqual(testDiv, cesium.children[0], 'Test div not placed correctly before move');
      // Move DOM into 'earth'.
      domManager.setDom('earth');
      doh.assertEqual(undefined, cesium.children[0], 'test div not removed properly');
      doh.assertEqual(testDiv, earth.children[0], 'test div not placed correctly after move.');
      doh.assertFalse(earth.classList.contains('hidden'), 'Div should be visible');
    }
  }).register(doh);

});

