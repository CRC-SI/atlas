define([
  'atlas/lib/ConvexHullGrahamScan',
  'atlas/lib/utility/Class',
  'atlas/model/GeoPoint',
  'atlas/util/Instances'
], function(ConvexHullGrahamScan, Class, GeoPoint, Instances) {

  /**
   * @typedef atlas.util.ConvexHullFactory
   * @ignore
   */
  var ConvexHullFactory;

  /**
   * Utility methods for constructing convex hulls.
   * @class atlas.util.ConvexHullFactory
   */
  ConvexHullFactory = Instances.defineGlobal(Class.extend({

    /**
     * @param {Array.<atlas.model.GeoPoint>} vertices
     * @returns {Array.<atlas.model.GeoPoint>} The convex hull vertices generated for the given
     * vertices.
     */
    fromVertices: function(vertices) {
      var convexHull = new ConvexHullGrahamScan();
      vertices.forEach(function(vertex) {
        convexHull.addPoint(vertex.longitude, vertex.latitude);
      });
      var hullPoints = convexHull.getHull();
      return hullPoints.map(function(point) {
        return GeoPoint.fromVertex(point);
      });
    }

  }));

  return ConvexHullFactory;
});
