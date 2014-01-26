/**
 The Campaign Manager View instance instantiates all of the major components that belong
 to a campaign (newly created or opened existing) including the "Campaign" instance itself, screen orientation UI selector,
 screen resolution UI selector, the sequencer, channels instance and more.
 In a way its the glue between all of the major instances that are related to campaign, and so they are instantiated here and init to bring
 them to life.
 @class CompCampaignNavigator
 @constructor
 @param {String} i_container element that CompCampaignNavigator inserts itself into
 @return {Object} instantiated CompCampaignNavigator
 **/
define(['jquery', 'backbone', 'ResolutionSelectorView', 'OrientationSelectorView', 'CampaignView', 'SequencerView', 'ChannelListView' ],
    function ($, Backbone, ResolutionSelectorView, OrientationSelectorView, CampaignView, SequencerView, ChannelListView) {

        var CampaignManagerView = Backbone.View.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                this.screenResolution = new ResolutionSelectorView({
                    el: '#123'
                });

                this.screenOrientation = new OrientationSelectorView({
                    el: '#123'
                });

                this.campaignView = new CampaignView({
                    el: '#123'
                });

                this.sequencerView = new SequencerView({
                    el: '#123'
                });
                this.channelListView = new ChannelListView({
                    el: '#123'
                });

            }
        })


        return CampaignManagerView;

    });

