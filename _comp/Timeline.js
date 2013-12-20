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
Timeline.CAMPAIGN_TIMELINE_SELECTED = 'CAMPAIGN_TIMELINE_SELECTED';

/**
 The timeline instance is created for each timeline in a campaign. It creates its UI, listens to timeline
 event selections, and holds a reference to its own timeline_id.
 The timeline instance also creates channel instances for all the channels it hosts and hold references to these
 channels via m_channels member.
 @class Timeline
 @constructor
 @return {Object} instantiated Timeline
 **/
function Timeline(i_campaign_timeline_id) {

    var self = this;
    this.m_channels = {}; // hold references to all created channel instances
    this.m_campaign_timeline_id = i_campaign_timeline_id;
    this.m_timing = 'sequencer';
    this.m_viewStackIndex = -1;
    this.m_property = commBroker.getService('CompProperty');
    this.m_helperSDK = commBroker.getService('HelperSDK');
    this.m_selected = false;

    this._init();
    this._onTimelineSelected();

};

Timeline.prototype = {
    constructor: Timeline,

    /**
     Init a timeline and wire the UI including creating the channels that are members of this timeline.
     @method _init
     @return none
     **/
    _init: function () {

        var self = this;

        self._populateChannels();
        self._populateTimeline();
        self._wireUI();

    },

    /**
     Listen to timeline selection events and populate the properties panel accordingly.
     @method _onTimelineSelected
     @return none
     **/
    _onTimelineSelected: function () {
        var self = this;

        commBroker.listen(Timeline.CAMPAIGN_TIMELINE_SELECTED, function (e) {
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
     Wire the UI for timeline property edits.
     @method _wireUI
     @return none
     **/
    _wireUI: function () {
        var self = this;

        var timelineTitle;
        $(Elements.TIME_LINE_PROP_TITLE_ID).on("input", function (e) {
            if (!self.m_selected)
                return;
            window.clearTimeout(timelineTitle);
            timelineTitle = window.setTimeout(function () {
                self._onChange(e);
            }, 200);
        });
    },

    /**
     Update msdb when the timeline title has changed.
     @method _onChange
     @param {Event} e
     @return none
     **/
    _onChange: function (e) {
        var self = this;
        jalapeno.setCampaignTimelineRecord(self.m_campaign_timeline_id, 'timeline_name', $(Elements.TIME_LINE_PROP_TITLE_ID).val());
    },

    _propLoadTimeline: function () {
        var self = this;

        self.m_property.viewPanel(Elements.PROP_ENTIRE_SCREEN);
        var recTimeline = jalapeno.getCampaignTimelineRecord(self.m_campaign_timeline_id);
        $(Elements.TIME_LINE_PROP_TITLE_ID).val(recTimeline['timeline_name']);
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
            self.m_channels[channelIDs[i]] = new Channel(channelIDs[i]);
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

        commBroker.getService('ScreenResolution').setResolution(width + 'x' + height);
        if (width > height) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.HORIZONTAL);
        } else {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.VERTICAL);
        }

        var screenProps = jalapeno.getTemplateViewersScreenProps(self.m_campaign_timeline_id, i_campaign_timeline_board_template_id)
        self._createTimelineUI(screenProps);

        // Future support for scheduler
        switch (self.m_timing) {
            case 'sequencer':
            {
                var sequences = commBroker.getService('Sequences');
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
            orientation: commBroker.getService('ScreenOrientation').getOrientation(),
            resolution: commBroker.getService('ScreenResolution').getResolution(),
            screenProps: i_screenProps,
            scale: '7'
        }

        var screenTemplate = new ScreenTemplateFactory(screenTemplateData, ScreenTemplateFactory.VIEWER_SELECTABLE, this);
        var snippet = screenTemplate.create();
        var elemID = $(snippet).attr('id');
        var divID1 = 'selectableScreenCollections' + getUnique();
        var divID2 = 'selectableScreenCollections' + getUnique();

        var snippetWrapper = '<div id="' + divID1 + '" style="display: none">' +
            '<div align="center" >' +
            '<div id="' + divID2 + '" align="center">' +
            '</div>' +
            '</div>' +
            '</div>';

        $('body').append(snippetWrapper);

        var timelineViewStack = commBroker.getService('Campaign').getTimelineViewStack();
        self.m_viewStackIndex = timelineViewStack.addChild('#' + divID1);

        $('#' + divID2).append($(snippet));
        screenTemplate.selectablelDivision();
        screenTemplate.activate();

    },

    /**
     Return the view stack index this timeline occupies in the timelineViewStack manager.
     @method getViewStackIndex
     @return {Number} m_viewStackIndex
     **/
    getViewStackIndex: function () {
        var self = this;
        return self.m_viewStackIndex;
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
    deleteTimeline: function(){
        var self = this;
        for (var channel in self.m_channels){
            self.m_channels[channel].deleteChannel();
        }
    }
}