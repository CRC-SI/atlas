define([
  // Code under test
  'atlas/util/NumberFormatter',
], function(NumberFormatter) {
  describe('NumberFormatter', function() {

    var formatter;

    beforeEach(function() {
      formatter = new NumberFormatter();
    });

    afterEach(function() {
      formatter = null;
    });

    it('can round', function() {
      expect(formatter.round(1.5)).toEqual('1.5');
      expect(formatter.round(1.2222)).toEqual('1.222');
      expect(formatter.round(1.2225)).toEqual('1.223');
      expect(formatter.round(1.2225, {minSigFigs: 0, maxSigFigs: 0})).toEqual('1');
      expect(formatter.round(1.2225, {minSigFigs: 0, maxSigFigs: 1})).toEqual('1.2');
      expect(formatter.round(1, {minSigFigs: 0, maxSigFigs: 1})).toEqual('1');
    });

  });
});
