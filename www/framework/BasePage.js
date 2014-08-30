/**
 * @module Framework
 */
define([
    'framework/BaseView',
], function(BaseView) {
    /**
     * @class BasePage
     * @extends BaseView
     */
    return BaseView.extend({
        /**
         * @property el
         * @type String
         */
        el: "#application",
        /**
         * @property title
         * @type String
         */
        title: undefined,
        /**
         * @method events
         * @returns {Object}
         */
        events: function(){
            return _.extend({}, BaseView.prototype.events, {
                'click .navbar-sidebar-toggle': 'handleSidebarToggleClicked'
            });
        },
        /**
         * @method disableForm
         * @param {String} selector
         */
        disableForm: function(selector) {
            this.$((selector ? selector + ' ': '') + ':input').prop('disabled', true);
        },
        /**
         * @method enableForm
         * @param {String} selector
         */
        enableForm: function(selector) {
            this.$((selector ? selector: ' ') + ':input').prop('disabled', false);
        },
        /**
         * @method handleSidebarToggleClicked
         * @param {Event} event
         */
        handleSidebarToggleClicked: function(event) {
            event.preventDefault();
            if (app.sidebars) {
                app.sidebars.toggle();
            } else {
                event.preventDefault();
            }
        }

    });
});
