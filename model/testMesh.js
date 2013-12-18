define([
  
], function () {
  var negativeRootTwoOverThree = -Math.sqrt(2.0) / 3.0;
  var negativeOneThird = -1.0 / 3.0;
  var rootSixOverThree = Math.sqrt(6.0) / 3.0;

  
  var mesh = {
    positions: [
      {x: 0.0, y: 0.0, z: 1.0},
      {x: 0.0, y: (2.0 * Math.sqrt(2.0)) / 3.0, z: negativeOneThird},
      {x: -rootSixOverThree, y: negativeRootTwoOverThree, z: negativeOneThird},
      {x: 0.0, y: 0.0, z: 1.0},
      {x: -rootSixOverThree, y: negativeRootTwoOverThree, z: negativeOneThird},
      {x: rootSixOverThree, y: negativeRootTwoOverThree, z: negativeOneThird},
      {x: 0.0, y: 0.0, z: 1.0},
      {x: rootSixOverThree, y: negativeRootTwoOverThree, z: negativeOneThird},
      {x: 0.0, y: (2.0 * Math.sqrt(2.0)) / 3.0, z: negativeOneThird},
      {x: -rootSixOverThree, y: negativeRootTwoOverThree, z: negativeOneThird},
      {x: 0.0, y: (2.0 * Math.sqrt(2.0)) / 3.0, z: negativeOneThird},
      {x: rootSixOverThree, y: negativeRootTwoOverThree, z: negativeOneThird}
    ],
    indices: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]],
    positions_old: [
      {
        x: 0.0,
        y: 0.0,
        z: 1.0 
      },
      {
        x: 0.0,
        y: (2.0 * Math.sqrt(2.0)) / 3.0,
        z: negativeOneThird
      },
      {
        x: -rootSixOverThree,
        y: negativeRootTwoOverThree,
        z: negativeOneThird
      },
      {
        x: rootSixOverThree,
        y: negativeRootTwoOverThree,
        z: negativeOneThird
      }
    ],
    indices_old: [[0,1,2],[0,2,3],[0,3,1],[2,1,3]]
  };
  
  return mesh;
});