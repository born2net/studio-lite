///<reference path="../../typings/lite/app_references.d.ts" />

//GULP_ABSTRACT_EXTEND extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock
//GULP_ABSTRACT_START
declare module TSLiteModules {
    export class BlockDigg extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {
        protected _initSettingsPanel() ;
        protected _loadBlockSpecificProps():void ;
        protected _populate():void ;
        public deletedBlock(i_memoryOnly):void ;
    }
}
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase', 'validator'], function ($, BlockJsonBase, validator) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    /**
     BlockDigg is based on JSON base class component
     @class BlockDigg
     @constructor
     @return {Object} instantiated BlockDigg
     **/
    class BlockDigg extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {

        private m_sheetsChangedHandler;
        private m_tokenChangedHandler;
        private m_sheetsRefreshHandler;
        private m_minTokenLength:number;

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = 6000;
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
            self.m_mimeType = 'Json.digg';
            self._initSettingsPanel();
            //self._listenSheetChanged();
            //self._listenTokenChanged();
            //self._listenRefreshSheetList();
            //self._loadSheetList();
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
         Load list of latest sheets from server
         @method _listenRefreshSheetList
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        private _listenRefreshSheetList() {
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
        }

        /**
         Listen sheet selected / changed
         @method _listenSheetChanged
         **/
        private _listenSheetChanged() {
            var self = this;
            self.m_sheetsChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_SHEET + ' option:selected').val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('id', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_SHEET).on('change', self.m_sheetsChangedHandler);
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
                var value = $(Elements.GOOGLE_SHEET_TOKEN).val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._loadSheetList();
            };
            $(Elements.GOOGLE_SHEET_TOKEN).on('change', self.m_tokenChangedHandler);
        }

        /**
         Clear the list of Google sheets
         @method _clearSheetList
         **/
        private _clearSheetList() {
            var self = this;
            $(Elements.GOOGLE_SHEET).empty();
            $(Elements.GOOGLE_SHEET).selectpicker('refresh');
        }

        /**
         Load latest sheets from Google services
         @method _loadSheetList
         **/
        private _loadSheetList() {
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
                        var snippet = `<option value="">Nothing selected</option>`;
                        _.forEach(jData, function (k:any) {
                            snippet += `<option value="${k.id}">${k.title}</option>`;
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
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_DIGG);
        }

        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        protected _loadBlockSpecificProps():void {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_DIGG);
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
            //$(Elements.GOOGLE_SHEET).selectpicker('val', style);
            //$(Elements.GOOGLE_SHEET_TOKEN).val(token);
            //self._loadSheetList();
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        public deletedBlock(i_memoryOnly):void {
            var self = this;
            super.deleteBlock(i_memoryOnly);
            $(Elements.GOOGLE_SHEET).off('change', self.m_sheetsChangedHandler);
            $(Elements.GOOGLE_SHEET_TOKEN).off('change', self.m_tokenChangedHandler);
            $(Elements.GOOGLE_SHEET_REFRESH).off('click', self.m_sheetsRefreshHandler);
        }

    }
    return BlockDigg;

});