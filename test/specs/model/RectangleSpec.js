define([
  // Code under test
  'atlas/model/Rectangle'
], function(Rectangle) {
  describe('A Rectangle', function() {

    var constructArgs = {
      north: 10,
      south: -5,
      east: 15,
      west: 5
    };

    function assertRectangle(rectangle) {
      expect(rectangle.getNorth()).toEqual(constructArgs.north);
      expect(rectangle.getSouth()).toEqual(constructArgs.south);
      expect(rectangle.getEast()).toEqual(constructArgs.east);
      expect(rectangle.getWest()).toEqual(constructArgs.west);
    }

    describe('can be constructed', function() {
      it('with an object', function() {
        assertRectangle(new Rectangle(constructArgs));
      });

      it('with an array', function() {
        assertRectangle(new Rectangle(constructArgs.north, constructArgs.south, constructArgs.east,
            constructArgs.west));
      });
    });

  });
});
