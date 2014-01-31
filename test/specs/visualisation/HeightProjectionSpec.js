define([
  'atlas/util/mixin',
  'atlas/model/Feature',
  // Code under test
  'atlas/visualisation/HeightProjection'
], function (mixin, Feature, HeightProjection) {
  describe('A HeightProjection', function () {
    var heightProj,
        someValues = {0: 0, 1: 1, 2: 2},
        initialHeight = 50,
        someEntities = {
          0: new Feature(0, {id: 0, height: initialHeight}),
          1: new Feature(1, {id: 1, height: initialHeight}),
          2: new Feature(2, {id: 1, height: initialHeight})
        };

    beforeEach(function () {
      heightProj = new HeightProjection({values: someValues, entities: someEntities});
      for (var id in Object.keys(someEntities)) {
        // setHeight() normally returns the previously set height. In these tests we only
        // care about set and reset the height once, so the fixed return is okay.
        spyOn(someEntities[id], 'setHeight').andReturn(initialHeight);
      }
    });

    afterEach(function () {
      heightProj = null;
    });

    describe('can render effects', function () {

      describe('with a default codomain and bin', function () {
        it('to all it\'s entities', function () {
          heightProj.render();
          for (var id in Object.keys(someEntities)) {
            expect(someEntities[id].setHeight).toHaveBeenCalledWith(heightProj._effects[id].newValue);
            expect(someEntities[id].setHeight.calls.length).toEqual(1);
          }
        });

        it('to a subset of entities', function () {
          var ids = [0, 2];
          heightProj.render(ids);
          for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            expect(someEntities[id].setHeight).toHaveBeenCalledWith(heightProj._effects[id].newValue);
            expect(someEntities[id].setHeight.calls.length).toEqual(1);
          }
        });

        it('to a single entity', function () {
          var id = 1;
          heightProj.render(id);
          expect(someEntities[id].setHeight).toHaveBeenCalledWith(heightProj._effects[id].newValue);
          expect(someEntities[id].setHeight.calls.length).toEqual(1);
        });
      }); // End 'with default codomain and bin'.

      // TODO(bpstudds): Implement tests for customisable codomain.
      xdescribe('with', function () {
        var args = {values: someValues, entities: someEntities};

        it('a fixed codomain', function () {
          heightProj = new HeightProjection(mixin(args, {codomain: {fixedProj: 15}}));
          expect(someEntities[id].setHeight).toHaveBeenCalledWith(15);
          expect(someEntities[id].setHeight.calls.length).toEqual(1);
        });

        it('a single codomain and (default) bin', function () {
          fail();
        });

      }); // End 'with specific codomain'.
    }); // End 'can render effects'.

    describe('can unrender effects', function() {
      beforeEach(function () {
        // Set up some effects to undo.
        heightProj.render();
      });

      it('on all it\'s entities', function () {
        heightProj.unrender();
        for (var id in Object.keys(someEntities)) {
          expect(someEntities[id].setHeight).toHaveBeenCalledWith(initialHeight);
          expect(someEntities[id].setHeight.calls.length).toEqual(2);
        }
      });

      it('on all it\'s entities', function () {
        var ids = [0, 2];
        heightProj.unrender(ids);
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          expect(someEntities[id].setHeight).toHaveBeenCalledWith(initialHeight);
          expect(someEntities[id].setHeight.calls.length).toEqual(2);
        }
      });

      it('on all it\'s entities', function () {
        var id = 1;
        heightProj.unrender(id);
        expect(someEntities[id].setHeight).toHaveBeenCalledWith(initialHeight);
        expect(someEntities[id].setHeight.calls.length).toEqual(2);
      }); // 'End can unrender effects'.
    }); // End 'can unrender effects'.
  }); // End 'A HeightProjection'.
});
