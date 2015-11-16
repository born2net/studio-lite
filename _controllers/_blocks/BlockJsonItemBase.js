///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'Block'], function ($, Block) {
    TSLiteModules.Block = Block;
    var BlockJsonItemBase = (function (_super) {
        __extends(BlockJsonItemBase, _super);
        function BlockJsonItemBase(options) {
            BB.lib.log('c base');
            if (options)
                this.m_options = options;
            _super.call(this);
        }
        BlockJsonItemBase.prototype.initialize = function () {
            var self = this;
            BB.lib.log('i base');
            _super.prototype.initialize.call(this, self.m_options);
            self._initSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
            self._listenInputChange();
        };
        /**
         Listen input change
         @method _listenInputChange
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        BlockJsonItemBase.prototype._listenInputChange = function () {
            var self = this;
            self.m_inputPathChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var value = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                $(xSnippet).attr('fieldName', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 333, false);
            $('#tmpJsonItem').on("input", self.m_inputPathChange);
        };
        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        BlockJsonItemBase.prototype._populate = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('XmlItem');
            var fieldType = $(xSnippet).attr('fieldType');
            var fieldName = $(xSnippet).attr('fieldName');
            $('#tmpJsonItem').val(fieldName);
        };
        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        BlockJsonItemBase.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockJsonItemBase.prototype.deleteBlock = function (i_memoryOnly) {
            var self = this;
            $('#tmpJsonItem').off("input", self.m_inputPathChange);
            self._deleteBlock(i_memoryOnly);
        };
        return BlockJsonItemBase;
    })(TSLiteModules.Block);
    return BlockJsonItemBase;
});
//# sourceMappingURL=BlockJsonItemBase.js.map