/**
 * @module Skritter
 * @submodule Collections
 * @param VocabList
 * @author Joshua McFarland
 */
define([
    'model/data/VocabList'
], function(VocabList) {
    /**
     * class DataVocabLists
     */
    var VocabLists = Backbone.Collection.extend({
        /**
         * @method initialize
         */
        initialize: function() {
        },
        /**
         * @property {Backbone.Model} model
         */
        model: VocabList,
        /**
         * @method insert
         * @param {Array|Object} vocablists
         * @param {Function} callback
         */
        insert: function(vocablists, callback) {
            skritter.storage.put('vocablists', vocablists, callback);
        },
        /**
         * @method loadAll
         * @param {Function} callback
         */
        loadAll: function(callback) {
            skritter.storage.getAll('vocablists', _.bind(function(vocablists) {
                this.add(vocablists, {merge: true, silent: true, sort: false});
                callback();
            }, this));
        }
    });
    
    return VocabLists;
});