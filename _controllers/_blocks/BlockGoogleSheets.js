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
         @override
         @method initialize
         **/
        BlockGoogleSheets.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, this.m_options);
            self._initSettingsPanel();
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
            _super.prototype._loadBlockSpecificProps.call(this);
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
        };
        return BlockGoogleSheets;
    })(TSLiteModules.BlockJsonBase);
    return BlockGoogleSheets;
});
//# sourceMappingURL=BlockGoogleSheets.js.map