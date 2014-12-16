define([
  // Code under test.
  'atlas/edit/EditManager'
], function(EditManager) {
  var em,
      managers,
      mockModule,
      mockEntityManager,
      e = {
        position: {
          x: 0,
          y: 0
        }
      };

  describe('An EditManager', function() {

    beforeEach(function() {
      mockModule = jasmine.createSpyObj('mockModule', ['startDrag', 'updateDrag', 'endDrag']);
      mockEntityManager = {
        getAt: function(e) {
          if (e === 'handle') {
            return {handler: {}};
          } else if (e === 'entity') {
            return {entity: []};
          } else {
            return null;
          }
        }
      };
      managers = {
        entity: mockEntityManager
      };
      em = new EditManager(managers);
      em.addModule('mock', mockModule);
      em.enableModule('mock');
    });

    afterEach(function() {
      managers = null;
      em = null;
    });

    it('is disabled be default', function() {
      expect(mockModule._editing).toBe(false);
      expect(mockModule._enabledModules).toEqual({});
      em.onLeftDown(e);
      em.onMouseMove(e);
      em.onLeftUp(e);
      expect(mockModule.startDrag).not.toHaveBeenCalled();
      expect(mockModule.updateDrag).not.toHaveBeenCalled();
      expect(mockModule.endDrag).not.toHaveBeenCalled();
    });

    it('can be enabled', function() {
    });


    it('can be disabled', function() {
        em.enable();
        em.onLeftDown(e);
        em.onMouseMove(e);
        em.onLeftUp(e);
        expect(mockModule.startDrag).toHaveBeenCalled();
        expect(mockModule.updateDrag).toHaveBeenCalled();
        expect(mockModule.endDrag).toHaveBeenCalled();
        em.disable();
        em.onLeftDown(e);
        em.onMouseMove(e);
        em.onLeftUp(e);
        expect(mockModule.startDrag.calls.length).toEqual(1);
        expect(mockModule.updateDrag.calls.length).toEqual(1);
        expect(mockModule.endDrag.calls.length).toEqual(1);
    });

    describe('can handle input', function() {
      beforeEach(function() {
        // Enable editing and module.
        em.enable();
        em.enableModule('mock');
      });

      it ('on left down', function() {
        em.onLeftDown(e);
        expect(mockModule.startDrag).toHaveBeenCalled();
      });

      it ('on mouse move', function() {
        em.onMouseMove(e);
        expect(mockModule.updateDrag).toHaveBeenCalled();
      });

      it ('on left up', function() {
        em.onLeftUp(e);
        expect(mockModule.endDrag).toHaveBeenCalled();
      });
    })
  });


});
