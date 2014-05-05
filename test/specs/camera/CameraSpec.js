define([
  // Code under test
  'atlas/camera/Camera'
], function (Camera) {
  describe ('A Camera', function () {
    var camera,
        defaultPosition = {lat: -37, lng: 144, elevation: 20000},
        defaultOrientation = {tilt: 0, bearing: 0, rotation: 0},
        aPosition = {lat: 37, lng: -144, elevation: 2000},
        anOrientation = {tilt: 10, bearing: 20, rotation: 30};

    afterEach(function () {
      camera = null;
    });

    describe ('can be constructed', function () {
      it ('with a default position', function () {
        camera = new Camera();
        expect(camera.getPosition()).toEqual(defaultPosition);
        expect(camera.getOrientation()).toEqual(defaultOrientation);
      });

      it ('with a given initial position', function () {
        camera = new Camera({position: aPosition, orientation: anOrientation});
        expect(camera.getPosition()).toEqual(aPosition);
        expect(camera.getOrientation()).toEqual(anOrientation);
      });
    });

    describe ('can be moved', function () {
      beforeEach(function () {
        camera = new Camera();
        spyOn(camera, '_animate');
      });

      afterEach(function () {
        camera = null;
      });

      it ('to a specific location and orientation instantly', function () {
        camera.zoomTo(aPosition, anOrientation);
        expect(camera._animate).toHaveBeenCalledWith({
          position: aPosition,
          orientation: anOrientation,
          duration: 0
        });
      });

      it ('to a specific location and orientation with flight animation', function () {
        var flightTime = 100;
        camera.zoomTo(aPosition, anOrientation, flightTime);
        expect(camera._animate).toHaveBeenCalledWith({
          position: aPosition,
          orientation: anOrientation,
          duration: flightTime
        });
      });

      it ('to a specific location instantly', function () {
        var flightTime = 100;
        camera.zoomTo(aPosition);
        expect(camera._animate).toHaveBeenCalledWith({
          position: aPosition,
          orientation: defaultOrientation,
          duration: 0
        });
      });
    });
  });
});
