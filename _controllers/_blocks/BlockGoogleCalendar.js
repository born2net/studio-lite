///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase', 'validator'], function ($, BlockJsonBase, validator) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;
    /**
     BlockGoogleCalendar is based on JSON base class component
     @class BlockGoogleCalendar
     @constructor
     @return {Object} instantiated BlockGoogleCalendar
     6e2919a1-47f0-4a4f-bd94-de7ecfbe604d
     **/
    var BlockGoogleCalendar = (function (_super) {
        __extends(BlockGoogleCalendar, _super);
        function BlockGoogleCalendar(options) {
            this.m_options = options;
            this.m_blockType = BB.CONSTS.BLOCKCODE_CALENDAR;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        /**
         Init sub class and super on base
         @method initialize
         **/
        BlockGoogleCalendar.prototype.initialize = function () {
            var self = this;
            self.m_minTokenLength = 15;
            _super.prototype.initialize.call(this, this.m_options);
            self.m_mimeType = 'Json.calendar';
            self._initSettingsPanel();
            self._listenCalChanged();
            self._listenTokenChanged();
            self._listenRefreshSheetList();
            self._loadSheetList();
        };
        /**
         Get current token from msdb
         @method _getToken
         @return {string} token
         **/
        BlockGoogleCalendar.prototype._getToken = function () {
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
        BlockGoogleCalendar.prototype._getFileId = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('id');
        };
        /**
         Load list of latest data from server
         @method _listenRefreshSheetList
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        BlockGoogleCalendar.prototype._listenRefreshSheetList = function () {
            var self = this;
            self.m_RefreshHandler = function (e) {
                if (!self.m_selected)
                    return;
                var token = self._getToken();
                if (token.length < self.m_minTokenLength) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_TOKEN_TOO_SHORT).text());
                    return;
                }
                self._loadSheetList();
            };
            $(Elements.GOOGLE_CALENDAR_REFRESH).on('click', self.m_RefreshHandler);
        };
        /**
         Listen dropdown selected / changed
         @method _listenCalChanged
         **/
        BlockGoogleCalendar.prototype._listenCalChanged = function () {
            var self = this;
            self.m_inputChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_CALENDAR + ' option:selected').val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('id', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_CALENDAR).on('change', self.m_inputChangedHandler);
        };
        /**
         Listen token updated
         @method _listenTokenChanged
         **/
        BlockGoogleCalendar.prototype._listenTokenChanged = function () {
            var self = this;
            self.m_tokenChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_CALENDAR_TOKEN).val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._loadSheetList();
            };
            $(Elements.GOOGLE_CALENDAR_TOKEN).on('change', self.m_tokenChangedHandler);
        };
        /**
         Clear the list of docs
         @method _clearList
         **/
        BlockGoogleCalendar.prototype._clearList = function () {
            var self = this;
            $(Elements.GOOGLE_CALENDAR).empty();
            $(Elements.GOOGLE_CALENDAR).selectpicker('refresh');
        };
        /**
         Load latest docs from Google services
         @method _loadSheetList
         **/
        BlockGoogleCalendar.prototype._loadSheetList = function () {
            var self = this;
            self._clearList();
            var token = self._getToken();
            if (token.length < self.m_minTokenLength)
                return;
            try {
                $.ajax({
                    url: "https://secure.digitalsignage.com:442/GoogleCalendarList/" + token + "/100",
                    dataType: "json",
                    type: "post",
                    complete: function (response, status) {
                        if (!self.m_selected)
                            return;
                        self._clearList();
                        if (_.isUndefined(response.responseText) || response.responseText.length == 0)
                            return;
                        var jData = JSON.parse(response.responseText);
                        var snippet = "<option value=\"\">Nothing selected</option>";
                        _.forEach(jData, function (k) {
                            snippet += "<option value=\"" + k.id + "\">" + k.summary + "</option>";
                        });
                        $(Elements.GOOGLE_CALENDAR).append(snippet);
                        var id = self._getFileId();
                        if (id.length > self.m_minTokenLength)
                            $(Elements.GOOGLE_CALENDAR).val(id);
                        $(Elements.GOOGLE_CALENDAR).selectpicker('refresh');
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
        BlockGoogleCalendar.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_CALENDAR);
        };
        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        BlockGoogleCalendar.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_CALENDAR);
            _super.prototype._loadBlockSpecificProps.call(this);
        };
        /**
         Populate UI
         @method _populate
         **/
        BlockGoogleCalendar.prototype._populate = function () {
            var self = this;
            _super.prototype._populate.call(this);
            var domPlayerData = self._getBlockPlayerData();
            var $data = $(domPlayerData).find('Json').find('Data');
            var style = $data.attr('id');
            var token = $data.attr('token');
            $(Elements.GOOGLE_CALENDAR).selectpicker('val', style);
            $(Elements.GOOGLE_CALENDAR_TOKEN).val(token);
            self._loadSheetList();
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockGoogleCalendar.prototype.deleteBlock = function (i_memoryOnly) {
            var self = this;
            $(Elements.GOOGLE_CALENDAR).off('change', self.m_inputChangedHandler);
            $(Elements.GOOGLE_CALENDAR_TOKEN).off('change', self.m_tokenChangedHandler);
            $(Elements.GOOGLE_CALENDAR_REFRESH).off('click', self.m_RefreshHandler);
            _super.prototype.deleteBlock.call(this, i_memoryOnly);
        };
        return BlockGoogleCalendar;
    })(TSLiteModules.BlockJsonBase);
    return BlockGoogleCalendar;
});
//# sourceMappingURL=BlockGoogleCalendar.js.map