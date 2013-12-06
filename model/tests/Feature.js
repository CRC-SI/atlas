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

  new TestCase({
    name: 'atlas/model/tests/Feature',

    setUp: function() {
      // summary:
      //      Create a Feature object.
      id = 12354;
      args = {
        vertices: "POLYGON ((1 2, 3 4, 5 6, 7 8))",
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
      feature._mesh.show = function () {
        this._shownMesh = true;
      };
      feature._mesh.hide = function () {
        this._shownMesh = false;
      };
      feature._footprint.show = function (h) {
        if (h === undefined) {
          this._shownFootprint = true;
        } else {
          this._shownExtrusion = true;
        }
      };
      feature._footprint.hide = function (h) {
        if (h === undefined) {
          this._shownFootprint = false;
        } else {
          this._shownExtrusion = false;
        }
      };
      feature.showAsFootprint();
      doh.assertTrue(feature._footprint._shownFootprint);
      doh.assertTrue(!feature._footprint._shownExtrusion);
      doh.assertTrue(!feature._mesh._shownMesh);
    },

    testShowExtrusion: function () {
      feature._mesh.show = function () {
        this._shownMesh = true;
      };
      feature._mesh.hide = function () {
        this._shownMesh = false;
      };
      feature._footprint.show = function (h) {
        if (h === undefined) {
          this._shownFootprint = true;
        } else {
          this._shownExtrusion = true;
        }
      };
      feature._footprint.hide = function (h) {
        if (h === undefined) {
          this._shownFootprint = false;
        } else {
          this._shownExtrusion = false;
        }
      };
      feature.showAsExtrusion();
      doh.assertTrue(!feature._footprint._shownFootprint);
      doh.assertTrue(feature._footprint._shownExtrusion);
      doh.assertTrue(!feature._mesh._shownMesh);
    },

    testShowMesh: function () {
      feature._mesh.show = function () {
        this._shownMesh = true;
      };
      feature._mesh.hide = function () {
        this._shownMesh = false;
      };
      feature._footprint.show = function (h) {
        if (h === undefined) {
          this._shownFootprint = true;
        } else {
          this._shownExtrusion = true;
        }
      };
      feature._footprint.hide = function (h) {
        if (h === undefined) {
          this._shownFootprint = false;
        } else {
          this._shownExtrusion = false;
        }
      };
      feature.showAsMesh();
      doh.assertTrue(!feature._footprint._shownFootprint);
      doh.assertTrue(!feature._footprint._shownExtrusion);
      doh.assertTrue(feature._mesh._shownMesh);
    }
  }).register(doh);

});
