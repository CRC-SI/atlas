define([
    'doh/runner',
    'dam/TestCase',
    '../Vertex',
    // Code under test.
    '../Line'
], function (doh, TestCase, Vertex, Line) {
  var line;

  new TestCase({
    name: 'atlas/model/tests/Line',

    setUp: function() {

    },

    tearDown: function() {

    },

    testHasGeoEntity: function() {
      line = new Line();
      doh.assertEqual('function', typeof line.getCentroid);
      doh.assertEqual('function', typeof line.getArea);
      doh.assertEqual('function', typeof line.isVisible);
      doh.assertEqual('function', typeof line.show);
      doh.assertEqual('function', typeof line.hide);
      doh.assertEqual('function', typeof line.toggleVisibility);
      doh.assertEqual('function', typeof line.remove);
    },

    testCreateNullLine: function() {
      line = new Line();

      doh.assertEqual(0, line.startVertex.x);
      doh.assertEqual(0, line.startVertex.y);
      doh.assertEqual(0, line.startVertex.z);
      doh.assertEqual(0, line.endVertex.x);
      doh.assertEqual(0, line.endVertex.y);
      doh.assertEqual(0, line.endVertex.z);
    },

    testCreateNullLine2: function() {
      line = new Line(new Vertex(), new Vertex());

      doh.assertEqual(0, line.startVertex.x);
      doh.assertEqual(0, line.startVertex.y);
      doh.assertEqual(0, line.startVertex.z);
      doh.assertEqual(0, line.endVertex.x);
      doh.assertEqual(0, line.endVertex.y);
      doh.assertEqual(0, line.endVertex.z);
    },

    testCreateLine: function() {
      var vertex = new Vertex(1.23,-4,-5.67);

      doh.assertEqual(1.23, vertex.x);
      doh.assertEqual(-4, vertex.y);
      doh.assertEqual(-5.67, vertex.z);
    },

    testGetLength2d: function() {
      var vertex1 = new Vertex();
      var vertex2 = new Vertex(3,4,0);
      line = new Line(vertex1, vertex2);
      var length = line.getLength();

      doh.assertEqual(5, length);
    },

    testGetLength3d: function() {
      var vertex1 = new Vertex(0,0,1);
      var vertex2 = new Vertex(0,3,5);
      line = new Line(vertex1, vertex2);
      var length = line.getLength();

      doh.assertEqual(5, length);
    }

  }).register(doh);

});