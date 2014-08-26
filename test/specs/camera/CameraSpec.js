define([
  // Code under test
  'atlas/camera/Camera',
  'atlas/model/GeoPoint'
], function(Camera, GeoPoint) {
  describe('A Camera', function() {
    var camera,
        defaultPosition = Camera.getDefaultPosition(),
        defaultOrientation = Camera.getDefaultOrientation(),
        aPosition = new GeoPoint({lat: 37, lng: -144, elevation: 2000}),
        anOrientation = {tilt: 10, bearing: 20, rotation: 30};

    afterEach(function() {
      camera = null;
    });

    describe('can be constructed', function() {
      it('with a default position', function() {
        camera = new Camera();
        expect(camera.getPosition()).toEqual(defaultPosition);
        expect(camera.getOrientation()).toEqual(defaultOrientation);
      });

      it('with a given initial position', function() {
        camera = new Camera({position: aPosition, orientation: anOrientation});
        expect(camera.getPosition()).toEqual(aPosition);
        expect(camera.getOrientation()).toEqual(anOrientation);
      });
    });

    describe('can be moved', function() {
      beforeEach(function() {
        camera = new Camera();
        spyOn(camera, '_animate');
      });

      afterEach(function() {
        camera = null;
      });

      it('to a specific location and orientation instantly', function() {
        var args = {position: aPosition, orientation: anOrientation};
        camera.zoomTo(args);
        expect(camera._animate).toHaveBeenCalledWith(args);
      });

      it('to a specific location and orientation with flight animation', function() {
        var flightTime = 100;
        var args = {position: aPosition, orientation: anOrientation, duration: flightTime};
        camera.zoomTo(args);
        expect(camera._animate).toHaveBeenCalledWith(args);
      });

      it('to a specific location instantly', function() {
        var args = {position: aPosition};
        camera.zoomTo(args);
        expect(camera._animate).toHaveBeenCalledWith(args);
      });
    });
  });
});
