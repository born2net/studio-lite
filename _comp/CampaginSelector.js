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

        commBroker.listen(CompMSDB.databaseReady, function (e) {
            self._loadCampaignList();
            $(Elements.CAMPAIGN_SELECTOR_LIST).listview('refresh');
            self._listenOpenProps();
        });
    },

    /**
     Populate the LI with all available campaigns from msdb
     @method _loadCampaignList
     @return none
     **/
    _loadCampaignList: function () {
        var self = this;
        self.m_selected_resource_id = undefined;

        var self = this;
        var msdb = commBroker.getService('CompMSDB');
        var tableCampaigns = msdb.m_db.table_campaigns();

        var keys = tableCampaigns.getAllPrimaryKeys();
        $(keys).each(function (key, campaign_id) {
            var recCampain = tableCampaigns.getRec(campaign_id);
            var playListMode = recCampain.campaign_playlist_mode == 0 ? 'sequencer' : 'scheduler';
            var snippet = '<li data-campaignid="' + campaign_id + '"data-icon="gear" class="selectedLibResource" data-theme="b"><a href="#">' +
                '<img src="https://secure.dynawebs.net/_msportal/_images/campaign.png">' +
                '<h2>' + recCampain.campaign_name + '</h2>' +
                '<p>play list mode: ' + playListMode + '</p></a>' +
                '<a data-theme="b" class="fixPropOpenLiButtonPosition selectedLibResource resourceLibOpenProps"></a>' +
                '</li>';
            $(self.m_container).append($(snippet));
        });
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
        var helperSDK = commBroker.getService('HelperSDK');
        helperSDK.setCampaignRecord(self.seletedCampaignID, 'campaign_name', text);
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

            var helperSDK = commBroker.getService('HelperSDK');
            var recCampaign = helperSDK.getCampaignRecord(self.seletedCampaignID);

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
    }
}
