/**
 Event fires when a channel is selected on a timeline. The event includes the channel id that was selected.
 @event Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED
 @param {This} caller
 @param {Event} campaign_timeline_channel_id
 @static
 @final
 **/
Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED = 'CAMPAIGN_TIMELINE_CHANNEL_SELECTED';

/**
 The Channel class is created under, and managed by, a timeline instance.
 So if for example a timeline has three channels, each channel would have a corresponding channel instance referenced within the timeline instance.
 Also, a channel creates, and holds a reference to, all the blocks that are contained within that channel, via the block_id.
 @class Channel
 @constructor
 @param {string} i_campaign_timeline_chanel_id
 @return {object} Channel instantiated
 **/
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

    /**
     Wire UI and listen to change in random playback on channel.
     @method _wireUI
     @return none
     **/
    _wireUI: function () {
        var self = this;

        $(Elements.RANDOM_PLAYBACK).change(function (e) {
            if (!self.m_selected)
                return;
            self._onChange(e);
        });
    },

    /**
     On change in random playback value update msdb with new value.
     @method _onChange
     @param {Event} e
     @return none
     **/
    _onChange: function (e) {
        var self = this;

        var state = $(Elements.RANDOM_PLAYBACK + ' option:selected').val() == "on" ? 'True' : 'False';
        self.m_helperSDK.setCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id, 'random_order', state)
    },

    /**
     Update the properties panel with the state of random playback.
     @method _propLoadChannel
     @return none
     **/
    _propLoadChannel: function () {
        var self = this;

        var recChannel = self.m_helperSDK.getCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id);
        var state = recChannel['random_order'] == 'True' ? 'on' : 'off';

        $(Elements.RANDOM_PLAYBACK + ' option[value=' + state + ']').attr("selected", "selected");

        // todo change name of propScreenDivision to propChannel after css done
        self.m_property.viewPanel(Elements.PROP_SCREEN_DIVISION);
        $(Elements.RANDOM_PLAYBACK).slider('refresh');
    },

    /**
     Create blocks instances for all the channel's blocs (i.e.: players / resources).
     @method _createBlocks
     @return none
     **/
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

    /**
     Listen to even when timeline is selected and it it's this instance's channel_id, populate properties panel.
     @method _onTimelineChannelSelected
     @return none
     **/
    _onTimelineChannelSelected: function () {
        var self = this;

        commBroker.listen(Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, function (e) {
            var channelID = e.edata;
            if (self.m_campaign_timeline_chanel_id != channelID) {
                self.m_selected = false;
                return;
            }

            self.m_selected = true;
            // log('channel selected ' + self.m_campaign_timeline_chanel_id);
            self._propLoadChannel();
        });
    },

    /**
     Get all blocks that belong to this channel instance but push them into an array
     so they are properly sorted by player offset time.
     @method getBlocks
     @return {Object} blocksSorted
     **/

    getBlocks: function () {
        var self = this;
        var blocksSorted = [];

        for (var block_id in self.m_blocks) {
            $(self.m_msdb.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = self.m_msdb.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    offsetTime = parseInt(recCampaignTimelineChannelPlayer['player_offset_time']);
                    blocksSorted[offsetTime] = self.m_blocks[block_id];
                    // log(self.m_blocks[block_id]);
                }
            });
        }
        return blocksSorted;
    },

    /**
     Return a block instance for the selected i_campaign_timeline_chanel_player_id (i.e.: block_id).
     @method getBlockInstance
     @param {Number} i_campaign_timeline_chanel_player_id
     @return {Object} reference to the block instance
     **/
    getBlockInstance: function (i_campaign_timeline_chanel_player_id) {
        var self = this;
        return self.m_blocks[i_campaign_timeline_chanel_player_id];
    },

    /**
     This is factory method produces block instances which will reside on the timeline and referenced within this
     channel instance. The factory will parse the blockCode and create the appropriate block type.
     @method createBlock
     @param {Number} i_campaign_timeline_chanel_player_id
     @param {XML} i_playerData
     @return {Object} reference to the block instance
     **/
    createBlock: function (i_campaign_timeline_chanel_player_id, i_player_data) {
        var self = this;

        var x2js = commBroker.getService('compX2JS');
        var playerData = x2js.xml_str2json(i_player_data);
        var blockCode = playerData['Player']['_player'];

        switch (parseInt(blockCode)) {
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