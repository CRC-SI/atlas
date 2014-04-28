define([
  'atlas/util/Class',
  'atlas/util/mixin'
], function (Class, mixin) {

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
   * @param {Function|boolean} [args.onRemove] - A callback that is called when the overlay remove
   *    button is clicked or a boolean value. If a callback or true is given, the
   *    remove button is rendered.
   * @param {function} [args.onEnabledChange] - A callback that is called when the overlay enable
   *    checkbox is clicked. This checkbox is only shown if the callback is given.
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
   *
   * @class atlas.dom.Overlay
   */
  Overlay = mixin(Class.extend(/** @lends atlas.dom.Overlay# */ {

    /**
     * The parent element of the Overlay, null if the Overlay is positioned absolutely within
     * the document.
     * @type {HTMLElement}
     * @protected
     */
    _parent: null,

    /**
     * The class(es) to apply to the Overlay HTML.
     * @type {String}
     * @protected
     */
    _class: null,

    /**
     * The title to place on the overlay.
     * @type {String}
     * @protected
     */
    _title: null,

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

    /**
     * The entire HTML of the rendered Overlay.
     * @type {String}
     * @protected
     */
    _html: null,

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
      //this._super(parent, position, content);
      args = mixin({
        parent: document,
        'class': '',
        title: '',
        dimensions: {top: 0, left: 0},
        content: ''
      }, args);
      if (typeof args.parent === 'string') { args.parent = document.getElementById(parent); }

      this._parent = args.parent;
      this._class = args.class;
      this._title = args.title;
      this._onRemove = args.onRemove;
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
      this._class !== '' && element.classList.add(this._class);

      // Wrap the title with an enable checkbox and remove button if necessary.
      var title = '<div class="overlay-title">';
      if (this._onEnabledChange) {
        title += '<input type="checkbox" value="false" class="enable-overlay">'
      }
      title += this._title;
      if (this._onRemove) {
        title += '<button class="remove-overlay">X</button>';
      }
      title +=  '</div>'
      this._html = title + '<div class="overlay-body">' + this._content + '</div>';

      // Create the overlay html.
      element.innerHTML = this._html;

      // Set the Overlay's position.
      this._dimensions.top !== undefined && (element.style.top = this._dimensions.top + 'px');
      this._dimensions.left !== undefined && (element.style.left = this._dimensions.left + 'px');
      // Width and Height don't need to be set, even if height and width are set to '0'.
      this._dimensions.height && (element.style.height = this._dimensions.height + 'px');
      this._dimensions.width && (element.style.width = this._dimensions.width + 'px');

      // Attach to parent
      this._parent.appendChild(element);

      // Add event handler to close button and checkbox
      if (this._onRemove) {
        var buttons = element.getElementsByClassName('remove-overlay');
        buttons[0].addEventListener('click', function (e) {
          // 0 -> left click.
          if (e.button === 0) {
            this._onRemove(e);
          }
        }.bind(this))
      }
      if (this._onEnabledChange) {
        var checkboxes = element.getElementsByClassName('enable-overlay');
        checkboxes[0].addEventListener('click', function (e) {
          // 0 -> left click.
          if (e.button === 0) {
            this._onEnabledChange(e.target.value, e);
          }
        })
      }

      return element;
    },

    // -------------------------------------------
    // Getters and Setters
    // -------------------------------------------
    getContent: function () {
      return this._content;
    },

    getHtml: function () {
      return this._html;
    },

    // -------------------------------------------
    // Modifiers
    // -------------------------------------------

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
      /**
       * Converts a map of attributes to a HTML string.
       * @param {Object} data - The map of attributes to values.
       * @param {String} [data.class=''] - The CSS class of the tag.
       * @param {String} [data.id=''] - The ID of the tag.
       * @param {atlas.model.Colour} [data.bgColour=null] - The CSS background-color to apply
       *    to the tag.
       * @returns {String} The HTML string of the attributes.
       */
      parseAttributes: function (data) {
        var html = '',
            style = '',
            data = data || {};
        data.class && (html += 'class="' + data.class +'" ');
        data.id && (html += 'id="' + data.id +'" ');
        data.background && (style += 'background:' + data.background + ';');
        data.bgColour && (style += 'background-color:' + data.bgColour.toHexString() + ';');
        data.width && (style += 'width:' + data.width + ';');
        if (style !== '') {
          html += 'style="' + style +'"';
        }
        if (html === '') { return ''; }
        return (html = ' ' + html.trim());
      },

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
      generateTable: function (data) {
        if (!data || !data.rows) { return ''; }
        var tableAttributes = Overlay.parseAttributes(data),
            html = '<table' + tableAttributes + '>';
        data.rows.forEach(function (row) {
          var rowAttributes = Overlay.parseAttributes(row);
          html += '<tr' + rowAttributes + '>';
          row.cells.forEach(function (cell) {
            var cellAttributes = Overlay.parseAttributes(cell);
            html += '<td' + cellAttributes + '>' + (cell.value || '') + '</td>';
          });
          html += '</tr>';
        });
        html += '</table>';
        return html;
      }
    }
  ); // End class definition

  return Overlay;
});
