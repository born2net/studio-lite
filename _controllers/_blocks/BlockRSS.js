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
         When user changes a URL link for the RSS feed, update the msdb
         @method _listenInputChange
         @return none
         @example see code _getDefaultPlayerRSSData for sample XML structure
         **/
        _listenInputChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();

                if (BB.JalapenoHelper.isBlockPlayerDataExist(self.m_block_id, 'Rss', self.m_blockPlacement)) {
                    var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
                    var xPlayerData = recBlock['player_data'];
                } else {
                    var xPlayerData = BB.JalapenoHelper.getPlayerDataBoilerplate(self.m_blockType);
                }

                var xmlDoc = $.parseXML(xPlayerData);
                var xSnippet = $(xmlDoc).find('Rss');
                xSnippet.attr('url', text);
                log(xSnippet[0].outerHTML);

                BB.JalapenoHelper.updatePlayerData(self.m_block_id, xmlDoc, self.m_blockPlacement);

            }, 150);

            self.m_inputChangeHandler = $(Elements.RSS_LINK).on("input", onChange);

            /*
             var rssLink;
             $(Elements.RSS_LINK).on("input", function (e) {
             if (!self.m_selected)
             return;
             window.clearTimeout(rssLink);
             rssLink = window.setTimeout(function () {
             self._onChange(e);
             }, 200);
             });*/
        },

        /**
         Get a default RSS XML player_data which is a boilerplate xml structure used
         to add a new RSS component with
         @method _getDefaultPlayerRSSData
         @return {xml} xml data
         **/
        _getDefaultPlayerRSSData: function () {
            var xml = '<Player player="3345" label="Rss news" interactive="0">' +
                '<Data>' +
                '<Rss url="http://rss.news.yahoo.com/rss/politics" minRefreshTime="30" speed="10" vertical="1" rtl="0">' +
                '<Title>' +
                '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                '</Title>' +
                '<Description>' +
                '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                '</Description>' +
                '</Rss>' +
                '</Data>' +
                '</Player>'
            return xml;
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
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;

            if (BB.JalapenoHelper.isBlockPlayerDataExist(self.m_block_id, 'Rss', self.m_blockPlacement)) {
                var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
                var xmlDoc = $.parseXML(recBlock['player_data']);
                var xSnippet = $(xmlDoc).find('Rss');
                var url = xSnippet.attr('url');
                $(Elements.RSS_LINK).val(url);
            } else {
                $(Elements.RSS_LINK).val(self.m_rssUrl);
            }
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