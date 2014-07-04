define([
  'atlas/model/GeoPoint',
  // Code under test
  'atlas/model/LineNetwork'
], function (GeoPoint, LineNetwork) {
  var lineNw,
      id = 'lineNw',
      args,
      vertices,
      lines,
      nwData,
      actualLineVertices;

  describe('A LineNetwork', function () {
    beforeEach(function () {
      vertices = [
        new GeoPoint(0, 0),
        new GeoPoint(0, 1),
        new GeoPoint(1, 1),
        new GeoPoint(1, 0)
      ];
      lines = [
        {vertexIds: [0, 2, 3]},
        {vertexIds: [0, 1]}
      ];
      nwData = {
        vertexData: vertices,
        lineData: lines
      };
      actualLineVertices = [
        [vertices[0], vertices[2], vertices[3]],
        [vertices[0], vertices[1]]
      ];
    });

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

    it('should be able to construct lines if given appropriate structures using GeoPoints', function () {
      lineNw = new LineNetwork(id, nwData);
      expect(lineNw).not.toBeNull();
      expect(lineNw.getVertexData()).toEqual(vertices);
      expect(lineNw.getLineData()).toEqual(lines);
      [0,1].forEach(function (id) {
        expect(lineNw.getLine(id).getVertices()).toEqual(actualLineVertices[id]);
      });
    });

    it('should set line widths by default', function () {
      lineNw = new LineNetwork(id, nwData);
      var defaultWidth = lineNw.getDefaultLineWidth();
      lineNw.getLines().forEach(function (line) {
        expect(line.getWidth()).toEqual(defaultWidth);
      });
    });

    it('should allow default line widths to be set', function () {
      var lineWidth = '10px';
      nwData.lineWidth = lineWidth;
      lineNw = new LineNetwork(id, nwData);

      lineNw.getLines().forEach(function (line) {
        expect(line.getWidth()).toEqual(lineWidth);
      });
    });

    it('should allow widths to be set for individual lines', function () {
      var line1 = 12, line2 = '6px';
      nwData.lineData[0].width = line1;
      nwData.lineData[1].width = line2;
      lineNw = new LineNetwork(id, nwData);

      expect(lineNw.getLine(0).getWidth()).toEqual(line1);
      expect(lineNw.getLine(1).getWidth()).toEqual(line2);
    })

  });
});
