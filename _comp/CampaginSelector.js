/*/////////////////////////////////////////////

 CompCampaignSelector

 /////////////////////////////////////////////*/

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

    _init: function () {
        var self = this;
        self.m_property.initPanel('#campaignProperties', true);

        self.m_screenArrowSelector = commBroker.getService('ScreenArrowSelector');

        $('#startNewCampaign').on('tap', function () {
            self.m_screenArrowSelector.selectNext();
        });

        commBroker.listen(CompMSDB.databaseReady, function (e) {
            self._loadCampaignList();
            $('#campaignSelectorList').listview('refresh');
            self._listenOpenProps();
        });
    },

    _loadCampaignList: function () {
        var self = this;
        self.m_selected_resource_id = undefined;

        var self = this;
        var compeMSDB = commBroker.getService('CompMSDB');
        var tableCampaigns = compeMSDB.m_db.table_campaigns();

        var keys = tableCampaigns.getAllPrimaryKeys();
        $(keys).each(function (key, campaign_id) {
            var recCampain = tableCampaigns.getRec(campaign_id);
            var playListMode = recCampain.campaign_playlist_mode == 0 ? 'sequencer' : 'scheduler';
            var snippet = '<li data-campaignid="' + campaign_id + '"data-icon="gear" class="selectedLibResource" data-theme="c"><a href="#">' +
                '<img src="https://secure.dynawebs.net/_msportal/_images/campaign.png">' +
                '<h2>' + recCampain.campaign_name + '</h2>' +
                '<p>play list mode: ' + playListMode + '</p></a>' +
                '<a data-theme="c" class="selectedLibResource resourceLibOpenProps"></a>' +
                '</li>';
            $(self.m_container).append($(snippet));
        });
    },

    _wireUI: function(){
        var self = this;

        var campaignSelName;
        $("#selectedCampaignProperties").on("input", function (e) {
            window.clearTimeout(campaignSelName);
            campaignSelName = window.setTimeout(function () {
                self._onChange(e);
            }, 200);
        });
    },

    _onChange: function(e) {
        var self = this;
        var text = $(e.target).val();
        var helperSDK = commBroker.getService('HelperSDK');
        helperSDK.setCampaignRecord(self.seletedCampaignID, 'campaign_name', text);
    },

    _listenOpenProps: function () {
        var self = this;

        $('.selectedLibResource').tap(function (e) {

            var openProps = $(e.target).closest('a').hasClass('resourceLibOpenProps') ? true : false;
            var resourceElem = $(e.target).closest('li');
            var resourceProp = $(resourceElem).find('.resourceLibOpenProps');
            self.seletedCampaignID = $(resourceElem).data('campaignid');

            self.m_property.viewPanel('#campaignProperties');

            $('.selectedLibResource').css('background-image', 'linear-gradient(#fff , #f1f1f1)');
            $(resourceElem).css('background-image', 'linear-gradient(#bebebe , #bebebe)');
            $(resourceProp).css('background-image', 'linear-gradient(#bebebe , #bebebe)');

            var helperSDK = commBroker.getService('HelperSDK');
            var recCampaign = helperSDK.getCampaignRecord(self.seletedCampaignID);

            $('#selectedCampaignProperties').val(recCampaign['campaign_name']);

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

    _campaignSelected: function () {
        var self = this;
        commBroker.getService('Campaign').setSelectedCampaign(self.seletedCampaignID);
        self.m_screenArrowSelector.selectLast();
    }
}
