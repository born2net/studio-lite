/**
 The Core Application StackView between Login screen and main app
 @class AppEntryFaderView
 @constructor
 @return {object} instantiated AppCoreStackView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    /**
     @method AppCoreStackView
     @param {Constructor} none
     @return {Object} require.js module
     **/
    var PropertyPanelView = Backbone.StackView.Modal.extend({
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
            // alert(Elements.PROP_PANEL);
        }
    });
    return PropertyPanelView;
});