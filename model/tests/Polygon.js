define([
  'doh/runner',
  'dam/TestCase',
  '../Vertex',
  '../Style',
  '../Material',
  /* Code under test */
  '../Polygon',
], function (doh, TestCase, Vertex, Style, Material, Polygon) {

  /* Test globals go here */
  var polygon;
  var id;
  var args;


  /* Begin test case definitions */
  new TestCase({

    name: 'atlas/model/Polygon',

    setUp: function () {
      // summary:
      id = 12345;
      args = {
        footprint: "POLYGON ((1 2, 3 4, 5 6, 7 8))",
        renderManager: {},
        eventManager: {}
      };
      vertices = [];
      vertices.push(new Vertex(1, 2, 0));
      vertices.push(new Vertex(3, 4, 0));
      vertices.push(new Vertex(5, 6, 0));
      vertices.push(new Vertex(7, 8, 0));
      vertices.push(new Vertex(1, 2, 0));
      polygon = new Polygon(id, args.footprint, args);
    },

    testCreate: function() {
      doh.assertTrue(polygon instanceof Polygon);
      doh.assertEqual(vertices, polygon._vertices);
    },

    testDefaults: function () {
      doh.assertEqual(0, polygon._height);
      doh.assertEqual(0, polygon._elevation);
      doh.assertEqual(false, polygon._visible);
      doh.assertEqual(false, polygon._renderable);
      doh.assertEqual(null, polygon._centroid);
      doh.assertEqual(null, polygon._area);
      doh.assertEqual(Style.DEFAULT, polygon._style);
      doh.assertEqual(Material.DEFAULT, polygon._material);
    },

    testSetHeight: function() {
      polygon.setHeight(33);
      doh.assertEqual(33, polygon._height);
      polygon.setHeight('asdf');
      doh.assertEqual(33, polygon._height);
      polygon.setHeight();
      doh.assertEqual(33, polygon._height);
      doh.assertTrue(!polygon.isRenderable());
    },

    testSetElevation: function() {
      polygon.setElevation(33);
      doh.assertEqual(33, polygon._elevation);
      polygon.setElevation('asdf');
      doh.assertEqual(33, polygon._elevation);
      polygon.setElevation();
      doh.assertEqual(33, polygon._elevation);
      doh.assertTrue(!polygon.isRenderable());
    },

    testInsertVertexStart: function() {
      var v = new Vertex(5, 6, 0);
      polygon.insertVertex(0, v);
      vertices.unshift(v);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    },

    testInsertVertexMid: function() {
      var v = new Vertex(8, 9, 0);
      polygon.insertVertex(1, v);
      vertices.splice(1, 0, v);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    },

    testInsertVertexEnd: function() {
      var v = new Vertex(5, 6, 0);
      polygon.insertVertex(polygon._vertices.length + 5, v);
      var v2 = vertices.pop();
      vertices.push(v);
      vertices.push(v2);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    },

    testRemoveVertexStart: function() {
      polygon.removeVertex(0);
      vertices = vertices.splice(1, vertices.length - 2);
      vertices.push(vertices[0]);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    },

    testRemoveVertexMid: function() {
      polygon.removeVertex(2);
      vertices.splice(2, 1);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    },

    testRemoveVertexEnd: function() {
      polygon.removeVertex(vertices.length);
      var v = vertices.pop();
      vertices.pop();
      vertices.push(v);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    },

    testAddVertex: function() {
      var v = new Vertex(9, 10, 0);
      var v2 = vertices.pop();
      vertices.push(v);
      vertices.push(v2);
      polygon.addVertex(v);
      doh.assertEqual(vertices, polygon._vertices);
      doh.assertTrue(!polygon.isRenderable());
    }

  }).register(doh);
});

