/**
 CampaignView manages campaign related logic and UI
 @class CampaignView
 @constructor
 @return {Object} instantiated CampaignView
 **/
define(['jquery', 'backbone', 'SequencerView', 'ChannelListView', 'StackView', 'Timeline', 'ScreenLayoutSelectorView', 'xdate'], function ($, Backbone, SequencerView, ChannelListView, StackView, Timeline, ScreenLayoutSelectorView, xdate) {

    BB.SERVICES.CAMPAIGN_VIEW = 'CampaignView';

    var CampaignView = BB.View.extend({

        /**
         Init the instance and listen to VIEW_CHANGED event so we know when it's time to act.
         If no campaign was selected, we launch the campaign wizard creator, otherwise we populate the campaign / timelines.
         We also use this method to wire the rest of the campaigns elements.
         @method initialize
         @return none
         **/
        initialize: function () {
            var self = this;
            this.m_timelines = {}; // hold references to all created timeline instances
            this.m_timelineViewStack = new StackView.Fader({el: Elements.SELECTED_TIMELINE});
            this.m_selected_timeline_id = -1;
            this.m_selected_campaign_id = -1;
            this.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);

            this.m_sequencerView = new SequencerView({
                el: Elements.SCREEN_LAYOUTS_UL
            });
            BB.comBroker.setService(BB.SERVICES['SEQUENCER_VIEW'], this.m_sequencerView);

            this.m_channelListView = new ChannelListView({
                el: Elements.CHANNEL_LIST_VIEW
            });
            BB.comBroker.setService(BB.SERVICES.CHANNEL_LIST_VIEW, this.m_channelListView);

            self.m_property.initPanel(Elements.CHANNEL_PROPERTIES);
            self.m_property.initPanel(Elements.TIMELINE_PROPERTIES);

            self._listenDelTimeline();
            self._onWireTimeLineOrViewerSelected();
            self._listenAddNewTimeline();
            self._listenToggleTimelinesCollapsible();

            self.m_noneSelectedTimelines = new BB.View({el: Elements.NONE_SELECTED_SCREEN_LAYOUT})
            self.m_timelineViewStack.addView(self.m_noneSelectedTimelines);

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._render();
            });
        },

        /**
         If loading an existing campaign (i.e.: we are not creating a brand new one) we load
         all campaign data from msdb and populate UI
         @method _render
         **/
        _render: function () {
            var self = this;
            self.stopListening(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW);

            // a new campaign was just created
            if (self.m_selected_campaign_id != -1)
                return;

            // a previous campaign was loaded from CampaignSelectorView
            self.m_selected_campaign_id = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_SELECTOR).getSelectedCampaign();
            self._loadTimelinesFromDB();
            self._loadSequencerFirstTimeline();
            self._updatedTimelineLength();
            self._listenTimelineLengthChanged();

        },

        /**
         Load all of the campaign's timelines from msdb and populate the sequencer.
         @method _loadTimelinesFromDB
         @return none
         **/
        _loadTimelinesFromDB: function () {
            var self = this;
            var sequenceOrder = [];

            var timelineIDs = jalapeno.getCampaignTimelines(self.m_selected_campaign_id);
            for (var i = 0; i < timelineIDs.length; i++) {
                var campaign_timeline_id = timelineIDs[i];
                var sequenceIndex = jalapeno.getCampaignTimelineSequencerIndex(campaign_timeline_id);
                sequenceOrder[parseInt(sequenceIndex)] = parseInt(campaign_timeline_id);
            }

            $(sequenceOrder).each(function (sequenceIndex, campaign_timeline_id) {
                // create the timelines
                self.m_timelines[campaign_timeline_id] = new Timeline({campaignTimelineID: campaign_timeline_id});
            });


        },

        /**
         Select the first timeline in the sequencer UI and if fails, select main Campaign > timeline.
         @method _loadSequencerFirstTimeline
         @return none
         **/
        _loadSequencerFirstTimeline: function () {
            var self = this;
            var firstTimelineID = jalapeno.getCampaignTimelineIdOfSequencerIndex(self.m_selected_campaign_id, 0);
            //setTimeout(function () {
                if (self.m_sequencerView.selectTimeline(firstTimelineID) == -1) {
                    self.m_timelineViewStack.selectView(self.m_noneSelectedTimelines);
                }
            //}, 250);
        },

        /**
         This is a key method that we use to listen to fire event of ScreenLayoutSelectorView.ON_VIEWER_SELECTED.
         Upon the event we examine e.context.m_owner to find out who was the owner if the fired event (i.e.: instanceof)
         so we can select tha appropriate campaign or timeline in the UI. See further notes in code.
         @method _onWireTimeLineOrViewerSelected
         @return none
         **/
        _onWireTimeLineOrViewerSelected: function () {
            var self = this;

            BB.comBroker.listen(BB.EVENTS.ON_VIEWER_SELECTED, function (e) {

                var campaign_timeline_board_viewer_id = e.caller.campaign_timeline_board_viewer_id;
                var campaign_timeline_id = e.caller.campaign_timeline_id;
                self.m_selected_timeline_id = campaign_timeline_id;

                ////////////////////////////////////////////////
                //// Timeline selected from Sequencer class
                ////////////////////////////////////////////////

                if (e.context.m_owner instanceof SequencerView) {
                    self.m_timelineViewStack.selectView(self.m_timelines[campaign_timeline_id].getStackViewID());
                    BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);
                    self._updatedTimelineLength();
                    return;
                }

                ////////////////////////////////////////////////
                //// Timeline selected from Timeline class
                ////////////////////////////////////////////////

                if (e.context.m_owner instanceof Timeline) {
                    var recCampaignTimelineViewerChanels = jalapeno.getChannelIdFromCampaignTimelineBoardViewer(campaign_timeline_board_viewer_id, campaign_timeline_id);
                    var campaign_timeline_channel_id = recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']
                    BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, campaign_timeline_channel_id);
                    return;
                }

                ////////////////////////////////////////////////
                //// Timeline selected from TemplateWizard
                ////////////////////////////////////////////////

                var board_id = undefined;
                var campaign_board_id = undefined;

                if (e.context.m_owner instanceof ScreenLayoutSelectorView) {
                    if (self.m_selected_campaign_id == -1) {

                        ////////////////////////////////////////////////
                        // Created a brand new campaign and a new board
                        ////////////////////////////////////////////////

                        var width = BB.comBroker.getService(BB.SERVICES['RESOLUTION_SELECTOR_VIEW']).getResolution().split('x')[0];
                        var height = BB.comBroker.getService(BB.SERVICES['RESOLUTION_SELECTOR_VIEW']).getResolution().split('x')[1];
                        board_id = jalapeno.createBoard('board', width, height);

                        var newTemplateData = jalapeno.createNewTemplate(board_id, e.caller.screenTemplateData.screenProps);
                        var board_template_id = newTemplateData['board_template_id']
                        var viewers = newTemplateData['viewers'];

                        self.m_selected_campaign_id = jalapeno.createCampaign('campaign');
                        campaign_board_id = jalapeno.assignCampaignToBoard(self.m_selected_campaign_id, board_id);

                        // set campaign name
                        var campaignName = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_NAME_SELECTOR_VIEW']).getCampaignName();
                        jalapeno.setCampaignRecord(self.m_selected_campaign_id,'campaign_name',campaignName);

                    } else {

                        ////////////////////////////////////////////////
                        // Add Timeline to an existing campaign
                        ////////////////////////////////////////////////

                        campaign_board_id = jalapeno.getFirstBoardIDofCampaign(self.m_selected_campaign_id);
                        board_id = jalapeno.getBoardFromCampaignBoard(campaign_board_id);
                        var newTemplateData = jalapeno.createNewTemplate(board_id, e.caller.screenTemplateData.screenProps);
                        var board_template_id = newTemplateData['board_template_id']
                        var viewers = newTemplateData['viewers'];
                    }

                    campaign_timeline_id = jalapeno.createNewTimeline(self.m_selected_campaign_id);
                    jalapeno.setCampaignTimelineSequencerIndex(self.m_selected_campaign_id, campaign_timeline_id, 0);

                    var campaign_timeline_board_template_id = jalapeno.assignTemplateToTimeline(campaign_timeline_id, board_template_id, campaign_board_id);
                    var channels = jalapeno.createTimelineChannels(campaign_timeline_id, viewers);
                    jalapeno.assignViewersToTimelineChannels(campaign_timeline_board_template_id, viewers, channels);

                    self.m_timelines[campaign_timeline_id] = new Timeline({campaignTimelineID: campaign_timeline_id});
                    BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);

                    BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']).reSequenceTimelines();
                    self._loadSequencerFirstTimeline();
                    return;
                }
            });
        },

        /**
         Wire the UI for adding a new timeline
         @method _listenAddNewTimeline
         **/
        _listenAddNewTimeline: function () {
            var self = this;
            $(Elements.ADD_NEW_TIMELINE_BUTTON).on('click', function () {
                BB.comBroker.getService(BB.SERVICES['SCREEN_LAYOUT_SELECTOR_VIEW']).hidePreviousButton();
                self.options.stackView.slideToPage(Elements.SCREEN_LAYOUT_SELECTOR, 'left');
            });
        },

        /**
         Wire the UI for timeline deletion.
         @method _listenDelTimeline
         @return none
         **/
        _listenDelTimeline: function () {
            var self = this;
            $(Elements.REMOVE_TIMELINE_BUTTON).on('click', function (e) {
                self._deleteTimeline(e, self);
            });
        },

        /**
         Toggle the arrow of the collapsible timelines / sequencer UI widget
         @method _listenToggleTimelinesCollapsible
         **/
        _listenToggleTimelinesCollapsible: function(){
            $(Elements.TOGGLE_TIMELINES_COLLAPSIBLE).on('click',function(){
                var  toggle = $(this).find('span')[0];
                if ($(toggle).hasClass('glyphicon-chevron-down')){
                    $(toggle).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right')
                } else {
                    $(toggle).removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down')
                }
            });
        },

        /**
         When a timeline is deleted, remove it from the local timelines hash and notify sequencer.
         @method _deleteTimeline
         @param {Event} e
         @param {Object} i_caller
         @return none
         **/
        _deleteTimeline: function (e, i_caller) {
            var self = this;
            e.preventDefault();
            e.stopImmediatePropagation();
            self.m_timelines[self.m_selected_timeline_id].deleteTimeline();
            delete self.m_timelines[self.m_selected_timeline_id];
            BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']).deleteSequencedTimeline(self.m_selected_timeline_id);
            self._loadSequencerFirstTimeline();
        },

        /**
         Get currently selected campaign, which we hold a reference to.
         @method getSelectedCampaign
         @return {Number} m_selected_campaign_id
         **/
        getSelectedCampaign: function () {
            var self = this;
            return self.m_selected_campaign_id;
        },

        /**
         Set selected campaign, which we hold a reference to.
         @method setSelectedCampaign
         @param {Number} i_selected_campaign_id
         @return none
         **/
        setSelectedCampaign: function (i_selected_campaign_id) {
            var self = this;
            self.m_selected_campaign_id = i_selected_campaign_id;
        },

        /**
         Get selected timeline instance, which we hold a reference to, via it's timeline_id.
         @method getTimelineInstance
         @param {Number} i_campaign_timeline_id
         @return {Object} timeline instance
         **/
        getTimelineInstance: function (i_campaign_timeline_id) {
            var self = this;
            return self.m_timelines[i_campaign_timeline_id];
        },

        /**
         Get the timeline viewstack and provide to others.
         @method getTimelineViewStack
         @return {Object} timeline viewStack instance
         **/
        getTimelineViewStack: function () {
            var self = this;
            return self.m_timelineViewStack;
        },

        /**
         Listen for updates on changes in length of currently selected timeline through the jalapeno framework
         @method _listenTimelineLengthChanged
         **/
        _listenTimelineLengthChanged: function(){
            var self = this;
            $(jalapeno).on(Jalapeno.TIMELINE_LENGTH_CHANGED, $.proxy(self._updatedTimelineLength,this));
        },

        /**
         Update UI when timeline length changed
         @method _updatedTimelineLength
         **/
        _updatedTimelineLength: function(){
            var self = this;
            self.m_xdate = new xdate();
            var a1 = jalapeno.getTimelineTotalDuration(this.m_selected_timeline_id);
            var a2 = self.m_xdate.clearTime().addSeconds(a1).toString('HH:mm:ss');
            $(Elements.TIMELINE_TOTAL_LENGTH).text(a2);
        }
    });

    return CampaignView;
});

