///<reference path="../../typings/lite/app_references.d.ts" />

//GULP_ABSTRACT_EXTEND extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock
//GULP_ABSTRACT_START
declare module TSLiteModules {
    export class BlockGoogleCalendar extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {
        protected _initSettingsPanel() ;
        protected _loadBlockSpecificProps():void ;
        protected _populate():void ;
        public deleteBlock(i_memoryOnly):void ;
    }
}
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
    class BlockGoogleCalendar extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {

        private m_inputChangedHandler;
        private m_tokenChangedHandler;
        private m_RefreshHandler;
        private m_minTokenLength:number;

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = BB.CONSTS.BLOCKCODE_CALENDAR;
            _.extend(this.m_options, {blockType: this.m_blockType});
            super();
        }

        /**
         Init sub class and super on base
         @method initialize
         **/
        initialize() {
            var self = this;
            self.m_minTokenLength = 15;
            super.initialize(this.m_options);
            self.m_mimeType = 'Json.calendar';
            self._initSettingsPanel();
            self._listenCalChanged();
            self._listenTokenChanged();
            self._listenRefreshSheetList();
            self._loadSheetList();
        }

        /**
         Get current token from msdb
         @method _getToken
         @return {string} token
         **/
        private _getToken():string {
            var self = this;
            var domPlayerData:XMLDocument = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('token');
        }

        /**
         Get current fileID from msdb
         @method _getFileId
         @return {string} id
         **/
        private _getFileId():string {
            var self = this;
            var domPlayerData:XMLDocument = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('id');
        }

        /**
         Load list of latest data from server
         @method _listenRefreshSheetList
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        private _listenRefreshSheetList() {
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
        }

        /**
         Listen dropdown selected / changed
         @method _listenCalChanged
         **/
        private _listenCalChanged() {
            var self = this;
            self.m_inputChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_CALENDAR + ' option:selected').val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('id', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_CALENDAR).on('change', self.m_inputChangedHandler);
        }

        /**
         Listen token updated
         @method _listenTokenChanged
         **/
        private _listenTokenChanged() {
            var self = this;
            self.m_tokenChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_CALENDAR_TOKEN).val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._loadSheetList();
            };
            $(Elements.GOOGLE_CALENDAR_TOKEN).on('change', self.m_tokenChangedHandler);
        }

        /**
         Clear the list of docs
         @method _clearList
         **/
        private _clearList() {
            var self = this;
            $(Elements.GOOGLE_CALENDAR).empty();
            $(Elements.GOOGLE_CALENDAR).selectpicker('refresh');
        }

        /**
         Load latest docs from Google services
         @method _loadSheetList
         **/
        private _loadSheetList() {
            var self = this;
            self._clearList();
            var token = self._getToken();
            if (token.length < self.m_minTokenLength)
                return;

            try {
                $.ajax({
                    url: `https://secure.digitalsignage.com:442/GoogleCalendarList/${token}/100`,
                    dataType: "json",
                    type: "post",
                    complete: function (response, status) {
                        if (!self.m_selected)
                            return;
                        self._clearList();
                        if (_.isUndefined(response.responseText) || response.responseText.length == 0)
                            return;
                        var jData = JSON.parse(response.responseText);
                        var snippet = `<option value="">Nothing selected</option>`;
                        _.forEach(jData, function (k:any) {
                            snippet += `<option value="${k.id}">${k.summary}</option>`;
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
            } catch (e) {
                BB.lib.log('error on ajax' + e);
            }
        }

        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        protected _initSettingsPanel() {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_CALENDAR);
        }

        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        protected _loadBlockSpecificProps():void {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_CALENDAR);
            super._loadBlockSpecificProps();
        }

        /**
         Populate UI
         @method _populate
         **/
        protected _populate():void {
            var self = this;
            super._populate();
            var domPlayerData:XMLDocument = self._getBlockPlayerData();
            var $data = $(domPlayerData).find('Json').find('Data');
            var style = $data.attr('id');
            var token = $data.attr('token');
            $(Elements.GOOGLE_CALENDAR).selectpicker('val', style);
            $(Elements.GOOGLE_CALENDAR_TOKEN).val(token);
            self._loadSheetList();
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        public deleteBlock(i_memoryOnly):void {
            var self = this;
            $(Elements.GOOGLE_CALENDAR).off('change', self.m_inputChangedHandler);
            $(Elements.GOOGLE_CALENDAR_TOKEN).off('change', self.m_tokenChangedHandler);
            $(Elements.GOOGLE_CALENDAR_REFRESH).off('click', self.m_RefreshHandler);
            super.deleteBlock(i_memoryOnly);
        }

    }
    return BlockGoogleCalendar;

});