define([
  'atlas/material/Color',
  'atlas/material/Style'
], function(Color, Style) {
  describe ('A Style', function() {

    describe ('can be constructed', function() {

      it ('with defaults', function() {
        var style = new Style();
        expect(style.getFillMaterial()).toEqual(Style.getDefaultFillMaterial());
        expect(style.getBorderMaterial()).toEqual(Style.getDefaultBorderMaterial());
        expect(style.getBorderWidth()).toEqual(Style.DEFAULT_BORDER_WIDTH);
      });

    });

  });
});
