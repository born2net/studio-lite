///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
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
            self.m_mimeType = 'Json.weather';
            self._initSettingsPanel();
            self._listenWeatherUnitsChanged();
            self._listenWeatherStyleChanged();
            self._listenWeatherAddressChanged();
        };
        /**
         Listen Weather units changed
         @method _listenWeatherUnitsChanged
         **/
        BlockWorldWeather.prototype._listenWeatherUnitsChanged = function () {
            var self = this;
            self.m_weatherUnitChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.WEATHER_UNIT + ' option:selected').val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('unit', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.WEATHER_UNIT).on('change', self.m_weatherUnitChangedHandler);
        };
        /**
         Listen weather style changed
         @method _listenWeatherStyleChanged
         **/
        BlockWorldWeather.prototype._listenWeatherStyleChanged = function () {
            var self = this;
            self.m_weatherStyleChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.WEATHER_STYLE + ' option:selected').val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('style', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.WEATHER_STYLE).on('change', self.m_weatherStyleChangedHandler);
        };
        /**
         Listen weather address changed
         @method _listenWeatherAddressChanged
         **/
        BlockWorldWeather.prototype._listenWeatherAddressChanged = function () {
            var self = this;
            self.m_weatherAddressChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.WEATHER_ADDRESS).val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('address', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.WEATHER_ADDRESS).on('change', self.m_weatherAddressChangedHandler);
        };
        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        BlockWorldWeather.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_WEATHER);
        };
        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        BlockWorldWeather.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_WEATHER);
            _super.prototype._loadBlockSpecificProps.call(this);
        };
        /**
         Populate UI
         @method _populate
         **/
        BlockWorldWeather.prototype._populate = function () {
            var self = this;
            _super.prototype._populate.call(this);
            var domPlayerData = self._getBlockPlayerData();
            var $data = $(domPlayerData).find('Json').find('Data');
            var unit = $data.attr('unit');
            var style = $data.attr('style');
            var address = $data.attr('address');
            $(Elements.WEATHER_UNIT).selectpicker('val', unit);
            $(Elements.WEATHER_STYLE).selectpicker('val', style);
            $(Elements.WEATHER_ADDRESS).val(address);
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockWorldWeather.prototype.deletedBlock = function (i_memoryOnly) {
            var self = this;
            _super.prototype.deleteBlock.call(this, i_memoryOnly);
            $(Elements.WEATHER_UNIT).off('change', self.m_weatherUnitChangedHandler);
            $(Elements.WEATHER_STYLE).off('change', self.m_weatherStyleChangedHandler);
            $(Elements.WEATHER_ADDRESS).off('change', self.m_weatherAddressChangedHandler);
        };
        return BlockWorldWeather;
    })(TSLiteModules.BlockJsonBase);
    return BlockWorldWeather;
});
//# sourceMappingURL=BlockWorldWeather.js.map