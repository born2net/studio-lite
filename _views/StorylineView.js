/**
 StoryLineView module manages the Timeline > Channels UI while displaying the visual length over time for each block on the selected channel
 @class StorylineView
 @constructor
 @param {String}
 @return {Object} instantiated StorylineView
 **/
define(['jquery', 'backbone', 'text', 'text!_templates/_storyboard.html'], function ($, Backbone, text, storylineTemplate) {

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
            self.m_blockZindex = 3; // future drag support
            BB.comBroker.setService(BB.SERVICES.STORYLINE, self);
            BB.comBroker.listen(BB.EVENTS.SIDE_PANEL_SIZED, $.proxy(self._updateWidth, self));
            self._listenReset();
            self._listenTimelineSelected();
            self._listenTimelineChanged();
            self._listenBlockSelection();
            self._listenTimelineBlockRemoved();
            self._listenStackViewSelected();
            self._listenToggleStorylineCollapsible();
            self._listenAppResized();
            self._listenContextMenu();
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
                    self.m_storylineContainerSnippet = $(storylineTemplate).find(Elements.STORYLINE_CONTAINER).parent();
                    self.m_TableSnippet = $(storylineTemplate).find('table').parent();
                    self.m_ChannelSnippet = $(storylineTemplate).find(Elements.CLASS_STORYLINE_CHANNEL).parent();
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
         Listen to reset of when switching to different campaign so we forget current state
         @method _listenReset
         **/
        _listenReset: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_RESET, function () {
                self.m_storyWidth = 0;
                self.m_selectedTimelineID = undefined;
                self.m_selectedBlockID = undefined;
                self.m_selectedChannel = undefined;
            });
        },

        /**
         Anytime the containing StackView is selected, re-render the Storyline as resources or scenes could have been
         removed while we were gone
         @method _listenStackViewSelected
         **/
        _listenStackViewSelected: function () {
            var self = this;
            var appContentFaderView = BB.comBroker.getService(BB.SERVICES['APP_CONTENT_FADER_VIEW']);
            var campaignSliderStackView = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_SLIDER_STACK_VIEW']);

            campaignSliderStackView.on(BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == BB.comBroker.getService(BB.SERVICES['CAMPAIGN_VIEW'])) {
                    setTimeout(function () {
                        self._updateWidth();
                        self._render();
                    }, 500);
                }
            });
            appContentFaderView.on(BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == BB.comBroker.getService(BB.SERVICES['CAMPAIGN_MANAGER_VIEW'])) {
                    setTimeout(function () {
                        self._updateWidth();
                        self._render();
                    }, 500);
                }
            });
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
         Listen to when the app is resized so we can re-render
         @method _listenAppResized
         **/
        _listenAppResized: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, function (e) {
                self._updateWidth();
                self._render();
            });
        },

        /**
         Add block selection by marking it on the storyline and remembering selection
         @method _addBlockSelection
         @param {Number} i_blockID
         **/
        _addBlockSelection: function (i_blockID) {
            var self = this;
            if (_.isUndefined(i_blockID))
                return;
            self._removeBlockSelection();
            self.m_selectedBlockID = i_blockID;
            var blockElem = $(Elements.STORYLINE_CONTAINER).find('[data-timeline_channel_block_id="' + i_blockID + '"]');
            $(blockElem).addClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK_SELECTED));
        },

        /**
         Add channel selection by marking it on the storyline and remembering selection
         @method _addChannelSelection
         @param {Number} i_selectedChannel
         **/
        _addChannelSelection: function (i_selectedChannel) {
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
        _removeChannelSelection: function () {
            var self = this;
            self.m_selectedChannel = undefined;
            $(Elements.CLASS_CHANNEL_HEAD_SELECTED, Elements.STORYLINE_CONTAINER).removeClass(BB.lib.unclass(Elements.CLASS_CHANNEL_HEAD_SELECTED));
        },

        /**
         Remove currently selected block by removing selection as well forgetting it
         @method _removeBlockSelection
         **/
        _removeBlockSelection: function () {
            var self = this;
            self.m_selectedBlockID = undefined;
            $(Elements.CLASS_TIMELINE_BLOCK, Elements.STORYLINE_CONTAINER).removeClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK_SELECTED));
        },

        /**
         Build the UI for the top seconds / minutes scala of the storyline
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
            var timeline = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_VIEW']).getTimelineInstance(self.m_selectedTimelineID);
            var channel = timeline.getChannelInstance(i_campaign_timeline_chanel_id);
            var blocks = channel.getBlocks();
            var snippet, totalPercent = 0;
            for (var block in blocks) {
                var blockData = blocks[block].getBlockData();
                var blockID = blockData.blockID;
                var fontAwesome = blocks[block].getBlockData().blockFontAwesome;
                var totalDuration = parseInt(pepper.getTimelineTotalDuration(self.m_selectedTimelineID));
                var blockDuration = pepper.getBlockTimelineChannelBlockLength(blockID).totalInSeconds;
                var percent = (parseFloat(blockDuration) / parseFloat(totalDuration) * 100);
                totalPercent += percent;

                var blockWidth = (self.m_storyWidth * percent) / 100;
                if (blockWidth < 1)
                    continue;
                if (blockWidth < 25) {
                    snippet = '<div class="timelineBlock" data-timeline_channel_block_id="' + blockID + '" style="width: ' + percent + '%;"></div>';
                } else {
                    snippet = '<div class="timelineBlock" data-timeline_channel_block_id="' + blockID + '" style="width: ' + percent + '%;"><i style="font-size: 14px"  class="fa ' + fontAwesome + '"></i></div>';

                    /* future support draggable */
                    // snippet = '<div class="draggable ui-widget-content ui-draggable ui-draggable-handle timelineBlock" data-timeline_channel_block_id="' + blockID + '" style="width: ' + percent + '%;"><i style="font-size: 14px"  class="fa ' + fontAwesome + '"></i></div>';

                }
                /* future support draggable */
                // setTimeout(function(){
                //    $(".timelineBlock").draggable({
                //        axis: "x",
                //        start: function(event, ui) { $(this).css("z-index", self.m_blockZindex++); }
                //    });
                //},700);

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
                self._deselection();
                self.m_selectedTimelineID = e.edata;
                self._render();
            });
        },

        /**
         Forget all current selections
         @method _deselection
         **/
        _deselection: function () {
            var self = this;
            self.m_selectedTimelineID = undefined;
            self.m_selectedBlockID = undefined;
            self.m_selectedChannel = undefined;
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
            $(Elements.CLASS_TIMELINE_BLOCK).off('click contextmenu');
            $(Elements.CLASS_TIMELINE_BLOCK).on('click contextmenu', function (e) {
                $.proxy(self._blockSelected(e), self);

                /* future support draggable */
                // $(this).addClass('top').removeClass('bottom');
                // $(this).siblings().removeClass('top').addClass('bottom');
                // $(this).css("z-index", self.m_blockZindex++);
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
            if (e.button == 0) {
                e.stopImmediatePropagation();
                $(Elements.STORYLINE_CONTEXT_MENU).hide();
            }

            var blockElem = $(e.target);

            if (_.isUndefined($(blockElem).attr('class')))
                return true;

            if ($(blockElem).hasClass(BB.lib.unclass(Elements.CLASS_STORYLINE_CHANNEL)))
                blockElem = $(blockElem).find(Elements.CLASS_CHANNEL_HEAD);

            if ($(blockElem).hasClass(BB.lib.unclass(Elements.CLASS_TIMELINE_BLOCK)))
                blockElem = $(blockElem).closest(Elements.CLASS_CHANNEL_BODY);

            var timeline_channel_id = $(blockElem).data('timeline_channel_id');
            var campaign_timeline_board_viewer_id = $(blockElem).data('campaign_timeline_board_viewer_id');

            //if (_.isUndefined(timeline_channel_id) || _.isUndefined(campaign_timeline_board_viewer_id))
            //    return false;

            if (self.m_selectedChannel == timeline_channel_id)
                return true;

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
            return true;
        },

        /**
         When a block is selected within a channel, get the resource element so we can select it and fire
         the BLOCK_SELECTED event
         @method _blockSelected
         @param {Event} e
         **/
        _blockSelected: function (e) {
            var self = this;
            //e.stopImmediatePropagation();
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
            //return false;
        },


        /**
         Toggle the arrow of the collapsible storyline UI widget
         @method _listenToggleStorylineCollapsible
         **/
        _listenToggleStorylineCollapsible: function () {
            var self = this;
            $(Elements.TOGGLE_STORYLINE_COLLAPSIBLE).on('click', function () {
                var toggle = $(this).find('span')[0];
                if ($(toggle).hasClass('glyphicon-chevron-down')) {
                    $(toggle).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right')
                } else {
                    $(toggle).removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down')
                }
                $(Elements.STORYLINE).fadeIn(500).queue(function(){
                    self._render();
                }).dequeue().delay(500).queue(function(){
                    self._render();
                }).dequeue();
            });
        },

        /**
         Listen to any canvas right click
         @method _listenContextMenu
         **/
        _listenContextMenu: function () {
            var self = this;
            $(Elements.STORYLINE).contextmenu({
                target: Elements.STORYLINE_CONTEXT_MENU,
                before: function (e, element, target) {
                    e.preventDefault();
                    //self.m_mouseX = e.offsetX;
                    //self.m_mouseY = e.offsetY;
                    if (_.isUndefined(self.m_selectedBlockID))
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
                case 'nextChannel': {
                    self.selectNextChannel();
                    break;
                }
                case 'addContent': {
                    $(Elements.ADD_BLOCK_BUTTON).trigger('click');
                    break;
                }
                case 'removeContent': {
                    $(Elements.REMOVE_BLOCK_BUTTON).trigger('click');
                    break;
                }
                case 'first': {
                    BB.comBroker.getService(BB.SERVICES.CHANNEL_LIST_VIEW).moveBlockFirst();
                    break;
                }
                case 'last': {
                    BB.comBroker.getService(BB.SERVICES.CHANNEL_LIST_VIEW).moveBlockLast();
                    break;
                }
            }
            return true;
        },

        /**
         Listen to when a timeline block is removed
         @method _listenTimelineBlockRemoved
         @param {Object} e
         **/
        _listenTimelineBlockRemoved: function(){
            var self = this;
            pepper.listen(Pepper.REMOVE_TIMELINE_CHANNEL_BLOCK, function(e){
                self.m_selectedBlockID = undefined;
                self._removeBlockSelection();
            });
        },

        /**
         Select next channel
         @method selectNextChannel
         **/
        selectNextChannel: function () {
            var self = this;
            var timeline_channel_id, campaign_timeline_board_viewer_id;
            var channelsIDs = pepper.getChannelsOfTimeline(self.m_selectedTimelineID);
            if (_.isUndefined(self.m_selectedChannel)) {
                timeline_channel_id = channelsIDs[0];
            } else {
                for (var ch in channelsIDs) {
                    if (channelsIDs[ch] == self.m_selectedChannel) {
                        if (_.isUndefined(channelsIDs[parseInt(ch) + 1])) {
                            timeline_channel_id = channelsIDs[0];
                        } else {
                            timeline_channel_id = channelsIDs[parseInt(ch) + 1];
                        }
                    }
                }
            }
            campaign_timeline_board_viewer_id = pepper.getAssignedViewerIdFromChannelId(timeline_channel_id);
            var screenData = {
                m_owner: self,
                campaign_timeline_id: self.m_selectedTimelineID,
                campaign_timeline_board_viewer_id: campaign_timeline_board_viewer_id
            };
            self._removeBlockSelection();
            self._addChannelSelection(timeline_channel_id);
            BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']).selectViewer(screenData.campaign_timeline_id, screenData.campaign_timeline_board_viewer_id);
            BB.comBroker.fire(BB.EVENTS.ON_VIEWER_SELECTED, this, screenData);
            BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, self.m_selectedChannel);
        }
    });

    return StorylineView;

});