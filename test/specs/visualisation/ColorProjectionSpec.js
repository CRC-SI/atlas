define([
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  'atlas/material/Color',
  // Code under test.
  'atlas/visualisation/ColorProjection'
], function(Setter, Feature, Color, ColorProjection) {
  var colorProj,
      someValues = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4},
      someEntities,
      initialColor = Color.GREEN,
      newColor = Color.RED,
      args;

  describe('A ColorProjection', function() {
    beforeEach(function() {
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

    afterEach(function() {
      colorProj = null;
      someEntities = {0: null, 1: null, 2: null};
    });

    describe('can be constructed', function() {

      describe('for a discrete projection', function() {
        it('with a fixed codomain', function() {
          var codomain = {fixedProj: Color.RED};
          args = Setter.mixin({type: 'discrete', bins: 3, codomain: codomain}, args);
          colorProj = new ColorProjection(args);
          colorProj.render();
          expect(colorProj._entities[0].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.RED});
          expect(colorProj._entities[2].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.RED});
          expect(colorProj._entities[4].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.RED});
        });

        it('with a single codomain', function() {
          // This test _will_ fail if Color.BLUE and Color.RED are frozen.
          var codomain = {regressBy: 'hue', startProj: Color.RED, endProj: Color.BLUE};
          args = Setter.mixin({type: 'discrete', bins: 3, codomain: codomain}, args);
          colorProj = new ColorProjection(args);
          colorProj.render();
          // Check that GeoEntities were binned correctly.
          // There are three bins and the values are in [0, 4].
          // Hence the three bins are 0: [0, 4/3), 1: [4/3, 8/3), and 2: [8/3, 4]
          expect(colorProj._attributes[0].binId).toEqual(0);
          expect(colorProj._attributes[1].binId).toEqual(0);
          expect(colorProj._attributes[2].binId).toEqual(1);
          expect(colorProj._attributes[3].binId).toEqual(2);
          expect(colorProj._attributes[4].binId).toEqual(2);
          expect(colorProj._stats[0].entityIds).toEqual(['0', '1']);
          expect(colorProj._stats[1].entityIds).toEqual(['2']);
          expect(colorProj._stats[2].entityIds).toEqual(['3', '4']);
          //expect(colorProj._entities[0].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.BLUE});
          //expect(colorProj._entities[2].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.BLUE});
          //expect(colorProj._entities[4].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.RED});
        });
      }); // End 'for a discrete projection'.

      describe('for a continuous projection', function() {
        it('with a single codomain', function() {
          // This test _will_ fail if Color.BLUE and Color.GREEN are frozen.
          var codomain = {regressBy: 'hue', startProj: Color.BLUE, endProj: Color.GREEN};
          args = Setter.mixin({type: 'continuous', codomain: codomain}, args);
          colorProj = new ColorProjection(args);
          colorProj.render();
          expect(colorProj._attributes[0].binId).toEqual(0);
          expect(colorProj._attributes[1].binId).toEqual(0);
          expect(colorProj._attributes[2].binId).toEqual(0);
          expect(colorProj._attributes[3].binId).toEqual(0);
          expect(colorProj._attributes[4].binId).toEqual(0);
          expect(colorProj._stats[0].entityIds).toEqual(['0', '1', '2', '3', '4']);
          //expect(colorProj._entities[0].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.BLUE});
          //expect(colorProj._entities[2].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.BLUE});
          //expect(colorProj._entities[4].modifyStyle).toHaveBeenCalledWith({fillMaterial: Color.GREEN});
        })
      });

      describe('by default', function() {
        // TODO(bpstudds): Modify tests so the expected values are not hardcoded.

        beforeEach(function() {
          colorProj = new ColorProjection({values: someValues, entities: someEntities});
        });

        describe('and render effects', function() {
          it('to all it\'s GeoEntities', function() {
            var ids = Object.keys(someEntities);
            colorProj.render();
            for (var i = 0; i < ids.length; i++) {
              var id = ids[i];
              expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillMaterial: newColor});
              expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
              expect(someEntities[id]._style.getFillMaterial()).toEqual(newColor);
            }
          });

          it('to a subset of it\'s GeoEntities', function() {
            var ids = [0, 2];
            colorProj.render(ids);
            for (var i = 0; i < ids.length; i++) {
              var id = ids[i];
              expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillMaterial: newColor});
              expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
              expect(someEntities[id]._style.getFillMaterial()).toEqual(newColor);
            }
          });

          it('to one of it\'s GeoEntities', function() {
            var id = 1;
            colorProj.render(id);
            expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillMaterial: newColor});
            expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
            expect(someEntities[id]._style.getFillMaterial()).toEqual(newColor);
          });
        }); // End 'and render effects'.
      }); // End 'by default'.
    }); // End 'can be constructed'.

    describe('when constructed can unrender effects', function() {
      beforeEach(function() {
        colorProj = new ColorProjection({values: someValues, entities: someEntities});
        colorProj.render();
      });

      it('to all it\'s GeoEntities', function() {
        var ids = Object.keys(someEntities);
        colorProj.unrender();
        // Expect to be changed
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillMaterial: initialColor});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style.getFillMaterial()).toEqual(initialColor);
        }
      });

      it('to a subset of it\'s GeoEntities', function() {
        var ids = [0, 2];
        colorProj.unrender(ids);
        // Expect to be changed
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillMaterial: initialColor});
          expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
          expect(someEntities[id]._style.getFillMaterial()).toEqual(initialColor);
        }
        // Expect to be unchanged
        expect(someEntities[1].modifyStyle.calls.length).toEqual(1);
      });

      it('to one of it\'s GeoEntities', function() {
        var id = 1;
        colorProj.unrender(id);
        expect(someEntities[id].modifyStyle).toHaveBeenCalledWith({fillMaterial: initialColor});
        expect(someEntities[id].modifyStyle.calls.length).toEqual(2);
        expect(someEntities[id]._style.getFillMaterial()).toEqual(initialColor);
        // Expect to be unchanged
        [0, 2].forEach(function(id) {
          expect(someEntities[id].modifyStyle.calls.length).toEqual(1);
        });
      });
    }); // End 'can unrender effects'

    describe('can generate a legend', function() {
      beforeEach(function() {
        var legend;
        args = {
          values: someValues,
          entities: someEntities,
          codomain: {startProj: Color.RED, endProj: Color.RED}
        };
      });

      describe('for a continuous projection', function() {
        beforeEach(function() {
          args.type = 'continuous';
          delete args.bins;
        });

        it('with 1 legend (=== 1 bin)', function() {
          var expected = [
            { cells: [
              { bgColor: 'linear-gradient(to bottom,#ff0000,#ff0000)', width: '1em' },
              {value: '0.000&ndash;1.000'}
            ] },
            { cells: [
              { bgColor: 'linear-gradient(to bottom,#ff0000,#ff0000)', width: '1em' },
              {value: '1.000&ndash;2.000'}
            ] },
            { cells: [
              { bgColor: 'linear-gradient(to bottom,#ff0000,#ff0000)', width: '1em' },
              {value: '2.000&ndash;3.000'}
            ] },
            { cells: [
              { bgColor: 'linear-gradient(to bottom,#ff0000,#ff0000)', width: '1em' },
              {value: '3.000&ndash;4.000'}
            ] }
          ];
          colorProj = new ColorProjection(args);
          colorProj.render();
          legend = colorProj.getLegend();
          expect(legend).toNotBe(null);
          expect(legend.rows).toEqual(expected);
        });
      });

      describe('for a discrete projection', function() {
        beforeEach(function() {
          args.type = 'discrete'
        });

        it('with 1 bin and 1 legend', function() {
          var expected = [
            { bgColor: Color.RED, width: '1em' },
            { value: '0.000&ndash;4.000' }
          ];
          args.bins = 1;
          colorProj = new ColorProjection(args);
          colorProj.render();
          legend = colorProj.getLegend();
          expect(legend).toNotBe(null);
          expect(legend.rows[0]).toNotBe(null);
          expect(legend.rows[0].cells).toEqual(expected);
        });

        it('with 3 bins and 1 legend', function() {
          var expected = [
            { cells: [
              { bgColor: Color.RED, width: '1em' },
              {value: '0.000&ndash;1.333'}
            ] },
            { cells: [
              { bgColor: Color.RED, width: '1em' },
              {value: '1.333&ndash;2.667'}
            ] },
            { cells: [
              { bgColor: Color.RED, width: '1em' },
              {value: '2.667&ndash;4.000'}
            ] }
          ];
          args.bins = 3;
          colorProj = new ColorProjection(args);
          colorProj.render();
          legend = colorProj.getLegend();
          expect(legend).toNotBe(null);
          expect(legend.rows).toEqual(expected);
        });
      }); // End 'for a discrete projection'
    }); // End 'can generate a legend'
  }); // End 'A ColorProjection'
});
