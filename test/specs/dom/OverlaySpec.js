define([
  // Code under test.
  'atlas/dom/Overlay'
], function (Overlay) {

  describe('An Overlay', function () {
    var parent,
        position = {
          top: 100,
          left: 200,
          height: 300,
          width: 400
        },
        html = '<p>Wootage!</p>',
        overlay,
        element;

    beforeEach(function () {
      parent = document.createElement('div');
      overlay = new Overlay(parent, position, html);
      element = overlay._render();
    });

    afterEach(function () {
      parent = null;
      overlay = null;
      element = null;
    });

    it('can be constructed', function () {
      expect(overlay._parent).toBe(parent);
      expect(overlay._position).toBe(position);
      expect(overlay._html).toBe(html);
    });

    it('can create an element containing plain text from html', function () {
      expect(element.innerHTML).toEqual(html);
      expect(element.classList.contains('hidden')).toBe(false);
    });

    it('is attached to the parent node', function () {
      expect(parent.children.length).toBe(1);
      expect(parent.children[0].innerHTML).toEqual(html);
    });

    it('is positioned', function () {
      expect(parent.children[0].style.top).toEqual('100px');
      expect(parent.children[0].style.left).toEqual('200px');
      expect(parent.children[0].style.height).toEqual('300px');
      expect(parent.children[0].style.width).toEqual('400px');
    });

    it('can be hidden', function () {
      overlay.hide();
      expect(parent.children[0].classList.contains('hidden')).toBe(true);
    });

    it('can be unhidden', function () {
      overlay.hide();
      overlay.show();
      expect(parent.children[0].classList.contains('hidden')).toBe(false);
    });
  }); // End 'An Overlay'.
});
