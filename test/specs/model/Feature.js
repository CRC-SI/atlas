define([
    'doh/runner',
    'dam/TestCase',
    '../Polygon',
    // Code under test.
    '../Feature'
], function (doh, TestCase, Polygon, Feature) {

  var feature;
  var id;
  var args;

  var mockMeshFootprint = function () {
    // Mock _mesh.
    feature._mesh = {
      show: function () {
        this._shownMesh = true;
      },
      hide: function () {
        this._shownMesh = false;
      }
    };
    // Mock _footprint.
    feature._footprint = {
      setHeight: function(h) {
        this._height = h;
      },
      show: function (h) {
        if (h === undefined) {
          this._shownFootprint = true;
        } else {
          this._shownExtrusion = true;
        }
      },
      hide: function (h) {
        if (h === undefined) {
          this._shownFootprint = false;
        } else {
          this._shownExtrusion = false;
        }
      }
    };
  };

  new TestCase({
    name: 'atlas/model/tests/Feature',

    setUp: function() {
      // summary:
      //      Create a Feature object.
      id = 12354;
      args = {
        footprint: "POLYGON ((1 2, 3 4, 5 6, 7 8))",
        renderManager: {},
        eventManager: {},
        show: true,
        displayMode: 'extrusion',
        height: 10,
        elevation: 20
      };
      feature = new Feature(id, args);
    },

    tearDown: function() {
      feature = null;
    },

    testCreate: function() {
      doh.assertTrue(feature instanceof Feature);
    },

    testDefaults: function () {
      feature = new Feature(id, {renderManager: {}, eventManager: {}});
      doh.assertEqual(0, feature._height);
      doh.assertEqual(0, feature._elevation);
      doh.assertEqual(false, feature._visible);
      doh.assertEqual('footprint', feature._displayMode);
    },

    testParameters: function() {
      doh.assertTrue(feature._footprint instanceof Polygon);
      doh.assertEqual(id, feature._id);
      doh.assertEqual(10, feature._height);
      doh.assertEqual(20, feature._elevation);
      doh.assertEqual(true, feature._visible);
      doh.assertEqual('extrusion', feature._displayMode);
    },

    testShowFootprint: function () {
      mockMeshFootprint();
      feature.showAsFootprint();
      doh.assertTrue(feature._footprint._shownFootprint);
      doh.assertTrue(!feature._footprint._shownExtrusion);
      doh.assertTrue(!feature._mesh._shownMesh);
      doh.is(0, feature._footprint._height);
    },

    testShowExtrusion: function () {
      mockMeshFootprint();
      feature.showAsExtrusion();
      doh.assertTrue(!feature._footprint._shownFootprint);
      doh.assertTrue(feature._footprint._shownExtrusion);
      doh.assertTrue(!feature._mesh._shownMesh);
      doh.is(args.height, feature._footprint._height);
    },

    testShowMesh: function () {
      mockMeshFootprint();
      feature.showAsMesh();
      doh.assertTrue(!feature._footprint._shownFootprint);
      doh.assertTrue(!feature._footprint._shownExtrusion);
      doh.assertTrue(feature._mesh._shownMesh);
    }
  }).register(doh);

});
