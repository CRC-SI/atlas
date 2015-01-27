define([
  'atlas/material/Color'
], function(Color) {
  describe ('A Color', function() {

    describe ('can be constructed', function() {

      it ('with a name string', function() {
        expect(new Color('red').toHexString()).toEqual('#ff0000');
      });

      it ('with an rgba string', function() {
        var value = 'rgba(255, 0, 0, 0.5)';
        var color = new Color(value);
        expect(color.toString()).toEqual(value);
        color.alpha = 1;
        expect(color.toString()).toEqual('rgba(255, 0, 0, 1)');
      });

      it ('with arguments', function() {
        expect(new Color(1, 0, 0).toHexString()).toEqual('#ff0000');
      });

      it ('with an array', function() {
        expect(new Color([1, 0, 0, 0]).toHexString()).toEqual('#ff0000');
      });

      it ('with an object', function() {
        var color = new Color({red: 1, green: 0, blue: 0, alpha: 0});
        expect(color.toHexString()).toEqual('#ff0000');
      });

    });

    it ('can be converted to rgba', function() {
      var color = new Color('red');
      expect(color.toString()).toEqual('rgba(255, 0, 0, 1)');
      color.alpha = 0.5;
      expect(color.toString()).toEqual('rgba(255, 0, 0, 0.5)');
    });

  });
});
