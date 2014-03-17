/**
 The Channel class is created under, and managed by, a timeline instance.
 So if for example a timeline has three channels, each channel would have a corresponding channel instance referenced within the timeline instance.
 Also, a channel creates, and holds a reference to, all the blocks that are contained within that channel, via the block_id.
 @class Channel
 @constructor
 @param {string} i_campaign_timeline_chanel_id
 @return {object} Channel instantiated
 **/
define(['jquery', 'backbone', 'X2JS'], function ($, Backbone, X2JS) {

    /**
     Event fires when a channel is selected on a timeline. The event includes the channel id that was selected.
     @event CAMPAIGN_TIMELINE_CHANNEL_SELECTED
     @param {This} caller
     @param {Event} campaign_timeline_channel_id
     @static
     @final
     **/
    BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED = 'CAMPAIGN_TIMELINE_CHANNEL_SELECTED';

    var Channel = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_campaign_timeline_chanel_id = this.options.campaignTimelineChanelID;
            self.m_selected = false;
            self.m_blocks = {}; // hold references to all created player instances
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_blockFactory = BB.comBroker.getService(BB.SERVICES['BLOCK_FACTORY']);
            BB.comBroker.listenOnce(BB.EVENTS.BLOCKS_LOADED, $.proxy(self._onBlocksLoaded,self));
            self.m_blockFactory.loadBlockModules();
        },

        /**
         When all block modules have loaded, begin creating blocks
         @method _onBlocksLoaded
         **/
        _onBlocksLoaded: function(){
            var self = this;
            self._createChannelBlocks();
            self.initUI();
            $(Elements.SELECTED_TIMELINE).fadeIn();
        },

        /**
         After blocks loaded, continue initiliazation
         @method initUI
         **/
        initUI: function(){
            var self = this;
            self._onTimelineChannelSelected();
            self._wireUI();
            self._propLoadChannel();
            self._listenResourceRemoving();
        },

        /**
         Wire UI and listen to change in related UI (random playback on channel)
         @method _wireUI
         @return none
         **/
        _wireUI: function () {
            var self = this;
            self.m_randomPlaybackHandler = $(Elements.RANDOM_PLAYBACK).on('change', function (e) {
                if (!self.m_selected)
                    return;
                self._onChangeRandomPlayback(e);
            });
        },

        /**
         On change in random playback value update msdb with new value.
         @method _onChangeRandomPlayback
         @param {Event} e
         @return none
         **/
        _onChangeRandomPlayback: function (e) {
            var self = this;
            var state = $(Elements.RANDOM_PLAYBACK + ' option:selected').val() == "on" ? 'True' : 'False';
            jalapeno.setCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id, 'random_order', state)
        },

        /**
         Listen to when a resource removing from resources so we can remove corresponding blocks
         @method _listenResourceRemoving
         @return none
         **/
        _listenResourceRemoving: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.REMOVING_RESOURCE, function (e) {
                var removingResoucreID = e.edata;
                for (var blockID in self.m_blocks) {
                    if (self.m_blocks[blockID] instanceof BlockImage || self.m_blocks[blockID] instanceof BlockVideo) {
                        if (removingResoucreID == self.m_blocks[blockID].getResourceID()) {
                            self.deleteBlock(blockID);
                        }
                    }
                }
            });
        },

        /**
         Update the properties panel with the state of random playback.
         @method _propLoadChannel
         @return none
         **/
        _propLoadChannel: function () {
            var self = this;

            var recChannel = jalapeno.getCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id);
            var state = recChannel['random_order'] == 'True' ? 'on' : 'off';

            $(Elements.RANDOM_PLAYBACK + ' option[value=' + state + ']').attr("selected", "selected");
            self.m_property.selectView(Elements.CHANNEL_PROPERTIES);
        },

        /**
         Listen to even when timeline is selected and it it's this instance's channel_id, populate properties panel.
         @method _onTimelineChannelSelected
         @return none
         **/
        _onTimelineChannelSelected: function () {
            var self = this;

            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, function (e) {
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
         Create blocks instances for all the channel's blocs (i.e.: players / resources).
         @method _createChannelBlocks
         @return none
         **/
        _createChannelBlocks: function () {
            var self = this;
            var blockIDs = jalapeno.getChannelBlocks(self.m_campaign_timeline_chanel_id);
            for (var i = 0; i < blockIDs.length; i++) {
                var blockID = blockIDs[i];
                var recBlock = jalapeno.getBlockRecord(blockID);
                self.createChannelBlock(blockID, recBlock['player_data'])
            }
        },

        /**
         This method produces block instances which will reside on the timeline and referenced within this
         channel instance.
         @method createChannelBlock
         @param {Number} i_campaign_timeline_chanel_player_id
         @param {XML} i_playerData
         @return {Object} reference to the block instance
         **/
        createChannelBlock: function (i_campaign_timeline_chanel_player_id, i_player_data) {
            var self = this;
            var blockFactory = BB.comBroker.getService(BB.SERVICES.BLOCK_FACTORY);
            var blockID = parseInt(i_campaign_timeline_chanel_player_id);
            self.m_blocks[blockID] = blockFactory.createBlock(blockID, i_player_data, BB.CONSTS.PLACEMENT_CHANNEL);
            return self.m_blocks[blockID];
        },

        /**
         Get all blocks that belong to this channel instance but push them into an array so they are properly sorted by player offset time.
         @method getBlocks
         @return {Object} blocksSorted
         **/
        getBlocks: function () {
            var self = this;
            var blocksSorted = [];
            for (var block_id in self.m_blocks) {
                var recBlock = jalapeno.getBlockRecord(block_id);
                var offsetTime = parseInt(recBlock['player_offset_time']);
                blocksSorted[offsetTime] = self.m_blocks[block_id];
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
         Delete this channel and all of it's related blocks
         @method deleteChannel
         @return none
         **/
        deleteChannel: function () {
            var self = this;
            $(Elements.RANDOM_PLAYBACK).off('change', self.m_randomPlaybackHandler);
            jalapeno.removeChannelFromTimeline(self.m_campaign_timeline_chanel_id);
            for (var blockID in self.m_blocks) {
                self.deleteBlock(blockID);
            }
            $.each(self, function (k) {
                self[k] = undefined;
            });
        },

        /**
         Delete a block from the channel
         @method deleteBlock
         @param {Number} i_block_id
         @return none
         **/
        deleteBlock: function (i_block_id) {
            var self = this;
            self.m_blocks[i_block_id].deleteBlock();
            delete self.m_blocks[i_block_id];
        }
    });

    return Channel;
});