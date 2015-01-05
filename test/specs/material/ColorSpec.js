define([
  'atlas/material/Color'
], function(Color) {
  describe ('A Color', function() {

    describe ('can be constructed', function() {

      it ('with a string', function() {
        var color = new Color('red');
        expect(color.toHexString()).toEqual('#ff0000');
      });

      it ('with arguments', function() {
        var color = new Color(1, 0, 0);
        expect(color.toHexString()).toEqual('#ff0000');
      });

      it ('with an array', function() {
        var color = new Color([1, 0, 0, 0]);
        expect(color.toHexString()).toEqual('#ff0000');
      });

      it ('with an object', function() {
        var color = new Color({red: 1, green: 0, blue: 0, alpha: 0});
        expect(color.toHexString()).toEqual('#ff0000');
      });

    });

  });
});
