/*/////////////////////////////////////////////

 Campaign

 /////////////////////////////////////////////*/

function Campaign() {

    this.self = this;
    this.m_msdb = undefined;
    this.m_timelines = {}; // hold references to all created timeline instances
    this.m_timelineViewStack = new Viewstacks('#campainViewMainContainer');
    this.m_selected_timeline_id = -1;
    this.m_selected_campaign_id = -1;
    this.m_property = commBroker.getService('CompProperty');
};

Campaign.prototype = {
    constructor: Campaign,

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
                    self.m_msdb = commBroker.getValue(CompMSDB.msdb)
                    self._loadTimelinesFromDB();
                }
            }
        });

        self._onWireOpenTimeLineProperties();
        self._onWireNewTimelineWizard();
        self._onWireDelTimeline();
        self._listenTimelineOrViewerSelected();

        self.m_timelineViewStack.addChild('#noneSelectedScreenLayout');

        self.m_property.initPanel('#propScreenDivision', false);
        self.m_property.initPanel('#propEntireScreen', false);

    },

    _onLaunchTimelineWizard: function () {
        var self = this;
        $.mobile.changePage('#screenLayoutList', {transition: "pop"});
        var compTemplateWizard = new TemplateWizard('#screenLayoutItemsList');
    },

    _onWireNewTimelineWizard: function () {
        $('#addNewScreenButton').tap(function (e) {
            $.mobile.changePage('#screenLayoutList', {transition: "pop"});
            var compTemplateWizard = new TemplateWizard('#screenLayoutItemsList');
        });
    },

    _onWireDelTimeline: function () {
        var self = this;
        $('#delScreenButton').tap(function (e) {
            self._onDeleteTimeline(e, self);
        });
    },

    _onWireOpenTimeLineProperties: function () {
        $('#openTimeLineProperties').on('click', function (e) {
            var comProp = commBroker.getService('CompProperty');

            if (comProp.getSelectedPanelID() != '#propScreenDivision' && comProp.getSelectedPanelID() != '#propEntireScreen')
                comProp.viewPanel('#propScreenDivision');

            comProp.openPanel(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });
    },

    _loadTimelinesFromDB: function () {

        var self = this;
        var recCampaign = self.m_msdb.table_campaigns().getRec(self.m_selected_campaign_id);
        var helperSDK = commBroker.getService('HelperSDK');
        var sequenceOrder = [];

        // Get all timelines
        $(self.m_msdb.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {

            var recCampaignTimeline = self.m_msdb.table_campaign_timelines().getRec(campaign_timeline_id);
            var sequenceIndex = helperSDK.getCampaignTimelineSequencerIndex(campaign_timeline_id);

            // if timeline belongs to selected campaign
            if (recCampaignTimeline['campaign_id'] == self.m_selected_campaign_id) {
                var campaign_timeline_id = recCampaignTimeline['campaign_timeline_id'];
                // build sequenced order of timelines to create
                sequenceOrder[parseInt(sequenceIndex)] = parseInt(campaign_timeline_id);

            }
        });

        $(sequenceOrder).each(function (sequenceIndex, campaign_timeline_id) {
            // create the timelines
            self.m_timelines[campaign_timeline_id] = new Timeline(campaign_timeline_id);
        });

        self._loadSequencerFirstTimeline();

    },

    /////////////////////////////////////////////////////////
    //
    // _loadSequencerFirstTimeline
    //
    //      select the first timeline in the sequencer UI
    //      and if fails select Main Campaign > timeline
    //
    /////////////////////////////////////////////////////////

    _loadSequencerFirstTimeline: function () {
        var self = this;

        var helperSDK = commBroker.getService('HelperSDK');
        var firstTimelineID = helperSDK.getCampaignTimelineIdOfSequencerIndex(self.m_selected_campaign_id, 0);
        var sequencesComp = commBroker.getService('Sequences');

        setTimeout(function () {
            if (sequencesComp.selectTimeline(firstTimelineID) == -1) {
                self.m_timelineViewStack.selectIndex(0);
            }
        }, 250);
    },

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

            //todo take off comment after css done
            //if (e.context.m_owner instanceof Scheduler) {
            //    return;
            //}

            ////////////////////////////////////////////////
            //// Timeline selected from Timeline class
            ////////////////////////////////////////////////

            if (e.context.m_owner instanceof Timeline) {
                var helperSDK = commBroker.getService('HelperSDK');
                var recCampaignTimelineViewerChanels = helperSDK.getChannelIdFromCampaignTimelineBoardViewer(campaign_timeline_board_viewer_id, campaign_timeline_id);
                var campaign_timeline_channel_id = recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']
                commBroker.fire(Channel.CAMPAIGN_TIMELINE_CHANNEL_SELECTED, this, null, campaign_timeline_channel_id);
                return;
            }

            ////////////////////////////////////////////////
            //// Timeline selected from TemplateWizard
            ////////////////////////////////////////////////

            if (e.context.m_owner instanceof TemplateWizard) {
                var helperSDK = commBroker.getService('HelperSDK');
                if (self.m_selected_campaign_id == -1) {

                    ////////////////////////////////////////////////
                    // Created a brand new campign and a new board
                    ////////////////////////////////////////////////

                    var width = commBroker.getService('ScreenResolution').getResolution().split('x')[0];
                    var height = commBroker.getService('ScreenResolution').getResolution().split('x')[1];
                    var campaign_board_id = helperSDK.createBoard('board', width, height);

                    var newTemplateData = helperSDK.createNewTemplate(campaign_board_id, e.caller.screenTemplateData.screenProps);
                    var board_template_id = newTemplateData['board_template_id']
                    var viewers = newTemplateData['viewers'];

                    self.m_selected_campaign_id = helperSDK.createCampaign('campaign');
                    helperSDK.assignCampaignToBoard(self.m_selected_campaign_id, campaign_board_id);

                } else {

                    ////////////////////////////////////////////////
                    // Add Timeline to an existing campign
                    ////////////////////////////////////////////////

                    var campaign_board_id = helperSDK.getFirstBoardIDofCampaign(self.m_selected_campaign_id);
                    var newTemplateData = helperSDK.createNewTemplate(campaign_board_id, e.caller.screenTemplateData.screenProps);
                    var board_template_id = newTemplateData['board_template_id']
                    var viewers = newTemplateData['viewers'];

                }

                campaign_timeline_id = helperSDK.createNewTimeline(self.m_selected_campaign_id);

                var campaign_timeline_board_template_id = helperSDK.assignTemplateToTimeline(campaign_timeline_id, board_template_id, campaign_board_id);
                var channels = helperSDK.createTimelineChannels(campaign_timeline_id, viewers);

                helperSDK.assignViewersToTimelineChannels(campaign_timeline_board_template_id, viewers, channels);

                self.m_timelines[campaign_timeline_id] = new Timeline(campaign_timeline_id);
                commBroker.fire(Timeline.CAMPAIGN_TIMELINE_SELECTED, this, null, campaign_timeline_id);

                commBroker.getService('Sequences').reSequenceTimelines();
                self._loadSequencerFirstTimeline();
                return;
            }
        });
    },

    /* _propLoadTemplateViewer: function (i_campaign_timeline_board_viewer_id, i_campaign_timeline_id) {
        var self = this;
        self.m_property.viewPanel('#propScreenDivision');
        var a = $('#divName').attr('value', i_campaign_timeline_board_viewer_id + ' ' + i_campaign_timeline_id);
    },
    */

    _onDeleteTimeline: function (e, i_caller) {
        var self = this;

        e.preventDefault();
        e.stopImmediatePropagation();

        var sequencesComp = commBroker.getService('Sequences');
        sequencesComp.deleteTimeline(self.m_selected_timeline_id);
        delete self.m_timelines[self.m_selected_timeline_id];
        self._loadSequencerFirstTimeline();

    },

    getSelectedCampaign: function () {
        var self = this;
        return self.m_selected_campaign_id;
    },

    setSelectedCampaign: function (i_selected_campaign_id) {
        var self = this;
        self.m_selected_campaign_id = i_selected_campaign_id;
    },

    getTimelineInstance: function (i_campaign_timeline_id) {
        var self = this;
        return self.m_timelines[i_campaign_timeline_id];
    },

    getTimelineViewStack: function () {
        var self = this;
        return self.m_timelineViewStack;
    }
}

