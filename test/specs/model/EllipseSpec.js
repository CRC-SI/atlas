define([
  'atlas/model/Vertex',
  // Code under test.
  'atlas/model/Ellipse'
], function (Vertex, Ellipse) {
  describe ('An Ellipse', function () {
    var ellipse,
        data,
        args;

    beforeEach (function () {
      data = {
        centroid: new Vertex(0, 0, 0),
        semiMajor: 20,
        semiMinor: 10
      };

    });

    afterEach (function () {
      ellipse = null;
      args = null;
    });

    describe ('can be constructed', function () {
      it ('when all expected constructor args are given', function () {
        data.rotation = 10;
        ellipse = new Ellipse('id', data, {});
        expect(ellipse).not.toBeNull();
        expect(ellipse.getId()).toEqual('id');
        expect(ellipse.getCentroid()).toEqual(data.centroid);
        expect(ellipse.getRotation()).toEqual(10);
        expect(ellipse.getSemiMajorAxis()).toEqual(data.semiMajor);
        expect(ellipse.getSemiMinorAxis()).toEqual(data.semiMinor);
      });

      it ('with the id in the ellipse data', function () {
        data.id = 'id';
        ellipse = new Ellipse('id', data, {});
        expect(ellipse.getId()).toEqual('id');
        expect(ellipse.getCentroid()).toEqual(data.centroid);
        expect(ellipse.getRotation()).toEqual(0);
        expect(ellipse.getSemiMajorAxis()).toEqual(data.semiMajor);
        expect(ellipse.getSemiMinorAxis()).toEqual(data.semiMinor);
      });
    }); // End 'can be constructed'

    describe ('cannot be constructed when', function () {
      it ('an ID is not provided', function () {
        var noId = function () {
          ellipse = new Ellipse(data, {});
        };
        expect(noId).toThrow();
      });

      it ('a centroid is not provided', function () {
        delete data.centroid;
        var fails = function () {
          new Ellipse('id', data);
        };
        expect(fails).toThrow();
      })

      it ('the semi major or minor axis is not provided', function () {
        var noSemiMajor = function () {
              delete data.semiMajor;
              new Ellipse('id', data);
            },
            noAxes = function () {
              delete data.semiMajor;
              delete data.semiMinor;
              new Ellipse('id', data);
            },
            noSemiMinor = function () {
              data.semiMajor = 10;
              delete data.semiMinor;
              new Ellipse('id', data);
            };
        expect(noSemiMajor).toThrow();
        expect(noAxes).toThrow();
        expect(noSemiMinor).toThrow();
      })
    }); // End 'cannot be constructed when'

    describe ('can be modified', function () {
      beforeEach (function () {
        ellipse = new Ellipse('id', data);
      });

      describe ('by translation', function () {
        it ('in both axis', function () {
          ellipse.translate({x: 5, y: 10, z: 0});
          expect(ellipse.getCentroid()).toEqual(new Vertex(5, 10, 0));
        });

        it ('in semi major axis', function () {
          ellipse.translate({x: 5});
          expect(ellipse.getCentroid()).toEqual(new Vertex(5, 0, 0));
        });

        it ('in both axis', function () {
          ellipse.translate({y: 10});
          expect(ellipse.getCentroid()).toEqual(new Vertex(0, 10, 0));
        });

        it ('fails without an arg', function () {
          var f = function () {
            ellipse.translate();
          };
          expect(f).toThrow();
        });
      }); // End 'by translation'

      describe ('by scale', function () {

        it ('in both axis', function () {
          ellipse.scale({x: 2, y: 0.5});
          expect(ellipse.getSemiMajorAxis()).toEqual(2 * data.semiMajor);
          expect(ellipse.getSemiMinorAxis()).toEqual(0.5 * data.semiMinor);
        });

        it ('in the semi major axis', function () {
          ellipse.scale({x: 2});
          expect(ellipse.getSemiMajorAxis()).toEqual(2 * data.semiMajor);
          expect(ellipse.getSemiMinorAxis()).toEqual(data.semiMinor);
        });

        it ('in the semi minor axis', function () {
          ellipse.scale({y: 0.5});
          expect(ellipse.getSemiMinorAxis()).toEqual(0.5 * data.semiMinor);
        });
      }); // End 'by scale'
    }); // End 'can be modified'
  }); // End 'An Ellipse'
});
