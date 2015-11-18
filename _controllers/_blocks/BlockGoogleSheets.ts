///<reference path="../../typings/lite/app_references.d.ts" />

/**
 BlockGoogleSheets is based on JSON base class component
 @class BlockGoogleSheets
 @constructor
 @return {Object} instantiated BlockGoogleSheets
 **/
//GULP_ABSTRACT_EXTEND extends BlockJsonBase
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockGoogleSheets extends BlockJsonBase {
        protected _initSettingsPanel();
        protected _loadBlockSpecificProps();
   }
}
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase'], function ($, BlockJsonBase) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    class BlockGoogleSheets extends TSLiteModules.BlockJsonBase {

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = 6022;
            _.extend(this.m_options, {blockType: this.m_blockType});
            super();
        }

        /**
         Init sub class and super on base
         @override
         @method initialize
         **/
        initialize() {
            var self = this;
            super.initialize(this.m_options);
            self._initSettingsPanel();
        }

        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        protected _initSettingsPanel(){
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
        }

        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        protected _loadBlockSpecificProps(){
            var self = this;
            super._loadBlockSpecificProps();
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_SHEETS);
        }

    }
    return BlockGoogleSheets;

});