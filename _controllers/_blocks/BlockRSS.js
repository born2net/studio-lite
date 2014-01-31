/**
 * BlockRSS block resided inside a Scenes or timeline
 *
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

            self._wireUI();
            // todo: disabled mini colors
            //self._listenRSSColorPicker();
        },

        /**
         Bind listener events to related UI elements
         @method _wireUI
         @return none
         **/
        _wireUI: function () {
            var self = this;

            var rssLink;
            $(Elements.RSS_LINK).on("input", function (e) {
                if (!self.m_selected)
                    return;
                window.clearTimeout(rssLink);
                rssLink = window.setTimeout(function () {
                    self._onChange(e);
                }, 200);
            });
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
         @method _loadCommonProperties
         @return none
         **/
        _loadCommonProperties: function () {
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

            var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
            var xml = recBlock['player_data'];
            var x2js = BB.comBroker.getService('compX2JS');
            var jPlayerData = x2js.xml_str2json(xml);

            if ((jPlayerData)["Player"]["Data"]["Rss"]) {
                $(Elements.RSS_LINK).val((jPlayerData)["Player"]["Data"]["Rss"]["_url"]);
            } else {
                $(Elements.RSS_LINK).val(self.m_rssUrl);
            }

        },

        /**
         When user changes a URL link for the RSS feed, update the msdb
         @method _onChange
         @param e {event} event from target input
         @return none
         @example see code _getDefaultPlayerRSSData for sample XML structure
         **/
        _onChange: function (e) {
            var self = this;

            var text = $(e.target).val();
            var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
            var xPlayerData = recBlock['player_data'];
            var xmlDoc = $.parseXML(xPlayerData);
            var xml = $(xmlDoc);
            var rss = xml.find('Rss');

            // this is a new component so we need to add a boilerplate XML
            if (rss.length == 0) {
                xPlayerData = self._getDefaultPlayerRSSData();
                xmlDoc = $.parseXML(xPlayerData);
                xml = $(xmlDoc);
                rss = xml.find('Rss');
                rss.attr('url', text);
            } else {
                rss.attr('url', text);
            }

            var xmlString = (new XMLSerializer()).serializeToString(xml[0]);
            jalapeno.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xmlString);
        },


        /**
         Listen to when user selects to change the color of the RSS feed
         @method _listenRSSColorPicker
         @return none
         **/
        _listenRSSColorPicker: function () {
            $('#hue-demo').minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    var log;
                    try {
                        log = hex ? hex : 'transparent';
                        if (opacity) log += ', ' + opacity;
                        console.log(log);
                    } catch (e) {
                    }
                },
                theme: 'default'
            });
        }
    });

    return BlockRSS;
});