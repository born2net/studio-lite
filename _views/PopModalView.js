/**
 Popup Modal
 @class PopModalView
 @constructor
 @return {object} instantiated PopModalView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var PopModalView = Backbone.StackView.Modal.extend({

        /**
         @method AppViewSlider
         @param {Constructor} none
         **/
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });
    return PopModalView;
});