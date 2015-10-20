define([
  // Code under test
  'atlas/model/Rectangle',
  'atlas/model/GeoPoint'
], function(Rectangle, GeoPoint) {
  describe('A Rectangle', function() {

    var constructArgs = {
      north: 10,
      south: -5,
      east: 15,
      west: 5
    };

    function assertRectangle(actual, expected) {
      expect(actual.getNorth()).toEqual(expected.north);
      expect(actual.getSouth()).toEqual(expected.south);
      expect(actual.getEast()).toEqual(expected.east);
      expect(actual.getWest()).toEqual(expected.west);
    }

    describe('can be constructed', function() {

      it('with an object', function() {
        assertRectangle(new Rectangle(constructArgs), constructArgs);
      });

      it('with an array', function() {
        assertRectangle(new Rectangle(constructArgs.north, constructArgs.south, constructArgs.east,
            constructArgs.west), constructArgs);
      });

      it('with rectangles', function() {
        var rectA = new Rectangle(5, 1, -2, 4);
        var rectB = new Rectangle(8, 3, 2, 5);
        var rectC = Rectangle.fromRectangles([rectA, rectB]);
        assertRectangle(rectC, {north: 8, south: 1, east: 5, west: -2});
      });

      it('with points', function() {
        var pointA = new GeoPoint({latitude: 5, longitude: 1});
        var pointB = new GeoPoint({latitude: -8, longitude: 3});
        var rect = Rectangle.fromPoints([pointA, pointB]);
        assertRectangle(rect, {north: 5, south: -8, east: 3, west: 1});
      });

    });

    describe('cannot be constructed', function() {

      it('with no rectangles', function() {
        expect(function() {Rectangle.fromRectangles([]);}).toThrow();
        expect(function() {Rectangle.fromRectangles();}).toThrow();
      });

      it('with no points', function() {
        expect(function() {Rectangle.fromPoints([]);}).toThrow();
        expect(function() {Rectangle.fromPoints();}).toThrow();
      });

    });

  });
});
