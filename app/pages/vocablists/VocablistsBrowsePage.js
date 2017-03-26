const GelatoPage = require('gelato/page');
const Table = require('components/vocablists/VocablistsBrowseTableComponent');
const Sidebar = require('components/vocablists/VocablistsSidebarComponent');
const ExpiredNotification = require('components/account/AccountExpiredNotificationComponent');

/**
 * A page that allows a user to browse different categories of vocablists they can study.
 * @class VocablistBrowse
 * @extends {GelatoPage}
 */
module.exports = GelatoPage.extend({

  /**
   * @property events
   * @type {Object}
   */
  events: {
    'change input[type="checkbox"]': 'handleChangeCheckbox',
    'keyup #list-search-input': 'handleKeypressListSearchInput',
    'click #list-option': 'handleClickListOption',
    'click #grid-option': 'handleClickGridOption'
  },

  /**
   * @property title
   * @type {String}
   */
  title: app.locale('pages.vocabLists.titleBrowse'),

  /**
   * @property template
   * @type {Function}
   */
  template: require('./VocablistsBrowse'),

  /**
   * @method initialize
   * @constructor
   */
  initialize: function() {
    if (app.config.recordLoadTimes) {
      this.loadStart = window.performance.now();
      this.loadAlreadyTimed = false;
    }

    this._views['sidebar'] = new Sidebar();
    this._views['table'] = new Table();
    this._views['expiration'] = new ExpiredNotification();

    if (app.config.recordLoadTimes) {
      this.componentsLoaded = {
        table: false
      };
      this.listenTo(this._views['table'], 'component:loaded', this._onComponentLoaded);
    }
  },

  /**
   * @method render
   * @returns {VocablistBrowse}
   */
  render: function() {
    if (app.isMobile()) {
      this.template = require('./MobileVocablistsBrowse.jade');
    }

    this.renderTemplate();
    this._views['sidebar'].setElement('#vocablist-sidebar-container').render();
    this._views['table'].setElement('#vocablist-container').render();
    this._views['expiration'].setElement('#expiration-container').render();

    return this;
  },

  /**
   * @method handleChangeCheckbox
   */
  handleChangeCheckbox: function() {
    /** TODO: support checkbox filters
     var checkedBoxes = $('input[type="checkbox"]:checked');
     var filterTypes = checkedBoxes.map(function(i, el) {
            return $(el).attr('name');
        });
     this.table.setFilterTypes(filterTypes);
     this.table.render();
     **/
  },

  /**
   * @method onClickListOption
   * @param {Event} event
   */
  handleClickListOption: function(event) {
    event.preventDefault();

    this._views['table'].setLayout('list');
    this.$('#list-option').addClass('chosen');
    this.$('#grid-option').removeClass('chosen');
  },

  /**
   * @method onClickGridOption
   * @param {Event} event
   */
  handleClickGridOption: function(event) {
    event.preventDefault();

    this._views['table'].setLayout('grid');
    this.$('#list-option').removeClass('chosen');
    this.$('#grid-option').addClass('chosen');
  },

  /**
   * @method handleKeypressListSearchInput
   * @param {Event} event
   */
  handleKeypressListSearchInput: function(event) {
    this._views['table'].setFilterString(event.target.value);
  },

  /**
   * Keeps track of which components have loaded. When everything is loaded,
   * if timing is being recorded, this calls a function to record
   * the load time.
   * @param {String} component the name of the component that was loaded
   * @private
   */
  _onComponentLoaded: function(component) {
    this.componentsLoaded[component] = true;

    // return if any component is still not loaded
    for (let component in this.componentsLoaded) {
      if (this.componentsLoaded[component] !== true) {
        return;
      }
    }

    // but if everything's loaded, since this is a page, log the time
    this._recordLoadTime();
  },

  /**
   * Records the load time for this page once.
   * @private
   */
  _recordLoadTime: function() {
    if (this.loadAlreadyTimed || !app.config.recordLoadTimes) {
      return;
    }

    this.loadAlreadyTimed = true;
    const loadTime = window.performance.now() - this.loadStart;
    app.loadTimes.pages.vocablistsBrowse.push(loadTime);
  }
});
