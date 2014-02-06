define([
  'atlas/visualisation/AbstractProjection',
  'atlas/model/Feature',
  // Code under test.
  'atlas/visualisation/DynamicProjection'
], function (AbstractProjection, Feature, DynamicProjection) {

  describe('A DynamicProjection', function () {
    var dynPrj,
        mockedPrj,
        someEntities,
        data = [
          { index: 0,
            values: {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
          },
          { index: 20,
            values: {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
          },
          { index: 30,
            values: {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
          },
          { index: 40
          }
        ];

    beforeEach(function () {
      someEntities = {
        0: new Feature(0, {id: 0}),
        1: new Feature(1, {id: 1}),
        2: new Feature(2, {id: 2}),
        3: new Feature(3, {id: 3}),
        4: new Feature(4, {id: 4})
      };
      mockedPrj = new AbstractProjection({values: {}, entities: someEntities});
    });

    it('can be constructed', function () {
      dynPrj = new DynamicProjection(mockedPrj, data);
      expect(dynPrj).not.toBeNull();
    });

    describe('once constructed', function () {
      beforeEach(function () {
        mockedPrj = new AbstractProjection({values: {}, entities: someEntities})
      })
    })
  })
});
