///<reference path="../../typings/lite/app_references.d.ts" />

//GULP_ABSTRACT_EXTEND extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockDigg extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {
        protected _initSettingsPanel() ;
        protected _loadBlockSpecificProps():void ;
        protected _updateTitleTab() ;
        public deletedBlock(i_memoryOnly):void ;
   }
}
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase', 'validator'], function ($, BlockJsonBase, validator) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;

    /**
     BlockDigg is based on JSON base class component
     @class BlockDigg
     @constructor
     @return {Object} instantiated BlockDigg
     **/
    class BlockDigg extends TSLiteModules.BlockJsonBase implements IBlocks.IBlock {

        constructor(options?:any) {
            this.m_options = options;
            this.m_blockType = 6000;
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
            self.m_mimeType = 'Json.digg';
            self._initSettingsPanel();
        }

        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        protected _initSettingsPanel() {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_DIGG);
        }

        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        protected _loadBlockSpecificProps():void {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_DIGG);
            super._loadBlockSpecificProps();
        }

        /**
         Hide the Settings tab as Digg does not have any special component setting options
         @override
         @method _updateTitleTab
         */
        protected _updateTitleTab() {
            var self = this;
            $(Elements.BLOCK_COMMON_SETTINGS_TAB).hide();
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        public deletedBlock(i_memoryOnly):void {
            var self = this;
            super.deleteBlock(i_memoryOnly);
        }

    }
    return BlockDigg;

});