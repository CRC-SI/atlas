define([
  'atlas/dom/DomUtil',
  'atlas/events/EventTarget',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Class',
  'jquery',
], function (DomUtil, EventTarget, Log, Setter, Types, Class, $) {

  /**
   * @typedef atlas.dom.Overlay
   * @ignore
   */
  var Overlay;

  /**
   * @classdesc An Overlay can be used to place panels overlaying the Atlas
   * render which can display information. They can be used to display plain text
   * or HTML. The content is wrapped in a <div> and includes an option title, enable
   * checkbox, and close button.
   *
   * @param {Object} args - Arguments to the constructor.
   * @param {String|HTMLElement} [args.parent=document] - The DOM ID or element instance to place
   *    the Overlay on.
   * @param {String} [args.title] - A title to show in the overlay.
   * @param {String} [args.class] - The CSS class to apply to the <code><div</code> surrounding
   *    the Overlay.
   * @param {boolean} [args.hasRemoveBtn=false] - Whether the Overlay should have a remove
   *    button. The default action of this button is to remove and destroy the Overlay.
   * @param {function} [args.onRemove] - A callback that is called when the Overlay remove
   *    button is clicked. This callback overrides the default action of the remove button, so the
   *    callback should remove the Overlay if that is required.
   * @param {boolean} [args.hasEnableCheckbox=false] - Whether the Overlay should have an enable
   *    checkbox. The default action of this checkbox is to minimise and maximise the Overlay.
   * @param {function} [args.onEnabledChange] - A callback that is called when the overlay enable
   *    checkbox is clicked. This callback overrides the default behaviour of the enable checkbox,
   *    so the callback should minimise/maximise the Overlay if this is required.
   * @param {Object} [args.position] - The position of the Overlay.
   * @param {Object} [args.position.top=0] - The dimension from the top of <code>parent</code>
   *    to the top of the Overlay in pixels.
   * @param {Object} [args.position.left=0] - The dimension from the left of <code>parent</code>
   *    to the left of the Overlay in pixels.
   * @param {Object} [args.position.bottom=undefined] - The dimension from the bottom of
   *    <code>parent</code> to the top of the Overlay in pixels.
   * @param {Object} [args.position.right=undefined] - The dimension from the right of
   *    <code>parent</code> to the left of the Overlay in pixels.
   * @param {Object} [args.dimensions] - The dimensions of the Overlay. Dimensions are overridden
   *    if both <code>position.top</code> and <code>position.bottom</code> or
   *    <code>position.top</code> and <code>position.bottom</code> are defined.
   * @param {Object} [args.dimensions.height] - The height of the Overlay, by default it fits the content.
   * @param {Object} [args.dimensions.width] - The width of the Overlay, by default it fits the content.
   * @param {String} [args.content=''] - Either a plain text or HTML to be rendered in the Overlay.
   * @param {atlas.events.EventManager} [args.eventManager]
   *
   * @class atlas.dom.Overlay
   * @extends atlas.dom.EventTarget
   */
  Overlay = EventTarget.extend(/** @lends atlas.dom.Overlay# */ {

    /**
     * The parent element of the Overlay, null if the Overlay is positioned absolutely within
     * the document.
     * @type {HTMLElement}
     * @protected
     */
    _parent: null,

    /**
     * The HTMLElement generated from this Overlay.
     * @type {HTMLElement}
     * @protected
     */
    _element: null,

    /**
     * The class(es) to apply to the Overlay HTML.
     * @type {String}
     * @protected
     */
    _cssClass: null,

    /**
     * The title to place on the overlay.
     * @type {String}
     * @protected
     */
    _title: null,

    /**
     * The position of the Overlay. If both <code>top</code> and <code>bottom</code> are specified,
     * height is ignored. If both <code>left</code> and <code>right</code> are specified,
     * width is ignored.
     * @type {Object}
     * @property {Number} top - Distance in pixels from the top edge of the Parent.
     * @property {Number} left - Distance in pixels from the left edge of the Parent.
     * @property {Number} bottom - Distance in pixels from the bottom edge of the Parent.
     * @property {Number} right - Distance in pixels from the right edge of the Parent.
     * @protected
     */
    _position: null,

    /**
     * The dimensions of the Overlay
     * @type {Object}
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

    /**
     * Function handler for when the Overlay is removed. The context of this
     * function is assumed to be correctly set.
     * @function
     * @protected
     */
    _onRemove: null,

    /**
     * Function handler for when the Overlay is enabled or disabled. The function should
     * accept one argument, a boolean that if true means the Overlay is being enabled.
     * @function
     * @protected
     */
    _onEnabledChange: null,

    /*
     * Constructor for the overlay
     * @ignore
     */
    _init: function (args) {
      // Set defaults
      args = Setter.merge({
        parent: document.body,
        cssClass: '',
        title: '',
        position: {},
        dimensions: {},
        showMinimised: false,
        content: '',
        hasRemoveBtn: false,
        hasChangeCheckbox: false
      }, args);
      this._super(args.eventManager);
      if (typeof args.parent === 'string') {
        args.parent = document.getElementById(args.parent);
      }
      if (!args.parent) { throw new Error('Error attaching to element ' + args.parent)}

      // Sanitise the dimensions and positions passed in.
      ['top', 'left', 'right', 'bottom'].forEach(function (p) {
        args.position[p] === null && delete args.position[p];
      });
      args.dimensions.width === null && delete args.dimensions.width;
      args.dimensions.height === null && delete args.dimensions.height;

      // Set instance members
      this._id = args.id;
      this._parent = args.parent;
      this._title = args.title;
      this._cssClass = args.cssClass;

      this._position = args.position;
      this._dimensions = args.dimensions;
      this._content = args.content;
      this._showMinimised = args.showMinimised;

      this._onRemove = Types.isFunction(args.onRemove) ? args.onRemove : null;
      this._hasRemoveBtn = args.hasRemoveBtn || this._onRemove !== null;
      this._onEnabledChange = Types.isFunction(args.onEnabledChange) ? args.onEnabledChange : null;
      this._hasEnableCheckbox = args.hasEnableCheckbox || this._onEnabledChange !== null;

      // Construct element and append it to the parent.
      this._render();
    },

    // -------------------------------------------
    // Getters and Setters
    // -------------------------------------------

    isVisible: function() {
      var element = this.getDom();
      if (!element) { return false; }
      return $(element).is(':visible');
    },

    getContent: function() {
      return this._content;
    },

    getCssClass: function() {
      return this._cssClass;
    },

    getDom: function() {
      return this._element;
    },

    /**
     * Gets the individual DOM elements for the title and content of the Overlay.
     * @returns {{title: HTMLElement, content: HTMLElement}}
     */
    getDomElements: function() {
      var overlay = this.getDom(),
          title = $('.title', overlay)[0],
          content = $('.body', overlay)[0];
      return {title: title, content: content};
    },

    getHtml: function() {
      return $(this.getDom()).html();
    },

    getId: function() {
      return this._id;
    },

    getParent: function() {
      return this._parent;
    },

    getPosition: function() {
      return this._position;
    },

    setPosition: function(position) {
      this._position = position;
      var $element = $(this.getDom());
      ['top', 'bottom', 'left', 'right'].forEach(function(attr) {
        var value = position[attr];
        value !== undefined && $element.css(attr, value + 'px');
      });
    },

    getDimensions: function() {
      return this._dimensions;
    },

    setDimensions: function(dimensions) {
      var $element = $(this.getDom());
      this._dimensions = dimensions;
      ['height', 'width'].forEach(function(attr) {
        var value = dimensions[attr];
        value !== undefined && $element.css(attr, value + 'px');
      });
    },

    /**
     * Sets whether the Overlay is minimised.
     * @param {boolean} isMinimised - The Overlay should be minimised.
     */
    setMinimised: function (isMinimised) {
      var elems = this.getDomElements(),
        $content = $(elems.content),
        $enableCheckbox = $('.enable-overlay', elems.title);
      $content.toggle(!isMinimised);
      $enableCheckbox.prop('checked', !isMinimised);
    },

    /**
     * @returns {boolean} Whether the Overlay is minimised.
     */
    isMinimised: function() {
      var content = this.getDomElements().content;
      return !$(content).is(':visible');
    },

    // -------------------------------------------
    // Modifiers
    // -------------------------------------------

    /**
     * Hides the Overlay from view.
     */
    hide: function() {
      if (!this.isVisible()) { return; }
      $(this.getDom()).hide();
      this._eventManager && this._eventManager.dispatchEvent(new Event(this, 'overlay/hide'));
    },

    /**
     * Shows the overlay on the parent document.
     */
    show: function() {
      if (this.isVisible()) { return; }
      $(this.getDom()).show();
      this._eventManager && this._eventManager.dispatchEvent(new Event(this, 'overlay/show'));
    },

    /**
     * Sets the content of the Overlay to be visible.
     */
    maximise: function() {
      this.setMinimised(false);
    },

    /**
     * Sets the content of the Overlay to be hidden. The Overlay should be sized so that
     * only it uses only sufficient space to display the title.
     */
    minimise: function() {
      this.setMinimised(true);
    },

    /**
     * Toggles whether the Overlay is minimised.
     */
    toggleMinimisation: function() {
      this.setMinimised(!this.isMinimised());
    },

    /**
     * Removes the Overlay from the parent document.
     */
    remove: function() {
      if (!this._element || !this._element.parentElement) {
        Log.warn('Tried to remove an unrendered Overlay.');
        return;
      }
      this.hide();
      $(this.getDom()).remove();
      this._element = null;
      this._eventManager && this._eventManager.dispatchEvent(new Event(this, 'overlay/remove'));
    },

    /**
     * Creates the element for the HTML of the Overlay.
     * @returns {HTMLElement} The rendered DOM for the Overlay.
     * @protected
     */
    _render: function() {
      // TODO(bpstudds): Refactor this function.
      // TODO(aramk) Refactor to use jQuery.
      var $element = $('<div class="overlay"></div>');
      $element.addClass(this.getCssClass());
      var element = this._element = $element[0],
        $parent = $(this.getParent());

      var title = '';
      if (this._title) {
        // Create HTML for title of overlay.
        // Wrap the title with an enable checkbox and remove button if necessary.
        title += '<div class="title">';
        if (this._hasEnableCheckbox) {
          title += '<input type="checkbox" value="true" class="enable">'
        }
        title += '<div class="enable-label">' + this._title + '</div>';
        if (this._hasRemoveBtn) {
          title += '<button class="remove">X</button>';
        }
        title += '</div>';
      }

      // Create HTML for body of overlay.
      var bodyClass = 'body';
      var html = title + '<div class="' + bodyClass + '">' + this._content + '</div>';

      // Create the overlay html.
      $element.html(html);

      this.setPosition(this._position);
      this.setDimensions(this._dimensions);
      this.setMinimised(this._showMinimised);
      $parent.append($element);
      DomUtil.constrainPositionWithin($element, $parent);

      // Add event handler to close button and checkbox
      if (this._hasRemoveBtn) {
        var removeFunction = this._onRemove ? '_onRemove' : 'remove';
        $('.remove-overlay', element).click(function (e) {
          // 0 -> left click.
          if (e.button === 0) {
            this[removeFunction](e);
          }
        }.bind(this));
      }
      if (this._hasEnableCheckbox) {
        var enableFunction = this._onEnabledChange ? '_onEnabledChange' : 'toggleMinimisation';
        $('.enable-overlay', element).click(function (e) {
          // 0 -> left click.
          if (e.button === 0) {
            this[enableFunction](e.target.value, e);
          }
        }.bind(this));
      }

      return element;
    }
  }); // End class instance definition


  // -------------------------------------------
  // Statics
  // -------------------------------------------

  /**
   * Creates a series of HTML attributes based on the given data structure.
   * @param {Object} data - The map of attributes to values.
   * @param {String} [data.cssClass=''] - The CSS class of the tag.
   * @param {String} [data.id=''] - The ID of the tag.
   * @param {atlas.model.Colour} [data.bgColour=null] - The CSS background-color to apply to the tag.
   * @returns {String} The HTML string of the attributes.
   */
  Overlay.parseAttributes = function (data) {
    // TODO(aramk) Rely on $.attr() instead.
    var html = '',
        style = '',
        data = data || {};
    data.cssClass && (html += 'class="' + data.cssClass +'" ');
    data.id && (html += 'id="' + data.id +'" ');
    data.background && (style += 'background:' + data.background + ';');
    data.bgColour && (style += 'background-color:' + data.bgColour.toHexString() + ';');
    data.width && (style += 'width:' + data.width + ';');
    if (style !== '') {
      html += 'style="' + style +'"';
    }
    if (html === '') { return ''; }
    return html.trim();
  };

  /**
   * Generates a HTML table from a 2D array of objects describing the table. The first
   * index of the 2D array represents a row in the table, the second index represents
   * the column. Each array element should conform to the <code>data</code> parameter
   * of {@link atlas.dom.Overlay~parseAttributes}, as well as having a <code>value</code>
   * property which will be placed into the cell.
   * @param {Object} data - The table data.
   * @returns {String}
   *
   * @example <caption>Form of data expected by generateTable</caption>
   * data = {
   *   id: 'tableID',
   *   class: 'tableClass',
   *   rows: [
   *     { id: 'row1_ID',
   *       cells: [
   *         { value: 'cellContents', class: 'class', bgColour = Colour.RED, ... }
   *         { value: 'cellContents2', bgColour = Colour.GREEN, ... }
   *       ]
   *     },
   *     { id: 'row2_ID',
   *       cells: [
   *         { value: 'cellContents', class: 'class', bgColour = Colour.RED, ... }
   *         { value: 'cellContents2', bgColour = Colour.GREEN, ... }
   *       ]
   *     }
   *   ]
   * }
   */
  Overlay.generateTable = function (data) {
    if (!data || !data.rows) { return ''; }
    var tableAttributes = Overlay.parseAttributes(data),
        html = '<table ' + tableAttributes + '>';
    data.rows.forEach(function (row) {
      var rowAttributes = Overlay.parseAttributes(row);
      html += '<tr ' + rowAttributes + '>';
      row.cells.forEach(function (cell) {
        var cellAttributes = Overlay.parseAttributes(cell);
        html += '<td ' + cellAttributes + '>' + (cell.value || '') + '</td>';
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
  };

  return Overlay;
});
