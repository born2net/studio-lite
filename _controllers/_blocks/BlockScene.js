/**
 * BlockScene block resided inside a Scenes or timeline
 * @class BlockScene
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    /**
     event fires when scene the scene width or height modified by user
     @event Block.SCENE_BLOCK_DIMENSIONS_CHANGE
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.SCENE_BLOCK_DIMENSIONS_CHANGE = 'SCENE_BLOCK_DIMENSIONS_CHANGE';

    var BlockScene = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3510;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_SCENE_COMMON_PROPERTIES);
            self._listenInputChanges();
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChanges: function () {
            var self = this;

            self.m_inputNameChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Player').eq(0).attr('label', text);
                self._setBlockPlayerData(domPlayerData);
                BB.comBroker.fire(BB.EVENTS['SCENE_RENAMED'], this);
            }, 150);
            $(Elements.SCENE_NAME_INPUT).on("input", self.m_inputNameChangeHandler);


            self.m_inputWidthChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if (parseFloat($(e.target).val()) < 100)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Layout').eq(0).attr('width', $(e.target).val());
                self._setBlockPlayerData(domPlayerData);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_DIMENSIONS_CHANGE'], self, null, self.m_block_id);
            }, 200);
            $(Elements.SCENE_WIDTH_INPUT).on("blur", self.m_inputWidthChangeHandler);

            self.m_inputHeightChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if (parseFloat($(e.target).val()) < 100)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Layout').eq(0).attr('height', $(e.target).val());
                self._setBlockPlayerData(domPlayerData);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_DIMENSIONS_CHANGE'], self, null, self.m_block_id);
            }, 200);
            $(Elements.SCENE_HEIGHT_INPUT).on("blur", self.m_inputHeightChangeHandler);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var domPlayer = $(domPlayerData).find('Player').eq(0);
            var domPlayerLayout = $(domPlayerData).find('Player').eq(0).find('Layout');
            $(Elements.SCENE_NAME_INPUT).val($(domPlayer).attr('label'));
            $(Elements.SCENE_WIDTH_INPUT).val($(domPlayerLayout).attr('width'));
            $(Elements.SCENE_HEIGHT_INPUT).val($(domPlayerLayout).attr('height'));
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_SCENE_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.SCENE_NAME_INPUT).off("input", self.m_inputNameChangeHandler);
            $(Elements.SCENE_WIDTH_INPUT).off("input", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_HEIGHT_INPUT).off("input", self.m_inputHeightChangeHandler);
            self._deleteBlock();
        }
    });

    return BlockScene;
});