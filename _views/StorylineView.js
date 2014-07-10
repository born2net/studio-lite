/**
 StoryLineView module manages the Timeline > Channels UI while displaying the visual length in time for each block on the selected channel
 @class StorylineView
 @constructor
 @param {String}
 @return {Object} instantiated StorylineView
 **/
define(['jquery', 'backbone', 'text', 'text!_templates/_storyboard.html'], function ($, Backbone, text, storyBoardTemplate) {

    /**
     Custom event fired when a block is selected on the storyline
     @event STORYLINE_BLOCK_SELECTED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    BB.EVENTS.STORYLINE_BLOCK_SELECTED = 'STORYLINE_BLOCK_SELECTED';

    BB.SERVICES.STORYLINE = 'StoryLine';

    var StorylineView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_storyWidth = 0;
            self.m_owner = self;
            self.m_selectedTimelineID = undefined;
            self.m_selectedBlockID = undefined;
            self.m_selectedChannel = undefined;
            BB.comBroker.listen(BB.EVENTS.SIDE_PANEL_SIZED, $.proxy(self._updateWidth, self));
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, $.proxy(self._updateWidth, self));
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, $.proxy(self._render, self));
            self._listenTimelineSelected();
            self._listenTimelineChanged();
            self._listenBlockSelection();
            self._updateWidth();
        },

        /**
         Draw a fresh storyline for current timeline
         @method _render
         **/
        _render: function () {
            var self = this;
            if (_.isUndefined(self.m_render)) {
                self.m_render = _.debounce(function () {
                    $(Elements.STORYLINE).empty();
                    self.m_storylineContainerSnippet = $(storyBoardTemplate).find(Elements.STORYLINE_CONTAINER).parent();
                    self.m_TableSnippet = $(storyBoardTemplate).find('table').parent();
                    self.m_ChannelSnippet = $(storyBoardTemplate).find(Elements.CLASS_STORYLINE_CHANNEL).parent();
                    self._populateScala();
                    self._populateChannels();
                    self._listenSelections();
                    self._addBlockSelection(self.m_selectedBlockID);
                    self._addChannelSelection(self.m_selectedChannel);
                }, 100);
            }
            self.m_render();
        },

        /**
         Listen for block selection
         @method _listenBlockSelection
         **/
        _listenBlockSelection: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.BLOCK_SELECTED, function (e) {
                var blockID = e.edata;
                if (!_.isNumber(blockID)) // ignore scene blocks
                    return;
                self._addBlockSelection(blockID);
            });
        },

        /**
         Add block selection by marking it on the storyboard and remembering selection
         @method _addBlockSelection
         @param {Number} i_blockID
         **/
        _addBlockSelection: function(i_blockID){
            var self = this;
            if (_.isUndefined(i_blockID))
                return;
            self._removeBlockSelection();
            self.m_selectedBlockID = i_blockID;
            var blockElem = $(Elements.STORYLINE_CONTAINER).find('[data-timeline_channel_block_id="' + i_blockID + '"]');
            $(blockElem).addClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK_SELECTED));
        },

        /**
         Add channel selection by marking it on the storyboard and remembering selection
         @method _addChannelSelection
         @param {Number} i_selectedChannel
         **/
        _addChannelSelection: function(i_selectedChannel){
            var self = this;
            if (_.isUndefined(i_selectedChannel))
                return;
            self._removeChannelSelection();
            self.m_selectedChannel = i_selectedChannel;
            var blockElem = $(Elements.STORYLINE_CONTAINER).find('[data-timeline_channel_id="' + i_selectedChannel + '"]');
            blockElem = $(blockElem).filter('.channelHead');
            $(blockElem).addClass(BB.lib.unclass(Elements.CLASS_CHANNEL_HEAD_SELECTED));
        },

        /**
         Remove currently selected channel by removing selection as well forgetting it
         @method _removeChannelSelection
         **/
        _removeChannelSelection: function(){
            var self = this;
            self.m_selectedChannel = undefined;
            $(Elements.CLASS_CHANNEL_HEAD_SELECTED, Elements.STORYLINE_CONTAINER).removeClass(BB.lib.unclass(Elements.CLASS_CHANNEL_HEAD_SELECTED));
        },

        /**
         Remove currently selected block by removing selection as well forgetting it
         @method _removeBlockSelection
         **/
        _removeBlockSelection: function(){
            var self = this;
            self.m_selectedBlockID = undefined;
            $(Elements.CLASS_TIMELINE_BLOCK, Elements.STORYLINE_CONTAINER).removeClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK_SELECTED));
        },

        /**
         Build the UI for the top seconds / minutes scala of the storyboard
         @method _populateScala
         **/
        _populateScala: function () {
            var self = this, i;
            var ticks = [];
            var format = 's';
            var totalDuration = parseInt(pepper.getTimelineTotalDuration(self.m_selectedTimelineID));
            if (totalDuration > 420) {
                totalDuration = totalDuration / 60;
                format = 'm';
            }

            var tick = totalDuration / 4;
            for (i = 1; i < 5; i++) {
                tick = BB.lib.parseToFloatDouble(tick);
                ticks.push(tick * i);
            }

            ticks.unshift(0);
            ticks[ticks.length - 1] = totalDuration;
            var l = String((ticks[ticks.length - 1]).toFixed(2)).length;
            var lastTick = '';
            var scalaRuler = $(self.m_TableSnippet).find(Elements.CLASS_SCALA_RULER);
            for (i = 0; i < ticks.length; i++) {
                if (i == ticks.length - 1)
                    lastTick = 'width="1%"'
                var value = BB.lib.padZeros(BB.lib.parseToFloatDouble(ticks[i]), l) + format; // log(value);
                $(scalaRuler).append('<td class="scalaNum"' + lastTick + ' >' + value + '</td>');
            }
            $(Elements.STORYLINE).append(self.m_TableSnippet);
        },

        /**
         Populate UI channels
         @method _populateChannels
         **/
        _populateChannels: function () {
            var self = this;
            var channelsIDs = pepper.getChannelsOfTimeline(self.m_selectedTimelineID);
            for (var n = 0; n < channelsIDs.length; n++) {
                var channelID = channelsIDs[n];
                var channelSnippet = _.template(_.unescape(self.m_ChannelSnippet.html()), {value: n + 1});
                var viewerID = pepper.getAssignedViewerIdFromChannelId(channelID);
                $(self.m_storylineContainerSnippet).find('section').append(channelSnippet);
                var channelHead = $(self.m_storylineContainerSnippet).find(Elements.CLASS_CHANNEL_HEAD + ':last');
                var channelBody = $(self.m_storylineContainerSnippet).find(Elements.CLASS_CHANNEL_BODY + ':last');
                $(channelHead).attr('data-timeline_channel_id', channelID);
                $(channelBody).attr('data-timeline_channel_id', channelID);
                $(channelHead).attr('data-campaign_timeline_board_viewer_id', viewerID);
                $(channelBody).attr('data-campaign_timeline_board_viewer_id', viewerID);
                self._populateBlocks(channelID);
            }
            $(Elements.STORYLINE).append(self.m_storylineContainerSnippet);
            self._updateWidth();
            setTimeout(function () {
                self._updateWidth();
            }, 5)
        },

        /**
         Populate UI blocks
         @method _populateBlocks
         @params {Number} i_campaign_timeline_chanel_id
         **/
        _populateBlocks: function (i_campaign_timeline_chanel_id) {
            var self = this;
            var label;
            var timeline = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_VIEW']).getTimelineInstance(self.m_selectedTimelineID);
            var channel = timeline.getChannelInstance(i_campaign_timeline_chanel_id);
            var blocks = channel.getBlocks();
            for (var block in blocks) {
                var blockData = blocks[block].getBlockData();
                var blockID = blockData.blockID;
                var totalDuration = parseInt(pepper.getTimelineTotalDuration(self.m_selectedTimelineID));
                var blockDuration = pepper.getBlockTimelineChannelBlockLength(blockID).totalInSeconds;
                var percent = Math.floor((parseFloat(blockDuration) / parseFloat(totalDuration) * 100));
                var recBlock = pepper.getBlockRecord(blockID);
                var blockType = $(recBlock.player_data).attr('player') != undefined ? $(recBlock.player_data).attr('player') : '3510';
                var color = BB.PepperHelper.getBlockBoilerplate(blockType).color;
                var acronym = BB.PepperHelper.getBlockBoilerplate(blockType).acronym;

                var blockWidth = (self.m_storyWidth * percent) / 100;
                if (blockWidth < 50) {
                    label = '';
                } else {
                    label = $(recBlock).attr('label');
                    if (_.isEmpty(label))
                        label = acronym;
                }
                var snippet = '<div class="timelineBlock" data-timeline_channel_block_id="' + blockID + '" style="width: ' + percent + '%; background-color: ' + color + '"><span>' + label + '</span></div>';
                $(self.m_storylineContainerSnippet).find('.channelBody:last').append(snippet);
            }
        },

        /**
         Compute the storyline UI width total width
         @method _updateWidth
         **/
        _updateWidth: function () {
            var self = this;
            self.m_storyWidth = parseInt($(Elements.STORYLINE_CONTAINER).width()) - 25;
            $(Elements.CLASS_CHANNEL_BODY_CONTAINER).width(self.m_storyWidth);
        },

        /**
         Listen to changes in the timeline (channel, block length etc) so we can re-render the storyline
         @method _listenTimelineChanged
         **/
        _listenTimelineChanged: function () {
            var self = this;
            pepper.listen(Pepper.BLOCK_LENGTH_CHANGED, $.proxy(self._render, self));
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_TIMELINE_CHANGED, function () {
                self._render();
            })
        },

        /**
         Listen to a new timeline selection so we can re-render the storyline
         @method _listenTimelineSelected
         **/
        _listenTimelineSelected: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, function (e) {
                self.m_selectedTimelineID = e.edata;
                self._render();
            });
        },

        /**
         Listen to channel selection so we can re-render storyline
         @method _listenSelections
         **/
        _listenSelections: function () {
            var self = this;
            $(Elements.CLASS_CHANNEL_HEAD).off('click');
            $(Elements.CLASS_CHANNEL_HEAD).on('click', function (e) {
                $.proxy(self._blockChannelSelected(e), self);
                BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, self.m_selectedChannel);
            });
            $(Elements.CLASS_STORYLINE_CHANNEL).off('click');
            $(Elements.CLASS_STORYLINE_CHANNEL).on('click', function (e) {
                $.proxy(self._blockChannelSelected(e), self);
                BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, self.m_selectedChannel);
            });
            $(Elements.CLASS_TIMELINE_BLOCK).off('click');
            $(Elements.CLASS_TIMELINE_BLOCK).on('click', function (e) {
                $.proxy(self._blockSelected(e), self);
            });
        },

        /**
         When a block is selected within a channel, get the resource element so we can select it and fire
         the BLOCK_SELECTED event
         @method _blockSelected
         @param {Event} e
         **/
        _blockChannelSelected: function (e) {
            var self = this;
            var chHead;
            e.stopImmediatePropagation();
            var blockElem = $(e.target);

            if (_.isUndefined($(blockElem).attr('class')))
                return false;

            if ( $(blockElem).hasClass(BB.lib.unclass(Elements.CLASS_STORYLINE_CHANNEL)))
                blockElem = $(blockElem).find(Elements.CLASS_CHANNEL_HEAD);

            if ( $(blockElem).hasClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK)))
                blockElem = $(blockElem).closest(Elements.CLASS_CHANNEL_BODY);

            var timeline_channel_id = $(blockElem).data('timeline_channel_id');
            var campaign_timeline_board_viewer_id = $(blockElem).data('campaign_timeline_board_viewer_id');

            if (self.m_selectedChannel == timeline_channel_id)
                return false;

            self.m_selectedChannel = timeline_channel_id;
            var screenData = {
                m_owner: self,
                campaign_timeline_id: self.m_selectedTimelineID,
                campaign_timeline_board_viewer_id: campaign_timeline_board_viewer_id
            };
            self._removeBlockSelection();
            self._addChannelSelection(self.m_selectedChannel);
            var sequencer = BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']);
            sequencer.selectViewer(screenData.campaign_timeline_id, screenData.campaign_timeline_board_viewer_id);
            BB.comBroker.fire(BB.EVENTS.ON_VIEWER_SELECTED, this, screenData);
            return false;
        },

        /**
         When a block is selected within a channel, get the resource element so we can select it and fire
         the BLOCK_SELECTED event
         @method _blockSelected
         @param {Event} e
         **/
        _blockSelected: function (e) {
            var self = this;
            e.stopImmediatePropagation();
            var blockElem = $(e.target);
            self.selected_block_id = $(blockElem).data('timeline_channel_block_id');
            // if label was selected
            if (_.isUndefined(self.selected_block_id)) {
                blockElem = $(e.target).parent();
                self.selected_block_id = $(blockElem).data('timeline_channel_block_id');
            }
            e.target = blockElem[0];
            self._blockChannelSelected(e);
            BB.comBroker.fire(BB.EVENTS.STORYLINE_BLOCK_SELECTED, this, null, self.selected_block_id);
            $(blockElem).addClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK_SELECTED));
            return false;
        }
    });

    return StorylineView;

});