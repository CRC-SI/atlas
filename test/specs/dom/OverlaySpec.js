define([
  'atlas/model/Colour',
  '../../lib/simulate.js',
  // Code under test.
  'atlas/dom/Overlay'
], function (Colour, simulate, Overlay) {

    var parent,
        position = {
          top: 100,
          left: 200
        },
        dimensions = {
          height: 300,
          width: 400
        },
        content = '<p>Wootage!</p>',
        args,
        overlay,
        element;

  var getOverlayDom = function () {
    var overlay = parent.getElementsByClassName('overlay')[0],
        title = overlay.getElementsByClassName('overlay-title')[0],
        content = overlay.getElementsByClassName('overlay-body')[0];
    return {
      overlay: overlay,
      title: title,
      content: content
    }
  };

  describe('An Overlay', function () {


    beforeEach(function () {
      parent = document.createElement('div');
      args = {parent: parent, position: position, dimensions: dimensions, content: content};
    });

    afterEach(function () {
      overlay && overlay.remove();
      parent = null;
      overlay = null;
      element = null;
    });

    describe('Non-default', function () {

      it('can have a title', function () {
        args.title = 'title';
        overlay = new Overlay(args);

        var actual = getOverlayDom();
        expect(actual.title.innerHTML).toEqual('title');
      });

      it('should have a remove button if an onRemove callback is given', function () {
        args.title = 'title';
        args.onRemove = function () {};
        overlay = new Overlay(args);

        var actual = getOverlayDom(),
            removeBtn = actual.title.getElementsByClassName('remove-overlay')[0];
        expect(overlay._onRemove).toEqual(args.onRemove);
        expect(removeBtn).not.toBeUndefined();
        expect(removeBtn).not.toBeNull();
        expect(removeBtn.type).toEqual('submit');
      });

      it('should have a remove button if hasRemoveBtn is true', function () {
        args.hasRemoveBtn = true;
        overlay = new Overlay(args);

        var actual = getOverlayDom(),
            removeBtn = actual.title.getElementsByClassName('remove-overlay')[0];
        expect(removeBtn).not.toBeUndefined();
        expect(removeBtn).not.toBeNull();
        expect(removeBtn.type).toEqual('submit');
      });

      it('should be removed by default when the remove button is clicked', function () {
        // default callback
        args.hasRemoveBtn = true;
        overlay = new Overlay(args);

        var removeBtn = getOverlayDom().title.getElementsByClassName('remove-overlay')[0];
        spyOn(overlay, 'remove');
        simulate(removeBtn, 'click');
        expect(overlay.remove).toHaveBeenCalled();
      });

      it('should call the given callback when the remove button is pressed', function () {
        args.onRemove = function () {};
        var overlay = new Overlay(args),
            removeBtn = getOverlayDom().title.getElementsByClassName('remove-overlay')[0];
        spyOn(overlay, '_onRemove');
        simulate(removeBtn, 'click');
        expect(overlay._onRemove).toHaveBeenCalled();
      });

      it('should not have a remove button by default', function () {
        overlay = new Overlay(args);
        var actual = getOverlayDom(),
            removeBtn = actual.title.getElementsByClassName('remove-overlay')[0];
        expect(removeBtn).toBeUndefined();
      });

      it('should not have a remove button if told not to', function () {
        args.hasRemoveButton = false;
        overlay = new Overlay(args);

        var actual = getOverlayDom(),
            removeBtn = actual.title.getElementsByClassName('remove-overlay')[0];
        expect(removeBtn).toBeUndefined();
      });

      it('should not have a remove button if onRemove is not a valid function', function () {
        args.title = 'title';
        // onEnabledChange is undefined
        overlay = new Overlay(args);
        var actual = getOverlayDom(),
            removeBtn = actual.title.getElementsByClassName('remove-overlay')[0];
        expect(removeBtn).toBeUndefined();
        overlay.remove();

        // onEnabledChange is not a function
        args.onEnabledChange = {};
        overlay = new Overlay(args);
        var actual = getOverlayDom(),
            removeBtn = actual.title.getElementsByClassName('remove-overlay')[0];
        expect(removeBtn).toBeUndefined();
      });

      it('should have an enable checkbox if an onEnabledChange callback is given', function () {
        args.title = 'title';
        args.onEnabledChange = function () {};
        overlay = new Overlay(args);

        var actual = getOverlayDom(),
            enableCb = actual.title.getElementsByClassName('enable-overlay')[0];
        expect(enableCb).not.toBeUndefined();
        expect(enableCb).not.toBeNull();
        expect(enableCb.type).toEqual('checkbox');
      });

      it('should have an enable checkbox if hasEnableCheckbox is true', function () {
        args.title = 'title';
        args.hasEnableCheckbox = true;
        overlay = new Overlay(args);

        var actual = getOverlayDom(),
            enableCb = actual.title.getElementsByClassName('enable-overlay')[0];
        expect(enableCb).not.toBeUndefined();
        expect(enableCb).not.toBeNull();
        expect(enableCb.type).toEqual('checkbox');
      });

      it('should call a callback when the enable checkbox is toggled', function () {
        args.hasEnableCheckbox = true;
        overlay = new Overlay(args);

        var enableCb = getOverlayDom().title.getElementsByClassName('enable-overlay')[0];
        spyOn(overlay, 'toggleMinimisation');
        simulate(enableCb, 'click');
        expect(overlay.toggleMinimisation).toHaveBeenCalled();

        overlay.remove();
        args.onEnabledChange = function () {};
        overlay = new Overlay(args);

        enableCb = getOverlayDom().title.getElementsByClassName('enable-overlay')[0];
        spyOn(overlay, '_onEnabledChange');
        simulate(enableCb, 'click');
        expect(overlay._onEnabledChange).toHaveBeenCalled();
      });

      it('should not have an enable checkbox if hasEnableCheckbox is false', function () {
        args.title = 'title';
        args.hasEnableCheckbox = false;
        overlay = new Overlay(args);

        var actual = getOverlayDom(),
            enableCb = actual.title.getElementsByClassName('enable-overlay')[0];
        expect(enableCb).toBeUndefined();
      });

      it('should not have an enable checkbox if onEnabledChange is not a valid function', function () {
        args.title = 'title';
        // onEnabledChange is undefined
        overlay = new Overlay(args);
        var actual = getOverlayDom(),
            enableCb = actual.title.getElementsByClassName('enable-overlay')[0];
        expect(enableCb).toBeUndefined();
        overlay.remove();

        // onEnabledChange is not a function
        args.onEnabledChange = {};
        overlay = new Overlay(args);
        actual = getOverlayDom();
        enableCb = actual.title.getElementsByClassName('enable-overlay')[0];
        expect(enableCb).toBeUndefined();
      });

      it('should be able to be minimised and maximised', function () {
        overlay = new Overlay(args);
        var domBefore = getOverlayDom(),
            isMinimised = domBefore.content.classList.contains('hidden');
        expect(isMinimised).toBe(false);

        overlay.minimise();
        var domAfter = getOverlayDom();
        isMinimised = domAfter.content.classList.contains('hidden');
        expect(isMinimised).toBe(true);

        overlay.maximise();
        domAfter = getOverlayDom();
        isMinimised = domAfter.content.classList.contains('hidden');
        expect(isMinimised).toBe(false);
      });
    });

    describe('Default', function () {

      beforeEach(function () {
        overlay = new Overlay(args);
      });

      it('can be constructed', function () {
        expect(overlay.getParent()).toBe(parent);
        expect(overlay.getDimensions()).toBe(dimensions);
        expect(overlay.getContent()).toContain(content);
      });

      it('can create an element containing plain text from content', function () {
        var actual = getOverlayDom();
        expect(actual.overlay.classList.contains('hidden')).toBe(false);
        expect(actual.content.innerHTML).toEqual(content);
      });

      it('is attached to the parent node', function () {
        var actualOverlay = parent.getElementsByClassName('overlay')[0];
        expect(actualOverlay).not.toBeNull();
      });

      it('it has dimensions', function () {
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

      it('can be removed', function() {
        overlay.remove();
        expect(parent.children.length).toBe(0);
      });
    });

    describe ('can generate HTML', function () {
      it ('with tag class and id', function () {
        var data = {
          cssClass: 'aClass',
          id: 'anId'
        };
        var html = Overlay.parseAttributes(data);
        expect(html).toEqual(' class="aClass" id="anId"');
      });

      it ('with inline tag styles', function () {
        var data = {
          bgColour: Colour.RED
        };
        var html = Overlay.parseAttributes(data);
        expect(html).toEqual(' style="background-color:#ff0000;"');
      });

      it ('handling blank data', function () {
        var html = Overlay.parseAttributes({});
        expect(html).toEqual('');
        var html = Overlay.parseAttributes();
        expect(html).toEqual('');
      })

      it ('as a plain table', function () {
        var data = {
              id: 'table',
              rows: [
                {
                  id: 'row1',
                  cells: [ {value: '0'}, {value: '10'} ]
                },
                {
                  cells: [ {value: '1'}, {value: '11'} ]
                }
              ]
            },
            html = Overlay.generateTable(data);
        expect(html).toEqual(
          '<table id="table">' +
            '<tr id="row1"><td>0</td><td>10</td></tr>' +
            '<tr><td>1</td><td>11</td></tr>' +
          '</table>')
      });

      it ('as a table with background colour', function () {
        var data = {
              rows: [
                {
                  cells: [ {value: '0', bgColour: Colour.RED}, {value: '10', bgColour: Colour.BLUE} ]
                },
                {
                  cells: [ {value: '1'}, {value: '11', bgColour: Colour.GREEN} ]
                }
              ]
            },
            html = Overlay.generateTable(data);
        expect(html).toEqual(
          '<table>' +
            '<tr><td style="background-color:#ff0000;">0</td><td style="background-color:#0000ff;">10</td></tr>' +
            '<tr><td>1</td><td style="background-color:#00ff00;">11</td></tr>' +
          '</table>'
        )
      })
    });
  }); // End 'An Overlay'.
});
