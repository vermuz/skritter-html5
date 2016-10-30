const GelatoPage = require('gelato/page');
const AccountSidebar = require('components/account/AccountSidebarComponent');

const ChangePasswordDialog = require('dialogs1/change-password/view');
const ResetAllDataDialog = require('dialogs1/reset-all-data/view');

/**
 * @class AccountSettingsGeneralPage
 * @extends {GelatoPage}
 */
const AccountSettingsGeneralPage = GelatoPage.extend({

  /**
   * @property events
   * @type {Object}
   */
  events: {
    'change #avatar-upload-input': 'handleChangeAvatarUploadInput',
    'change #field-country': 'handleSelectCountry',
    'click #button-save': 'handleClickButtonSave',
    'click #field-change-password': 'handleClickChangePassword',
    'click #change-avatar': 'handleClickChangeAvatar',
    'click #reset-all-data': 'handleClickResetAllData'
  },

  /**
   * @property title
   * @type {String}
   */
  title: app.locale('pages.accountGeneral.title'),

  /**
   * @property template
   * @type {Function}
   */
  template: require('./AccountSettingsGeneral'),

  /**
   * @method initialize
   * @constructor
   */
  initialize: function() {
    this.countries = require('data/country-codes');
    this.dialog = null;
    this.timezones = require('data/country-timezones');
    this.sidebar = new AccountSidebar();
    this.listenTo(app.user, 'state', this.render);
    app.user.fetch();
  },

  /**
   * @method render
   * @returns {AccountSettingsGeneralPage}
   */
  render: function() {
    if (app.isMobile()) {
      this.template = require('./MobileAccountSettingsGeneral.jade');
    }

    this.renderTemplate();
    this.sidebar.setElement('#sidebar-container').render();
    return this;
  },

  /**
   * @method getSelectedCountryCode
   * @returns {String}
   */
  getSelectedCountryCode: function() {
    return this.$('#field-country :selected').val() || app.user.get('country');
  },

  /**
   * @method handleChangeAvatarUploadInput
   * @param {Event} event
   */
  handleChangeAvatarUploadInput: function(event) {
    var file = event.target.files[0];
    var data = new FormData().append('image', file);
    var reader = new FileReader();
    reader.onload = function(event) {
      $('#field-avatar').attr('src', event.target.result);
    };
    reader.readAsDataURL(file);
  },

  /**
   * @method handleClickButtonSave
   * @param {Event} event
   */
  handleClickButtonSave: function(event) {
    event.preventDefault();
    var avatar = this.$('#field-avatar').get(0).src;
    avatar = avatar.replace('data:image/gif;base64,', '');
    avatar = avatar.replace('data:image/jpeg;base64,', '');
    avatar = avatar.replace('data:image/png;base64,', '');
    app.user.set({
      avatar: avatar,
      aboutMe: this.$('#field-about').val(),
      country: this.$('#field-country').find(':selected').val(),
      email: this.$('#field-email').val(),
      eccentric: this.$('#field-eccentric').is(':checked'),
      name: this.$('#field-name').val(),
      private: this.$('#field-private').is(':checked'),
      timezone: this.$('#field-timezone :selected').val()
    }).save();
  },

  /**
   * @method handleClickChangeAvatar
   * @param {Event} event
   */
  handleClickChangeAvatar: function(event) {
    event.preventDefault();
    this.$('#avatar-upload-input').trigger('click');
  },

  /**
   * @method handleClickChangePassword
   * @param {Event} event
   */
  handleClickChangePassword: function(event) {
    event.preventDefault();
    this.dialog = new ChangePasswordDialog();
    this.dialog.render();
    this.dialog.open();
  },

  /**
   * @method handleClickResetAllData
   * @param {Event} event
   */
  handleClickResetAllData: function(event) {
    event.preventDefault();
    this.dialog = new ResetAllDataDialog();
    this.dialog.render();
    this.dialog.open();
  },

  /**
   * @method handleSelectCountry
   * @param event
   */
  handleSelectCountry: function(event) {
    event.preventDefault();
    this.render();
  },

  /**
   * @method remove
   * @returns {AccountSettingsGeneralPage}
   */
  remove: function() {
    this.sidebar.remove();
    return GelatoPage.prototype.remove.call(this);
  }

});

module.exports = AccountSettingsGeneralPage;