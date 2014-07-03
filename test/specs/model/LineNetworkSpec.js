define([
  'atlas/model/GeoPoint',
  // Code under test
  'atlas/model/LineNetwork'
], function (GeoPoint, LineNetwork) {
  var lineNw,
      id = 'lineNw',
      args,
      vertices = [
        new GeoPoint(0, 0),
        new GeoPoint(0, 1),
        new GeoPoint(1, 1),
        new GeoPoint(1, 0)
      ],
      lines = [
        {vertexIds: [0, 2, 3]},
        {vertexIds: [0, 1]}
      ];

  describe('A LineNetwork', function () {
    afterEach(function () {
      lineNw = null;
    });

    it('should be constructable with just an ID', function () {
      lineNw = new LineNetwork(id);
      expect(lineNw).not.toBeNull();
      expect(lineNw.getId()).toEqual(id);

      lineNw = new LineNetwork({id: id});
      expect(lineNw).not.toBeNull();
      expect(lineNw.getId()).toEqual(id);
    });

    it('should construct lines if given appropriate structures using GeoPoints', function () {
      args = {
        id: id,
        vertexData: vertices,
        lineData: lines
      };
      lineNw = new LineNetwork(args);
      expect(lineNw).not.toBeNull();
      expect(lineNw.getVertices()).toEqual(vertices);
      expect(lineNw.getLines()).toEqual(lines);
    });
  });
});
