define([
  'atlas/lib/utility/Log',
  'atlas/material/Color',
  'underscore'
], function(Log, Color, _) {
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

      it ('with an array integers', function() {
        expect(Color.fromRGBA([128, 0, 0, 0]).toHexString()).toEqual('#800000');
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

    it ('can be converted to an array', function() {
      var color = new Color('red');
      expect(color.toArray()).toEqual([1, 0, 0, 1]);
      expect(color.toArray({floatValues: false})).toEqual([255, 0, 0, 255]);
    });

    it ('can darken colors', function() {
      var color = new Color('red');
      var darker1 = color.darken(0.1);
      expect(darker1.toArray()).toEqual([0.8, 0, 0, 1]);
      // Ensure darken() returns a new instance each time.
      var darker2 = new Color('red').darken(0.1);
      expect(darker1.equals(darker2)).toBe(true);
      expect(darker1 !== darker2).toBe(true);
    });

    it ('can lighten colors', function() {
      var color = new Color('red');
      var lighten1 = color.lighten(0.1);
      expect(lighten1.toArray()).toEqual([1, 0.2, 0.2, 1]);
      // Ensure lighten() returns a new instance each time.
      var lighten2 = new Color('red').lighten(0.1);
      expect(lighten1.equals(lighten2)).toBe(true);
      expect(lighten1 !== lighten2).toBe(true);
    });

  });
});
