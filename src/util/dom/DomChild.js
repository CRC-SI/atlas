/*
 * A utility class for managing the children of DOM Elements.
 */
define([
], function() {
  "use strict";

  /**
   * A utility class containing static functions for managing the child
   * elements on a DOM node.
   * @exports atlas.util.dom.DomChild
   */
  var DomChild = {

    /**
     * Gets all of the child elements of the given DOM node.
     * @param {HTMLElement} element - The DOM node.
     * @returns {HTMLElement[]} A list of all child nodes.
     */
    getChildren: function(element) {
      if (!element || !element.hasChildNodes()) {
        return [];
      }
      var children = [];
      children.push(element.firstElementChild);
      var sibling = children[0];
      // The while code doesn't play nice with jsdoc so I've used untilArg2isNull instead.
//      while ((sibling = sibling.nextElementSibling) !== null) {
//        children.push(sibling);
//      }
      var untilArg2isNull = function(children, sibling) {
        if (sibling === null) return;
        children.push(sibling);
        untilArg2isNull(children, sibling.nextElementSibling);
      };
      untilArg2isNull(children, sibling);
      return children;
    },

    /**
     * Removes all children from the given DOM node.
     * @param {HTMLElement} element - The DOM node.
     */
    removeChildren: function(element) {
      var children = DomChild.getChildren(element);
      for (var child in children) {
        element.removeChild(child);
      }
    },

    /**
     * Adds a given HTMLElement as a child to to given DOM node.
     * @param {HTMLElement} element - The DOM node to add to.
     * @param {HTMLElement} child - The DOM node to add.
     */
    addChild: function(element, child) {
      element.appendChild(child);
    },

    /**
     * Adds a list of HTMLElements to the given DOM node.
     * @param {HTMLElement} element - The DOM node to add to.
     * @param {HTMLElement[]} children - The list of nodes to add.
     */
    addChildren: function(element, children) {
      children.forEach(function(child) {
        element.appendChild(child);
      });
    }
  };

  return DomChild;
});
