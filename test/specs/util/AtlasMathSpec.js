define([
  'atlas/util/AtlasMath'
], function(AtlasMath) {

  describe('An AtlasMath', function() {

    describe('averages', function() {
      it('can calculate averages', function() {
        var arr = [1, 2, 3, 4, 5];
        var ave = AtlasMath.average(arr);
        expect(ave).toEqual(3);
      });

      it('works with empty arrays', function() {
        expect(AtlasMath.average([])).toEqual(0);
      });

      it('doesn\'t work with non-arrays', function() {
        expect(function() {
          AtlasMath.average({});
        }).toThrow();
        expect(function() {
          AtlasMath.average('');
        }).toThrow();
      });

    });

    describe('maximum', function() {
      it('can calulate maximums when given an array of positive numbers', function() {
        expect(AtlasMath.max([5, 3, 1, 6, 4])).toBe(6);
      });

      it('can calulate maximums when given an array of negative numbers', function() {
        expect(AtlasMath.max([-3, -12, -8, -100])).toBe(-3);
      });

      it('can calulate maximums when given an array of negative and positive numbers', function() {
        expect(AtlasMath.max([3.3, -10, 12, 6, 4 + 4])).toBe(12);
      });

    });

  });

});
