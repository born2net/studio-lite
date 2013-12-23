/**
 The class manages the UI of campaign selection, creation of new campaign or opening an existing campaign.
 @class CompCampaignSelector
 @param i_container element to append the list of campaigns
 @constructor
 @return {object} instantiated AddBlockWizard
 **/
function CompCampaignSelector(i_container) {

    var self = this;
    self.m_container = i_container;
    self.m_property = commBroker.getService('CompProperty');
    self.seletedCampaignID = -1;
    self.m_screenArrowSelector = undefined;

    self._wireUI();
    self._init();
};

CompCampaignSelector.prototype = {
    constructor: CompCampaignSelector,

    /**
     Init the properties panel, and allow creation of new campaign
     @method _init
     @return none
     **/
    _init: function () {
        var self = this;
        self.m_property.initPanel(Elements.CAMPAIGN_PROPERTIES, true);
        self.m_screenArrowSelector = commBroker.getService('ScreenArrowSelector');

        $(Elements.START_NEW_CAMPAIGN).on('tap', function () {
            self.m_screenArrowSelector.selectNext();
        });

        $(Elements.REMOVE_CAMPAIGN).on('tap', function () {
            if (self.seletedCampaignID == -1) {
                commBroker.getService('PopupManager').popUpDialogOK('selection', 'First select a campaign using the gear icon', function () {
                });
            } else {
                var selectedLI = $(Elements.CAMPAIGN_SELECTOR_LIST).find('[data-campaignid="' + self.seletedCampaignID + '"]');
                selectedLI.remove();
                self.removeCampaignFromMSDB(self.seletedCampaignID);
            }
        });
    },

    /**
     Remove an entire campaign including its timelines, channels, blocks, template, board etc
     @method removeCampaign
     @return none
     **/
    removeCampaignFromMSDB: function (i_campaign_id) {
        var self = this;

        var timelineIDs = jalapeno.getCampaignTimelines(i_campaign_id);

        for (var i = 0; i < timelineIDs.length; i++) {
            var timelineID = timelineIDs[i];
            jalapeno.removeTimelineFromCampaign(timelineID);
            var campaignTimelineBoardTemplateID = jalapeno.removeBoardTemplateFromTimeline(timelineID);
            jalapeno.removeTimelineBoardViewerChannels(campaignTimelineBoardTemplateID);
            var boardTemplateID = jalapeno.removeBoardTemplate(campaignTimelineBoardTemplateID);
            jalapeno.removeBoardTemplateViewers(boardTemplateID);
            jalapeno.removeTimelineFromSequences(timelineID);

            var channelsIDs = jalapeno.getChannelsOfTimeline(timelineID);
            for (var n = 0; n < channelsIDs.length; n++) {
                var channelID = channelsIDs[n];
                jalapeno.removeChannelFromTimeline(channelID);

                var blockIDs = jalapeno.getChannelBlocks(channelID);
                for (var x = 0; x < blockIDs.length; x++) {
                    var blockID = blockIDs[x];
                    jalapeno.removeBlockFromTimelineChannel(blockID);
                }
            }
        }
        jalapeno.removeCampaign(i_campaign_id);
        jalapeno.removeCampaignBoard(i_campaign_id);

        // check to see if any other campaigns are left, do some clean house and remove all campaign > boards
        var campaignIDs = jalapeno.getCampaignIDs();
        if (campaignIDs.length == 0)
            jalapeno.removeAllBoards();
    },

    /**
     Populate the LI with all available campaigns from msdb
     @method _loadCampaignList
     @return none
     **/
    _loadCampaignList: function () {
        var self = this;

        self.m_selected_resource_id = undefined;
        var campaignIDs = jalapeno.getCampaignIDs();
        for (var i = 0; i < campaignIDs.length; i++) {
            var campaignID = campaignIDs[i];
            var recCampaign = jalapeno.getCampaignRecord(campaignID);
            var playListMode = recCampaign['campaign_playlist_mode'] == 0 ? 'sequencer' : 'scheduler';
            var snippet = '<li data-campaignid="' + campaignID + '"data-icon="gear" class="' + Elements.CLASS_SELECTED_LIB_RESOURCE2 + '" data-theme="a"><a href="#">' +
                '<img src="https://secure.dynawebs.net/_msportal/_images/campaign.png">' +
                '<h2>' + recCampaign['campaign_name'] + '</h2>' +
                '<p>play list mode: ' + playListMode + '</p></a>' +
                '<a data-theme="a" class="' + Elements.CLASS_FIX_PROP_OPEN_LI_BUTTON_POSITION + ' ' + Elements.CLASS_SELECTED_LIB_RESOURCE2 + ' ' + Elements.CLASS_RESOURCE_LIB_OPEN_PROPS2 + '"></a>' +
                '</li>';
            $(self.m_container).append($(snippet));
        }
    },

    /**
     Wire changing of campaign name through campaign properties
     @method _wireUI
     @return none
     **/
    _wireUI: function () {
        var self = this;

        var campaignSelName;
        $(Elements.SELECTED_CAMPAIGN_PROPERTIES).on("input", function (e) {
            window.clearTimeout(campaignSelName);
            campaignSelName = window.setTimeout(function () {
                self._onChange(e);
            }, 200);
        });
    },

    /**
     Update the msdb with newly updated campaign name
     @method _onChange
     @param {event} event on change
     @return none
     **/
    _onChange: function (e) {
        var self = this;
        var text = $(e.target).val();
        jalapeno.setCampaignRecord(self.seletedCampaignID, 'campaign_name', text);
    },

    /**
     Listen for user trigger on campaign selection and populate the properties panel
     @method _listenOpenProps
     @return none
     **/
    _listenOpenProps: function () {
        var self = this;

        $(Elements.CLASS_SELECTED_LIB_RESOURCE).tap(function (e) {

            var openProps = $(e.target).closest('a').hasClass('resourceLibOpenProps') ? true : false;
            var resourceElem = $(e.target).closest('li');
            var resourceProp = $(resourceElem).find(Elements.CLASS_RESOURCE_LIB_OPEN_PROPS);
            self.seletedCampaignID = $(resourceElem).data('campaignid');

            self.m_property.viewPanel(Elements.CAMPAIGN_PROPERTIES);

            $(Elements.CLASS_SELECTED_LIB_RESOURCE).css('background-image', 'linear-gradient(#fff , #f1f1f1)');
            $(resourceElem).css('background-image', 'linear-gradient(#bebebe , #bebebe)');
            $(resourceProp).css('background-image', 'linear-gradient(#bebebe , #bebebe)');

            var recCampaign = jalapeno.getCampaignRecord(self.seletedCampaignID);

            $(Elements.SELECTED_CAMPAIGN_PROPERTIES).val(recCampaign['campaign_name']);

            $(self.m_container).listview('refresh');

            if (openProps) {
                commBroker.getService('CompProperty').openPanel(e);
            } else {
                self._campaignSelected();
            }

            e.stopImmediatePropagation();
            return false;
        });
    },

    /**
     When a campaign is selected disable the arrow navigation component
     @method _campaignSelected
     @return none
     **/
    _campaignSelected: function () {
        var self = this;
        commBroker.getService('Campaign').setSelectedCampaign(self.seletedCampaignID);
        self.m_screenArrowSelector.selectLast();
    },

    /**
     Load campaigns after authentication completed
     @method loadCampaigns
     @return none
     **/
    loadCampaigns: function () {
        var self = this;
        self._loadCampaignList();
        $(Elements.CAMPAIGN_SELECTOR_LIST).listview('refresh');
        self._listenOpenProps();
    }

}
