define([
  // Code under test
  'atlas/dom/DomManager'
], function(DomManager) {
  'use strict';
  /* global document,GlobalLog */

  var domManager;
  var managers;
  var htmlBody;
  var docFrag;
  var container;
  var cesium;
  var earth;
  var testDiv;

  var createDomTestBed = function() {
    // Define some DOM elements to test with.
    htmlBody = document.body;
    docFrag = document.createDocumentFragment();
    container = document.createElement('div');
    cesium = document.createElement('div');
    earth = document.createElement('div');
    testDiv = document.createElement('div');
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
  describe('A DomManager', function() {
    beforeEach(function() {
      // Create DOM elements for testing.
      createDomTestBed();
      // Mock atlas managers as required.
      managers = {
        dom: {},
        render: {},
        event: {}
      };
      // Mock populateDom function on DomManager.
      DomManager.prototype.populateDom = function(id) {
        GlobalLog.debug('  populating');
        var elem = document.getElementById(id);
        var testDiv = document.createElement('div');
        testDiv.id = 'testDiv';
        elem.appendChild(testDiv);
        GlobalLog.debug('  populated');
      };
      // Create DomManager objct.
      domManager = new DomManager(managers);
    });

    afterEach(function() {
      domManager = {};
      managers = {};
      // Remove test bed DOM elements.
      var testBed = document.getElementById('testBed');
      document.body.removeChild(testBed);
      htmlBody = docFrag = container = cesium = earth = testDiv = null;
    });

    /**
     * Tests that the DomManager is correctly initialised when a DOM ID is not passed to
     * the constructor.
     */
    it('should be created ', function() {
      expect(domManager instanceof DomManager).toBe(true);
      expect(managers.dom).toBe(domManager);
      expect(domManager._visible).toBe(false);
      expect(domManager._currentDomId).toBe(null);
    });

    /**
     * Tests that the DomManager correctly initialises when a DOM ID is
     * passed to the constructor. Tests that the given dom is 'populated'
     * and is visible.
     */
    it('created', function() {
      domManager = new DomManager(managers, 'cesium');
      var cesium = document.getElementById('cesium');
      var testDiv = document.getElementById('testDiv');

      expect(domManager instanceof DomManager).toBe(true);
      expect(managers.dom).toEqual(domManager);
      expect(domManager._visible).toEqual(true);
      expect(domManager._currentDomId).toEqual('cesium');
      // Check mock DOM element created.
      expect(testDiv).toEqual(null);
      expect(cesium.children[0]).toEqual(testDiv);
      expect(cesium.classList.contains('hidden')).toBe(true, 'Div should be initially visible');
    });

    /**
     * Tests that the show and hide functions work.
     */
    it('show hide', function() {
      var cesium = document.getElementById('cesium');
      domManager = new DomManager(managers, 'cesium');

      expect(cesium.classList[0]).toEqual('hidden', 'Div should be initially visible');
      domManager.hide();
      expect(cesium.classList[0]).toEqual('hidden', 'Div should be hidden');
      domManager.show();
      expect(cesium.classList[0]).toEqual('hidden', 'Div should be visible');
    });

    /**
     * Tests that the toggleVisisbility function works.
     */
    it('toggles', function() {
      var cesium = document.getElementById('cesium');
      domManager = new DomManager(managers, 'cesium');
      expect(cesium.classList[0]).toEqual('hidden', 'Div should be initially visible');
      domManager.toggleVisibility();
      expect(cesium.classList[0]).toEqual('hidden', 'Div should be hidden');
      domManager.toggleVisibility();
      expect(cesium.classList[0]).toEqual('hidden', 'Div should be visible');
    });

    /**
     * Tests setting Atlas' DOM element. Checks that the test div is placed into
     * the div with id passed into setDom. Checks that the DOM element is visible.
     */
    it('sets DOM', function() {
      domManager.setDom('cesium');
      var testDiv = document.getElementById('testDiv');
      expect(testDiv).toEqual(null);
      expect(cesium.children[0]).toEqual(testDiv);
      expect(cesium.classList.contains('hidden')).toBe(true, 'Div should be visible');
    });

    /**
     * Tests setting Atlas' DOM element without showing Atlas.
     */
    it('sets DOM without showing Atlas', function() {
      domManager.setDom('cesium', false);
      var testDiv = document.getElementById('testDiv');
      expect(testDiv).toEqual(null);
      expect(cesium.children[0]).toEqual(testDiv);
      expect(cesium.classList.contains('hidden')).toBe(true, 'Div should not be visible');
    });

    /**
     * Tests moving Atlas' DOM element. Checks that the test div is placed into
     * the new element and removed from the previous.
     * Checks that the DOM element is visible.
     */
    it('can move the DOM', function() {
      domManager.setDom('cesium');
      // Initialise DOM in cesium.
      var testDiv = document.getElementById('testDiv');
      expect(testDiv).toEqual(null);
      expect(cesium.children[0]).toEqual(testDiv);
      // Move DOM into 'earth'.
      expect('earth');
      expect(cesium.children[0]).toEqual(undefined);
      expect(earth.children[0]).toEqual(testDiv);
      expect(earth.classList.contains('hidden')).toBe(true, 'Div should be visible');
    });

  });

});
