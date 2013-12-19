define([
  
], function () {
  var negativeRootTwoOverThree = -Math.sqrt(2.0) / 3.0;
  var negativeOneThird = -1.0 / 3.0;
  var rootSixOverThree = Math.sqrt(6.0) / 3.0;

  
  var mesh = {
    id: 'id',
    color: [255,255,255,0], /* red, green, blue, alpha */
    geoLocation: [-37.9, 144.5, 0], /* lat, lng, elevation */
    positions: [ /* Every vertex position in the mesh, every 3 elements form an (x,y,z) tuple */
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
    indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], /* Triangles in mesh, each element specifies an index into the position array */
    normals: [1,2,3], /* Normals per triangle vertex */
  };
  
  return mesh;
});