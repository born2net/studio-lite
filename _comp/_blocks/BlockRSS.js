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
function BlockRSS(i_placement, i_campaign_timeline_chanel_player_id) {

    var self = this;

    self.m_blockType = 3345;
    self.m_blockName = model.getComponent(self.m_blockType).name;
    self.m_blockDescription = model.getComponent(self.m_blockType).description;
    self.m_blockIcon = model.getComponent(self.m_blockType).icon;
    self.m_rssUrl = 'http://rss.news.yahoo.com/rss/world';

    Block.call(this, i_placement, i_campaign_timeline_chanel_player_id);
    self.m_property.initSubPanel('#blockRSSCommonProperties');
    self._wireUI();
}

BlockRSS.prototype = new Block(null);

BlockRSS.prototype._wireUI = function () {
    var self = this;

    var rssLink;
    $("#rssLink").on("input", function (e) {
        if (!self.m_selected)
            return;
        window.clearTimeout(rssLink);
        rssLink = window.setTimeout(function () {
            self._onChange(e);
        }, 200);
    });
};

/**
 Get a default RSS XML player_data which we use to add a new RSS component
 @method _getDefaultPlayerRSSData
 @return {xml} xml data
 **/
BlockRSS.prototype._getDefaultPlayerRSSData = function () {
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
    //todo ask alon if it's ok I am building my own XML
    return xml;
};

/**
 Populate the changes in the common properties panel for BlockRSS
 @method _loadCommonProperties
 @return none
 **/
BlockRSS.prototype._loadCommonProperties = function () {
    var self = this;

    self._populate();
    this.m_property.viewSubPanel('#blockRSSCommonProperties');
};


BlockRSS.prototype._populate = function () {
    var self = this;

    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xml = recBlock['player_data'];
    var x2js = commBroker.getService('compX2JS');
    var jPlayerData = x2js.xml_str2json(xml);

    if ((jPlayerData)["Player"]["Data"]["Rss"]) {
        $('#rssLink').val((jPlayerData)["Player"]["Data"]["Rss"]["_url"]);
    } else {
        $('#rssLink').val(self.m_rssUrl);
    }

}

/**
 When user changes a URL link for feed, update internal db
 @method _onChange
 @param e {event} event from target input
 @return none
 @example see code _getDefaultPlayerRSSData for sample XML structure
 **/
BlockRSS.prototype._onChange = function (e) {
    var self = this;

    var text = $(e.target).val();
    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xPlayerData = recBlock['player_data'];
    var xmlDoc = $.parseXML(xPlayerData);
    var xml = $(xmlDoc);
    var rss = xml.find('Rss');

    // this is a new component so we need to add a boilerplate xml
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
    self.m_helperSDK.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xmlString);
}