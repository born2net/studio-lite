///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 BlockWorldWeather is based on JSON base class component
 @class BlockWorldWeather
 @constructor
 @return {Object} instantiated BlockWorldWeather
 **/
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;
    var BlockWorldWeather = (function (_super) {
        __extends(BlockWorldWeather, _super);
        function BlockWorldWeather(options) {
            this.m_options = options;
            this.m_blockType = 6010;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        /**
         Init sub class and super on base
         @method initialize
         **/
        BlockWorldWeather.prototype.initialize = function () {
            var self = this;
            _super.prototype.initialize.call(this, this.m_options);
            self._initSettingsPanel();
        };
        /**
         Populate the common properties UI
         @method _populate
         **/
        BlockWorldWeather.prototype._populate = function () {
            _super.prototype._populate.call(this);
        };
        BlockWorldWeather.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_WEATHER);
        };
        BlockWorldWeather.prototype._loadBlockSpecificProps = function () {
            var self = this;
            _super.prototype._loadBlockSpecificProps.call(this);
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_WEATHER);
        };
        /**
         Override base class method by hiding the paths container in json common properties
         @method _updateJsonPaths
         **/
        BlockWorldWeather.prototype._updateJsonPaths = function () {
            $(Elements.JSON_PATHS_CONTAINER).hide();
        };
        /**
         Update the title of the selected tab properties element and also show the sub tab
         for Settings of Json sub components (world weather, Calendar etc...)
         @method _updateTitleTab
         */
        BlockWorldWeather.prototype._updateTitleTab = function () {
            var self = this;
            _super.prototype._updateTitleTab.call(this);
            $(Elements.BLOCK_COMMON_SETTINGS_TAB).show();
        };
        return BlockWorldWeather;
    })(TSLiteModules.BlockJsonBase);
    return BlockWorldWeather;
});
//# sourceMappingURL=BlockWorldWeather.js.map