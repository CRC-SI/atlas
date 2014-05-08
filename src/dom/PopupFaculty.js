define([
  'atlas/util/Class',
  'atlas/dom/Overlay'
], function (Class, Overlay) {
  /**
   * @typedef atlas.visualisation.FeaturePopupFaculty
   * @ignore
   */
  var FeaturePopupFaculty;

  // Uses on EventManager:
  //   On 'entity/popup/show' display the overlay
  //   On 'entity/popup/hide'
  //   On 'entity/deselect'
  //     - remove and destroy the overlay
  // Depends on Overlay

  // The user should be able to specify:
  //   - the entityId of the associated entity (not required for functionality)
  //   - the position of the popup as
  //     - (top || bottom || 0), (left || right || 0)
  //   - the size of the popup


  // The overlay should:
  //   - not have an enable checkbox
  //   - have a close button

  FeaturePopupFaculty = Class.extend({

    /**
     * The Overlay being rendered by the popup.
     * @private
     * @type atlas.dom.Overaly
     */
    _overlay: null,

    _init: function () {

    }

  });

});
FeaturePopupFaculty
