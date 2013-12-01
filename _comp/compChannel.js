/*/////////////////////////////////////////////

 Channel

 /////////////////////////////////////////////*/

Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED = 'CAMPAIGN_TIMELINE_CHANNEL_SELECTED';

function Channel(i_campaign_timeline_chanel_id) {

    this.self = this;
    this.m_campaign_timeline_chanel_id = i_campaign_timeline_chanel_id;
    this.m_msdb = commBroker.getValue(CompMSDB.msdb);
    this.m_selected = false;
    this.m_blocks = {}; // hold references to all created player instances
    this.m_property = commBroker.getService('CompProperty');
    this.m_helperSDK = commBroker.getService('HelperSDK');

    this._createBlocks();
    this._onTimelineChannelSelected();
    this._wireUI();
    this._propLoadChannel();
};

Channel.prototype = {
    constructor: Channel,

    _wireUI: function () {
        var self = this;

        $('#randomPlayback').change(function (e) {
            if (!self.m_selected)
                return;
            self._onChange(e);
        });
    },

    _onChange: function (e) {

        var self = this;

        var state = $('#randomPlayback option:selected').val() == "on" ? 'True' : 'False';
        self.m_helperSDK.setCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id, 'random_order', state)
    },

    _propLoadChannel: function () {
        var self = this;

        var recChannel = self.m_helperSDK.getCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id);
        var state = recChannel['random_order'] == 'True' ? 'on' : 'off';

        $('#randomPlayback option[value=' + state + ']').attr("selected", "selected");

        // todo change name of propScreenDivision to propChannel after css done
        self.m_property.viewPanel('#propScreenDivision');
        $('#randomPlayback').slider('refresh');
    },

    /////////////////////////////////////////////////////////
    //
    // _createBlocks
    //
    //      create blocks instances for all the channel's
    //      players / resources
    //
    /////////////////////////////////////////////////////////

    _createBlocks: function () {
        var self = this;

        // get all blocks that belong channel
        $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (self.m_campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                // log('ch ' + self.m_campaign_timeline_chanel_id + ' ' + campaign_timeline_chanel_player_id);
                // self.m_blocks[campaign_timeline_chanel_player_id] = new Block(campaign_timeline_chanel_player_id, recCampaignTimelineChannelPlayer['player_data']);
                self.createBlock(campaign_timeline_chanel_player_id, recCampaignTimelineChannelPlayer['player_data'])
            }
        });
    },

    _onTimelineChannelSelected: function () {
        var self = this;

        commBroker.listen(Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, function (e) {
            var channelID = e.edata;
            if (self.m_campaign_timeline_chanel_id != channelID) {
                self.m_selected = false;
                return;
            }

            self.m_selected = true;
            log('channel selected ' + self.m_campaign_timeline_chanel_id);
            self._propLoadChannel();
        });
    },

    /////////////////////////////////////////////////////////
    //
    // getBlocks
    //
    //      return all blocks that belong to channel instance
    //      but push them into an array so they are properly
    //      sorted by player offset time
    //
    /////////////////////////////////////////////////////////

    getBlocks: function () {
        var self = this;
        var blocksSorted = [];

        for (var block_id in self.m_blocks) {
            $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    offsetTime = parseInt(recCampaignTimelineChannelPlayer['player_offset_time']);
                    blocksSorted[offsetTime] = self.m_blocks[block_id];
                    log(self.m_blocks[block_id]);
                }
            });
        }
        return blocksSorted;
    },

    /////////////////////////////////////////////////////////
    //
    // getBlockInstance
    //
    //      return block instance of given played_id
    //
    /////////////////////////////////////////////////////////

    getBlockInstance: function (i_campaign_timeline_chanel_player_id) {
        var self = this;
        return self.m_blocks[i_campaign_timeline_chanel_player_id];
    },

    /////////////////////////////////////////////////////////
    //
    // createBlock
    //
    //      adds a new block instance
    //
    // return
    //      newly created Block instance
    //
    /////////////////////////////////////////////////////////

    createBlock: function (i_campaign_timeline_chanel_player_id, i_player_data) {
        var self = this;

        var x2js = commBroker.getService('compX2JS');
        var playerData = x2js.xml_str2json(i_player_data);
        var blockType = playerData['Player']['_player'];

        switch (parseInt(blockType)) {
            case 3345:
            {
                self.m_blocks[i_campaign_timeline_chanel_player_id] = new BlockRSS(Block.PLACEMENT_CHANNEL, i_campaign_timeline_chanel_player_id);
                break;
            }
            case 3430:
            {
                self.m_blocks[i_campaign_timeline_chanel_player_id] = new BlockQR(Block.PLACEMENT_CHANNEL, i_campaign_timeline_chanel_player_id);
                break;
            }
            case 3100:
            {
                self.m_blocks[i_campaign_timeline_chanel_player_id] = new BlockVideo(Block.PLACEMENT_CHANNEL, i_campaign_timeline_chanel_player_id);
                self.m_blocks[i_campaign_timeline_chanel_player_id].setPlayerData(playerData);
                break;
            }
            case 3130:
            {
                self.m_blocks[i_campaign_timeline_chanel_player_id] = new BlockImage(Block.PLACEMENT_CHANNEL, i_campaign_timeline_chanel_player_id);
                self.m_blocks[i_campaign_timeline_chanel_player_id].setPlayerData(playerData);
                break;
            }
        }


        return self.m_blocks[i_campaign_timeline_chanel_player_id];
    }
}