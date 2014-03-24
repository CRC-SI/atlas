define([
  'atlas/model/Vertex',
  // Code under test.
  'atlas/model/Ellipse'
], function (Ellipse) {
  describe ('An Ellipse', function () {
    var ellipse,
        data,
        args;

    beforeEach (function () {
      data = {
        centroid: new Vertex(0, 0, 0),
        semiMajor: 10,
        semiMinor: 10
      };

    });

    afterEach (function () {
      ellipse = null;
      args = null;
    });

    describe ('can be constructed', function () {
      it ('when all expected constructor args are given', function () {
        ellipse = new Ellipse('id', data, {});
        expect(ellipse).not.toBeNull();
        expect(ellipse.getId()).toEqual('id');
      });

    });

  })
});
