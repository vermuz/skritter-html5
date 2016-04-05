var GelatoComponent = require('gelato/component');

/**
 * A component that is a composite of graphs which show user study statistics
 * over a certain range of time.
 * @class StatsTimelineComponent
 * @extends {GelatoComponent}
 */
module.exports = GelatoComponent.extend({
    /**
     * @method initialize
     * @constructor
     */
    initialize: function(options) {
        this.listenTo(this.collection, 'state:standby', this.updateGraphs);
    },
    /**
     * @property template
     * @type {Function}
     */
    template: require('./template'),
    /**
     * @method render
     * @returns {VocablistSideBar}
     */
    render: function() {
        this.renderTemplate();
    },

    updateGraphs: function() {

    }
});
