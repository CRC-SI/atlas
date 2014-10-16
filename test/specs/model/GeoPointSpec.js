define([
  // Code under test
  'atlas/model/GeoPoint',
  'atlas/model/Vertex'
], function(GeoPoint, Vertex) {
  describe('A GeoPoint', function() {

    var lat, lng, elev, geoPoint;

    beforeEach(function () {
      lat = -37.79859924316406;
      lng = 144.96112060546875;
      elev = 2000;
      geoPoint = new GeoPoint({latitude: lat, longitude: lng, elevation: elev});
    });

    afterEach(function () {
      geoPoint = null;
    });

    describe('can be constructed', function() {

      it('from an array', function() {
        var actual = new GeoPoint([geoPoint.longitude, geoPoint.latitude, geoPoint.elevation]);
        expect(actual).toEqual(geoPoint);
      });

      it('from an object', function() {
        expect(geoPoint.latitude).toEqual(lat);
        expect(geoPoint.longitude).toEqual(lng);
        expect(geoPoint.elevation).toEqual(elev);
      });

      it('from another GeoPoint', function() {
        var other = new GeoPoint(geoPoint);
        expect(other).toEqual(geoPoint);
        expect(other).not.toBe(geoPoint);
      });
    });

    it('can be subtracted', function() {
      var diff = new GeoPoint({latitude: 0.001, longitude: 0.001});
      var other = geoPoint.subtract(diff);
      expect(other.latitude).toEqual(geoPoint.latitude - diff.latitude);
      expect(other.longitude).toEqual(geoPoint.longitude - diff.longitude);
      expect(other.elevation).toEqual(geoPoint.elevation);
      expect(other).not.toBe(geoPoint);
    });

    it('can be translated', function() {
      var diff = new GeoPoint({latitude: 0.001, longitude: 0.001});
      var other = geoPoint.translate(diff);
      expect(other.latitude).toEqual(geoPoint.latitude + diff.latitude);
      expect(other.longitude).toEqual(geoPoint.longitude + diff.longitude);
      expect(other.elevation).toEqual(geoPoint.elevation);
      expect(other).not.toBe(geoPoint);
    });

    it('can have values changed', function() {
      var diff = new GeoPoint({latitude: 0.001, longitude: 0.001});
      var other = geoPoint.set(diff);
      expect(other.latitude).toEqual(diff.latitude);
      expect(other.longitude).toEqual(diff.latitude);
      expect(other).toBe(geoPoint);
    });

    it('can be converted to Vertex', function() {
      var vertex = geoPoint.toVertex();
      expect(vertex.x).toEqual(geoPoint.longitude);
      expect(vertex.y).toEqual(geoPoint.latitude);
      expect(vertex.z).toEqual(geoPoint.elevation);
    });

    it('can be converted to radians', function() {
      var radians = geoPoint.toRadians();
      expect(radians.longitude).toEqual(2.5300488419460256);
      expect(radians.latitude).toEqual(-0.6597100094350496);
      expect(radians.elevation).toEqual(geoPoint.elevation);
      expect(radians).not.toBe(geoPoint);
    });

    it('can be cloned', function() {
      var other = geoPoint.clone();
      expect(other).toEqual(geoPoint);
      expect(other.equals(geoPoint)).toBe(true);
      expect(other).not.toBe(geoPoint);
    });

    it('can be compared', function() {
      var diff = new GeoPoint({latitude: 1E-10, longitude: 1E-10});
      var other = geoPoint.translate(diff);
      expect(other.isCloseTo(geoPoint)).toBe(true);
      expect(other).not.toBe(geoPoint);
    });

  });
});
