/**
 StoryLineView module manages the Timeline > channels UI while displaying the visual length in time for each block on the selected channel
 @class StorylineView
 @constructor
 @param {String}
 @return {Object} instantiated StorylineView
 **/
define(['jquery', 'backbone', 'text', 'text!_templates/_storyboard.html'], function ($, Backbone, text, storyBoardTemplate) {

    BB.SERVICES.STORYLINE = 'StoryLine';

    var StorylineView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_storyWidth = 0;
            self.m_timelineID = undefined;
            BB.comBroker.listen(BB.EVENTS.SIDE_PANEL_SIZED, $.proxy(self._updateWidth, self));
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, $.proxy(self._updateWidth, self));
            self._listenTimelineSelected();
            self._updateWidth();
        },

        /**
         Draw a fresh storyline for current timelime
         @method _render
         **/
        _render: function (i_timelineID) {
            var self = this;
            self.m_timelineID = i_timelineID;
            $(Elements.STORYLINE).empty();
            self.m_storylineContainerSnippet = $(storyBoardTemplate).find(Elements.STORYLINE_CONTAINER).parent();
            self.m_TableSnippet = $(storyBoardTemplate).find('table').parent();
            self.m_ChannelSnippet = $(storyBoardTemplate).find(Elements.CLASS_STORYLINE_CHANNEL).parent();
            self._populateScala();
            self._populateChannels();
        },

        /**
         Build the UI for the top seconds / minutes scala of the storyboard
         @method _populateScala
         **/
        _populateScala: function () {
            var self = this, i;
            var ticks = [];
            var format = 's';
            var totalDuration = parseInt(pepper.getTimelineTotalDuration(self.m_timelineID));
            if (totalDuration > 420) {
                totalDuration = totalDuration / 60;
                format = 'm';
            }
            var tick = totalDuration / 4;
            for (i = 1; i < 5; i++)
                ticks.push(tick * i);
            ticks.unshift(0);
            ticks[ticks.length - 1] = totalDuration;
            var l = String(Math.round(ticks[ticks.length - 1])).length;
            var scalaRuler = $(self.m_TableSnippet).find(Elements.CLASS_SCALA_RULER);
            for (i = 0; i < ticks.length; i++) {
                var value = BB.lib.padZeros(Math.floor(ticks[i]), l) + format; // log(value);
                $(scalaRuler).append('<td class="scalaNum">' + value + '</td>');
            }
            $(Elements.STORYLINE).append(self.m_TableSnippet);
        },

        _populateChannels: function(){
            var self = this;
            var channelsIDs = pepper.getChannelsOfTimeline(self.m_timelineID);
            for (var n = 0; n < channelsIDs.length; n++) {
                var channelID = channelsIDs[n];
                var channelSnippet  = _.template(_.unescape(self.m_ChannelSnippet.html()), {value: n+1});
                $(self.m_storylineContainerSnippet).find('section').append(channelSnippet);
                self._populateBlocks(channelID);
            }
            $(Elements.STORYLINE).append(self.m_storylineContainerSnippet);
            self._updateWidth();
            setTimeout(function(){
                self._updateWidth();
            },5)
        },

        _populateBlocks: function(i_campaign_timeline_chanel_id){
            var self = this;
            var label;

            var timeline = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_VIEW']).getTimelineInstance(self.m_timelineID);
            var channel = timeline.getChannelInstance(i_campaign_timeline_chanel_id);
            var blocks = channel.getBlocks();
            for (var block in blocks) {
                var blockData = blocks[block].getBlockData();
                var blockID = blockData.blockID;
                var totalDuration = parseInt(pepper.getTimelineTotalDuration(self.m_timelineID));
                var blockDuration = pepper.getBlockTimelineChannelBlockLength(blockID).totalInSeconds;
                var percent = Math.floor((parseFloat(blockDuration) / parseFloat(totalDuration) * 100));
                var recBlock = pepper.getBlockRecord(blockID);
                var blockType = $(recBlock.player_data).attr('player') != undefined ? $(recBlock.player_data).attr('player') : '3510';
                var color = BB.PepperHelper.getBlockBoilerplate(blockType).color;
                var acronym = BB.PepperHelper.getBlockBoilerplate(blockType).acronym;
                if (percent<5) {
                    label = '';
                } else {
                    label = $(recBlock).attr('label');
                    if (_.isEmpty(label)){
                        label = acronym;
                    }
                }

                var snippet = '<div class="timelineBlock" style="width: ' + percent + '%; background-color: ' + color + '"><span>' + label + '</span></div>';
                $(self.m_storylineContainerSnippet).find('.channelBody:last').append(snippet);
            }
        },

        _updateWidth: function () {
            var self = this;
            self.m_storyWidth = parseInt($(Elements.STORYLINE_CONTAINER).width()) - 25;
            $(Elements.CLASS_CHANNEL_BODY_CONTAINER).width(self.m_storyWidth);
        },


        _listenTimelineSelected: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, function (e) {
                log(e.edata);
                self._render(e.edata);
            });
        }
    });

    return StorylineView;

});