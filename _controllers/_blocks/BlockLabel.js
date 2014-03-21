/**
 * BlockLabel block resided inside a Scenes or timeline
 * @class BlockLabel
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockLabel = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3241;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_LABEL_COMMON_PROPERTIES);
            self.m_labelFontSelector = self.m_blockProperty.getLabelFontSelector();
            self._listenInputChange();
            self._listenFontSelectionChange();
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_inputChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Label');
                var xSnippetText = $(xSnippet).find('Text');
                $(xSnippetText).text(text);
                self._setBlockPlayerData(domPlayerData);
            }, 150);
            $(Elements.LABEL_TEXT).on("input", self.m_inputChangeHandler);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Label');
            var xSnippetText = $(xSnippet).find('Text');
            var xSnippetFont = $(xSnippet).find('Font');
            $(Elements.LABEL_TEXT).val(xSnippetText.text());

            self.m_labelFontSelector.setConfig({
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
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenFontSelectionChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_labelFontSelector)
                    return;
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Label');
                var xSnippetFont = $(xSnippet).find('Font');

                config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
                config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
                config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'normal');
                xSnippetFont.attr('fontColor', BB.lib.colorToDecimal(config.color));
                xSnippetFont.attr('fontSize', config.size);
                xSnippetFont.attr('fontFamily', config.font);
                xSnippetFont.attr('textAlign', config.alignment);

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
            this._viewSubPanel(Elements.BLOCK_LABEL_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.LABEL_TEXT).off("input", self.m_inputChangeHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            self._deleteBlock();
        }
    });

    return BlockLabel;
});