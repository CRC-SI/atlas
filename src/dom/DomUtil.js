define([
  'jquery',
], function($) {

  /**
   * @typedef atlas.dom.DomUtil
   * @ignore
   */
  var DomUtil;

  /**
   * A collection of reusable DOM utility methods.
   * @class atlas.dom.DomUtil
   */
  DomUtil = /** @lends atlas.dom.DomUtil# */ {

    getPositionBoundary: function(domNode) {
      var $domNode = $(domNode),
        position = $(domNode).position();
      position.right = position.left + $domNode.width();
      position.bottom = position.top + $domNode.height();
      return position;
    },

    setPositionBoundary: function (domNode, boundary) {
      var left = boundary.left,
        right = boundary.right,
        top = boundary.top,
        bottom = boundary.bottom,
        $domNode = $(domNode);
      left !== undefined && $domNode.css('left', left);
      right !== undefined && $domNode.css('left', right - $domNode.width());
      top !== undefined && $domNode.css('top', top);
      bottom !== undefined && $domNode.css('top', bottom - $domNode.height());
    },

    /**
     * Constrains the given DOM node in the given parent DOM node. This expects the given dom node
     * to be absolutely positioned in the given parent, which is relatively positioned.
     * @param {HTMLElement} domNode
     */
    constrainPositionWithin: function(domNode, parentDomNode) {
      var position = this.getPositionBoundary(domNode),
        boundary = {},
        $parent = $(parentDomNode),
        parentWidth = $parent.width(),
        parentHeight = $parent.height();
      if (position.left < 0) {
        boundary.left = 0;
      } else if (position.right > parentWidth) {
        boundary.right = parentWidth;
      }
      if (position.top < 0) {
        boundary.right = 0;
      } else if (position.bottom > parentHeight) {
        boundary.bottom = parentHeight;
      }
      this.setPositionBoundary(domNode, boundary);
    }

  };

  return DomUtil;
});