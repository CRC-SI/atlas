define([
  // Code under test
  'atlas/dom/PopupFaculty'
], function (PopupFaculty) {
  var popupFaculty,
      popup,
      entityId = '0001',
      html = '<p>Text</p>',
      cssClass = 'aPopup',
      domNode,
      args = {
        entityId: entityId,
        position: {top: 0, left: 0},
        content: html
      };

  describe('A PopupFaculty', function () {

    beforeEach(function () {
      domNode = document.createElement('div');
      domNode.id = 'popupContainer';
      document.appendChild(domNode);
    });

    afterEach(function () {
      popupFaculty = null;
      popup = null;
    });

    it('should be constructed with a parent dom node', function () {
      popupFaculty = new PopupFaculty({parentDomNode: 'popupContainer'});
      expect(popupFaculty).not.toBeNull();
      popupFaculty = new PopupFaculty({parentDomNode: domNode});
      expect(popupFaculty).not.toBeNull();
    });

    xit('should require an EventManager to be constructed', function () {
      var noArgs = function () { popupFaculty = new PopupFaculty(); },
          noManager = function () { popupFaculty = new PopupFaculty({}); },
          emptyManager = function () { popupFaculty = new PopupFaculty({eventManager: {}}); },
          incorrectManager = function () { popupFaculty = new PopupFaculty({eventManager: null}); };

      expect(noArgs).toThrow();
      expect(noManager).toThrow();
      expect(emptyManager).toThrow();
      expect(incorrectManager).toThrow();
    });

    it('should show popups given HTML content, a top-left position, and a entity ID', function () {
      popup = popupFaculty.show(args);
      expect(popup.isVisible()).toBe(true);
      expect(popup.getContent()).toEqual(html);
      expect(popup.getPosition()).toEqual(position);
      expect(popup.getEntityId()).toEqual(entityId);
    });

    it('should allow a CSS class for the overlay contained be set', function () {
      args.cssClass = cssClass;
      popup = popupFaculty.show(args);
      expect(popup.getCssClass()).toEqual(cssClass);
    });

    it('should hide popup identify by associated entity ID', function () {
      popup = popupFaculty.showPopup(args);
      expect(popup.isVisible()).toBe(true);
      popup = popupFaculty.hidePopup(entityId)
      expect(popup.getDom()).toBeNull();
    });

  });
});
