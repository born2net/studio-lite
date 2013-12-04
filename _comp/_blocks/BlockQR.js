/**
 * BlockQR block resided inside a Scenes or timeline
 *
 * @class BlockQR
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
function BlockQR(i_placement, i_campaign_timeline_chanel_player_id) {

    var self = this;

    self.m_blockType = 3430;
    self.m_blockName = model.getComponent(self.m_blockType).name;
    self.m_blockDescription = model.getComponent(self.m_blockType).description;
    self.m_blockIcon = model.getComponent(self.m_blockType).icon;
    self.m_qrText = 'Hello World';

    Block.call(this, i_placement, i_campaign_timeline_chanel_player_id);
    self.m_property.initSubPanel(Elements.BLOCK_QR_COMMON_PROPERTIES);
    self._wireUI();
}

BlockQR.prototype = new Block(null);

/**
 Wire's elements to event handlers
 @method _wireUI
 @return none
 **/
BlockQR.prototype._wireUI = function () {
    var self = this;

    var qrText;
    $(Elements.QR_TEXT).on("input", function (e) {
        if (!self.m_selected)
            return;
        window.clearTimeout(qrText);
        qrText = window.setTimeout(function () {
            self._onChange(e);
        }, 200);

    });
};

/**
 Populate the QR block common properties panel
 @method _loadCommonProperties
 @return none
 **/
BlockQR.prototype._loadCommonProperties = function () {
    var self = this;

    self._populate();
    this.m_property.viewSubPanel(Elements.BLOCK_QR_COMMON_PROPERTIES);
};

/**
 Load up property values in the common panel
 @method _populate
 @return none
 **/
BlockQR.prototype._populate = function () {
    var self = this;

    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xml = recBlock['player_data'];
    var x2js = commBroker.getService('compX2JS');
    var jPlayerData = x2js.xml_str2json(xml);

    if (jPlayerData["Player"]["Data"]["Text"]) {
        $(Elements.QR_TEXT).val(jPlayerData["Player"]["Data"]["Text"]["__text"]);
    } else {
        $(Elements.QR_TEXT).val(self.m_qrText);
    }
}

/**
 When user changes QR text update msdb.
 We use xSavePlayerData as a json boilerplate that we append values to
 and save it in msdb as player_data
 @method _onChange
 @param {event} e event from target input element
 @return none
 **/
BlockQR.prototype._onChange = function (e) {
    var self = this;

    var text = $(e.target).val();
    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xml = recBlock['player_data'];
    var x2js = commBroker.getService('compX2JS');
    var jPlayerData = x2js.xml_str2json(xml);

    // Example of how to build player_data as json object and serialize back to XML for save

    var xSavePlayerData = {
        Player: {
            _player: 3430,
            Data: {
                Text: {
                    _textSource: 'static',
                    __text: text
                }
            },
            _label: 'QR Code',
            _interactive: '0'
        }
    }

    var xData = x2js.json2xml_str(xSavePlayerData);
    self.m_helperSDK.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xData);
}

