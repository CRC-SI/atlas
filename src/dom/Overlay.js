define([
  'atlas/util/Class',
  'atlas/util/mixin'
], function (Class, mixin) {

  /**
   * @classdesc An Overlay can be used to place panels overlaying the Atlas
   * render (or in fact, any section of the host website) which can display
   * information.
   * @author Brendan Studds
   *
   * @param {Object} args - Arguments to the constructor.
   * @param {String|HTMLElement} [args.parent=document] - The DOM ID or element instance to place the Overlay on.
   * @param {Object} [args.dimensions] - The dimensions of the Overlay.
   * @param {Object} [args.dimensions.top=0] - The dimension from the top of <code>parent</code> to the top of the Overlay in pixels.
   * @param {Object} [args.dimensions.left=0] - The dimension from the left of <code>parent</code> to the left of the Overlay in pixels.
   * @param {Object} [args.dimensions.height] - The height of the Overlay, by default it fits the content.
   * @param {Object} [args.dimensions.width] - The width of the Overlay, by default it fits the content.
   * @param {String} [args.content=''] - Either a plain text or HTML to be rendered in the Overlay.
   *
   * @class atlas.dom.Overlay
   */
  var Overlay = mixin(Class.extend(/** @lends atlas.dom.Overlay# */ {

    /**
     * The parent element of the Overlay, null if the Overlay is positioned absolutely within
     * the document.
     * @type {HTMLElement}
     * @protected
     */
    _parent: null,

    /**
     * The position of the Overlay
     * @type {Object}
     * @property {Number} top - Distance in pixels from the top edge of the Parent.
     * @property {Number} left - Distance in pixels from the left edge of the Parent.
     * @property {Number} height - Height of the Overlay in pixels.
     * @property {Number} width - Width of the Overlay in pixels.
     * @protected
     */
    _dimensions: null,

    /**
     * The content of the Overlay. Currently supports HTML and plain text.
     * @type {String}
     * @protected
     */
    _content: null,

    /*
     * Constructor for the overlay
     * @ignore
     */
    _init: function (args) {
      //this._super(parent, position, content);
      args = mixin({
        parent: document,
        dimensions: {top: 0, left: 0},
        content: ''
      }, args);
      if (typeof args.parent === 'string') { args.parent = document.getElementById(parent); }

      this._parent = args.parent;
      this._dimensions = args.dimensions;
      this._content = args.content;
      // Construct element and append it to the parent.
      this._element = this._render();
    },

    /**
     * Creates the element for the HTML of the Overlay.
     * @returns {HTMLElement} The rendered DOM for the Overlay.
     * @protected
     */
    _render: function () {
      var element = document.createElement('div');
      element.classList.add('overlay');
      element.innerHTML = this._content;

      // Set the Overlay's position.
      this._dimensions.top !== undefined && (element.style.top = this._dimensions.top + 'px');
      this._dimensions.left !== undefined && (element.style.left = this._dimensions.left + 'px');
      // Width and Height don't need to be set, even if height and width are set to '0'.
      this._dimensions.height && (element.style.height = this._dimensions.height + 'px');
      this._dimensions.width && (element.style.width = this._dimensions.width + 'px');

      this._parent.appendChild(element);
      //this._element = element;
      return element;
    },

//////
// MODIFIERS

    /**
     * Hides the Overlay from view.
     */
    hide: function () {
      if (this._element === undefined) { return; }
      this._element.classList.add('hidden');
    },

    /**
     * Shows the overlay on the parent document.
     */
    show: function () {
      if (this._element === undefined) { return; }
      this._element.classList.remove('hidden');
    },

    /**
     * Removes the Overlay from the parent document.
     */
    remove: function () {
      if (this._element === undefined) { return; }
      this._parent.removeChild(this._element);
    }
  }), // End class instance definition

//////
// STATICS
    {

    }
  ); // End class definition

  return Overlay;
});
