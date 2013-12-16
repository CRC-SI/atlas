/**
 * A utility class for adding and removing classes to DOM HTMLElements.
 */
define([
], function () {

  /**
   * A utility class containing static functions for managing a DOM
   * elements classes.
   * @author Brendan Studds
   * @exports atlas/util/dom/DomClass
   */
  var DomClass = {

    /**
     * Adds the given class to the given element.
     * @param {HTMLElement} element The DOM HtmlElement to change.
     * @param {String} classStr     The class to add to the DOM element
     */
    add: function(element, classStr) {
      element.classList.add(classStr);
    },

    /**
     * Removes the given class to the given element.
     * @param {HTMLElement} element The DOM HtmlElement to change.
     * @param {String} classStr     The class to remove
     */
    remove: function(element, classStr) {
      element.classList.remove(classStr);
    },

    /**
     * Toggles the given class to the given element.
     * @param {HTMLElement} element The DOM HtmlElement to change.
     * @param {String} classStr     The class to toggle
     */
    toggle: function(element, classStr) {
      element.classList.toggle(classStr);
    }
  };

  return DomClass;
});