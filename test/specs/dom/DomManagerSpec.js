define([
  // Code under test
  'atlas/dom/DomManager'
], function(DomManager) {
  'use strict';
  /* global document*/

  var domManager;
  var managers;

  var containerId = 'fake-container';
  var cesiumDivId = 'cesium';
  var earthDivId = 'earth';

  /* Begin test case definitions */
  describe('A DomManager', function() {
    beforeEach(function() {
      // Create DOM elements to 'render' into
      var container = document.createElement('div');
      var cesiumDiv = document.createElement('div');
      cesiumDiv.id = cesiumDivId;
      var earthDiv = document.createElement('div');
      earthDiv.id = earthDivId;
      container.id = containerId;
      container.appendChild(cesiumDiv);
      container.appendChild(earthDiv);
      document.body.appendChild(container);

      // Mock atlas managers as required.
      managers = {
        dom: {},
        render: {},
        event: {}
      };

      // Create DomManager objct.
      domManager = new DomManager(managers);
      spyOn(domManager, 'populateDom');
    });

    afterEach(function() {
      domManager = null;
      managers = null;
      // Remove test bed DOM elements.
      var container = document.getElementById(containerId);
      document.body.removeChild(container);
    });

    it('should not assign an element or make the element visible when constructing', function() {
      // Construction occurs in beforeEach
      expect(domManager instanceof DomManager).toBe(true);
      expect(managers.dom).toBe(domManager);
      expect(domManager._visible).toBe(false);
      expect(domManager.getDomNode()).toBe(null);
    });

    it('should default to not showing the node when setting the dom node', function() {
      domManager.setDom('cesium');
      var cesiumDiv = document.getElementById('cesium');
      expect(domManager.populateDom).toHaveBeenCalled();

      expect(cesiumDiv).not.toEqual(null);
      expect(cesiumDiv.classList.contains('hidden')).toBe(true);
    });

    it('should set and display Atlas in a given node when requested', function() {
      var cesiumDiv = document.getElementById('cesium');
      domManager.setDom('cesium', true);
      expect(domManager.populateDom).toHaveBeenCalled();

      expect(cesiumDiv).not.toEqual(null);
      expect(cesiumDiv.classList.contains('hidden')).toBe(false);
    });

    /**
     * Tests that the show and hide functions work.
     */
    it('should be able to show the dom node when it is hidden, and vice versa', function() {
      var cesiumDiv = document.getElementById('cesium');
      // Default to hidden
      domManager.setDom('cesium');

      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(false);
      domManager.show();
      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(true);
      domManager.hide();
      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(false);
    });

    /**
     * Tests that the toggleVisisbility function works.
     */
    it('should be able to toggle visisbility', function() {
      domManager.setDom('cesium', true);
      var cesiumDiv = document.getElementById(cesiumDivId);

      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(true);
      domManager.hide();
      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(false);
      domManager.show();
      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(true);
    });

    /**
     * Tests moving Atlas' DOM element. Checks that the test div is placed into
     * the new element and removed from the previous.
     * Checks that the DOM element is visible.
     */
    it('can move the DOM', function() {
      domManager.setDom(cesiumDivId, true);
      var cesiumDiv = document.getElementById(cesiumDivId);
      var earthDiv = document.getElementById(earthDivId);

      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(true);
      expect(earthDiv.classList.contains('hidden')).not.toEqual(true);

      domManager.setDom(earthDivId, true);
      expect(earthDiv.classList.contains('hidden')).not.toEqual(true);
      expect(cesiumDiv.classList.contains('hidden')).not.toEqual(false);
    });

  });

});
