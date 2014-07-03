define([
  'atlas/model/GeoPoint',
  // Code under test
  'atlas/model/LineNetwork'
], function (GeoPoint, LineNetwork) {
  var lineNw,
      id = 'lineNw',
      nwData,
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
      ],
      actualLineVertices = [
        [vertices[0], vertices[2], vertices[3]],
        [vertices[0], vertices[1]]
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
      nwData = {
        vertexData: vertices,
        lineData: lines
      };
      lineNw = new LineNetwork(id, nwData);
      expect(lineNw).not.toBeNull();
      expect(lineNw.getVertexData()).toEqual(vertices);
      expect(lineNw.getLineData()).toEqual(lines);
      var f = lineNw.constructNetwork.bind(lineNw);
      expect(f).not.toThrow();
      lineNw.constructNetwork();
      [0,1].forEach(function (id) {
        expect(lineNw.getLine(id).getVertices()).toEqual(actualLineVertices[id]);
      });
    });
  });
});
