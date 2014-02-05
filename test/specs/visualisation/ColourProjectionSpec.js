define([
  'atlas/lib/tinycolor',
  'atlas/util/mixin',
  'atlas/model/Feature',
  'atlas/model/Colour',
  // Code under test.
  'atlas/visualisation/ColourProjection'
], function (tinycolor, mixin, Feature, Colour, ColourProjection) {
  var colourProj,
      someValues = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4},
      someEntities,
      initialColour = Colour.GREEN,
      newColour = Colour.RED,
      args;

  describe('A ColourProjection', function () {
    beforeEach(function () {
      someEntities = {
        0: new Feature(0, {}),
        1: new Feature(1, {}),
        2: new Feature(2, {}),
        3: new Feature(3, {}),
        4: new Feature(4, {})
      };
      for (var id in Object.keys(someEntities)) {
        // setHeight() normally returns the previously set height. In these tests we only
        // care about set and reset the height once, so the fixed return is okay.
        spyOn(someEntities[id], 'modifyStyle').andCallThrough();
      }
      args = {values: someValues, entities: someEntities};
    });

    afterEach(function () {
      colourProj = null;
      someEntities = {0: null, 1: null, 2: null};
    });

    describe('can be constructed', function () {

      describe('for a discrete projection', function () {
        it('with a fixed codomain', function () {
          var codomain = {fixedProj: Colour.RED};
          args = mixin({type: 'discrete', bins: 3, codomain: codomain}, args);
          colourProj = new ColourProjection(args);
          colourProj.render();
          expect(colourProj._entities[0].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.RED});
          expect(colourProj._entities[2].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.RED});
          expect(colourProj._entities[4].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.RED});
        });

        it('with a single codomain', function () {
          // This test _will_ fail if Colour.BLUE and Colour.RED are frozen.
          var codomain = {regressBy: 'hue', startProj: Colour.BLUE, endProj: Colour.RED};
          args = mixin({type: 'discrete', bins: 3, codomain: codomain}, args);
          colourProj = new ColourProjection(args);
          colourProj.render();
          // Check that GeoEntities were binned correctly.
          // There are three bins and the values are in [0, 4].
          // Hence the three bins are 0: [0, 4/3), 1: [4/3, 8/3), and 2: [8/3, 4]
          expect(colourProj._attributes[0].binId).toEqual(0);
          expect(colourProj._attributes[1].binId).toEqual(0);
          expect(colourProj._attributes[2].binId).toEqual(1);
          expect(colourProj._attributes[3].binId).toEqual(2);
          expect(colourProj._attributes[4].binId).toEqual(2);
          expect(colourProj._stats[0].entityIds).toEqual(['0', '1']);
          expect(colourProj._stats[1].entityIds).toEqual(['2']);
          expect(colourProj._stats[2].entityIds).toEqual(['3', '4']);
          expect(colourProj._entities[0].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.BLUE});
          //expect(colourProj._entities[2].modifyStyle).toHaveBeenCalledWith({fill: Colour.BLUE});
          expect(colourProj._entities[4].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.RED});
        });
      }); // End 'for a discrete projection'.

      describe('for a continuous projection', function () {
        it('with a single codomain', function () {
          // This test _will_ fail if Colour.BLUE and Colour.GREEN are frozen.
          var codomain = {regressBy: 'hue', startProj: Colour.BLUE, endProj: Colour.GREEN};
          args = mixin({type: 'continuous', codomain: codomain}, args);
          colourProj = new ColourProjection(args);
          colourProj.render();
          expect(colourProj._attributes[0].binId).toEqual(0);
          expect(colourProj._attributes[1].binId).toEqual(0);
          expect(colourProj._attributes[2].binId).toEqual(0);
          expect(colourProj._attributes[3].binId).toEqual(0);
          expect(colourProj._attributes[4].binId).toEqual(0);
          expect(colourProj._stats[0].entityIds).toEqual(['0', '1', '2', '3', '4']);
          expect(colourProj._entities[0].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.BLUE});
          //expect(colourProj._entities[2].modifyStyle).toHaveBeenCalledWith({fill: Colour.BLUE});
          expect(colourProj._entities[4].modifyStyle).toHaveBeenCalledWith({fillColour: Colour.GREEN});
        })
      });

      describe('by default', function () {
        // TODO(bpstudds): Modify tests so the expected values are not hardcoded.

        beforeEach(function () {
          colourProj = new ColourProjection({values: someValues, entities: someEntities});
        });

        describe('and render effects', function () {
          it('to all it\'s GeoEntities', function () {
            var ids = Object.keys(someEntities);
            colourProj.render();
            for (var i = 0; i < ids.length; i++) {
              var id = ids[i];
              expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillColour: newColour});
              expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
              expect(someEntities[id]._style._fillColour).toEqual(newColour);
            }
          });

          it('to a subset of it\'s GeoEntities', function () {
            var ids = [0, 2];
            colourProj.render(ids);
            for (var i = 0; i < ids.length; i++) {
              var id = ids[i];
              expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillColour: newColour});
              expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
              expect(someEntities[id]._style._fillColour).toEqual(newColour);
            }
          });

          it('to one of it\'s GeoEntities', function () {
            var id = 1;
            colourProj.render(id);
            expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillColour: newColour});
            expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
            expect(someEntities[id]._style._fillColour).toEqual(newColour);
          });
        }); // End 'and render effects'.
      }); // End 'by default'.
    }); // End 'can be constructed'.

    describe('when constructed can unrender effects', function () {
      beforeEach(function () {
        colourProj = new ColourProjection({values: someValues, entities: someEntities});
        colourProj.render();
      });

      it('to all it\'s GeoEntities', function () {
        var ids = Object.keys(someEntities);
        colourProj.unrender();
        // Expect to be changed
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillColour: initialColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style._fillColour).toEqual(initialColour);
        }
      });

      it('to a subset of it\'s GeoEntities', function () {
        var ids = [0, 2];
        colourProj.unrender(ids);
        // Expect to be changed
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillColour: initialColour});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style._fillColour).toEqual(initialColour);
        }
        // Expect to be unchanged
        expect(someEntities[1].modifyStyle.calls.length).toEqual(1);
      });

      it('to one of it\'s GeoEntities', function () {
        var id = 1;
        colourProj.unrender(id);
        expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillColour: initialColour});
        expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
        expect(someEntities[id]._style._fillColour).toEqual(initialColour);
        // Expect to be unchanged
        [0, 2].forEach(function (id) {
          expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
        });
      });
    }); // End 'can unrender effects'
  }); // End 'A ColourProjection'
});
