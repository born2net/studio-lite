///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 BlockWorldWeatherItem is based on JSON item base class component
 @class BlockWorldWeatherItem
 @constructor
 @return {Object} instantiated BlockWorldWeatherItem
 **/
define(['jquery', 'BlockJsonItemBase'], function ($, BlockJsonItemBase) {
    TSLiteModules.BlockJsonItemBase = BlockJsonItemBase;
    var BlockWorldWeatherItem = (function (_super) {
        __extends(BlockWorldWeatherItem, _super);
        function BlockWorldWeatherItem(options) {
            this.m_options = options;
            this.m_blockType = 431111110;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        BlockWorldWeatherItem.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, this.m_options);
            BB.lib.log('i child');
        };
        return BlockWorldWeatherItem;
    })(TSLiteModules.BlockJsonItemBase);
    return BlockWorldWeatherItem;
});
//# sourceMappingURL=BlockWorldWeatherItem.js.map