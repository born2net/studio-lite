/**
 CampaignView manages campaign related logic and UI
 @class CampaignView
 @constructor
 @return {Object} instantiated CampaignView
 **/
define(['jquery', 'backbone', 'SequencerView', 'ChannelListView'], function ($, Backbone, SequencerView, ChannelListView) {

    var CampaignView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;


            this.m_sequencerView = new SequencerView({
                el: '#123'
            });
            this.m_channelListView = new ChannelListView({
                el: '#123'
            });

            this.m_campainProperties = new Backbone.View({
                el: Elements.CAMPAIGN_PROPERTIES
            })

            this.m_propertiesPanel = Backbone.comBroker.getService(Services.PROPERTIES_PANEL);
            this.m_propertiesPanel.addView(this.m_campainProperties);
            this.m_propertiesPanel.selectView(this.m_campainProperties);


            $(this.el).find('#next').on('click',function(e){
                if (self.options.to==null)
                    return;
                var toView = self.options.appCoreStackView.getViewByID(self.options.to);
                self.options.appCoreStackView.slideToPage(toView, 'right');
                return false;
            });
            $(this.el).find('#prev').on('click',function(e){
                if (self.options.from==null)
                    return;
                var fromView = self.options.appCoreStackView.getViewByID(self.options.from);
                self.options.appCoreStackView.slideToPage(fromView, 'left');
                return false;
            });
        },

        render: function() {
        }

    })


    return CampaignView;

});

