define([
  'atlas/core/ItemStore',
  'atlas/core/Manager',
  'atlas/dom/Popup',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types'
], function(ItemStore, Manager, Popup, Setter, Types) {

  // TODO(aramk) This duplicates the purpose of PopupFaculty in some ways.

  /**
   * @typedef atlas.dom.PopupManager
   * @ignore
   */
  var PopupManager;

  /**
   * @classdesc Creates and manages a set of {@link atlas.dom.Popup} objects. When to visualise them
   * is deliverately not handled by this manager.
   *
   * @param {Object} managers - A mapping of Atlas manager types to the Manager instance.
   * @param {Object} [options] - Options to control the PopupManager's behaviour.
   * @param {Object} [options.isExclusive] - Whether to show only a single {@link atlas.dom.Popup}
   * at a time.
   *
   * @class atlas.dom.PopupManager
   * @extends atlas.core.Manager
   */
  PopupManager = Manager.extend(/** @lends atlas.dom.PopupManager# */ {

    _id: 'popup',

    /**
     * The current {@link atlas.dom.Popup}.
     * @type atlas.dom.Popup
     */
    _current: null,

    /**
     * A collection of added {@link atlas.dom.Popup} objects.
     * @type {atlas.core.ItemStore}
     */
    _popups: null,

    _isExclusive: true,

    _init: function(managers, options) {
      this._super(managers);
      options = Setter.mixin({
        isExclusive: true
      }, options);
      this._isExclusive = options.isExclusive;
      this._popups = new ItemStore();
    },

    setup: function() {
      this._bindEvents();
    },

    _bindEvents: function() {
      var handlers = [
        {
          source: 'extern',
          name: 'popup/onSelection',
          callback: function(args) {
            this.createOnSelection(args);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'popup/create',
          callback: function(args) {
            var callback = args.callback;
            delete args.callback;
            var popup = this._createPopup(args);
            callback && callback(popup);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'popup/delete',
          callback: function(args) {
            var callback = args.callback;
            delete args.callback;
            this._removePopup(Popup.ID_PREFIX + args.id);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'popup/current',
          callback: function(args) {
            args.callback(this.getCurrent());
          }.bind(this)
        }
      ];
      this._managers.event.addEventHandlers(handlers);
    },

    _createPopup: function(args) {
      var entity = args.entity,
        content = args.content,
        title = args.title;
      args.renderManager = this._managers.render;
      if (Types.isString(entity)) {
        args.entity = this._managers.entity.getById(entity);
      }
      args = Setter.merge({
        parent: this._managers.dom.getDom()
      }, args);
      if (Types.isFunction(content)) {
        args.content = content(args);
      }
      if (Types.isFunction(title)) {
        args.title = title(args);
      }
      var popup = new Popup(args);
      this._bindPopupEvents(popup);
      this._popups.add(popup);
      return popup;
    },

    _removePopup: function(id) {
      var popup = this._popups.get(id);
      popup.remove();
      this._popups.remove(id);
    },

    _bindPopupEvents: function(popup) {
      popup.addEventListener('overlay/show', function() {
        if (!this._isExclusive) return;
        // Hide other popups when one becomes visible.
        this._popups.forEach(function(otherPopup) {
          if (popup === otherPopup) return;
          otherPopup.hide();
        });
      }.bind(this));
      popup.addEventListener('overlay/remove', function() {
        this._removePopup(popup.getId());
      }.bind(this));
    },

    createOnSelection: function(args) {
      var entity = args.entity,
        entityPopup,
        onCreate = args.onCreate;
      delete args.onCreate;

      var initPopup = function() {
        if (entityPopup) return;
        entityPopup = this._createPopup(args);
        onCreate(entityPopup);
        // TODO(aramk) Track the entity instead.
        this._managers.event.addEventHandler('intern', 'input/leftdown', function(event) {
          entityPopup && entityPopup.hide();
        });
        entity.addEventListener('entity/deselect', function(event) {
          entityPopup.hide();
        }, {ignoreBubbled: true});
      }.bind(this);
      entity.addEventListener('entity/select', function(event) {
        initPopup();
        entityPopup.show();
      }, {ignoreBubbled: true});
      return entityPopup;
    },

    getCurrent: function() {
      return this._current;
    }

  });

  return PopupManager;
});
