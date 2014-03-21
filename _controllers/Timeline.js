/**
 The timeline instance is created for each timeline in a campaign. It creates its UI, listens to timeline
 event selections, and holds a reference to its own timeline_id.
 The timeline instance also creates channel instances for all the channels it hosts and hold references to these
 channels via m_channels member.
 @class Timeline
 @constructor
 @return {Object} instantiated Timeline
 **/
define(['jquery', 'backbone', 'Channel', 'ScreenTemplateFactory'], function ($, Backbone, Channel, ScreenTemplateFactory) {

    /**
     Custom event fired when a timeline is selected. If a timeline is not of the one selected,
     it ignores the event.
     @event Timeline.CAMPAIGN_TIMELINE_SELECTED
     @param {This} caller
     @param {Self} context caller
     @param {Event} timelineID of the timeline selected
     @static
     @final
     **/
    BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED = 'CAMPAIGN_TIMELINE_SELECTED';

    var Timeline = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            this.m_channels = {}; // hold references to all created channel instances
            this.m_campaign_timeline_id = self.options.campaignTimelineID;
            this.m_timing = 'sequencer';
            this.m_stackViewID = undefined;
            this.m_property = BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW);
            this.m_selected = false;

            self._populateChannels();
            self._populateTimeline();
            self._listenInputChange();
            self._listenScreenLayoutEdit();
            this._onTimelineSelected();

        },

        /**
         Listen to timeline selection events and populate the properties panel accordingly.
         @method _onTimelineSelected
         @return none
         **/
        _onTimelineSelected: function () {
            var self = this;

            BB.comBroker.listen(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, function (e) {
                var timelineID = e.edata;
                if (self.m_campaign_timeline_id != timelineID) {
                    self.m_selected = false;
                    return;
                }

                self.m_selected = true;
                self._propLoadTimeline();
                // log('timeline selected ' + self.m_campaign_timeline_id);

            });
        },

        /**
         Update msdb when the timeline title has changed.
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                jalapeno.setCampaignTimelineRecord(self.m_campaign_timeline_id, 'timeline_name', $(Elements.TIME_LINE_PROP_TITLE_ID).val());
            }, 150, false);
            self.m_inputChangeHandler = $(Elements.TIME_LINE_PROP_TITLE_ID).on("input", onChange);
        },

        /**
         Pull up the screen layout editor
         @method _listenScreenLayoutEdit
         @return none
         **/
        _listenScreenLayoutEdit: function () {
            var self = this;
            self.m_openScreenLayoutEditorHandler = function(e){
                var screenLayoutEditor = BB.comBroker.getService(BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW);
                screenLayoutEditor.selectView();
            };
            $(Elements.EDIT_SCREEN_LAYOUT).on('click',self.m_openScreenLayoutEditorHandler);

        },

        /**
         Populate the timeline property
         @method _listenInputChange
         **/
        _propLoadTimeline: function () {
            var self = this;
            self.m_property.viewPanel(Elements.TIMELINE_PROPERTIES);
            var recTimeline = jalapeno.getCampaignTimelineRecord(self.m_campaign_timeline_id);
            $(Elements.TIME_LINE_PROP_TITLE_ID).val(recTimeline['timeline_name']);
            self._populateTimelineLength();
        },

        /**
         Populate the timeline length in its properties box
         @method _populateTimelineLength
         **/
        _populateTimelineLength: function () {
            var self = this;
            self.m_xdate = BB.comBroker.getService('XDATE');
            var totalDuration = parseInt(jalapeno.getTimelineTotalDuration(self.m_campaign_timeline_id));
            totalDuration = self.m_xdate.clearTime().addSeconds(totalDuration).toString('HH:mm:ss');
            $(Elements.TIMELINE_LENGTH).text(totalDuration);
        },

        /**
         Create the timeline and load up its template (screen divisions) UI
         @method _populateTimeline
         @return none
         **/
        _populateTimeline: function () {
            var self = this;
            var boardTemplateIDs = jalapeno.getTemplatesOfTimeline(self.m_campaign_timeline_id);
            for (var i = 0; i < boardTemplateIDs.length; i++) {
                self._populateBoardTemplate(boardTemplateIDs[i]);
            }
        },

        /**
         Create a channel instance for every channel this timeline hosts
         @method _populateChannels
         @return none
         **/
        _populateChannels: function () {
            var self = this;

            var self = this;
            var channelIDs = jalapeno.getChannelsOfTimeline(self.m_campaign_timeline_id);
            for (var i = 0; i < channelIDs.length; i++) {
                self.m_channels[channelIDs[i]] = new Channel({campaignTimelineChanelID: channelIDs[i]});
            }
        },

        /**
         Load up the board template (screen divisions) for this timeline instance.
         In case sequencer is used, we push it to the sequencer, thus creating the thumbnail template
         inside the sequencer so this timeline can be selected.
         Scheduler future support.
         @method _populateBoardTemplate
         @param {Number} i_campaign_timeline_board_template_id
         @return none
         **/
        _populateBoardTemplate: function (i_campaign_timeline_board_template_id) {
            var self = this;

            var recBoard = jalapeno.getGlobalBoardRecFromTemplate(i_campaign_timeline_board_template_id);
            var width = parseInt(recBoard['board_pixel_width']);
            var height = parseInt(recBoard['board_pixel_height']);

            BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).setResolution(width + 'x' + height);
            if (width > height) {
                BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).setOrientation(BB.CONSTS.HORIZONTAL);
            } else {
                BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).setOrientation(BB.CONSTS.VERTICAL);
            }

            var screenProps = jalapeno.getTemplateViewersScreenProps(self.m_campaign_timeline_id, i_campaign_timeline_board_template_id)
            self._createTimelineUI(screenProps);

            // Future support for scheduler
            switch (self.m_timing) {
                case 'sequencer':
                {
                    var sequences = BB.comBroker.getService(BB.SERVICES.SEQUENCER_VIEW);
                    sequences.createTimelineThumbnailUI(screenProps);
                    break;
                }

                case 'scheduler':
                {
                    break;
                }
            }
        },

        /**
         Create the actual UI for this timeline instance. We use the ScreenTemplateFactory for SVG creation
         and insert the snippet onto timelineViewStack so the timeline UI can be presented when selected.
         @method _createTimelineUI
         @param {Object} i_screenProps template properties object
         @return none
         **/
        _createTimelineUI: function (i_screenProps) {

            var self = this;
            var screenTemplateData = {
                orientation: BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).getOrientation(),
                resolution: BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).getResolution(),
                screenProps: i_screenProps,
                scale: '7'
            }

            var screenTemplate = new ScreenTemplateFactory({
                i_screenTemplateData: screenTemplateData,
                i_type: ScreenTemplateFactory.VIEWER_SELECTABLE,
                i_owner: this});

            var snippet = screenTemplate.create();
            var elemID = $(snippet).attr('id');
            var divID1 = 'selectableScreenCollections' + _.uniqueId();
            var divID2 = 'selectableScreenCollections' + _.uniqueId();

            var snippetWrapper = '<div id="' + divID1 + '" style="display: none">' +
                '<div align="center" >' +
                '<div id="' + divID2 + '" align="center">' +
                '</div>' +
                '</div>' +
                '</div>';

            $(Elements.SELECTED_TIMELINE).append(snippetWrapper);

            var timelineViewStack = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getTimelineViewStack();
            // self.m_stackViewID = timelineViewStack.addChild('#' + divID1);
            $('#' + divID2).append($(snippet));
            screenTemplate.selectablelDivision();
            var view = new BB.View({el: '#' + divID1});
            self.m_stackViewID = timelineViewStack.addView(view);
            screenTemplate.activate();

        },

        /**
         Return the view stack index this timeline occupies in the timelineViewStack manager.
         @method getStackViewID
         @return {Number} m_stackViewID
         **/
        getStackViewID: function () {
            var self = this;
            return self.m_stackViewID;
        },

        /**
         The timeline hold references to all of the channels it creates that exist within it.
         The getChannelInstance returns a specific channel instance for a channel_id.
         @method getChannelInstance
         @param {Number} i_campaign_timeline_chanel_id
         @return {Object} Channel
         **/
        getChannelInstance: function (i_campaign_timeline_chanel_id) {
            var self = this;
            return self.m_channels[i_campaign_timeline_chanel_id];
        },

        /**
         Delete this timeline thus also need to delete all of its related channels
         @method deleteTimeline
         @return none
         **/
        deleteTimeline: function () {
            var self = this;
            $(Elements.TIME_LINE_PROP_TITLE_ID).off("input", self.m_inputChangeHandler);
            var boardTemplateID = jalapeno.getGlobalBoardIDFromTimeline(self.m_campaign_timeline_id);
            jalapeno.removeTimelineFromCampaign(self.m_campaign_timeline_id);
            var campaignTimelineBoardTemplateID = jalapeno.removeBoardTemplateFromTimeline(self.m_campaign_timeline_id);
            jalapeno.removeBoardTemplate(boardTemplateID);
            jalapeno.removeTimelineBoardViewerChannels(campaignTimelineBoardTemplateID);
            jalapeno.removeBoardTemplateViewers(boardTemplateID);
            for (var channel in self.m_channels) {
                self.m_channels[channel].deleteChannel();
                delete self.m_channels[channel];
            }
            $.each(self, function (k) {
                self[k] = undefined;
            });

            $(Elements.EDIT_SCREEN_LAYOUT).off('click',self.m_openScreenLayoutEditorHandler);
        }
    });

    return Timeline;
});