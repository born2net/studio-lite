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
     BlockTwitterV3 is based on JSON base class component
     @class BlockTwitterV3
     @constructor
     @return {Object} instantiated BlockTwitterV3
     6e2919a1-47f0-4a4f-bd94-de7ecfbe604d
     **/
    var BlockTwitterV3 = (function (_super) {
        __extends(BlockTwitterV3, _super);
        function BlockTwitterV3(options) {
            this.m_options = options;
            this.m_blockType = 6230;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        /**
         Init sub class and super on base
         @method initialize
         **/
        BlockTwitterV3.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, this.m_options);
            self.m_mimeType = 'Json.twitter';
            self.m_minTokenLength = 15;
            self._initSettingsPanel();
            self._listenFilterScreenNameChange();
            self._listenTokenChanged();
            self._listenGetNewToken();
        };
        /**
         Listen to request to generate a new token
         @method _listenGetNewToken
         **/
        /**
         Listen to input screen name changes
         @method _listenFilterScreenNameChange
         **/
        BlockTwitterV3.prototype._listenGetNewToken = function () {
            var self = this;
            self.m_tokenRequest = function (e) {
                if (!self.m_selected)
                    return;
                var win = window.open('http://twitter.signage.me', '_blank');
                if (win) {
                    win.focus();
                }
                else {
                    bootbox.alert($(Elements.MSG_BOOTBOX_POPUP_BLOCKED).text());
                }
                return false;
            };
            $(Elements.CLASS_GEN_TOKEN, self.el).on('click', self.m_tokenRequest);
        };
        /**
         Listen token updated
         @method _listenTokenChanged
         **/
        BlockTwitterV3.prototype._listenTokenChanged = function () {
            var self = this;
            self.m_tokenChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var token = $(e.target).val();
                if (token.length < self.m_minTokenLength) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_TOKEN_TOO_SHORT).text());
                    return;
                }
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', token);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.CLASS_ACCESS_TOKEN, self.el).on('change', self.m_tokenChangedHandler);
        };
        /**
         Listen to input screen name changes
         @method _listenFilterScreenNameChange
         **/
        BlockTwitterV3.prototype._listenFilterScreenNameChange = function () {
            var self = this;
            self.m_filterScreenNameChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var screenName = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('screenName', screenName);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.TWITTER_FILTER_SCREEN_NAME, self.el).on('change', self.m_filterScreenNameChangedHandler);
        };
        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        BlockTwitterV3.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_TWITTERV3);
        };
        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        BlockTwitterV3.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_TWITTERV3);
            _super.prototype._loadBlockSpecificProps.call(this);
        };
        /**
         Populate UI
         @method _populate
         **/
        BlockTwitterV3.prototype._populate = function () {
            var self = this;
            _super.prototype._populate.call(this);
            var domPlayerData = self._getBlockPlayerData();
            var $data = $(domPlayerData).find('Json').find('Data');
            var token = $data.attr('token');
            var screenName = $data.attr('screenName');
            $(Elements.CLASS_ACCESS_TOKEN, self.el).val(token);
            $(Elements.TWITTER_FILTER_SCREEN_NAME, self.el).val(screenName);
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existence but not from msdb
         **/
        BlockTwitterV3.prototype.deleteBlock = function (i_memoryOnly) {
            var self = this;
            _super.prototype.deleteBlock.call(this, i_memoryOnly);
            $(Elements.CLASS_ACCESS_TOKEN, self.el).off('change', self.m_tokenChangedHandler);
            $(Elements.CLASS_GEN_TOKEN, self.el).off('click', self.m_tokenRequest);
            $(Elements.TWITTER_FILTER_SCREEN_NAME, self.el).off('change', self.m_filterScreenNameChangedHandler);
        };
        return BlockTwitterV3;
    })(TSLiteModules.BlockJsonBase);
    return BlockTwitterV3;
});
//# sourceMappingURL=BlockTwitterV3.js.map