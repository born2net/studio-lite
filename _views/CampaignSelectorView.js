/**
 Campaign selector, class extends Backbone > View and used to select a campaign or create a new one
 @class CampaignSelectorView
 @constructor
 @return {Object} instantiated CampaignSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var CampaignSelectorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.seletedCampaignID = -1;

            $('#newCampaign').on('click', function (e) {
                var toView = self.options.appCoreStackView.getViewByID(self.options.to);
                self.options.appCoreStackView.slideToPage(toView, 'right');
                return false;
            });

            $('#removeCampaign').on('click', function (e) {
                if (self.seletedCampaignID != -1){
                    var selectedLI = self.$el.find('[data-campaignid="' + self.seletedCampaignID + '"]');
                    selectedLI.remove();
                    self.removeCampaignFromMSDB(self.seletedCampaignID);
                }
                return false;
            });

           /* $(this.el).find('#prev').on('click', function (e) {
                if (self.options.from == null)
                    return;
                var fromView = self.options.appCoreStackView.getViewByID(self.options.from);
                self.options.appCoreStackView.slideToPage(fromView, 'left');
                return false;
            });*/

            this._loadCampaignList();
            this._listenOpenProps();
            this._listenSelectCampaign();
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

                var snippet = '<a href="#" class="selectAppListItem  list-group-item" data-campaignid="' + campaignID + '">' +
                    '<h4>' + recCampaign['campaign_name'] + '</h4>' +
                    '<p class="list-group-item-text">play list mode:' + playListMode + '</p>' +
                    '<div class="openProps">' +
                    '<button type="button" class="openPropsButton btn btn-default btn-sm"><span class="glyphicon glyphicon-th"></span></button>' +
                    '</div>' +
                    '</a>';
                $('#campaignSelectorList').append($(snippet));
            }
        },

        /**
         Listen select campaign
         @method _listenSelectCampaign
         @return none
         **/
        _listenSelectCampaign: function () {
            var self = this;
            $('.selectAppListItem').on('click',function (e) {
                $('.selectAppListItem ',self.el).removeClass('active');
                $(this).addClass('active');
                self.seletedCampaignID = $(this).data('campaignid');
                var toView = self.options.appCoreStackView.getViewByID(Elements.CAMPAIGN);
                self.options.appCoreStackView.slideToPage(toView, 'right');
                return false;
            });
        },

        /**
         Listen for user trigger on campaign selection and populate the properties panel
         @method _listenOpenProps
         @return none
         **/
        _listenOpenProps: function () {
            var self = this;

            $('.openPropsButton').on('click', function (e) {
                $('.selectAppListItem ',self.el).removeClass('active');
                var elem = $(e.target).closest('a').addClass('active');
                self.seletedCampaignID = $(elem).data('campaignid');
                var recCampaign = jalapeno.getCampaignRecord(self.seletedCampaignID);
                $(Elements.FORM_CAMPAIGN_NAME).val(recCampaign['campaign_name']);

                var propertiesPanel = Backbone.comBroker.getService(Services.PROPERTIES_PANEL);
                propertiesPanel.openPropertiesPanel();

                e.stopImmediatePropagation();
                return false;
            });
        },


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
         When a campaign is selected disable the arrow navigation component
         @method _campaignSelected
         @return none
         **/
        _campaignSelected: function () {
            var self = this;
            commBroker.getService('Campaign').setSelectedCampaign(self.seletedCampaignID);
            self.m_screenArrowSelector.selectLast();
        },


    })

    return CampaignSelectorView;

});

