///<reference path="../../typings/lite/app_references.d.ts" />

/**
 * BlockJsonItemBase block resides inside a scene or timeline
 * @class BlockJsonItemBase
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 * @example
 * path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
 * json player: children[0].children
 * json item: text
 */
//GULP_ABSTRACT_EXTEND extends Block
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockJsonItemBase extends Block {
        protected m_options;
        protected m_inputPathChange;
        protected m_selected;
   }
}
//GULP_ABSTRACT_END

define(['jquery', 'Block'], function ($, Block) {
    TSLiteModules.Block = Block;

    class BlockJsonItemBase extends TSLiteModules.Block {

        protected m_options;
        protected m_inputPathChange;
        protected m_selected;

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;

            self.m_blockType = 4310;
            _.extend(self.m_options, {blockType: this.m_blockType})
            super.initialize(self.m_options);
            self._initSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
            self._listenInputChange();
        }

        /**
         Listen input change
         @method _listenInputChange
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _listenInputChange() {
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
        }

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate() {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('XmlItem');
            var fieldType = $(xSnippet).attr('fieldType');
            var fieldName = $(xSnippet).attr('fieldName');
            $('#tmpJsonItem').val(fieldName);
        }

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps() {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock(i_memoryOnly) {
            var self = this;
            $('#tmpJsonItem').off("input", self.m_inputPathChange);
            self._deleteBlock(i_memoryOnly);
        }
    }
    return BlockJsonItemBase;

});