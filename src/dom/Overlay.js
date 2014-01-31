define([
  'atlas/util/Class',
  'atlas/util/mixin'
], function (Class, mixin) {

  var Overlay = mixin(Class.extend({

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
    _position: null,

    /**
     * The HTML contained within the Overlay.
     * @type {String}
     * @protected
     */
    _html: null,

    _init: function (parent, position, html) {
      if (typeof parent === 'string') { parent = document.getElementById(parent); }

      this._parent = parent || document;
      this._position = position;
      this._html = html;
    },

    /**
     * Creates the element for the HTML of the Overlay.
     * @returns {HTMLElement} The rendered DOM for the Overlay.
     * @protected
     */
    _render: function () {
      var element = document.createElement('div');
      element.classList.add('overlay');
      element.innerHTML = this._html;

      // Set the Overlay's position.
      element.style.top = this._position.top + 'px';
      element.style.left = this._position.left + 'px';
      element.style.height = this._position.height + 'px';
      element.style.width = this._position.width + 'px';

      this._parent.appendChild(element);
      this._element = element;
      return element;
    },

    hide: function () {
      if (this._element === undefined) { return; }
      this._element.classList.add('hidden');
    },

    show: function () {
      if (this._element === undefined) { return; }
      this._element.classList.remove('hidden');
    }
  }), // End class instance definition

//////
// STATICS
    {

    }
  ); // End class definition

  return Overlay;
});
