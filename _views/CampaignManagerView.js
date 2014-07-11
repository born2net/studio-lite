/**
 The Campaign Manager View instance is a shell that acts as a StackView Fade instance for Campaign selections
 between it and resources / help / settings etc
 @class CampaignManagerView
 @constructor
 **/
define(['backbone'], function (Backbone) {

    BB.SERVICES.CAMPAIGN_MANAGER_VIEW = 'CampaignManagerView';

    var CampaignManagerView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['CAMPAIGN_MANAGER_VIEW'], self);
        }
    })

    return CampaignManagerView;
});
