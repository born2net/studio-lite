/**
 This class manages the UI of all blocks within a channel as well as the ability to sort and reorder the content of a channel
 @class ChannelListView
 @constructor
 @return {Object} instantiated CompCampaignNavigator
 **/
define(['jquery', 'backbone', 'jqueryui', 'TouchPunch', 'Timeline', 'SequencerView', 'ResourceListView', 'StorylineView'], function ($, Backbone, jqueryui, TouchPunch, Timeline, SequencerView, ResourceListView, StorylineView) {

    BB.SERVICES.CHANNEL_LIST_VIEW = 'ChannelListView';

    var ChannelListView = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;

            this.m_property = BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW);
            this.selected_block_id = undefined;
            this.selected_campaign_timeline_chanel_id = undefined;
            this.selected_campaign_timeline_id = undefined;
            this.selected_campaign_timeline_board_viewer_id = undefined;

            $(Elements.SORTABLE).sortable();
            $(Elements.SORTABLE).disableSelection();
            $(Elements.SORTABLE).bind("sortstop", function (event, ui) {
                self._reOrderChannelBlocks();
            });

            self._listenAddRemoveBlocks();
            self._listenTimelineSelected();
            self._listenResourceRemoved();
            self._listenSceneRemoved();
            self._listenBlockLengthChanged();
            self._listenStorylineBlockSelected();
            self._listenStorylineChannelSelected();
            self._listenReset();
            self._listenContextMenu();
            pepper.listen(Pepper.TIMELINE_DELETED, $.proxy(self._onTimelineDeleted, self));

        },

        /**
         Listen to reset of when switching to different campaign so we forget current state
         @method _listenReset
         **/
        _listenReset: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_RESET, function(){
                self.selected_block_id = undefined;
                self.selected_campaign_timeline_chanel_id = undefined;
                self.selected_campaign_timeline_id = undefined;
                self.selected_campaign_timeline_board_viewer_id = undefined;
            });
        },

        /**
         Wire the UI and listen to channel remove and channel add button events.
         @method _listenAddRemoveBlocks
         @return none
         **/
        _listenAddRemoveBlocks: function () {
            var self = this;
            $(Elements.REMOVE_BLOCK_BUTTON).on('click', function (e) {
                if (_.isUndefined(self.selected_block_id)) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_SELECT_RESOURCE).text());
                    return;
                }
                self._deleteChannelBlock(self.selected_block_id);
            });
            $(Elements.ADD_BLOCK_BUTTON).on('click', function (e) {
                if (_.isUndefined(self.selected_campaign_timeline_id)) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_SELECT_CHANNEL).text());
                    return;
                }
                self._openAddBlockWizard(e);
            });
        },

        /**
         Wire the UI for timeline deletion.
         @method _onTimelineDeleted
         @return none
         **/
        _onTimelineDeleted: function () {
            var self = this;
            $(Elements.ADD_BLOCK_BUTTON).fadeOut();
            $(Elements.REMOVE_BLOCK_BUTTON).fadeOut();
            $(Elements.TIMELIME_PREVIEW).fadeOut();
            self._resetChannel();
        },

        /**
         Update the blocks offset times according to current order of LI elements and reorder accordingly in msdb.
         @method _reOrderChannelBlocks
         @return none
         **/
        _reOrderChannelBlocks: function () {
            var self = this
            var blocks = $(Elements.SORTABLE).children();
            var playerOffsetTime = 0;
            $(blocks).each(function (i) {
                var block_id = $(this).data('block_id');
                var recBlock = pepper.getBlockRecord(block_id);
                var playerDuration = recBlock['player_duration']
                pepper.setBlockRecord(block_id, 'player_offset_time', playerOffsetTime);
                log('player ' + block_id + ' offset ' + playerOffsetTime + ' playerDuration ' + playerDuration);
                playerOffsetTime = parseFloat(playerOffsetTime) + parseFloat(playerDuration);
            });
            pepper.calcTimelineTotalDuration(this.selected_campaign_timeline_id);
            BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANGED, self);
            BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.selected_block_id);
        },

        /**
         Get the total duration in seconds of the channel
         @method _getTotalDurationChannel
         @return {Number} totalChannelLength
         **/
        _getTotalDurationChannel: function () {
            var self = this
            var blocks = $(Elements.SORTABLE).children();
            var blocksIDs = [];
            $(blocks).each(function (i) {
                var block_id = $(this).data('block_id');
                blocksIDs.push(block_id);
            });
            var totalChannelLength = pepper.getTotalDurationOfBlocks(blocksIDs);
            return totalChannelLength;
        },

        /**
         Launch the add new block wizard UI component.
         @method _openAddBlockWizard
         @return none
         **/
        _openAddBlockWizard: function (e) {
            var self = this;
            var addBlockView = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_VIEW);
            addBlockView.selectView();
            BB.comBroker.listenOnce(BB.EVENTS.ADD_NEW_BLOCK_CHANNEL, function (e) {
                self._createNewChannelBlock(e.edata.blockCode, e.edata.resourceID, e.edata.sceneID);
                e.stopImmediatePropagation();
                e.preventDefault();
            });
        },

        /**
         Create a new block (player) on the current channel and refresh UI bindings such as properties open events.
         @method _createNewChannelBlock
         @param {Number} i_blockID
         @param {Number} i_resourceID optional param used when creating a block with embedded resource (i.e.: video / image / swf)
         @param {Number} i_sceneID optional param used when creating a block with embedded scene
         @return {Boolean} false
         **/
        _createNewChannelBlock: function (i_blockID, i_resourceID, i_sceneID) {
            var self = this;
            var totalChannelLength = self._getTotalDurationChannel();
            var jData = pepper.createNewChannelPlayer(self.selected_campaign_timeline_chanel_id, i_blockID, totalChannelLength, i_resourceID, i_sceneID);
            var campaign_timeline_chanel_player_id = jData['campaign_timeline_chanel_player_id'];
            var campaign_timeline_chanel_player_data = jData['campaign_timeline_chanel_player_data'];

            var timeline = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getTimelineInstance(self.selected_campaign_timeline_id);
            var channel = timeline.getChannelInstance(self.selected_campaign_timeline_chanel_id);
            channel.createChannelBlock(campaign_timeline_chanel_player_id, campaign_timeline_chanel_player_data);

            var campaign_timeline_board_viewer_id = self.selected_campaign_timeline_board_viewer_id;
            var campaign_timeline_id = self.selected_campaign_timeline_id;
            var campaign_timeline_chanel_id = self.selected_campaign_timeline_chanel_id;

            // self._resetChannel();
            $(Elements.SORTABLE).empty();
            self._loadChannelBlocks(campaign_timeline_id, campaign_timeline_chanel_id);
            self._listenBlockSelected();
            // self._deselectBlocksFromChannel();
            self._selectLastBlockOnChannel();
            self._reOrderChannelBlocks();
            return false;
        },

        /**
         Listen to when a resource has been deleted so we can delete the associated block and re calc channel length
         @method _listenResourceRemoved
         @return none
         **/
        _listenResourceRemoved: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.REMOVED_RESOURCE, function (e) {
                if (self.selected_campaign_timeline_id != undefined && self.selected_campaign_timeline_chanel_id != undefined) {
                    $(Elements.SORTABLE).empty();
                    self._loadChannelBlocks(self.selected_campaign_timeline_id, self.selected_campaign_timeline_chanel_id);
                    self._reOrderChannelBlocks();
                }
            });
        },

        /**
         Listen to when a resource has been deleted so we can delete the associated block and re calc channel length
         @method _listenSceneRemoved
         @return none
         **/
        _listenSceneRemoved: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.REMOVED_SCENE, function () {
                if (self.selected_campaign_timeline_id != undefined && self.selected_campaign_timeline_chanel_id != undefined) {
                    $(Elements.SORTABLE).empty();
                    self._loadChannelBlocks(self.selected_campaign_timeline_id, self.selected_campaign_timeline_chanel_id);
                    self._reOrderChannelBlocks();
                }
            });
        },

        /**
         Listen to the BB.EVENTS.ON_VIEWER_SELECTED so we know when a timeline has been selected.
         Once a timeline selection was done we check if the event if one of a timeline owner or other; if of timeline
         we populate channel list, if latter reset list.
         @method _listenTimelineSelected
         @return none
         **/
        _listenTimelineSelected: function () {
            var self = this;

            BB.comBroker.listen(BB.EVENTS.ON_VIEWER_SELECTED, function (e) {

                self._resetChannel();
                self.selected_campaign_timeline_board_viewer_id = e.caller.campaign_timeline_board_viewer_id;
                self.selected_campaign_timeline_id = e.caller.campaign_timeline_id;

                if (e.context.m_owner instanceof Timeline || e.context.m_owner instanceof StorylineView) {

                    var recCampaignTimelineViewerChanels = pepper.getChannelIdFromCampaignTimelineBoardViewer(self.selected_campaign_timeline_board_viewer_id, self.selected_campaign_timeline_id);
                    self._loadChannelBlocks(self.selected_campaign_timeline_id, recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']);
                    $(Elements.ADD_BLOCK_BUTTON).fadeIn();
                    $(Elements.REMOVE_BLOCK_BUTTON).fadeIn();
                    $(Elements.TIMELIME_PREVIEW).fadeIn();
                }

                if (e.context.m_owner instanceof SequencerView) {
                    self._resetChannel();
                    $(Elements.ADD_BLOCK_BUTTON).fadeOut();
                    $(Elements.REMOVE_BLOCK_BUTTON).fadeOut();
                    $(Elements.TIMELIME_PREVIEW).fadeOut();
                }
            });
        },

        /**
         Load the channel list with its own blocks and refresh the UI.
         @method _loadChannelBlocks
         @param {Number} i_campaign_timeline_id
         @param {Number} i_campaign_timeline_chanel_id
         @return none
         **/
        _loadChannelBlocks: function (i_campaign_timeline_id, i_campaign_timeline_chanel_id) {
            var self = this;

            self.selected_campaign_timeline_chanel_id = i_campaign_timeline_chanel_id;

            var timeline = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_VIEW']).getTimelineInstance(i_campaign_timeline_id);
            var channel = timeline.getChannelInstance(i_campaign_timeline_chanel_id);
            var blocks = channel.getBlocks();
            var xdate = BB.comBroker.getService('XDATE');

            for (var block in blocks) {
                var blockData = blocks[block].getBlockData();
                var duration = pepper.getBlockTimelineChannelBlockLength(blockData.blockID).totalInSeconds;
                var durationFormatted = xdate.clearTime().addSeconds(duration).toString('HH:mm:ss');
                $(Elements.SORTABLE).append($('<li class="' + BB.lib.unclass(Elements.CLASS_CHANNEL_LIST_ITEMS) + '  list-group-item" data-block_id="' + blockData.blockID + '">' +
                    '<a href="#">' +
                    //'<img  class="img-responsive" src="' + blockData.blockIcon + '"/>' +
                    '<i class="fa ' + blockData.blockFontAwesome + '"></i>'+
                    '<span>' + blockData.blockName + '</span>' +
                    '<span class="' + BB.lib.unclass(Elements.CLASS_BLOCK_LENGTH_TIMER) + '">' + durationFormatted + '</span>' +
                    '</a>' +
                    '</li>'));
            }
            self._listenBlockSelected();
        },

        /**
         Listen when a block is selected, if its properties need to be open than open panel.
         Also, reference the selected block internally and fire event announcing it was selected.
         We also load required AMD moduels if this is the first time a block was selected (i.e.: modules
         were never loaded yet) and when they finish loaded we continue with thread execution.
         @method _listenBlockSelected
         @return none
         **/
        _listenBlockSelected: function () {
            var self = this;
            // clear previous listeners
            $(Elements.CLASS_CHANNEL_LIST_ITEMS).off('click');
            $(Elements.CLASS_CHANNEL_LIST_ITEMS).on('click contextmenu', function (e) {
                $.proxy(self._listenChannelBlockSelected(e), self);
            });
        },

        /**
         When block is selected within a channel, get the resource element so we can select it and fire
         the BLOCK_SELECTED event
         @method _listenChannelBlockSelected
         @param {Event} e
         **/
        _listenChannelBlockSelected: function (e) {
            var self = this;
            var resourceElem = $(e.target).closest('li');
            self.selected_block_id = $(resourceElem).data('block_id');
            BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.selected_block_id);
            $(Elements.CLASS_CHANNEL_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
            $(resourceElem).addClass('activated').find('a').addClass('whiteFont');
            return false;
        },

        /**
         Listen to when a channel is selected, but through the storyline so we can re-select appropriate block in channel list
         @method _listenStorylineChannelSelected
         **/
        _listenStorylineChannelSelected: function(){
            var self = this;
            BB.comBroker.listen(BB.EVENTS['STORYLINE_CHANNEL_SELECTED'], function(e){
                self.selected_block_id = e.edata;
                var resourceElem = $(Elements.CHANNEL_LIST_VIEW).find('[data-block_id="' + self.selected_block_id + '"]');
                BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.selected_block_id);
                $(Elements.CLASS_CHANNEL_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(resourceElem).addClass('activated').find('a').addClass('whiteFont');
                return false;
            });
        },

        /**
         When a block is selected within a storyline get the resource element so we can select it and fire global block selection event
         @method _listenStorylineBlockSelected
         @param {Event} e
         **/
        _listenStorylineBlockSelected: function (e) {
            var self = this;
            BB.comBroker.listen(BB.EVENTS['STORYLINE_BLOCK_SELECTED'], function(e){
                self.selected_block_id = e.edata;
                var resourceElem = $(Elements.CHANNEL_LIST_VIEW).find('[data-block_id="' + self.selected_block_id + '"]');
                BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.selected_block_id);
                $(Elements.CLASS_CHANNEL_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(resourceElem).addClass('activated').find('a').addClass('whiteFont');
                return false;
            });
        },

        /**
         Forget the selected channel and reset channel member references
         @method _resetChannel
         **/
        _resetChannel: function () {
            var self = this;
            $(Elements.SORTABLE).empty();
            self.selected_block_id = undefined;
            self.selected_campaign_timeline_board_viewer_id = undefined;
            self.selected_campaign_timeline_id = undefined;
            self.selected_campaign_timeline_chanel_id = undefined;
        },

        /**
         Reset the UI when no block on channel is selected.
         @method _deselectBlocksFromChannel
         **/
        _deselectBlocksFromChannel: function () {
            var self = this;
            self.selected_block_id = undefined;
            self.m_property.resetPropertiesView();
        },

        /**
         Listen to when a block length has changed so we can update all other blocks offset respectively
         @method _listenBlockLengthChanged
         @return none
         **/
        _listenBlockLengthChanged: function () {
            var self = this;
            pepper.listen(Pepper.BLOCK_LENGTH_CHANGED, $.proxy(self._onBlockLengthChanged, self));
        },

        /**
         Listen to when a block on channel is modified with respect to its length
         @method _onBlockLengthChanged
         @param {Event} e block changed data
         **/
        _onBlockLengthChanged: function (e) {
            var self = this;
            var block_id = e.edata.campaignTimelineChanelPlayerID;
            var duration = e.edata.totalSeconds;
            var selectedLI = $(Elements.SORTABLE).find('[data-block_id="' + block_id + '"]');
            self.m_xdate = BB.comBroker.getService('XDATE');
            var durationFormated = self.m_xdate.clearTime().addSeconds(duration).toString('HH:mm:ss');
            $(Elements.CLASS_BLOCK_LENGTH_TIMER, selectedLI).text(durationFormated);
            self._reOrderChannelBlocks();
        },

        /**
         Select the last block on the channel (last LI element) and fire a click event on it.
         @method _selectLastBlockOnChannel
         @return none
         **/
        _selectLastBlockOnChannel: function () {
            var self = this
            var blocks = $(Elements.SORTABLE).children();
            var block = undefined;
            $(blocks).each(function (i) {
                block = this;
            });
            if (block)
                $(block).click();
        },

        /**
         Delete the selected block from the channel.
         @method _deleteChannelBlock
         @return none
         **/
        _deleteChannelBlock: function (i_block_id) {
            var self = this;
            var selectedLI = $(Elements.SORTABLE).find('[data-block_id="' + i_block_id + '"]');
            selectedLI.remove();
            var timeline = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getTimelineInstance(self.selected_campaign_timeline_id);
            var channel = timeline.getChannelInstance(self.selected_campaign_timeline_chanel_id);
            channel.deleteBlock(i_block_id);
            self._deselectBlocksFromChannel();
            self._reOrderChannelBlocks();
        },


        /**
         Listen to any canvas right click
         @method _listenContextMenu
         **/
        _listenContextMenu: function () {
            var self = this;
            $(Elements.SORTABLE ).contextmenu({
                target: Elements.CHANNEL_LIST_CONTEXT_MENU,
                before: function (e, element, target) {
                    e.preventDefault();
                    //self.m_mouseX = e.offsetX;
                    //self.m_mouseY = e.offsetY;
                    if (_.isUndefined(self.selected_block_id))
                        return false;
                    return true;
                },
                onItem: function (context, e) {
                    self._onContentMenuSelection($(e.target).attr('name'))
                }
            });
        },

        /**
         On Scene right click context menu selection command
         @method _onContentMenuSelection
         @param {String} i_command
         **/
        _onContentMenuSelection: function (i_command) {
            var self = this;
            var campaign_timeline_id = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getSelectedTimeline();
            if (campaign_timeline_id == -1 || _.isUndefined(campaign_timeline_id))
                return;

            switch (i_command){
                case 'remove': {
                    $(Elements.REMOVE_BLOCK_BUTTON).trigger('click');
                    break;
                }
                case 'first': {
                    self.moveBlockFirst();
                    break;
                }
                case 'last': {
                    self.moveBlockLast();
                    break;
                }
            }
            return true;
        },

        /**
         Move current selected block to be the first to play within the channel
         @method moveBlockFirst
         **/
        moveBlockFirst: function(){
            var self = this;
            var resourceElem = $('.activated',self.$el);
            $(Elements.SORTABLE).prepend($(resourceElem));
            self._reOrderChannelBlocks();
        },

        /**
         Move current selected block to be the last to play within the channel
         @method moveBlockLast
         **/
        moveBlockLast: function(){
            var self = this;
            var resourceElem = $('.activated',self.$el);
            $(Elements.SORTABLE).append($(resourceElem));
            self._reOrderChannelBlocks();
        }
    });

    return ChannelListView;

});