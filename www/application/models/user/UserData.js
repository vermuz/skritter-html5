/**
 * @module Application
 */
define([
    'framework/BaseModel',
    'collections/data/DataDecomps',
    'collections/data/DataItems',
    'collections/data/DataParams',
    'collections/data/DataSentences',
    'collections/data/DataSRSConfigs',
    'collections/data/DataStrokes',
    'collections/data/DataVocabs',
    'collections/data/DataVocabLists'
], function(BaseModel, DataDecomps, DataItems, DataParams, DataSentences, DataSRSConfigs, DataStrokes, DataVocabs, DataVocabLists) {
    /**
     * @class UserData
     * @extends BaseModel
     */
    var UserData = BaseModel.extend({
        /**
         * @method initialize
         * @param {User} user
         * @constructor
         */
        initialize: function(attributes, options) {
            this.decomps = new DataDecomps();
            this.items = new DataItems();
            this.params = new DataParams();
            this.sentences = new DataSentences();
            this.srsconfigs = new DataSRSConfigs();
            this.strokes = new DataStrokes();
            this.user = options.user;
            this.vocabs = new DataVocabs();
            this.vocablists = new DataVocabLists();
            this.on('change:access_token', this.updateExpires);
            this.on('change', this.cache);
        },
        /**
         * @property defaults
         * @type Object
         */
        defaults: {
            access_token: undefined,
            batchId: undefined,
            expires: undefined,
            expires_in: undefined,
            lastErrorCheck: 0,
            lastItemSync: 0,
            lastReviewSync: 0,
            lastSRSConfigSync: 0,
            lastVocabSync: 0,
            refresh_token: undefined,
            token_type: undefined,
            user_id: undefined
        },
        /**
         * @method cache
         */
        cache: function() {
            localStorage.setItem(this.user.id + '-data', JSON.stringify(this.toJSON()));
        },
        /**
         * @method addItems
         * @param {Number} limit
         * @param {Function} callbackSuccess
         * @param {Function} callbackError
         */
        addItems: function(limit, callbackSuccess, callbackError) {
            var self = this;
            app.dialogs.show().element('.message-title').text('Searching');
            async.waterfall([
                function(callback) {
                    app.api.requestBatch([
                        {
                            path: 'api/v' + app.api.get('version') + '/items/add',
                            method: 'POST',
                            params: {
                                lang: app.user.getLanguageCode(),
                                limit: limit ? limit : 1,
                                offset: 0,
                                fields: 'id'
                            }
                        }
                    ], function(result) {
                        callback(null, result);
                    }, function(error) {
                        callback(error);
                    });
                },
                function(batch, callback) {
                    app.api.checkBatch(batch.id, function() {
                        callback(null, batch);
                    }, function(error) {
                        callback(error);
                    }, function(result) {});
                },
                function(batch, callback) {
                    var totalItems = 0;
                    var totalVocabs = 0;
                    app.api.getBatch(batch.id, function() {
                        callback();
                    }, function(error) {
                        callback(error);
                    }, function(result) {
                        totalItems += result.Items ? result.Items.length : 0;
                        totalVocabs += result.numVocabsAdded ? result.numVocabsAdded : 0;
                        self.vocablists.add(result.VocabLists, {merge: true});
                        app.dialogs.show().element('.message-title').text('Adding: ' + totalVocabs);
                    });
                },
                function(callback) {
                    self.sync(function() {
                        callback();
                    }, function() {
                        callback();
                    });
                }
            ], function(error) {
                if (error) {
                    app.dialogs.hide(function() {
                        callbackError(error);
                    });
                } else {
                    console.log('added items');
                    app.dialogs.hide(callbackSuccess);
                }
            });
        },
        /**
         * @method downloadAll
         * @param {Function} callback
         */
        downloadAll: function(callback) {
            var self = this;
            var now = moment().unix();
            app.dialogs.show('download').element('.download-title').text('Requesting');
            async.series([
                function(callback) {
                    app.storage.clearAll(callback);
                },
                function(callback) {
                    app.api.requestBatch([
                        {
                            path: 'api/v' + app.api.get('version') + '/items',
                            method: 'GET',
                            params: {
                                lang: app.user.getLanguageCode(),
                                sort: 'changed',
                                offset: 0,
                                include_vocabs: 'true',
                                include_sentences: 'false',
                                include_strokes: 'true',
                                include_heisigs: 'true',
                                include_top_mnemonics: 'true',
                                include_decomps: 'true'
                            },
                            spawner: true
                        },
                        {
                            path: 'api/v' + app.api.get('version') + '/srsconfigs',
                            method: 'GET',
                            params: {
                                lang: app.user.getLanguageCode()
                            }
                        },
                        {
                            path: 'api/v' + app.api.get('version') + '/vocablists',
                            method: 'GET',
                            params: {
                                lang: app.user.getLanguageCode(),
                                sort: 'studying'
                            }
                        }
                    ], function(result) {
                        self.set('batchId', result.id);
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                },
                function(callback) {
                    app.api.checkBatch(self.get('batchId'), function() {
                        callback();
                    }, function(error) {
                        callback(error);
                    }, function(result) {
                        app.dialogs.element('.download-title').text('Assembling');
                        app.dialogs.element('.download-status-text').text(app.fn.convertBytesToSize(result.responseSize));
                    });
                },
                function(callback) {
                    app.api.getBatch(self.get('batchId'), function() {
                        callback();
                    }, function(error) {
                        callback(error);
                    }, function(result) {
                        var percent = Math.floor((result.downloadedRequests / result.totalRequests) * 100);
                        app.dialogs.element('.download-title').text('Downloading');
                        app.dialogs.element('.download-status-text').text(percent + '%');
                        app.dialogs.progress(percent);
                        self.put(result);
                    });
                }
            ], function(error) {
                if (error) {
                    callback(error);
                    app.dialogs.hide();
                } else {
                    self.set({
                        lastErrorCheck: now,
                        lastItemSync: now,
                        lastReviewSync: now,
                        lastSRSConfigSync: now,
                        lastVocabSync: now
                    });
                    app.dialogs.hide(callback);
                }
            });
        },
        /**
         * @method put
         * @param {Object} result
         * @param {Function} [callback]
         */
        put: function(result, callback) {
            async.series([
                function(callback) {
                    app.storage.putItems('decomps', result.Decomps, callback);
                },
                function(callback) {
                    app.storage.putItems('items', result.Items, callback);
                },
                function(callback) {
                    app.storage.putItems('sentences', result.Sentences, callback);
                },
                function(callback) {
                    app.storage.putItems('srsconfigs', result.SRSConfigs, callback);
                },
                function(callback) {
                    app.storage.putItems('strokes', result.Strokes, callback);
                },
                function(callback) {
                    app.storage.putItems('vocablists', result.VocabLists, callback);
                },
                function(callback) {
                    app.storage.putItems('vocabs', result.Vocabs, callback);
                }
            ], function() {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        },
        /**
         * @method sync
         * @param {Function} callbackSuccess
         * @param {Function} callbackError
         */
        sync: function(callbackSuccess, callbackError) {
            var self = this;
            var now = moment().unix();
            async.waterfall([
                function(callback) {
                    app.api.requestBatch([
                        {
                            path: 'api/v' + app.api.get('version') + '/items',
                            method: 'GET',
                            params: {
                                lang: app.user.getLanguageCode(),
                                sort: 'changed',
                                offset: self.get('lastItemSync'),
                                include_vocabs: 'true',
                                include_sentences: 'false',
                                include_strokes: 'true',
                                include_heisigs: 'true',
                                include_top_mnemonics: 'true',
                                include_decomps: 'true'
                            },
                            spawner: true
                        }
                    ], function(result) {
                        callback(null, result);
                    }, function(error) {
                        callback(error);
                    });
                },
                function(batch, callback) {
                    app.api.checkBatch(batch.id, function() {
                        callback(null, batch);
                    }, function(error) {
                        callback(error);
                    }, function(result) {});
                },
                function(batch, callback) {
                    app.api.getBatch(batch.id, function() {
                        callback();
                    }, function(error) {
                        callback(error);
                    }, function(result) {
                        self.user.schedule.insert(result.Items, {merge: true, sort: false});
                        self.put(result);
                    });
                }
            ], function(error) {
                if (error) {
                    callbackError(error);
                } else {
                    self.set('lastItemSync', now);
                    self.user.schedule.sort();
                    callbackSuccess();
                }
            });
        },
        /**
         * @method updateExpires
         */
        updateExpires: function() {
            this.set('expires', moment().unix() + this.get('expires_in'));
        }
    });

    return UserData;
});