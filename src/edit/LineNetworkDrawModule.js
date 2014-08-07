define([
  'atlas/edit/LineDrawModule'
], function(LineDrawModule) {
  /**
   * @typedef atlas.edit.LineNetworkDrawModule
   * @ignore
   */
  var LineNetworkDrawModule;

  /**
   * @classdesc Handles logic for drawing {@link atlas.model.LineNetwork} objects through user
   * interaction.
   * @extends atlas.edit.LineDrawModule
   * @class atlas.edit.LineNetworkDrawModule
   */
  LineNetworkDrawModule = LineDrawModule.extend(/** @lends atlas.edit.LineNetworkDrawModule# */ {
    // TODO(bpstudds): Will extension even work? Maybe this should be composition.

    /*
       Behaviour over-ridden from the LineDrawModule:
         - A "drawing interaction" produces a single line as per LineDrawModule
         - Multiple drawing interactions build up the network
         - Cancelling a drawing interaction removes the 'current' line but does not end drawing
           - "Double cancel" to stop drawing
             TODO(bpstudds): Is there an easy way to modify the cursor to signify drawing?
         - When clicking, check whether an existing node was clicked.
           - if a node doesn't exist, a node needs to be added to the LineNetwork
           - if a node already exists, add that node to the current line
               TODO(bpstudds): Be able to add a new (blank) line to a LineNetwork
         - On double clicking, drawing should be ended if a line is not currently being drawn
           - if the current line has 0 nodes, the new line is cancelled and drawing ended
           - if the current line has 1 node, the line is cancelled
           - if the current line has 2+ nodes, the line is finalised and a new one 'started'
     */

    /**
     * A scratch line network object that is used to contain the line network as it is drawn.
     * @type {atlas.model.LineNetwork}
     * @private
     */
    _lineNetwork: null,

    _init: function(args) {
      // TODO(bpstudds): 'create' event should only happen when actually done
      this._super(args);
    },

    _add: function(args) {
      // TODO(bpstudds): Check if clicked on pre-existing node.
      // TODO(bpstudds): Add (new|pre-existing) node to current line in the network.
      // TODO(bpstudds): Add de-bouncing to the BaseEditModule?

      // Delegate to LineDrawModule to draw a line.
      this._super(args);
    },

    _render: function() {
      // TODO(bpstudds): Make sure the LineNetwork is only re-rendering changed lines.
      this._super();
    },

    _stop: function() {
      this._super();
    },

    _cancel: function() {
      this._super();
    },

    _reset: function() {
      this._super();
    }

  });

  return LineNetworkDrawModule;
});

