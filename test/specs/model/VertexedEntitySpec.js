define([
  // Code under test
  'atlas/model/VertexedEntity'
], function(VertexedEntity) {
  var entity;

  describe('A VertexedEntity', function() {
    beforeEach(function() {
      entity = new VertexedEntity('id', {});
      entity.addVertex(1);
      entity.addVertex(2);
      entity.addVertex(3)
    });

    afterEach(function() {
      entity = null;
    });

    it('should be able to add "vertices" to the end vertex list', function() {
      entity.addVertex(4);
      expect(entity._vertices).toEqual([1, 2, 3, 4]);
    });

    describe('Removing vertices:', function() {
      it('should be able to remove vertices from the end of the list', function() {
        entity.removeVertex();
        expect(entity._vertices).toEqual([1, 2]);
      });

      describe('should be able to remove a vertex from', function() {
        it('the start', function() {
          entity.removeVertex(0);
          expect(entity._vertices).toEqual([2, 3]);
        });

        it('the middle', function() {
          entity.removeVertex(1);
          expect(entity._vertices).toEqual([1, 3]);
        });

        it('the end', function() {
          entity.removeVertex(2);
          expect(entity._vertices).toEqual([1, 2]);
        });
      });

      describe('should be able to remove vertices indexed from the last vertex', function() {
        it('the last vertex', function() {
          entity.removeVertex(-1);
          expect(entity._vertices).toEqual([1, 2]);
        });
        it('a middle vertex', function() {
          entity.removeVertex(-2);
          expect(entity._vertices).toEqual([1, 3]);
        });
        it('the first vertex', function() {
          entity.removeVertex(-3);
          expect(entity._vertices).toEqual([2, 3]);
        });
      });
    });

    describe('Inserting vertices:', function() {
      describe('should be able to insert a vertex relative to the start', function() {
        it('as the first element', function() {
          entity.insertVertex(0, 0);
          expect(entity._vertices).toEqual([0, 1, 2, 3]);
        });
        it('into the middle', function() {
          entity.insertVertex(1, 1.5);
          expect(entity._vertices).toEqual([1, 1.5, 2, 3]);
        });
        it('as the last element', function() {
          entity.insertVertex(3, 4);
          expect(entity._vertices).toEqual([1, 2, 3, 4]);
        });
      });

      describe('should be able to insert a vertex relative to the end', function() {
        it('as the first element', function() {
          entity.insertVertex(-4, 0);
          expect(entity._vertices).toEqual([0, 1, 2, 3]);
        });
        it('into the middle', function() {
          entity.insertVertex(-3, 1.5);
          expect(entity._vertices).toEqual([1, 1.5, 2, 3]);
        });
        it('as the last element', function() {
          entity.insertVertex(-1, 4);
          expect(entity._vertices).toEqual([1, 2, 3, 4]);
        });
      });
    });
  });
});

