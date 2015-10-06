define([
  'atlas/lib/utility/Log',
  'atlas/entity/EntityManager',
  'atlas/material/Color',
  'underscore'
], function(Log, EntityManager, Color, _) {
  describe('A Gradient', function() {

    describe('can be constructed', function() {

      it('from C3ML', function() {
        var c3ml = {
          id: 'foo',
          type: 'polygon',
          coordinates: [],
          fillMaterial: {
            type: 'Gradient',
            colors: [{
              color: [125, 233, 80, 255],
              pivot: 0.0
            }, {
              color: [233, 233, 80, 255],
              pivot: 0.5
            }, {
              color: [233, 120, 80, 255],
              pivot: 1.0
            }]
          }
        };
        var entityManager = new EntityManager({});
        entityManager.bulkCreate([c3ml]);
        var entity = entityManager.getById('foo');
        var gradient = entity.getStyle().getFillMaterial();
        expect(gradient.toJson()).toEqual({
            type: 'Gradient',
            colors: [{
              pivot: 0,
              color: 'rgba(0, 0, 0, 1)'
            }, {
              pivot: 0.5,
              color: 'rgba(0, 0, 0, 1)'
            }, {
              pivot: 1,
              color: 'rgba(0, 0, 0, 1)'
            }]
          })
      });

    });

  });
});
