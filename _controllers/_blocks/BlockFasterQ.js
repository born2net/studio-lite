/**
 * BlockFasterQ block resides inside a scene or timeline
 * @class BlockFasterQ
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockFasterQ = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 6100;
            _.extend(options, {blockType: self.m_blockType});
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_FASTERQ_COMMON_PROPERTIES);
            self._listenInputChanges();
            self._listenBackgroundColorChange();
        },

        /**
         Listen to changes in the line id selection
         @method _listenInputChanges
         **/
        _listenInputChanges: function () {
            var self = this;
            self.m_inputNameChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var $elem = $(Elements.CLASS_FASTERQ_LINE_NUMBER);
                var domPlayerData = self._getBlockPlayerData();
                var xWebKit = $(domPlayerData).find('Webkit');
                var xWebKitData = $(xWebKit).find('Data');
                $(xWebKitData).attr('lineID1',BB.lib.cleanChar($elem.eq(0).val()));
                $(xWebKitData).attr('lineID2',BB.lib.cleanChar($elem.eq(1).val()));
                $(xWebKitData).attr('lineID3',BB.lib.cleanChar($elem.eq(2).val()));
                $(xWebKitData).attr('lineID4',BB.lib.cleanChar($elem.eq(3).val()));
                $(xWebKitData).attr('lineID5',BB.lib.cleanChar($elem.eq(4).val()));
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 200);
            $(Elements.CLASS_FASTERQ_LINE_NUMBER).on("input", self.m_inputNameChangeHandler);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xWebKit = $(domPlayerData).find('Webkit');
            var xWebKitData = $(xWebKit).find('Data');
            var $elem = $(Elements.CLASS_FASTERQ_LINE_NUMBER);
            $elem.eq(0).val($(xWebKitData).attr('lineID1'));
            $elem.eq(1).val($(xWebKitData).attr('lineID2'));
            $elem.eq(2).val($(xWebKitData).attr('lineID3'));
            $elem.eq(3).val($(xWebKitData).attr('lineID4'));
            $elem.eq(4).val($(xWebKitData).attr('lineID5'));
            var bgColor = BB.lib.colorToHex(BB.lib.decimalToHex($(xWebKitData).attr('bgColor')));
            $('.minicolors-swatch-color',Elements.BLOCK_FASTERQ_COMMON_PROPERTIES).css({'backgroundColor': bgColor});
        },

        /**
         Listen to changes in font UI background color from common Block property and take action on changes
         @method _listenBackgroundColorChange
         **/
        _listenBackgroundColorChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FASTERQ_BG_COLOR_CHANGE, self, function (e) {
                if (!self.m_selected)
                    return;
                var color = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xWebKit = $(domPlayerData).find('Webkit');
                $(xWebKit).find('Data').attr('bgColor', BB.lib.colorToDecimal(color));
                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_FASTERQ_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            $(Elements.CLASS_FASTERQ_LINE_NUMBER).off("input", self.m_inputNameChangeHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FASTERQ_BG_COLOR_CHANGE, self);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockFasterQ;
});