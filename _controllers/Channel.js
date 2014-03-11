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

    /**
     All blocks and related property modules loaded by require.js
     @event BLOCKS_LOADED
     @param {This} caller
     @static
     @final
     **/
    BB.EVENTS.BLOCKS_LOADED = 'BLOCKS_LOADED';

    var Channel = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.x2js = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
            BB.comBroker.setService('compX2JS', this.x2js);

            self.m_campaign_timeline_chanel_id = this.options.campaignTimelineChanelID;
            self.m_selected = false;
            self.m_blocks = {}; // hold references to all created player instances
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self._loadBlocks();
        },

        /**
         Use require js to load all Block modules (and in turn modules load related properties modules) and save
         reference in channel so we can later instantiate blocks within the channel
         @method _loadBlocks
         **/
        _loadBlocks: function () {
            var self = this;
            $(Elements.SELECTED_TIMELINE).hide();
            require(['BlockProperties', 'Block', 'BlockRSS', 'BlockQR', 'BlockVideo', 'BlockImage'], function (BlockProperties, Block, BlockRSS, BlockQR, BlockVideo, BlockImage) {

                self.m_blockProperties = BB.comBroker.getService(BB.SERVICES.BLOCK_PROPERTIES) == undefined ?  self.m_blockProperties = new BlockProperties({el: Elements.BLOCK_PROPERTIES}) : BB.comBroker.getService(BB.SERVICES.BLOCK_PROPERTIES);
                self.m_block = Block;
                self.m_blockRSS = BlockRSS;
                self.m_blockQR = BlockQR;
                self.m_blockVideo = BlockVideo;
                self.m_blockImage = BlockImage;

                self._createBlocks();
                self.initUI();
                $(Elements.SELECTED_TIMELINE).fadeIn();
            });
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
         @method _createBlocks
         @return none
         **/
        _createBlocks: function () {
            var self = this;
            var blockIDs = jalapeno.getChannelBlocks(self.m_campaign_timeline_chanel_id);
            for (var i = 0; i < blockIDs.length; i++) {
                var blockID = blockIDs[i];
                var recBlock = jalapeno.getBlockRecord(blockID);
                self.createBlock(blockID, recBlock['player_data'])
            }
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
            // var x2js = BB.comBroker.getService('compX2JS');
            var playerData = this.x2js.xml_str2json(i_player_data);
            var blockCode = playerData['Player']['_player'];

            switch (parseInt(blockCode)) {
                case 3345:
                {
                    self.m_blocks[i_campaign_timeline_chanel_player_id] = new self.m_blockRSS({
                        i_placement: BB.CONSTS.PLACEMENT_CHANNEL,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
                case 3430:
                {
                    self.m_blocks[i_campaign_timeline_chanel_player_id] = new self.m_blockQR({
                        i_placement: BB.CONSTS.PLACEMENT_CHANNEL,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
                case 3100:
                {
                    self.m_blocks[i_campaign_timeline_chanel_player_id] = new self.m_blockVideo({
                        i_placement: BB.CONSTS.PLACEMENT_CHANNEL,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
                case 3130:
                {
                    self.m_blocks[i_campaign_timeline_chanel_player_id] = new self.m_blockImage({
                        i_placement: BB.CONSTS.PLACEMENT_CHANNEL,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
            }
            return self.m_blocks[i_campaign_timeline_chanel_player_id];
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