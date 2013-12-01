/**
 BlockQR which can reside as part of timeline channel or inside scenes
 @class BlockQR
 @constructor
 @param {string} i_placement indicates if the block is set to exist inside a timeline or inside a scene
 @param {string} i_campaign_timeline_chanel_player_id player id of instance
 @return {object} BlockQR instance
 **/

function BlockQR(i_placement, i_campaign_timeline_chanel_player_id) {

    var self = this;

    self.m_blockType = 3430;
    self.m_blockName = model.getComponent(self.m_blockType).name;
    self.m_blockDescription = model.getComponent(self.m_blockType).description;
    self.m_blockIcon = model.getComponent(self.m_blockType).icon;
    self.m_qrText = 'Hello World';

    Block.call(this, i_placement, i_campaign_timeline_chanel_player_id);
    self.m_property.initSubPanel('#blockQRCommonProperties');
    self._wireUI();
}

BlockQR.prototype = new Block(null);

BlockQR.prototype._wireUI = function () {
    var self = this;

    var qrText;
    $("#qrText").on("input", function (e) {
        if (!self.m_selected)
            return;
        window.clearTimeout(qrText);
        qrText = window.setTimeout(function () {
            self._onChange(e);
        }, 200);

    });
};

BlockQR.prototype._loadCommonProperties = function () {
    var self = this;

    self._populate();
    this.m_property.viewSubPanel('#blockQRCommonProperties');
};

BlockQR.prototype._populate = function () {
    var self = this;

    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xml = recBlock['player_data'];
    var x2js = commBroker.getService('compX2JS');
    var jPlayerData = x2js.xml_str2json(xml);

    if (jPlayerData["Player"]["Data"]["Text"]) {
        $('#qrText').val(jPlayerData["Player"]["Data"]["Text"]["__text"]);
    } else {
        $('#qrText').val(self.m_qrText);
    }
}

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
                    __text: text,
                }
            },
            _label: 'QR Code',
            _interactive: '0'
        }
    }

    var xData = x2js.json2xml_str(xSavePlayerData);
    self.m_helperSDK.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xData);

}

