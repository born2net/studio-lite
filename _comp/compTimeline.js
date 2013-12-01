/*/////////////////////////////////////////////

 Timeline

 /////////////////////////////////////////////*/

Timeline.CAMPAIGN_TIMELINE_SELECTED = 'CAMPAIGN_TIMELINE_SELECTED';

function Timeline(i_campaign_timeline_id) {

    var self = this;
    self.m_msdb = undefined;
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

    _init: function () {

        var self = this;

        self.m_msdb = commBroker.getValue(CompMSDB.msdb);

        self._populateChannels();
        self._populateTimeline();
        self._wireUI();

    },

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
            log('timeline selected ' + self.m_campaign_timeline_id);

        });
    },

    _wireUI: function () {
        var self = this;

        var timelineTitle;
        $("#timeLinePropTitleID").on("input", function (e) {
            if (!self.m_selected)
                return;
            window.clearTimeout(timelineTitle);
            timelineTitle = window.setTimeout(function () {
                self._onChange(e);
            }, 200);
        });
    },

    _onChange: function(e){
        var self = this;
        this.m_helperSDK.setCampaignTimelineRecord(self.m_campaign_timeline_id, 'timeline_name', $('#timeLinePropTitleID').val() );
    },

    _propLoadTimeline: function () {
        var self = this;

        self.m_property.viewPanel('#propEntireScreen');
        var recTimeline = this.m_helperSDK.getCampaignTimelineRecord(self.m_campaign_timeline_id);
        $('#timeLinePropTitleID').val(recTimeline['timeline_name']);
    },

    _populateTimeline: function () {
        var self = this;

        $(self.m_msdb.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each(function (k, table_campaign_timeline_board_template_id) {
            var recCampaignTimelineBoardTemplate = self.m_msdb.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
            if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == self.m_campaign_timeline_id) {
                self._populateBoardTemplate(table_campaign_timeline_board_template_id);
            }
        });
    },

    _populateChannels: function () {
        var self = this;

        $(self.m_msdb.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
            var recCampaignTimelineChannel = self.m_msdb.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
            if (self.m_campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {
                self.m_channels[campaign_timeline_chanel_id] = new Channel(campaign_timeline_chanel_id);
            }
        });
    },

    _populateBoardTemplate: function (i_campaign_timeline_board_template_id) {
        var self = this;

        var recCampaignTimelineBoardTemplate = self.m_msdb.table_campaign_timeline_board_templates().getRec(i_campaign_timeline_board_template_id);

        // Get global board > board template so we can get the total width / height resolution of the board
        var board_template_id = recCampaignTimelineBoardTemplate['board_template_id'];
        var recBoardTemplate = self.m_msdb.table_board_templates().getRec(board_template_id);
        var board_id = recBoardTemplate['board_id'];

        var recBoard = self.m_msdb.table_boards().getRec(board_id);
        var width = parseInt(recBoard['board_pixel_width']);
        var height = parseInt(recBoard['board_pixel_height']);

        commBroker.getService('ScreenResolution').setResolution(width + 'x' + height);
        if (width > height) {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.HORIZONTAL);
        } else {
            commBroker.getService('ScreenOrientation').setOrientation(ScreenOrientation.VERTICAL);
        }

        var counter = -1;
        var screenProps = {};

        $(self.m_msdb.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {

            var recCampaignTimelineBoardViewerChanel = self.m_msdb.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineBoardViewerChanel['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                var recBoardTemplateViewer = self.m_msdb.table_board_template_viewers().getRec(recCampaignTimelineBoardViewerChanel['board_template_viewer_id']);
                // log(i_campaign_timeline_board_template_id + ' ' + recBoardTemplateViewer['board_template_viewer_id']);
                counter++;
                screenProps['sd' + counter] = {};
                screenProps['sd' + counter]['campaign_timeline_board_viewer_id'] = recBoardTemplateViewer['board_template_viewer_id'];
                screenProps['sd' + counter]['campaign_timeline_id'] = self.m_campaign_timeline_id;
                screenProps['sd' + counter]['x'] = recBoardTemplateViewer['pixel_x'];
                screenProps['sd' + counter]['y'] = recBoardTemplateViewer['pixel_y'];
                screenProps['sd' + counter]['w'] = recBoardTemplateViewer['pixel_width'];
                screenProps['sd' + counter]['h'] = recBoardTemplateViewer['pixel_height'];
            }
        });

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
        ;
        self.m_viewStackIndex = timelineViewStack.addChild('#' + divID1);

        $('#' + divID2).append($(snippet));
        screenTemplate.selectablelDivision();
        screenTemplate.activate();

    },

    getViewStackIndex: function () {
        var self = this;
        return self.m_viewStackIndex;
    },

    getChannelInstance: function (i_campaign_timeline_chanel_id) {
        var self = this;
        return self.m_channels[i_campaign_timeline_chanel_id];
    }


}