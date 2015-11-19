///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;
    var BlockGoogleSheets = (function (_super) {
        __extends(BlockGoogleSheets, _super);
        function BlockGoogleSheets(options) {
            this.m_options = options;
            this.m_blockType = 6022;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        /**
         Init sub class and super on base
         @method initialize
         **/
        BlockGoogleSheets.prototype.initialize = function () {
            var self = this;
            self.m_minTokenLength = 15;
            _super.prototype.initialize.call(this, this.m_options);
            self._initSettingsPanel();
            self._listenSheetChanged();
            self._listenTokenChanged();
            self._listenRefreshSheetList();
            self._loadSheetList();
            // load rx lib
            require(['rx', 'rxbind', 'rxtime', 'rxdom'], function (Rx, rxbind, rxtime, txdom) {
                self._testRx();
            });
        };
        /**
         Get current token from msdb
         @method _getToken
         @return {string} token
         **/
        BlockGoogleSheets.prototype._getToken = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('token');
        };
        /**
         Get current fileID from msdb
         @method _getFileId
         @return {string} id
         **/
        BlockGoogleSheets.prototype._getFileId = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('id');
        };
        /**
         Load list of latest sheets from server
         @method _listenRefreshSheetList
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        BlockGoogleSheets.prototype._listenRefreshSheetList = function () {
            var self = this;
            self.m_sheetsRefreshHandler = function (e) {
                if (!self.m_selected)
                    return;
                var token = self._getToken();
                if (token.length < self.m_minTokenLength) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_TOKEN_TOO_SHORT).text());
                    return;
                }
                self._loadSheetList();
            };
            $(Elements.GOOGLE_SHEET_REFRESH).on('click', self.m_sheetsRefreshHandler);
        };
        /**
         Listen sheet selected / changed
         @method _listenSheetChanged
         **/
        BlockGoogleSheets.prototype._listenSheetChanged = function () {
            var self = this;
            self.m_sheetsChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_SHEET + ' option:selected').val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('id', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_SHEET).on('change', self.m_sheetsChangedHandler);
        };
        /**
         Listen token updated
         @method _listenTokenChanged
         **/
        BlockGoogleSheets.prototype._listenTokenChanged = function () {
            var self = this;
            self.m_tokenChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_SHEET_TOKEN).val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._loadSheetList();
            };
            $(Elements.GOOGLE_SHEET_TOKEN).on('change', self.m_tokenChangedHandler);
        };
        /**
         Clear the list of Google sheets
         @method _clearSheetList
         **/
        BlockGoogleSheets.prototype._clearSheetList = function () {
            var self = this;
            $(Elements.GOOGLE_SHEET).empty();
            $(Elements.GOOGLE_SHEET).selectpicker('refresh');
        };
        /**
         Load latest sheets from Google services
         @method _loadSheetList
         **/
        BlockGoogleSheets.prototype._loadSheetList = function () {
            var self = this;
            self._clearSheetList();
            var token = self._getToken();
            if (token.length < self.m_minTokenLength)
                return;
            try {
                $.ajax({
                    url: 'https://secure.digitalsignage.com:442/GoogleSheetsList/' + token,
                    dataType: "json",
                    type: "post",
                    complete: function (response, status) {
                        if (!self.m_selected)
                            return;
                        self._clearSheetList();
                        BB.lib.log('from sheets ' + response.responseText);
                        if (_.isUndefined(response.responseText) || response.responseText.length == 0)
                            return;
                        var jData = JSON.parse(response.responseText);
                        var snippet = '';
                        _.forEach(jData, function (k) {
                            snippet += "<option value=\"" + k.id + "\">" + k.title + "</option>";
                        });
                        $(Elements.GOOGLE_SHEET).append(snippet);
                        var id = self._getFileId();
                        if (id.length > self.m_minTokenLength)
                            $(Elements.GOOGLE_SHEET).val(id);
                        $(Elements.GOOGLE_SHEET).selectpicker('refresh');
                    },
                    error: function (jqXHR, exception) {
                        BB.lib.log(jqXHR, exception);
                    }
                });
            }
            catch (e) {
                BB.lib.log('error on ajax' + e);
            }
        };
        BlockGoogleSheets.prototype._testRx = function () {
            var quakes = Rx.Observable
                .interval(2000)
                .flatMap(function () {
                return Rx.DOM.Request.getJSON('https://secure.digitalsignage.com/facebook/getPhotosOfAlbums/CAAMtJcAiZA48BAH0mzYnLpuN2eosel84ZBAYJJYLo4KcWuZChX2musiYzi2wZAfukGyRmMClWgH9h89csdRD0w5GGVgwp7ZCuoyuXsCZC0tZCJoTl8llz4AMF0BrEllshoa9KOu38ipQTIJUOzKa6rW802p7N0wYmueZCz0w3b7eItDLK4g6V27LZBtwAPGmX1gQZD/400455236822277');
            })
                .flatMap(function (result) {
                return Rx.Observable.fromArray(result);
            })
                .map(function (quake) {
                return quake;
            });
            quakes.subscribe(function (quake) {
                BB.lib.log(quake);
            });
            var request = Rx.DOM.Request.getJSON('https://secure.digitalsignage.com/facebook/getPhotosOfAlbums/CAAMtJcAiZA48BAH0mzYnLpuN2eosel84ZBAYJJYLo4KcWuZChX2musiYzi2wZAfukGyRmMClWgH9h89csdRD0w5GGVgwp7ZCuoyuXsCZC0tZCJoTl8llz4AMF0BrEllshoa9KOu38ipQTIJUOzKa6rW802p7N0wYmueZCz0w3b7eItDLK4g6V27LZBtwAPGmX1gQZD/400455236822277');
            request.subscribe(function (x) {
                BB.lib.log(x);
            }, function (err) {
                BB.lib.log(err);
            });
            var avg = Rx.Observable.interval(1000);
            avg.scan(function (prev, cur) {
                return { sum: prev.sum + cur, count: prev.count + 1 };
            }, { sum: 0, count: 0 }).map(function (o) {
                return o.sum / o.count;
            });
            var subscription = avg.subscribe(function (x) {
                console.log(x);
            });
            var counter = Rx.Observable.interval(1000);
            var subscription1 = counter.subscribe(function (i) {
                console.log(' Subscription 1:', i);
            });
            //var request = Rx.DOM.Request.ajax({
            //    url: 'https://secure.digitalsignage.com/facebook/getPhotosOfAlbums/CAAMtJcAiZA48BAH0mzYnLpuN2eosel84ZBAYJJYLo4KcWuZChX2musiYzi2wZAfukGyRmMClWgH9h89csdRD0w5GGVgwp7ZCuoyuXsCZC0tZCJoTl8llz4AMF0BrEllshoa9KOu38ipQTIJUOzKa6rW802p7N0wYmueZCz0w3b7eItDLK4g6V27LZBtwAPGmX1gQZD/400455236822277',
            //    crossDomain: true,
            //    async: true
            //});
            //Rx.DOM.ready().subscribe(main);
            function searchWikipedia(term) {
                var cleanTerm = term;
                var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + cleanTerm + '&callback=JSONPCallback';
                return Rx.DOM.Request.jsonpRequestCold(url);
            }
            var input = $('#googleSheetToken');
            // Get all distinct throttled key up events from the input
            var keyupObserver = Rx.DOM.fromEvent(input, 'keyup')
                .map(function (e) {
                return e.target.value; // Project the text from the input
            })
                .filter(function (text) {
                return text.length > 2; // Only if the text is longer than 2 characters
            })
                .throttle(750 /* Pause for 750ms */)
                .distinctUntilChanged(); // Only if the value has changed
            // Search wikipedia
            var searcherObserver = keyupObserver
                .map(function (text) {
                return searchWikipedia(text);
            })
                .switchLatest(); // Ensure no out of order results
            var subscription2 = searcherObserver.subscribe(function (data) {
                var res = data[1];
                var i, len, li;
                for (i = 0, len = res.length; i < len; i++) {
                    BB.lib.log(data[1][i]);
                }
            }, function (error) {
                // Handle any errors
                var li = document.createElement('li');
                BB.lib.log('Error: ' + error);
            });
        };
        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        BlockGoogleSheets.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
        };
        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        BlockGoogleSheets.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
            _super.prototype._loadBlockSpecificProps.call(this);
        };
        /**
         Populate UI
         @method _populate
         **/
        BlockGoogleSheets.prototype._populate = function () {
            var self = this;
            _super.prototype._populate.call(this);
            var domPlayerData = self._getBlockPlayerData();
            var $data = $(domPlayerData).find('Json').find('Data');
            var style = $data.attr('id');
            var token = $data.attr('token');
            $(Elements.GOOGLE_SHEET).selectpicker('val', style);
            $(Elements.GOOGLE_SHEET_TOKEN).val(token);
            self._loadSheetList();
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockGoogleSheets.prototype.deletedBlock = function (i_memoryOnly) {
            var self = this;
            _super.prototype.deleteBlock.call(this, i_memoryOnly);
            $(Elements.GOOGLE_SHEET).off('change', self.m_sheetsChangedHandler);
            $(Elements.GOOGLE_SHEET_TOKEN).off('change', self.m_tokenChangedHandler);
            $(Elements.GOOGLE_SHEET_REFRESH).off('click', self.m_sheetsRefreshHandler);
        };
        return BlockGoogleSheets;
    })(TSLiteModules.BlockJsonBase);
    return BlockGoogleSheets;
});
//# sourceMappingURL=BlockGoogleSheets.js.map