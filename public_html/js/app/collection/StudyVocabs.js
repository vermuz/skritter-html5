/**
 * @module Skritter
 * @submodule Collection
 * @param StudyVocab
 * @author Joshua McFarland
 */
define([
    'model/StudyVocab',
    'backbone'
], function(StudyVocab) {
    /**
     * @class StudyVocabs
     */
    var StudyVocabs = Backbone.Collection.extend({
        /**
         * @property {StudyVocab} model
         */
        model: StudyVocab,
        /**
         * @method cache
         * @param {Function} callback
         * @returns {undefined}
         */
        cache: function(callback) {
            if (this.length === 0) {
                callback();
                return;
            }
            Skritter.storage.setItems('vocabs', this.toJSON(), function() {
                if (typeof callback === 'function')
                    callback();
            });
        },
        /**
         * @method loadAll
         * @param {Function} callback
         * @returns {undefined}
         */
        loadAll: function(callback) {
            Skritter.storage.getItems('vocabs', function(vocabs) {
                Skritter.study.vocabs.add(vocabs);
                callback(null, vocabs);
            });
        }

    });


    return StudyVocabs;
});