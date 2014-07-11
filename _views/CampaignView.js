/**
 CampaignView module manages campaign related logic and UI
 @class CampaignView
 @constructor
 @return {Object} instantiated CampaignView
 **/
define(['jquery', 'backbone', 'SequencerView', 'ChannelListView', 'StackView', 'Timeline', 'ScreenLayoutSelectorView', 'StorylineView', 'BlockFactory'], function ($, Backbone, SequencerView, ChannelListView, StackView, Timeline, ScreenLayoutSelectorView, StorylineView, BlockFactory) {

    /**
     Custom event fired when a timeline or channel or block within the timeline has changed
     it ignores the event.
     @event Timeline.CAMPAIGN_TIMELINE_SELECTED
     @param {This} caller
     @param {Self} context caller
     @param {Event} timelineID of the timeline selected
     @static
     @final
     **/
    BB.EVENTS.CAMPAIGN_TIMELINE_CHANGED = 'CAMPAIGN_TIMELINE_CHANGED';

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
            this.m_timelineViewStack = new StackView.Fader({el: Elements.SELECTED_TIMELINE, duration: 333});
            this.m_selected_timeline_id = -1;
            this.m_selected_campaign_id = -1;
            this.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);

            self.m_blockFactory = BB.comBroker.getService(BB.SERVICES['BLOCK_FACTORY']);
            if (!self.m_blockFactory)
                this.m_blockFactory = new BlockFactory();

            this.m_sequencerView = new SequencerView({
                el: Elements.SCREEN_LAYOUTS_UL
            });

            this.m_storylineView = new StorylineView({
                el: Elements.STORYLINE
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
            self._listenCampaignPreview();
            self._listenCampaignTimelinePreview();
            self._listenToggleTimelinesCollapsible();
            self._listenScreenTemplateEdit();

            self.m_noneSelectedTimelines = new BB.View({el: Elements.NONE_SELECTED_SCREEN_LAYOUT})

            //self.m_timelineViewStack.addView(self.m_noneSelectedTimelines);
            // pepper.listen(Pepper.NEW_TIMELINE_CREATED, $.proxy(self._updDelTimelineButtonStatus, self));
            // pepper.listen(Pepper.TIMELINE_DELETED, $.proxy(self._updDelTimelineButtonStatus, self));

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
            self._updatedTimelinesLengthUI();
            self._listenTimelineLengthChanged();
            // self._updDelTimelineButtonStatus();
        },

        /**
         Load all of the campaign's timelines from msdb and populate the sequencer.
         @method _loadTimelinesFromDB
         @return none
         **/
        _loadTimelinesFromDB: function () {
            var self = this;
            var sequenceOrder = [];

            var timelineIDs = pepper.getCampaignTimelines(self.m_selected_campaign_id);
            for (var i = 0; i < timelineIDs.length; i++) {
                var campaign_timeline_id = timelineIDs[i];
                var sequenceIndex = pepper.getCampaignTimelineSequencerIndex(campaign_timeline_id);
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
            self.m_sequencerView.selectFirstTimeline();
            //var firstTimelineID = pepper.getCampaignTimelineIdOfSequencerIndex(self.m_selected_campaign_id, 0);
            //if (self.m_sequencerView.selectTimeline(firstTimelineID) == -1)
            //    self.m_timelineViewStack.selectView(self.m_noneSelectedTimelines);
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
                var autoSelectFirstTimeline = true;
                var campaign_timeline_board_viewer_id = e.caller.campaign_timeline_board_viewer_id;
                var campaign_timeline_id = e.caller.campaign_timeline_id;
                self.m_selected_timeline_id = campaign_timeline_id;

                ////////////////////////////////////////////////
                //// Timeline selected from Sequencer class
                ////////////////////////////////////////////////

                if (e.context.m_owner instanceof SequencerView) {
                    //self.m_timelineViewStack.selectView(self.m_timelines[campaign_timeline_id].getStackViewID());
                    BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);
                    self._updatedTimelinesLengthUI();
                    return;
                }

                ////////////////////////////////////////////////
                //// Timeline selected from Timeline class
                ////////////////////////////////////////////////

                if (e.context.m_owner instanceof Timeline) {
                    var recCampaignTimelineViewerChanels = pepper.getChannelIdFromCampaignTimelineBoardViewer(campaign_timeline_board_viewer_id, campaign_timeline_id);
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
                        board_id = pepper.createBoard('board', width, height);

                        var newTemplateData = pepper.createNewTemplate(board_id, e.caller.screenTemplateData.screenProps);
                        var board_template_id = newTemplateData['board_template_id']
                        var viewers = newTemplateData['viewers'];

                        self.m_selected_campaign_id = pepper.createCampaign('campaign');
                        campaign_board_id = pepper.assignCampaignToBoard(self.m_selected_campaign_id, board_id);

                        // set campaign name
                        var campaignName = BB.comBroker.getService(BB.SERVICES['CAMPAIGN_NAME_SELECTOR_VIEW']).getCampaignName();
                        pepper.setCampaignRecord(self.m_selected_campaign_id, 'campaign_name', campaignName);

                    } else {

                        ////////////////////////////////////////////////
                        // Add Timeline to an existing campaign
                        ////////////////////////////////////////////////

                        campaign_board_id = pepper.getFirstBoardIDofCampaign(self.m_selected_campaign_id);
                        board_id = pepper.getBoardFromCampaignBoard(campaign_board_id);
                        var newTemplateData = pepper.createNewTemplate(board_id, e.caller.screenTemplateData.screenProps);
                        var board_template_id = newTemplateData['board_template_id']
                        var viewers = newTemplateData['viewers'];
                        autoSelectFirstTimeline = false;
                    }
                    campaign_timeline_id = pepper.createNewTimeline(self.m_selected_campaign_id);
                    pepper.setCampaignTimelineSequencerIndex(self.m_selected_campaign_id, campaign_timeline_id, 0);
                    pepper.setTimelineTotalDuration(campaign_timeline_id, '0');

                    var campaign_timeline_board_template_id = pepper.assignTemplateToTimeline(campaign_timeline_id, board_template_id, campaign_board_id);
                    var channels = pepper.createTimelineChannels(campaign_timeline_id, viewers);
                    pepper.assignViewersToTimelineChannels(campaign_timeline_board_template_id, viewers, channels);

                    self.m_timelines[campaign_timeline_id] = new Timeline({campaignTimelineID: campaign_timeline_id});
                    BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);
                    BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']).reSequenceTimelines();

                    if (autoSelectFirstTimeline) {
                        self._loadSequencerFirstTimeline();
                    } else {
                        self.m_sequencerView.selectTimeline(campaign_timeline_id);
                    }
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
                BB.comBroker.getService(BB.SERVICES['SCREEN_LAYOUT_SELECTOR_VIEW']).slideBackDirection('right');
                self.options.stackView.slideToPage(Elements.SCREEN_LAYOUT_SELECTOR, 'left');
            });
        },

        /**
         Wire the UI for launching campaign preview
         @method _listenCampaignPreview
         **/
        _listenCampaignPreview: function () {
            var self = this;
            $(Elements.CAMPAIGN_PREVIEW).on('click', function () {
                var livePreview = BB.comBroker.getService(BB.SERVICES['LIVEPREVIEW']);
                livePreview.launchCampaign(self.m_selected_campaign_id);
            });
        },

        /**
         Wire the UI for launching specific timeline preview
         @method _listenCampaignTimelinePreview
         **/
        _listenCampaignTimelinePreview: function () {
            var self = this;
            $(Elements.TIMELIME_PREVIEW).on('click', function () {
                var livePreview = BB.comBroker.getService(BB.SERVICES['LIVEPREVIEW']);
                livePreview.launchTimeline(self.m_selected_campaign_id, self.m_selected_timeline_id);
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
                var totalTimelines = pepper.getCampaignTimelines(self.m_selected_campaign_id).length;
                if (totalTimelines == 1) {
                    bootbox.dialog({
                        message: $(Elements.MSG_CANT_DELETE_TIMELINE).text(),
                        buttons: {
                            danger: {
                                label: $(Elements.MSG_BOOTBOX_OK).text(),
                                className: "btn-danger"
                            }
                        }
                    });
                } else {
                    bootbox.confirm($(Elements.MSG_BOOTBOX_SURE_REMOVE_TIMELINE).text(), function (i_result) {
                        if (i_result == true) {
                            $.proxy(self._deleteTimeline(), self);
                        }
                    });
                }
            });
        },

        /**
         Update delete timeline button thus not allowing for less one timeline in campaign
         @method _updDelTimelineButtonStatus
         _updDelTimelineButtonStatus: function () {
            var self = this;
            var totalTimelines = pepper.getCampaignTimelines(self.m_selected_campaign_id).length;
            if (totalTimelines > 1) {
                $(Elements.REMOVE_TIMELINE_BUTTON).prop('disabled', false);
            } else {
                $(Elements.REMOVE_TIMELINE_BUTTON).prop('disabled', true);
            }
        },
         **/

        /**
         Toggle the arrow of the collapsible timelines / sequencer UI widget
         @method _listenToggleTimelinesCollapsible
         **/
        _listenToggleTimelinesCollapsible: function () {
            $(Elements.TOGGLE_TIMELINES_COLLAPSIBLE).on('click', function () {
                var toggle = $(this).find('span')[0];
                if ($(toggle).hasClass('glyphicon-chevron-down')) {
                    $(toggle).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right')
                } else {
                    $(toggle).removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down')
                }
            });
        },

        /**
         Listen screen template edit button
         @method _listenScreenTemplateEdit
         **/
        _listenScreenTemplateEdit: function () {
            var self = this;
            $(Elements.EDIT_SCREEN_LAYOUT).on('click', function(e){
                var screenLayoutEditor = BB.comBroker.getService(BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW);
                var boardTemplateIDs = pepper.getTemplatesOfTimeline(self.m_selected_timeline_id);
                screenLayoutEditor.selectView(self.m_selected_timeline_id, boardTemplateIDs[0]);
            });
        },

        /**
         When a timeline is deleted, remove it from the local timelines hash and notify sequencer.
         @method _deleteTimeline
         @param {Event} e
         @param {Object} i_caller
         @return none
         **/
        _deleteTimeline: function () {
            var self = this;
            self.m_timelines[self.m_selected_timeline_id].deleteTimeline();
            delete self.m_timelines[self.m_selected_timeline_id];
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
         Listen for updates on changes in length of currently selected timeline through the pepper framework
         @method _listenTimelineLengthChanged
         **/
        _listenTimelineLengthChanged: function () {
            var self = this;
            pepper.listen(Pepper.TIMELINE_LENGTH_CHANGED, $.proxy(self._updatedTimelinesLengthUI, self));
        },

        /**
         Update UI of total timelines length on length changed
         @method _updatedTimelinesLengthUI
         **/
        _updatedTimelinesLengthUI: function () {
            var self = this;
            var totalDuration = 0;
            self.m_xdate = BB.comBroker.getService('XDATE');
            $.each(self.m_timelines, function (timelineID) {
                totalDuration = parseInt(pepper.getTimelineTotalDuration(timelineID)) + totalDuration;
            });
            var durationFormatted = self.m_xdate.clearTime().addSeconds(totalDuration).toString('HH:mm:ss');
            $(Elements.TIMELINES_TOTAL_LENGTH).text(durationFormatted);
        }
    });

    return CampaignView;
});

