define([
  // Code under test.
  'atlas/edit/EditManager'
], function (EditManager) {
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

  describe('An EditManager', function () {

    beforeEach(function () {
      mockModule = jasmine.createSpyObj('mockModule', ['start', 'update', 'end']);
      mockEntityManager = {
        getAt: function (e) {
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

    afterEach(function () {
      managers = null;
      em = null;
    });

    it('is disabled be default', function () {
      expect(mockModule._editing).toBe(false);
      expect(mockModule._enabledModules).toEqual({});
      em.onLeftDown(e);
      em.onMouseMove(e);
      em.onLeftUp(e);
      expect(mockModule.start).not.toHaveBeenCalled();
      expect(mockModule.update).not.toHaveBeenCalled();
      expect(mockModule.end).not.toHaveBeenCalled();
    });

    it('can be enabled', function () {
    });


    it('can be disabled', function () {
        em.enable();
        em.onLeftDown(e);
        em.onMouseMove(e);
        em.onLeftUp(e);
        expect(mockModule.start).toHaveBeenCalled();
        expect(mockModule.update).toHaveBeenCalled();
        expect(mockModule.end).toHaveBeenCalled();
        em.disable();
        em.onLeftDown(e);
        em.onMouseMove(e);
        em.onLeftUp(e);
        expect(mockModule.start.calls.length).toEqual(1);
        expect(mockModule.update.calls.length).toEqual(1);
        expect(mockModule.end.calls.length).toEqual(1);
    });

    describe('can handle input', function () {
      beforeEach(function () {
        // Enable editing and module.
        em.enable();
        em.enableModule('mock');
      });

      it ('on left down', function () {
        em.onLeftDown(e);
        expect(mockModule.start).toHaveBeenCalled();
      });

      it ('on mouse move', function () {
        em.onMouseMove(e);
        expect(mockModule.update).toHaveBeenCalled();
      });

      it ('on left up', function () {
        em.onLeftUp(e);
        expect(mockModule.end).toHaveBeenCalled();
      });
    })
  });


});
