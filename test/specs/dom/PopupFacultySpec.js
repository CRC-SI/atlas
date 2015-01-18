define([
  // Code under test
  'atlas/dom/PopupFaculty'
], function(PopupFaculty) {
  var popupFaculty,
      popup,
      entityId = '0001',
      html = '<p>Text</p>',
      cssClass = 'aPopup',
      domNode,
      position = {top: 0, left: 0},
      args = {
        entityId: entityId,
        position: position,
        content: html
      };

  describe('A PopupFaculty', function() {

    beforeEach(function() {
      /* global document */
      domNode = document.createElement('div');
      domNode.id = 'popupContainer';
    });

    afterEach(function() {
      popupFaculty = null;
      popup = null;
    });

    it('should be constructed with a parent dom node', function() {
      popupFaculty = new PopupFaculty({parent: domNode});
      expect(popupFaculty).not.toBeNull();
    });

    it('should be constructed with no EventManager or a valid one', function() {
      var noArgs = function() { popupFaculty = new PopupFaculty(); },
          emptyManager = function() { popupFaculty = new PopupFaculty({eventManager: {}}); },
          incorrectManager = function() { popupFaculty = new PopupFaculty({eventManager: null}); };

      expect(noArgs).toThrow();
      expect(emptyManager).toThrow();
      expect(incorrectManager).toThrow();
    });

    it('should show popups given HTML content, a top-left position, and a entity ID', function() {
      popupFaculty = new PopupFaculty({parent: domNode});
      popup = popupFaculty.show(args);
      expect(popup.getContent()).toContain(html);
      expect(popup.getPosition()).toEqual(position);
      expect(popup.getEntityId()).toEqual(entityId);
    });

    it('should allow a CSS class for the overlay contained be set', function() {
      popupFaculty = new PopupFaculty({parent: domNode});
      args.cssClass = cssClass;
      popup = popupFaculty.show(args);
      expect(popup.getCssClass()).toEqual(cssClass);
    });

    it('should hide popup identify by associated entity ID', function() {
      popupFaculty = new PopupFaculty({parent: domNode});
      popup = popupFaculty.show(args);
      expect(popup.isVisible()).toBe(true);
      popup = popupFaculty.hide({entityId: entityId});
      expect(popup.isVisible()).toBe(false);
    });

  });
});
