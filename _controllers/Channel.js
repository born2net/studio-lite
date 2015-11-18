/**
 The Channel class is created under, and managed by, a timeline instance.
 So if for example a timeline has three channels, each channel would have a corresponding channel instance referenced within the timeline instance.
 Also, a channel creates, and holds a reference to, all the blocks that are contained within that channel, via the block_id.
 @class Channel
 @constructor
 @param {string} i_campaign_timeline_chanel_id
 @return {object} Channel instantiated
 **/
define(['jquery', 'backbone', 'X2JS', 'BlockImage', 'BlockSVG', 'BlockVideo', 'BlockScene'], function ($, Backbone, X2JS, BlockImage, BlockSVG, BlockVideo, BlockScene) {

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
            self._listenReset();
            if (self.m_blockFactory.blocksLoaded()) {
                self._onBlocksLoaded();
            } else {
                BB.comBroker.listenOnce(BB.EVENTS['BLOCKS_LOADED'], $.proxy(self._onBlocksLoaded, self));
                self.m_blockFactory.loadBlockModules();
            }
        },

        /**
         When all block modules have loaded, begin creating blocks
         @method _onBlocksLoaded
         **/
        _onBlocksLoaded: function () {
            var self = this;
            self._createChannelBlocks();
            self._postInit();
            $(Elements.SELECTED_TIMELINE).fadeIn();
        },

        /**
         After blocks loaded, continue initiliazation
         @method _postInit
         **/
        _postInit: function () {
            var self = this;
            self._onTimelineChannelSelected();
            self._listenRandomPlayback();
            self._listenRepeatToFit();
            self._propLoadChannel();
            self._listenResourceRemoving();
            self._listenSceneRemoving();
            //self._listenViewerRemoved();
        },

        /**
         Listen to reset of when switching to different campaign so we forget current state
         @method _listenReset
         **/
        _listenReset: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.CAMPAIGN_RESET, self, function () {
                for (var blockID in self.m_blocks) {
                    self.deleteBlock(blockID, true);
                }
                $(self.m_thumbsContainer).empty();
                self._reset();
            });
        },

        /**
         Reset current state
         @method _reset
         **/
        _reset: function () {
            var self = this;
            $(Elements.RANDOM_PLAYBACK).off('change', self.m_randomPlaybackHandler);
            $(Elements.REPEAT_TO_FIT).off('change', self.m_repeatToFitPlaybackHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.CAMPAIGN_RESET, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.REMOVING_RESOURCE, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.REMOVING_SCENE, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, self);
            $.each(self, function (k) {
                self[k] = undefined;
            });
        },

        /**
         Wire UI and listen to change in related UI (random playback on channel)
         @method _listenRandomPlayback
         @return none
         **/
        _listenRandomPlayback: function () {
            var self = this;
            self.m_randomPlaybackHandler = $(Elements.RANDOM_PLAYBACK).on('change', function (e) {
                if (!self.m_selected)
                    return;
                self._onChangeRandomPlayback(e);
            });
        },

        /**
         Wire UI and listen to change in related UI (random playback on channel)
         @method _listenRandomPlayback
         @return none
         **/
        _listenRepeatToFit: function () {
            var self = this;
            self.m_repeatToFitPlaybackHandler = $(Elements.REPEAT_TO_FIT).on('change', function (e) {
                if (!self.m_selected)
                    return;
                self._onChangeRepeatToFit(e);
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
            pepper.setCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id, 'random_order', state)
        },

        /**
         On change in repeat to fit value update msdb with new value.
         @method _onChangeRepeatToFit
         @param {Event} e
         @return none
         **/
        _onChangeRepeatToFit: function (e) {
            var self = this;
            var state = $(Elements.REPEAT_TO_FIT + ' option:selected').val() == "on" ? 'True' : 'False';
            pepper.setCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id, 'repeat_to_fit', state)
        },

        /**
         Listen to when a resource removing from resources so we can remove corresponding blocks
         @method _listenResourceRemoving
         @return none
         **/
        _listenResourceRemoving: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.REMOVING_RESOURCE, self, function (e) {
                var removingResourceID = e.edata;
                for (var blockID in self.m_blocks) {
                    if (self.m_blocks[blockID] instanceof BlockImage || self.m_blocks[blockID] instanceof BlockSVG || self.m_blocks[blockID] instanceof BlockVideo) {
                        if (removingResourceID == self.m_blocks[blockID].getResourceID()) {
                            self.deleteBlock(blockID);
                        }
                    }
                }
            });
        },

        /**
         Listen to when a scene removing from scenes so we can remove corresponding blocks
         @method _listenSceneRemoving
         @return none
         **/
        _listenSceneRemoving: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.REMOVING_SCENE, self, function (e) {
                var removingSceneID = e.edata;
                for (var blockID in self.m_blocks) {
                    if (self.m_blocks[blockID] instanceof BlockScene) {
                        var sceneID = self.m_blocks[blockID].getChannelBlockSceneID();
                        if (removingSceneID == sceneID) {
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

            var recChannel = pepper.getCampaignTimelineChannelRecord(self.m_campaign_timeline_chanel_id);
            var stateRandom = recChannel['random_order'] == 'True' ? 'on' : 'off';
            var stateRepeat = recChannel['repeat_to_fit'] == 'True' ? 'on' : 'off';
            //$(Elements.RANDOM_PLAYBACK + ' option[value=' + stateRandom + ']').attr("selected", "selected");
            //$(Elements.REPEAT_TO_FIT + ' option[value=' + stateRepeat + ']').attr("selected", "selected");
            $(Elements.RANDOM_PLAYBACK).selectpicker('val',stateRandom);
            $(Elements.REPEAT_TO_FIT).selectpicker('val',stateRepeat);
            self.m_property.selectView(Elements.CHANNEL_PROPERTIES);
        },

        /**
         Listen to even when timeline is selected and it it's this instance's channel_id, populate properties panel.
         @method _onTimelineChannelSelected
         @return none
         **/
        _onTimelineChannelSelected: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, self, function (e) {
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
            var blockIDs = pepper.getChannelBlocks(self.m_campaign_timeline_chanel_id);
            for (var i = 0; i < blockIDs.length; i++) {
                var blockID = blockIDs[i];
                var recBlock = pepper.getBlockRecord(blockID);
                self.createChannelBlock(blockID, recBlock['player_data'])
            }
            BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANGED, self);
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
                var recBlock = pepper.getBlockRecord(block_id);
                var player_data = pepper.getBlockRecord(block_id)['player_data'];
                var domPlayerData = $.parseXML(player_data);
                var sceneHandle = $(domPlayerData).find('Player').attr('player');
                // workaround to remove scenes listed inside table campaign_timeline_chanel_players
                if (sceneHandle == '3510')
                    continue;
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
            pepper.removeChannelFromTimeline(self.m_campaign_timeline_chanel_id);
            for (var blockID in self.m_blocks) {
                self.deleteBlock(blockID);
            }
            self._reset();
        },

        /**
         Delete a block from the channel
         @method deleteBlock
         @param {Number} i_block_id
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         @return none
         **/
        deleteBlock: function (i_block_id, i_memoryOnly) {
            var self = this;
            self.m_blocks[i_block_id].deleteBlock(i_memoryOnly);
            delete self.m_blocks[i_block_id];
        }
    });

    return Channel;
});