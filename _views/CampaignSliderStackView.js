/**
 Main content of Application window, class extends Backbone > View > StackView > Slider for animation of selected content
 @class CampaignSliderStackView
 @constructor
 @return {object} instantiated AppViewSlider
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    BB.SERVICES.CAMPAIGN_SLIDER_STACK_VIEW = 'CampaignSliderStackView';

    var CampaignSliderStackView = Backbone.StackView.Slider.extend({

        /**
         @method AppViewSlider
         @param {Constructor} none
         **/
        initialize: function () {
            var self = this;
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            BB.comBroker.setService(BB.SERVICES.CAMPAIGN_SLIDER_STACK_VIEW, self);
        }
    });

    return CampaignSliderStackView;
});