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
  });
});
