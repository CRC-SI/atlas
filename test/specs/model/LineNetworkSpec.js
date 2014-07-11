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

    it('should clone non-primitive construction data', function () {
      lineNw = new LineNetwork(id, nwData);
      // Check node data is cloned
      var actualNodes = lineNw.getNodeData();
      actualNodes.forEach(function (node, i) {
        expect(node != inputNodes[i]).toBe(true);
      });
      // Check that line data is cloned.
      lineNw.getLineData().forEach(function (lineData, i) {
        expect(lineData).not.toBe(inputLines[i]);
        expect(lineData.nodeIds).not.toBe(inputLines[i].nodeIds);
      });
    });

    it('should be able to construct lines if given appropriate structures using GeoPoints', function () {
      lineNw = new LineNetwork(id, nwData);
      // Check lines have been correctly constructed.
      lineNw.getLines().forEach(function (line, i) {
        // Check that the constructed line has the correct (default) ID.
        expect(line.getId()).toEqual('network_line_10000' + i);
        // Check that the constructed lines have the correct vertices.
        expect(line.getVertices()).toEqual(expectedLineVertices[i]);
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
        // Check that the added point is a new object.
        expect(lineNw.getNodeData()[expectedNodeId]).not.toBe(point);
        // Check that the added point is correct.
        expect(lineNw.getNodeData()[expectedNodeId]).toEqual(point);
      });

      it('should be able to insert a node at the start of a specific line', function () {
        var point = new GeoPoint(-1,-1),
            nodeId = lineNw.addNode(point);
        // Insert node 'nodeId' into line 'network_line_100000'.
        lineNw.insertNodeIntoLine('network_line_100000', nodeId);

        // Check the appropriate line data has been updated
        var lineData = lineNw.getLineData('network_line_100000');
        expect(lineData.nodeIds).toEqual([nodeId].concat(inputLines[0].nodeIds));
      });

      it('should be able to insert a node at a specific index in a specific line', function () {
        var point = new GeoPoint(-1,-1),
            nodeId = lineNw.addNode(point);
        // Insert node 'nodeId' into line 'network_line_100000'.
        lineNw.insertNodeIntoLine('network_line_100000', nodeId, 2);

        var lineData = lineNw.getLineData('network_line_100000'),
            expectedNodeIds = [0, 2, 4, 3];
        expect(lineData.nodeIds).toEqual(expectedNodeIds);
      });

      it('should be able to insert a node into a specific line, relative to the end of the line',
          function () {
        var point = new GeoPoint(-1,-1),
            nodeId = lineNw.addNode(point);
        // Insert node 'nodeId' into line 'network_line_100000' at the end.
        lineNw.insertNodeIntoLine('network_line_100000', nodeId, -1);
        var lineData = lineNw.getLineData('network_line_100000'),
            expectedNodeIds = [0, 2, 3, 4];
        expect(lineData.nodeIds).toEqual(expectedNodeIds);

        // Insert node 'nodeId' into line 'network_line_100000' at the start.
        lineNw.insertNodeIntoLine('network_line_100000', nodeId, -5);
        lineData = lineNw.getLineData('network_line_100000');
        expectedNodeIds = [4, 0, 2, 3, 4];
        expect(lineData.nodeIds).toEqual(expectedNodeIds);
      });

      it('should do nothing a node is attempted to be inserted out of bounds', function () {
        var tooLow = function () { lineNw.insertNodeIntoLine('network_line_100000', 0, -5); };
            tooHigh = function () { lineNw.insertNodeIntoLine('network_line_100000', 0, 4); };
        expect(tooHigh).not.toThrow();
        expect(lineNw.getLineData('network_line_100000').nodeIds).toEqual(inputLines[0].nodeIds);
        expect(tooLow).not.toThrow();
        expect(lineNw.getLineData('network_line_100000').nodeIds).toEqual(inputLines[0].nodeIds);
      });

      it('should mark a line as being "dirty" when a node is added to it.', function () {

      });

    });

  });
});
