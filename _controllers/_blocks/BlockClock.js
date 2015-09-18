/**
 * BlockClock block resides inside a scene or timeline
 * @class BlockClock
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockClock = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3320;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_CLOCK_COMMON_PROPERTIES);
            self.m_clockFontSelector = self.m_blockProperty.getClockFontSelector();
            self._listenFontSelectionChange();
            self._listenClockMaskChange();
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Clock');
            var mask = $(xSnippet).attr('clockMask');
            var xSnippetFont = $(xSnippet).find('Font');

            $('input[type="radio"]',self.$el).filter(function(i){
                var radioValue = $(this).attr('value');
                var currMask = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).getDateTimeMask(radioValue);
                if (mask == currMask){
                    $(this).prop('checked',true);
                    return false;
                }
            });

            self.m_clockFontSelector.setConfig({
                bold: xSnippetFont.attr('fontWeight') == 'bold' ? true : false,
                italic: xSnippetFont.attr('fontStyle') == 'italic' ? true : false,
                underline: xSnippetFont.attr('textDecoration') == 'underline' ? true : false,
                alignment: xSnippetFont.attr('textAlign'),
                font: xSnippetFont.attr('fontFamily'),
                color: BB.lib.colorToHex(BB.lib.decimalToHex(xSnippetFont.attr('fontColor'))),
                size: xSnippetFont.attr('fontSize')
            });
        },

        /**
         Listen to new selection in clock mask radio button change
         @method _listenClockMaskChange
         **/
        _listenClockMaskChange: function(){
            var self = this;
            self.m_clockMaskHandler = function(e){
                if (!self.m_selected)
                    return;
                var radioValue = $(e.target).attr('value');
                var mask = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).getDateTimeMask(radioValue);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Clock');
                xSnippet.attr('clockMask',mask);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);

            }
            $('input[type="radio"]',self.$el).on('change',self.m_clockMaskHandler);
        },

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenFontSelectionChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_clockFontSelector)
                    return;
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Clock');
                var xSnippetFont = $(xSnippet).find('Font');

                config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
                config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
                config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'none');
                xSnippetFont.attr('fontColor', BB.lib.colorToDecimal(config.color));
                xSnippetFont.attr('fontSize', config.size);
                xSnippetFont.attr('fontFamily', config.font);
                xSnippetFont.attr('textAlign', config.alignment);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
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
            this._viewSubPanel(Elements.BLOCK_CLOCK_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            $('input[type="radio"]',self.$el).off('change',self.m_clockMaskHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockClock;
});