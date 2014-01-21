define([
  'atlas/model/Feature',
  'atlas/model/Colour',
  // Code under test.
  'atlas/visualisation/ColourProjection'
], function (Feature, Colour, ColourProjection) {
  var colourProj,
      someValues = {0: 0, 1: 1, 2: 2},
      initialColour = Colour.GREEN,
      newColour = Colour.RED,
      someEntities;

  describe('A ColourProjection', function () {

    beforeEach(function () {
      someEntities = {
        0: new Feature(0, {}),
        1: new Feature(1, {}),
        2: new Feature(2, {})
      };
      colourProj = new ColourProjection({values: someValues, entities: someEntities});
      for (var id in Object.keys(someEntities)) {
        // setHeight() normally returns the previously set height. In these tests we only
        // care about set and reset the height once, so the fixed return is okay.
        spyOn(someEntities[id], 'modifyStyle').andCallThrough();
      }
    });

    afterEach(function () {
      someEntities = {0: null, 1: null, 2: null};
      colourProj = null;
    });

    describe('can render effects', function () {
      // TODO(bpstudds): Modify tests so the expected values are not hardcoded.

      it('to all it\'s GeoEntities', function () {
        var ids = Object.keys(someEntities);
        colourProj.render();
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fill: newColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
          expect(someEntities[id]._style._fillColour).toEqual(newColour);
        }
      });

      it('to a subset of it\'s GeoEntities', function () {
        var ids = [0, 2];
        colourProj.render();
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fill: newColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
          expect(someEntities[id]._style._fillColour).toEqual(newColour);
        }
      });

      it('to one of it\'s GeoEntities', function () {
        var ids = [1];
        colourProj.render();
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fill: newColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
          expect(someEntities[id]._style._fillColour).toEqual(newColour);
        }
      });
    }); // End 'can render effects'

    describe('can unrender effects', function () {
      beforeEach(function () {
        colourProj.render();
      });

      it('to all it\'s GeoEntities', function () {
        var ids = Object.keys(someEntities);
        colourProj.unrender();
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fill: initialColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style._fillColour).toEqual(initialColour);
        }
      });

      it('to a subset of it\'s GeoEntities', function () {
        var ids = [0, 2];
        colourProj.unrender();
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fill: initialColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style._fillColour).toEqual(initialColour);
        }
      });

      it('to one of it\'s GeoEntities', function () {
        var ids = [1];
        colourProj.unrender();
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fill: initialColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style._fillColour).toEqual(initialColour);
        }
      });
    }); // End 'can unrender effects'
  }); // End 'A ColourProjection'
});
