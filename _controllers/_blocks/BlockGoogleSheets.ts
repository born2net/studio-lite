///<reference path="../../typings/lite/app_references.d.ts" />

/**
 BlockWorldWeather is based on JSON base class component
 @class BlockWorldWeather
 @constructor
 @return {Object} instantiated BlockWorldWeather
 **/
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    class BlockWorldWeather extends TSLiteModules.BlockJsonBase {

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = 6022;
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
            self._initSettingsPanel();
        }

        /**
         Populate the common properties UI
         @method _populate
         **/
        _populate() {
            super._populate();
        }

        protected _initSettingsPanel(){
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
        }

        protected _loadBlockSpecificProps(){
            var self = this;
            super._loadBlockSpecificProps();
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
        }

        /**
         Override base class method by hiding the paths container in json common properties
         @method _updateJsonPaths
         **/
        protected _updateJsonPaths() {
            $(Elements.JSON_PATHS_CONTAINER).hide();
        }

        /**
         Update the title of the selected tab properties element and also show the sub tab
         for Settings of Json sub components (world weather, Calendar etc...)
         @method _updateTitleTab
         */
        protected _updateTitleTab() {
            var self = this;
            super._updateTitleTab();
            $(Elements.BLOCK_COMMON_SETTINGS_TAB).show();

        }


    }
    return BlockWorldWeather;

});