///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase', 'validator'], function ($, BlockJsonBase, validator) {
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
            self.m_mimeType = 'Json.spreadsheet';
            self._initSettingsPanel();
            self._listenSheetChanged();
            self._listenTokenChanged();
            self._listenRefreshSheetList();
            self._loadSheetList();
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
                    url: 'https://secure.digitalsignage.com/GoogleSheetsList/' + token,
                    dataType: "json",
                    type: "post",
                    complete: function (response, status) {
                        if (!self.m_selected)
                            return;
                        self._clearSheetList();
                        //BB.lib.log('from sheets ' + response.responseText);
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