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
     BlockDigg is based on JSON base class component
     @class BlockDigg
     @constructor
     @return {Object} instantiated BlockDigg
     **/
    var BlockDigg = (function (_super) {
        __extends(BlockDigg, _super);
        function BlockDigg(options) {
            this.m_options = options;
            this.m_blockType = 6000;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        /**
         Init sub class and super on base
         @method initialize
         **/
        BlockDigg.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, this.m_options);
            self.m_mimeType = 'Json.digg';
            self._initSettingsPanel();
        };
        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        BlockDigg.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_DIGG);
        };
        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        BlockDigg.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_DIGG);
            _super.prototype._loadBlockSpecificProps.call(this);
        };
        /**
         Hide the Settings tab as Digg does not have any special component setting options
         @override
         @method _updateTitleTab
         */
        BlockDigg.prototype._updateTitleTab = function () {
            var self = this;
            $(Elements.BLOCK_COMMON_SETTINGS_TAB).hide();
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockDigg.prototype.deletedBlock = function (i_memoryOnly) {
            var self = this;
            _super.prototype.deleteBlock.call(this, i_memoryOnly);
        };
        return BlockDigg;
    })(TSLiteModules.BlockJsonBase);
    return BlockDigg;
});
//# sourceMappingURL=BlockDigg.js.map