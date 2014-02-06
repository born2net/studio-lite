/**
 Main content of Application window, class extends Backbone > View > StackView > Slider for animation of selected content
 @class CampaignSliderStackView
 @constructor
 @return {object} instantiated AppViewSlider
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var CampaignSliderStackView = Backbone.StackView.Slider.extend({

        /**
         @method AppViewSlider
         @param {Constructor} none
         **/
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });

    return CampaignSliderStackView;
});