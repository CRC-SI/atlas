define([
  // Code under test
  'atlas/visualisation/AbstractProjection',
  'atlas/visualisation/HeightProjection',
  'atlas/visualisation/ColourProjection'
], function (AbstractProjection, HeightProjection, ColourProjection) {

  /**
   * Wrapper for the AbstractProjection test suite. This allows the test suite
   * to be applied to multiple classes, ie. AbstractProjection and all its subclasses, easily.
   * @param {String} parametrisedTestName - Name of the class under test.
   * @param {Function} parametrisedTestClass - Constructor of class to test.
   */
  var parametrisedTestSuite = function (parametrisedTestName, parametrisedTestClass) {

    describe('A ' + parametrisedTestName, function () {
      var abPro, someValues, someMoreValues, everyValue, someStats, someParams;

      beforeEach(function () {
        someValues = {0: 0, 1: 1, 2: 2};
        someMoreValues = {3: 3, 4: 4, 5: 5};
        everyValue = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5};
        someStats = {min: {id: '0', value: 0}, max: {id: '2', value: 2}, sum: 3, average: 1, count: 3, range: 2};
        someParams = {
          '0': {
            diffFromAverage: -1,
            ratioBetweenMinMax: 0,
            ratioFromAverage: -1
          },
          '1': {
            diffFromAverage: 0,
            ratioBetweenMinMax: 0.5,
            ratioFromAverage: 0
          },
          '2': {
            diffFromAverage: 1,
            ratioBetweenMinMax: 1,
            ratioFromAverage: 1
          }
        };
      });

      describe('can be constructed', function () {
        // TODO(bpstudds): Add checks and mock passing in of GeoEntities.

        it('by default', function () {
          abPro = new parametrisedTestClass();
          expect(abPro.getType()).toEqual('continuous');
          expect(abPro.getValues()).toEqual({});
          expect(abPro.getConfiguration()).toEqual({});
        });

        it('with values', function () {
          abPro = new parametrisedTestClass({values: someValues});
          expect(abPro.getValues()).toEqual(someValues);
        });

        it('but fails with the incorrect arguments', function () {
          var func = function () { new parametrisedTestClass({type: 'incorrect', values: someValues}); };
          expect(func).toThrow();
        });
      });

      describe('once constructed', function () {
        beforeEach(function () {
          abPro = new parametrisedTestClass({values: someValues});
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

        it('can have stats calculated for the values', function () {
          var stats = abPro._calculateValuesStatistics();
          expect(stats).toEqual(someStats);
        });

        it('can have parameters calculated for all the values', function () {
          var params = abPro._calculateProjectionParameters();
          expect(params).toEqual(someParams);
        });
      }); // End 'once constructed'
    }); // End 'A parametrised test suite'
  }; // End parametricTestSuite()

  // Run the test suite over AbstractProjection and all it's subclasses.
  parametrisedTestSuite('AbstractProjection', AbstractProjection);
  parametrisedTestSuite('HeightProjection', HeightProjection);
  parametrisedTestSuite('ColourProjection', ColourProjection);
});
