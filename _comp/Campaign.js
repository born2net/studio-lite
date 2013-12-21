/**
 The campaign is a singleton class that manages the campaign UI.
 The campaign UI can switch the view of a selected timeline through the view stack instance it creates.
 In addition, the campaign instance holds reference to all of the timeline instances which exist within the campaign.
 A new timeline reference is created upon timeline creation and deleted upon timeline removal.
 @class Campaign
 @constructor
 @return {Object} instantiated Campaign
 **/
function Campaign() {

    this.self = this;
    this.m_timelines = {}; // hold references to all created timeline instances
    this.m_timelineViewStack = new Viewstacks(Elements.CAMPAIN_VIEW_MAIN_CONTAINER);
    this.m_selected_timeline_id = -1;
    this.m_selected_campaign_id = -1;
    this.m_property = commBroker.getService('CompProperty');
};

Campaign.prototype = {
    constructor: Campaign,

    /**
     Init the instance and listen to VIEW_CHANGED event so we know when it's time to act.
     If no campaign was selected, we launch the campaign wizard creator, otherwise we populate the campaign / timelines.
     We also use this method to wire the rest of the campaigns elements.
     @method init
     @return none
     **/
    init: function () {
        var self = this;

        // When UI for Campaign is loaded
        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab4' && commBroker.getService('PlayListViewStack') === e.caller) {

                commBroker.getService('ScreenArrowSelector').disable();

                /// Create new campaign
                if (self.m_selected_campaign_id == -1) {
                    self._onLaunchTimelineWizard();

                    /// Load existing campaign
                } else {

                    // self.m_selected_campaign_id = e.edata;
                    self._loadTimelinesFromDB();
                }
            }
        });

        self._onWireOpenTimeLineProperties();
        self._onWireNewTimelineWizard();
        self._onWireDelTimeline();
        self._onWireTimelineExpandCollapse();
        self._listenTimelineOrViewerSelected();

        self.m_timelineViewStack.addChild(Elements.NONE_SELECTED_SCREEN_LAYOUT);

        self.m_property.initPanel(Elements.PROP_SCREEN_DIVISION, false);
        self.m_property.initPanel(Elements.PROP_ENTIRE_SCREEN, false);

    },

    /**
     Launch the new campaign wizard UI.
     @method _onLaunchTimelineWizard
     @return none
     **/
    _onLaunchTimelineWizard: function () {
        var self = this;
        $.mobile.changePage(Elements.SCREEN_LAYOUT_LIST, {transition: "pop"});
        var compTemplateWizard = new TemplateWizard(Elements.SCREEN_LAYOUT_ITEMS_LIST);
    },

    /**
     Wire the UI for new campaign wizard launch.
     @method _onWireNewTimelineWizard
     @return none
     **/
    _onWireNewTimelineWizard: function () {
        $(Elements.ADD_NEW_SCREEN_BUTTON).tap(function (e) {
            $.mobile.changePage(Elements.SCREEN_LAYOUT_LIST, {transition: "pop"});
            var compTemplateWizard = new TemplateWizard(Elements.SCREEN_LAYOUT_ITEMS_LIST);
        });
    },

    /**
     Wire the UI for timeline deletion.
     @method _onWireDelTimeline
     @return none
     **/
    _onWireDelTimeline: function () {
        var self = this;
        $(Elements.DEL_SCREEN_BUTTON).tap(function (e) {
            self._deleteTimeline(e, self);
        });
    },

    /**
     Wire the UI to open a timeline property panel upon selection.
     @method _onWireOpenTimeLineProperties
     @return none
     **/
    _onWireOpenTimeLineProperties: function () {
        $(Elements.OPEN_TIMELINE_PROPERTIES).on('click', function (e) {
            var comProp = commBroker.getService('CompProperty');

            if (comProp.getSelectedPanelID() != Elements.PROP_SCREEN_DIVISION && comProp.getSelectedPanelID() != Elements.PROP_ENTIRE_SCREEN)
                comProp.viewPanel(Elements.PROP_SCREEN_DIVISION);

            comProp.openPanel(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });
    },

    /**
     Wire animation of opening and closing of timeline selection.
     @method _onWireTimelineExpandCollapse
     @return none
     **/
    _onWireTimelineExpandCollapse: function () {
        $('[data-role="collapsible"]', Elements.TIMELINES_COLLAPSIBLE).on('expand collapse', function (event) {
            $(this).find('h3').siblings().slideToggle(500, 'easeOutExpo');
            return false;
        });
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
            // var recCampaignTimeline = jalapeno.getCampaignTimelineRecord(campaign_timeline_id);
            var sequenceIndex = jalapeno.getCampaignTimelineSequencerIndex(campaign_timeline_id);
            sequenceOrder[parseInt(sequenceIndex)] = parseInt(campaign_timeline_id);
        }

        $(sequenceOrder).each(function (sequenceIndex, campaign_timeline_id) {
            // create the timelines
            self.m_timelines[campaign_timeline_id] = new Timeline(campaign_timeline_id);
        });

        self._loadSequencerFirstTimeline();
    },

    /**
     Select the first timeline in the sequencer UI and if fails, select main Campaign > timeline.
     @method _loadSequencerFirstTimeline
     @return none
     **/
    _loadSequencerFirstTimeline: function () {
        var self = this;

        var firstTimelineID = jalapeno.getCampaignTimelineIdOfSequencerIndex(self.m_selected_campaign_id, 0);
        var sequencesComp = commBroker.getService('Sequences');

        setTimeout(function () {
            if (sequencesComp.selectTimeline(firstTimelineID) == -1) {
                self.m_timelineViewStack.selectIndex(0);
            }
        }, 250);
    },

    /**
     This is a key method that we use to listen to fire event of ScreenTemplateFactory.ON_VIEWER_SELECTED.
     Upon the event we examine e.context.m_owner to find out who was the owner if the fired event (i.e.: instanceof)
     so we can select tha appropriate campaign or timeline in the UI. See further notes in code.
     @method _listenTimelineOrViewerSelected
     @return none
     **/
    _listenTimelineOrViewerSelected: function () {
        var self = this;
        commBroker.listen(ScreenTemplateFactory.ON_VIEWER_SELECTED, function (e) {

            var campaign_timeline_board_viewer_id = e.caller.campaign_timeline_board_viewer_id;
            var campaign_timeline_id = e.caller.campaign_timeline_id;
            self.m_selected_timeline_id = campaign_timeline_id;

            ////////////////////////////////////////////////
            //// Timeline selected from Sequencer class
            ////////////////////////////////////////////////

            if (e.context.m_owner instanceof Sequencer) {
                self.m_timelineViewStack.selectIndex(self.m_timelines[campaign_timeline_id].getViewStackIndex());
                commBroker.fire(Timeline.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);
                return;
            }

            ////////////////////////////////////////////////
            //// Timeline selected from Scheduler class  (future support)
            ////////////////////////////////////////////////

            if (e.context.m_owner instanceof Scheduler) {
                return;
            }

            ////////////////////////////////////////////////
            //// Timeline selected from Timeline class
            ////////////////////////////////////////////////

            if (e.context.m_owner instanceof Timeline) {
                var recCampaignTimelineViewerChanels = jalapeno.getChannelIdFromCampaignTimelineBoardViewer(campaign_timeline_board_viewer_id, campaign_timeline_id);
                var campaign_timeline_channel_id = recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']
                commBroker.fire(Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, campaign_timeline_channel_id);
                return;
            }

            ////////////////////////////////////////////////
            //// Timeline selected from TemplateWizard
            ////////////////////////////////////////////////

            var board_id = undefined;
            var campaign_board_id = undefined;

            if (e.context.m_owner instanceof TemplateWizard) {
                if (self.m_selected_campaign_id == -1) {

                    ////////////////////////////////////////////////
                    // Created a brand new campaign and a new board
                    ////////////////////////////////////////////////

                    var width = commBroker.getService('ScreenResolution').getResolution().split('x')[0];
                    var height = commBroker.getService('ScreenResolution').getResolution().split('x')[1];
                    board_id = jalapeno.createBoard('board', width, height);

                    var newTemplateData = jalapeno.createNewTemplate(board_id, e.caller.screenTemplateData.screenProps);
                    var board_template_id = newTemplateData['board_template_id']
                    var viewers = newTemplateData['viewers'];

                    self.m_selected_campaign_id = jalapeno.createCampaign('campaign');
                    campaign_board_id = jalapeno.assignCampaignToBoard(self.m_selected_campaign_id, board_id);

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

                var campaign_timeline_board_template_id = jalapeno.assignTemplateToTimeline(campaign_timeline_id, board_template_id, campaign_board_id);
                var channels = jalapeno.createTimelineChannels(campaign_timeline_id, viewers);
                jalapeno.assignViewersToTimelineChannels(campaign_timeline_board_template_id, viewers, channels);

                self.m_timelines[campaign_timeline_id] = new Timeline(campaign_timeline_id);
                commBroker.fire(Timeline.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);

                commBroker.getService('Sequences').reSequenceTimelines();
                self._loadSequencerFirstTimeline();
                return;
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
        jalapeno.removeTimelineFromCampaign(self.m_selected_timeline_id);
        commBroker.getService('Sequences').deleteSequencedTimeline(self.m_selected_timeline_id);
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
    }
}

