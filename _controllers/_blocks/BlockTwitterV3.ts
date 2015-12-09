///<reference path="../../typings/lite/app_references.d.ts" />

//GULP_ABSTRACT_EXTEND extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockTwitterV3 extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {
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
     BlockTwitterV3 is based on JSON base class component
     @class BlockTwitterV3
     @constructor
     @return {Object} instantiated BlockTwitterV3
     6e2919a1-47f0-4a4f-bd94-de7ecfbe604d
     **/
    class BlockTwitterV3 extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {

        private m_tokenChangedHandler:Function;
        private m_tokenRequest:Function;
        private m_filterScreenNameChangedHandler:Function;
        private m_minTokenLength:number;

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = 6230;
            _.extend(this.m_options, {blockType: this.m_blockType});
            super();
        }

        /**
         Init sub class and super on base
         @method initialize
         **/
        initialize() {
            var self = this;
            super.initialize(this.m_options);
            self.m_mimeType = 'Json.twitter';
            self.m_minTokenLength = 15;
            self._initSettingsPanel();
            self._listenFilterScreenNameChange();
            self._listenTokenChanged();
            self._listenGetNewToken();
        }

        /**
         Listen to request to generate a new token
         @method _listenGetNewToken
         **/
        /**
         Listen to input screen name changes
         @method _listenFilterScreenNameChange
         **/
        private _listenGetNewToken():void {
            var self = this;
            self.m_tokenRequest = function (e) {
                if (!self.m_selected)
                    return;
                var win = window.open('http://twitter.signage.me', '_blank');
                if (win) {
                    win.focus();
                } else {
                    bootbox.alert($(Elements.MSG_BOOTBOX_POPUP_BLOCKED).text());
                }
                return false;
            };
            $(Elements.CLASS_GEN_TOKEN, self.el).on('click', self.m_tokenRequest);
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
                var token = $(e.target).val();
                if (token.length < self.m_minTokenLength) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_TOKEN_TOO_SHORT).text());
                    return;
                }
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', token);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.CLASS_ACCESS_TOKEN, self.el).on('change', self.m_tokenChangedHandler);
        }

        /**
         Listen to input screen name changes
         @method _listenFilterScreenNameChange
         **/
        private _listenFilterScreenNameChange() {
            var self = this;
            self.m_filterScreenNameChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var screenName = $(e.target).val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('screenName', screenName);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.TWITTER_FILTER_SCREEN_NAME, self.el).on('change', self.m_filterScreenNameChangedHandler);
        }

        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        protected _initSettingsPanel() {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_TWITTERV3);
        }

        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        protected _loadBlockSpecificProps():void {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_TWITTERV3);
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
            var token = $data.attr('token');
            var screenName = $data.attr('screenName');
            $(Elements.CLASS_ACCESS_TOKEN, self.el).val(token);
            $(Elements.TWITTER_FILTER_SCREEN_NAME, self.el).val(screenName);
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existence but not from msdb
         **/
        public deleteBlock(i_memoryOnly):void {
            var self = this;
            super.deleteBlock(i_memoryOnly);
            $(Elements.CLASS_ACCESS_TOKEN, self.el).off('change', self.m_tokenChangedHandler);
            $(Elements.CLASS_GEN_TOKEN, self.el).off('click', self.m_tokenRequest);
            $(Elements.TWITTER_FILTER_SCREEN_NAME, self.el).off('change', self.m_filterScreenNameChangedHandler);
        }

    }
    return BlockTwitterV3;

});