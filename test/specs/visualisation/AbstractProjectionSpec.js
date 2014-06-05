define([
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  // Code under test
  'atlas/visualisation/AbstractProjection',
  'atlas/visualisation/HeightProjection',
  'atlas/visualisation/ColourProjection'
], function (Setter, Feature, AbstractProjection, HeightProjection, ColourProjection) {

  /**
   * Wrapper for the AbstractProjection test suite. This allows the test suite
   * to be applied to multiple classes, ie. AbstractProjection and all its subclasses, easily.
   * @param {String} parametrisedTestName - Name of the class under test.
   * @param {Function} parametrisedTestClass - Constructor of class to test.
   */
  var parametrisedTestSuite = function (parametrisedTestName, parametrisedTestClass) {

    describe('A ' + parametrisedTestName, function () {
      var abPro, someEntities, someValues, someMoreValues, everyValue, someStats, someAttributes,
          manyValues, manyEntities, bins1, bins2auto, bins2openBelow, bins2openAbove,
          bins2specifiedRange, manyStats, manyStats2bins, manyStats2binsSpecifiedRange,
          manyAttributes2binsSpecifiedRange;

      beforeEach(function () {
        someValues = {0: 0, 1: 1, 2: 2};
        someMoreValues = {3: 3, 4: 4, 5: 5};
        everyValue = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5};
        someStats = [{binId: 0, numBins: 1, min: {id: '0', value: 0}, max: {id: '2', value: 2}, sum: 3, average: 1, count: 3, range: 2, entityIds: ['0', '1', '2'], firstValue: Number.NEGATIVE_INFINITY, lastValue: Number.POSITIVE_INFINITY}];
        someEntities = {
          0: new Feature(0, {id: 0}),
          1: new Feature(1, {id: 1}),
          2: new Feature(2, {id: 1})
        };
        someAttributes = {
          0: {binId: 0, numBins: 1, absRatio: 0, diffFromAverage: -1, ratioFromAverage: -1},
          1: {binId: 0, numBins: 1, absRatio: 0.5, diffFromAverage: 0, ratioFromAverage: 0},
          2: {binId: 0, numBins: 1, absRatio: 1, diffFromAverage: 1, ratioFromAverage: 1}
        };
        manyValues = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 };
        manyEntities = {
          0: new Feature(0, {id: 0}),
          1: new Feature(1, {id: 1}),
          2: new Feature(2, {id: 2}),
          3: new Feature(3, {id: 3}),
          4: new Feature(4, {id: 4}),
          5: new Feature(5, {id: 5}),
          6: new Feature(6, {id: 6}),
          7: new Feature(7, {id: 7}),
          8: new Feature(8, {id: 8}),
          9: new Feature(9, {id: 9})
        };
        manyStats = [
          {binId: 0, numBins: 1, min: {id: '0', value: 0}, max: {id: '9', value: 9}, count: 10, average: 5, sum: 10, range: 45}
        ];
        manyStats2bins = [
          {binId: 0, numBins: 2, in: {id: '0', value: 0}, max: {id: '4', value: 4}, count: 5, average: 2, sum: 10, range: 4},
          {binId: 1, numBins: 2, in: {id: '5', value: 5}, max: {id: '9', value: 9}, count: 5, average: 7, sum: 35, range: 4}
        ];
        manyStats2binsSpecifiedRange = [
          {binId: 0, numBins: 2, min: {id: '1', value: 1}, max: {id: '3', value: 3}, count: 3, average: 2, sum: 6, range: 2, entityIds: ['1', '2', '3'], firstValue: 1, lastValue: 4},
          {binId: 1, numBins: 2, min: {id: '6', value: 6}, max: {id: '8', value: 8}, count: 3, average: 7, sum: 21, range: 2, entityIds: ['6', '7', '8'], firstValue: 6, lastValue: 9}
        ];
        bins1 = [
          { binId: 0, numBins: 1, firstValue: 0, lastValue: 9 }
        ];
        bins2openBelow= [
          { binId: 0, numBins: 2, firstValue: Number.NEGATIVE_INFINITY, lastValue: 5 },
          { binId: 1, numBins: 2, firstValue: 5, lastValue: 9 }
        ];
        bins2openAbove = [
          { binId: 0, numBins: 2, firstValue: 0, lastValue: 5 },
          { binId: 1, numBins: 2, firstValue: 5, lastValue: Number.POSITIVE_INFINITY }
        ];
        bins2auto = [
          { binId: 0, numBins: 2, firstValue: 0, lastValue: 4.5 },
          { binId: 1, numBins: 2, firstValue: 4.5, lastValue: 9 }
        ];
        bins2specifiedRange = [
          { binId: 0, numBins: 2, firstValue: 1, lastValue: 4 },
          { binId: 1, numBins: 2, firstValue: 6, lastValue: 9 }
        ];
        manyAttributes2binsSpecifiedRange = {
          //0: excluded
          1: {binId: 0, numBins: 2, absRatio: 0, diffFromAverage: -1, ratioFromAverage: -1},
          2: {binId: 0, numBins: 2, absRatio: 0.5, diffFromAverage: 0, ratioFromAverage: 0},
          3: {binId: 0, numBins: 2, absRatio: 1, diffFromAverage: 1, ratioFromAverage: 1},
          //4: excluded
          //5: excluded
          6: {binId: 1, numBins: 2, absRatio: 0, diffFromAverage: -1, ratioFromAverage: -1},
          7: {binId: 1, numBins: 2, absRatio: 0.5, diffFromAverage: 0, ratioFromAverage: 0},
          8: {binId: 1, numBins: 2, absRatio: 1, diffFromAverage: 1, ratioFromAverage: 1}
          //9: excluded
        };
      });

      describe('can be constructed', function () {
        // TODO(bpstudds): Add checks and mock passing in of GeoEntities.

        // You shouldn't be able to construct a Projection by default, it needs values and entities.
        xit('by default', function () {
          abPro = new parametrisedTestClass();
          expect(abPro.getType()).toEqual('continuous');
          expect(abPro.getValues()).toEqual({});
          expect(abPro.getConfiguration()).toEqual({});
        });

        it('with values', function () {
          abPro = new parametrisedTestClass({values: someValues, entities: someEntities});
          expect(abPro.getId()).toEqual('projection_100000');
          expect(abPro.getValues()).toEqual(someValues);
        });

        it('but fails with the incorrect arguments', function () {
          var func = function () { new parametrisedTestClass({type: 'incorrect', values: someValues, entities: someEntities}); };
          expect(func).toThrow();
        });

        describe('with bins', function () {
          var args;

          beforeEach(function () {
            args = {
              values: manyValues,
              entities: manyEntities
            };
          });

          it('by default', function () {
            abPro = new parametrisedTestClass(args);
            expect(abPro._bins).toEqual(bins1);
          });

          it('of variable number but fixed capacity', function () {
            args = Setter.mixin({bins: 2}, args);
            abPro = new parametrisedTestClass(args);
            expect(abPro._bins).toEqual(bins2auto);
          });

          describe('of variable number and capacity', function () {

            it('that are unbounded above', function () {
              args = Setter.mixin({
                bins: [{firstValue: 0, lastValue: 5}, {firstValue:5}]
              }, args);
              abPro = new parametrisedTestClass(args);
              expect(abPro._bins).toEqual(bins2openAbove);
            });

            it('that are unbounded below', function () {
              args = Setter.mixin({
                bins: [{lastValue: 5}, {firstValue:5, lastValue: 9}]
              }, args);
              abPro = new parametrisedTestClass(args);
              expect(abPro._bins).toEqual(bins2openBelow);
            });

            it('that have specified range', function () {
              args = Setter.mixin({
                bins: [{firstValue: 1, lastValue: 4}, {firstValue:6, lastValue: 9}]
              }, args);
              abPro = new parametrisedTestClass(args);
              expect(abPro._bins).toEqual(bins2specifiedRange);
              expect(abPro._calculateValueAttributes()).not.toBeNull();
            });
          }); // End 'of variable capacity'
        }); // End 'with bins'
      }); // End 'can be constructed'

      describe('once constructed', function () {
        beforeEach(function () {
          abPro = new parametrisedTestClass({values: someValues, entities: someEntities});
        });
        afterEach(function () {
          abPro = null;
        });

        it('can have values added', function () {
          abPro.update({values: someMoreValues, addToExisting: true});
          expect(abPro.getValues()).toEqual(everyValue);
        });

        it('can have new values set', function () {
          abPro.update({values: someMoreValues, addToExisting: false});
          expect(abPro.getValues()).toEqual(someMoreValues);
          abPro.update({values: someValues});
          expect(abPro.getValues()).toEqual(someValues);
        });

        describe('can have stats calculated for all values', function () {
          it('when divided into 1 bin', function () {
            // This test suite creates an AbstractProjection with 1 bin by default.
            // Stats for 'someValues' are calculated automatically when the AbPro is created.
            expect(abPro._stats).toEqual(someStats);
          });

          it('when divided into many bins', function () {
            // Create a new abPro with 2 bins specifying a limited range.
            abPro = new parametrisedTestClass({
              values: manyValues, entities: manyEntities, bins: bins2specifiedRange
            });
            expect(abPro._stats).toEqual(manyStats2binsSpecifiedRange);
          });
        }); // End 'can have stats calculated for all values'

        describe('can have projection attributes calculated for values', function () {
          it('when divided into 1 bin', function () {
            // This test suite creates an AbstractProjection with 1 bin by default.
            // Stats for 'someValues' are calculated automatically when the AbPro is created.
            expect(abPro._attributes).toEqual(someAttributes);
          });

          it('when divided into many bins', function () {
            // Create a new abPro with 2 bins specifying a limited range.
            abPro = new parametrisedTestClass({
              values: manyValues, entities: manyEntities, bins: bins2specifiedRange
            });
            expect(abPro._attributes).toEqual(manyAttributes2binsSpecifiedRange);
          });
        }); // End 'can have projection attributes calculated for values'
      }); // End 'once constructed'
    }); // End 'A parametrised test suite'
  }; // End parametricTestSuite()

  // Run the test suite over AbstractProjection and all it's subclasses.
  parametrisedTestSuite('AbstractProjection', AbstractProjection);
  // TODO(bpstudds): Is it really necessary to run the tests over the subclasses? Maybe the tests can be inherited.
  //parametrisedTestSuite('HeightProjection', HeightProjection);
  //parametrisedTestSuite('ColourProjection', ColourProjection);
});
