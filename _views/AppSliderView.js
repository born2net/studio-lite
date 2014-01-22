/**
 Main content of Application window, class extends Backbone > View > StackView > Slider for animation of selected content
 @class AppViewSlider
 @constructor
 @return {object} instantiated AppViewSlider
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var AppViewSlider = Backbone.StackView.Slider.extend({

        /**
         @method AppViewSlider
         @param {Constructor} none
         **/
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });
    return AppViewSlider;
});