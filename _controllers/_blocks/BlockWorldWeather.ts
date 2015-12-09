///<reference path="../../typings/lite/app_references.d.ts" />

/**
 BlockWorldWeather is based on JSON base class component and display world weather
 @class BlockWorldWeather
 @constructor
 @return {Object} instantiated BlockWorldWeather
 **/
//GULP_ABSTRACT_EXTEND extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockWorldWeather extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {
        protected _initSettingsPanel() ;
        protected _loadBlockSpecificProps():void ;
        protected _populate():void ;
        public deleteBlock(i_memoryOnly):void ;
   }
}
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    class BlockWorldWeather extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {

        private m_weatherUnitChangedHandler;
        private m_weatherStyleChangedHandler;
        private m_weatherAddressChangedHandler;

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = 6010;
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
            self.m_mimeType = 'Json.weather';
            self._initSettingsPanel();
            self._listenWeatherUnitsChanged();
            self._listenWeatherStyleChanged();
            self._listenWeatherAddressChanged();
        }

        /**
         Listen Weather units changed
         @method _listenWeatherUnitsChanged
         **/
        private _listenWeatherUnitsChanged() {
            var self = this;
            self.m_weatherUnitChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.WEATHER_UNIT + ' option:selected').val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('unit', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.WEATHER_UNIT).on('change', self.m_weatherUnitChangedHandler);
        }

        /**
         Listen weather style changed
         @method _listenWeatherStyleChanged
         **/
        private _listenWeatherStyleChanged() {
            var self = this;
            self.m_weatherStyleChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.WEATHER_STYLE + ' option:selected').val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('style', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.WEATHER_STYLE).on('change', self.m_weatherStyleChangedHandler);

        }

        /**
         Listen weather address changed
         @method _listenWeatherAddressChanged
         **/
        private _listenWeatherAddressChanged() {
            var self = this;
            self.m_weatherAddressChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.WEATHER_ADDRESS).val();
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('address', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.WEATHER_ADDRESS).on('change', self.m_weatherAddressChangedHandler);
        }

        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        protected _initSettingsPanel() {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_WEATHER);
        }

        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        protected _loadBlockSpecificProps():void {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_WEATHER);
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
            var unit = $data.attr('unit');
            var style = $data.attr('style');
            var address = $data.attr('address');
            $(Elements.WEATHER_UNIT).selectpicker('val',unit);
            $(Elements.WEATHER_STYLE).selectpicker('val',style);
            $(Elements.WEATHER_ADDRESS).val(address);
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        public deleteBlock(i_memoryOnly):void {
            var self = this;
            super.deleteBlock(i_memoryOnly);
            $(Elements.WEATHER_UNIT).off('change', self.m_weatherUnitChangedHandler);
            $(Elements.WEATHER_STYLE).off('change', self.m_weatherStyleChangedHandler);
            $(Elements.WEATHER_ADDRESS).off('change', self.m_weatherAddressChangedHandler);
        }

    }
    return BlockWorldWeather;

});