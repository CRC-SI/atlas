define([

], function () {
  /**
   * @fileOverview The position and indices data used here is copied from a Cesium example.
   * @see {@link https://github.com/AnalyticalGraphicsInc/cesium/wiki/Geometry-and-Appearances}
   */

  var negativeRootTwoOverThree = -Math.sqrt(2.0) / 3.0;
  var negativeOneThird = -1.0 / 3.0;
  var rootSixOverThree = Math.sqrt(6.0) / 3.0;


  return  {
    id: 'id',
    /* red, green, blue, alpha */
    color: [255,255,255,0],

    /* lat, lng, elevation */
    geoLocation: [-37.9, 144.5, 0],

    /* Every vertex position in the mesh, every 3 elements form an (x,y,z) tuple */
    positions: [
      0.0, 0.0, 1.0,
      0.0, (2.0 * Math.sqrt(2.0)) / 3.0, negativeOneThird,
      -rootSixOverThree, negativeRootTwoOverThree, negativeOneThird,
      0.0, 0.0, 1.0,
      -rootSixOverThree, negativeRootTwoOverThree, negativeOneThird,
      rootSixOverThree, negativeRootTwoOverThree, negativeOneThird,
      0.0, 0.0, 1.0,
      rootSixOverThree, negativeRootTwoOverThree, negativeOneThird,
      0.0, (2.0 * Math.sqrt(2.0)) / 3.0, negativeOneThird,
      -rootSixOverThree, negativeRootTwoOverThree, negativeOneThird,
      0.0, (2.0 * Math.sqrt(2.0)) / 3.0, negativeOneThird,
      rootSixOverThree, negativeRootTwoOverThree, negativeOneThird
    ],

    /* Triangles in mesh, each element specifies an index into the position array */
    triangles: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],

    /* Normals per triangle vertex, ie 1-1 with indices, but not necessarily with positions. */
    normals: [1,2,3]
  };
});
