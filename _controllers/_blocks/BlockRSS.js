/**
 * BlockRSS block resided inside a Scenes or timeline
 * @class BlockRSS
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockRSS = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            Block.prototype.constructor.call(this, options);
            var self = this;

            self.m_blockType = 3345;
            self.m_blockName = model.getComponent(self.m_blockType).name;
            self.m_blockDescription = model.getComponent(self.m_blockType).description;
            self.m_blockIcon = model.getComponent(self.m_blockType).icon;
            self.m_rssUrl = 'http://rss.news.yahoo.com/rss/world';
            self.m_property.initSubPanel(Elements.BLOCK_RSS_COMMON_PROPERTIES);
            self._listenInputChange();
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         @example see code getPlayerDataBoilerplate for sample XML structure
         **/
        _listenInputChange: function () {
            var self = this;
            var xmlString = undefined;

            var onChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();
                var recBlock = BB.JalapenoHelper.getBlockPlayerData(self.m_block_id, 'Rss', self.m_blockPlacement);
                if (recBlock == undefined) {
                    xmlString = BB.JalapenoHelper.getPlayerDataBoilerplate(self.m_blockType);
                } else {
                    xmlString = recBlock['player_data'];
                }
                var xmlDom = BB.JalapenoHelper.playerDataStringToXmlDom(xmlString);
                var xSnippet = $(xmlDom).find('Rss');
                $(xSnippet).attr('url', text);
                BB.JalapenoHelper.updatePlayerData(self.m_block_id, xmlDom, self.m_blockPlacement);
                // log(xSnippet[0].outerHTML);
            }, 150);
            self.m_inputChangeHandler = $(Elements.RSS_LINK).on("input", onChange);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var recBlock = BB.JalapenoHelper.getBlockPlayerData(self.m_block_id, 'Rss', self.m_blockPlacement);
            if (recBlock == undefined) {
                $(Elements.RSS_LINK).val(self.m_rssUrl);
            } else {
                var xmlDom = BB.JalapenoHelper.playerDataStringToXmlDom(recBlock['player_data']);
                var xSnippet = $(xmlDom).find('Rss');
                var url = xSnippet.attr('url');
                $(Elements.RSS_LINK).val(url);
            }
        },

        /**
         Populate the RSS block common properties panel
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this.m_property.viewSubPanel(Elements.BLOCK_RSS_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.RSS_LINK).off('change', self.m_inputChangeHandler);
            self._deleteBlock();
        }

    });

    return BlockRSS;
});