var SkritterModel = require('base/skritter-model');

/**
 * @class Vocablist
 * @extends {SkritterModel}
 */
module.exports = SkritterModel.extend({
    /**
     * @property idAttribute
     * @type {String}
     */
    idAttribute: 'id',
    /**
     * @method getPopularity
     * @returns {Number}
     */
    getPopularity: function() {
        var peopleStudying = this.get('peopleStudying');
        var CEIL = 2000;
        if (peopleStudying === 0)
            return 0;
        if (peopleStudying >= 2000)
            return 1;
        return Math.pow(peopleStudying/CEIL, 0.3);
    },
    /**
     * @method getProgress
     * @returns {Number}
     */
    getProgress: function() {
        var added = 0;
        var passed = false;
        var total = 0;
        var sections = this.get('sections');
        if (this.get('studyingMode') === 'finished') {
            return 100;
        }
        if (sections) {
            var currentIndex = this.get('currentIndex') || 0;
            var currentSection = this.get('currentSection') || sections[0].id;
            for (var i = 0, length = sections.length; i < length; i++) {
                var section = sections[i];
                if (section.id === currentSection) {
                    added += currentIndex;
                    passed = true;
                }
                if (this.get('sectionsSkipping').indexOf(section.id) > -1) {
                    continue;
                }
                if (!passed) {
                    added += section.rows.length;
                }
                total += section.rows.length;
            }
        }
        return total ? Math.round(100 * added / total) : 0;
    },
    /**
     * @method getSectionById
     * @param {String} sectionId
     * @returns {Object}
     */
    getSectionById: function(sectionId) {
        return _.find(this.get('sections'), {id: sectionId});
    },
    /**
     * @method getWordCount
     * @returns {Number}
     */
    getWordCount: function() {
        var count = 0;
        var rows = _.pluck(this.get('sections'), 'rows');
        for (var i = 0, length = rows.length; i < length; i++) {
            count += rows[i].length;
        }
        return count;
    }
});
