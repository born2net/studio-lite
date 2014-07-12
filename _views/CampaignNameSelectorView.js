/**
 Select a campaign name during new campaign creation wizard
 @class CampaignNameView
 @constructor
 @return {Object} instantiated CampaignNameView
 **/
define(['jquery', 'backbone', 'video'], function ($, Backbone, video) {

    BB.SERVICES.CAMPAIGN_NAME_SELECTOR_VIEW = 'CampaignNameSelectorView';

    var CampaignNameSelectorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_campaignName = 'My campaign';

            $(this.el).find(Elements.NEXT).on('click', function () {
                self.options.stackView.slideToPage(self.options.to, 'right');
                return false;
            });
            $(this.el).find(Elements.PREVIOUS).on('click', function () {
                self.options.stackView.slideToPage(self.options.from, 'left');
                return false;
            });

            $('#launchDemoModel').click(function(e){
                videojs("MY_VIDEO_1").ready(function(){
                    self.m_videoPlayer = this;
                    var w = $('#myModal').width();
                    var h = $('#myModal').height() - 100;
                    $('.video-js').width(w).height(h);
                    self.m_videoPlayer.load();
                    self.m_videoPlayer.play();

                });
            });

            $('#closeModal').click(function() {
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            });

            self._listenInputChange();
        },

        /**
         Listen to changes in user campaign name input
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                if (e.keyCode == 13) {
                    self.options.stackView.slideToPage(self.options.to, 'right');
                    return false;
                }
                self.m_campaignName = $(e.target).val();
            }, 150, false);
            $(Elements.NEW_CAMPAIGN_NAME).keyup(onChange);
        },

        /**
         Returns the selected campaign name
         @method getCampaignName
         @return {String} campaign name
         **/
        getCampaignName: function () {
            var self = this;
            return self.m_campaignName;
        }
    });

    return CampaignNameSelectorView;

});