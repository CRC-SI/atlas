define([
  // Code under test
  'atlas/model/LineNetwork'
], function (LineNetwork) {
  var lineNw,
      id = 'lineNw';

  describe('A LineNetwork', function () {
    it('should be constructable with just an ID', function () {
      lineNw = new LineNetwork(id);
      expect(lineNw).not.toBeNull();
      expect(lineNw.getId()).toEqual(id);
    })
  });
});
