define([
  'atlas/model/GeoPoint',
  // Code under test
  'atlas/model/LineNetwork'
], function (GeoPoint, LineNetwork) {
  var lineNw,
      id = 'lineNw',
      nwData,
      args,
      inputNodes,
      inputLines,
      expectedLineVertices;

  describe('A LineNetwork', function () {
    beforeEach(function () {
      inputNodes = [
        new GeoPoint(0, 0),
        new GeoPoint(0, 1),
        new GeoPoint(1, 1),
        new GeoPoint(1, 0)
      ];
      inputLines = [
        {nodeIds: [0, 2, 3]},
        {nodeIds: [0, 1]}
      ];
      nwData = {
        nodeData: inputNodes,
        lineData: inputLines
      };
      expectedLineVertices = [
        [inputNodes[0], inputNodes[2], inputNodes[3]],
        [inputNodes[0], inputNodes[1]]
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
      var actualNodes = lineNw.getNodeData();
      actualNodes.forEach(function (node, i) {
        expect(node).toEqual(inputNodes[i]);
      });
      expect(lineNw.getLineData()).toEqual(inputLines);
      lineNw.getLines().forEach(function (line, i) {
        expect(line.getVertices()).toEqual(expectedLineVertices[i]);
        expect(line.getId()).toEqual('network_line_10000' + i);
      });
    });

    it('should be able to set IDs of specific lines', function () {
      nwData.lineData.forEach(function (line, i) {
        line.id = 'line_' + i;
      });
      lineNw = new LineNetwork(id, nwData);
      lineNw.getLines().forEach(function (line, i) {
        expect(line.getId()).toEqual('line_' + i);
      });
    });

    it('should set line widths by default', function () {
      lineNw = new LineNetwork(id, nwData);
      var defaultWidth = lineNw.getDefaultLineWidth();
      lineNw.getLines().forEach(function (line) {
        expect(line.getWidth()).toEqual(defaultWidth);
      });
    });

    it('should allow getting individual lines by IDs', function () {
      lineNw = new LineNetwork(id, nwData);
      var aLine = lineNw.getLine('network_line_100000');
      expect(aLine).toBeDefined();
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

      expect(lineNw.getLine('network_line_100000').getWidth()).toEqual(line1);
      expect(lineNw.getLine('network_line_100001').getWidth()).toEqual(line2);
    });

    describe('Can be modified', function () {
      beforeEach(function () {
        // Assign IDs to individual lines based on it's index.
        nwData.lineData.forEach(function (line, i) {
          line.id = i;
        });
        lineNw = new LineNetwork(id, nwData);
      });

      afterEach(function() {
        lineNw = null;
      });

      it('should be able to add a new node', function () {
        var point = new GeoPoint(-1,-1),
            expectedNodeId = inputNodes.length,
            actualNodeId;
        actualNodeId = lineNw.addNode(point);

        expect(actualNodeId).toEqual(expectedNodeId);
        // TODO(bpstudds): Should input data be cloned?
        //expect(lineNw.getNodeData()[expectedId]).not.toBe(point);
        expect(lineNw.getNodeData()[expectedNodeId]).toEqual(point);
      });

      it('should be able to insert a node at the start of a specific line', function () {
        var point = new GeoPoint(-1,-1),
            nodeId = lineNw.addNode(point);
        // Insert node 'nodeId' into line 'network_line_100000'.
        lineNw.insertNodeIntoLine('network_line_100000', nodeId);

        var lineData = lineNw.getLineData('network_line_100000');
        //var line = lineNw.getLine('network_line_100000');
        // Check the appropriate line data has been updated
        expect(lineData.nodeIds).toEqual([nodeId].concat(inputLines[0].nodeIds));
        // Check that the line has been updated
        //expect(line.getVertices()).toEqual([point].concat(actualLineVertices[0]))
      });

      it('should mark a line as being "dirty" when a node is added to it.', function () {

      });

    });

  });
});
