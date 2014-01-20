define([
    'doh/runner',
    'dam/TestCase',
    // Code under test.
    '../Vertex'
], function (doh, TestCase, Vertex) {
  // Define test variables`
  var vertex;

  new TestCase({
    name: 'atlas/model/tests/Vertex',

    setUp: function() {
    },

    tearDown: function() {
    },

    testCreateNullVertex: function() {
      vertex = new Vertex();

      doh.assertEqual(0, vertex.x);
      doh.assertEqual(0, vertex.y);
      doh.assertEqual(0, vertex.z);
    },

    testCreateDefinedVertex: function() {
      vertex = new Vertex(1,2,3);

      doh.assertEqual(1, vertex.x);
      doh.assertEqual(2, vertex.y);
      doh.assertEqual(3, vertex.z);
    }
  }).register(doh);

});