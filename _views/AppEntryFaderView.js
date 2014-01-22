/**
 The Core Application StackView between Login screen and Main app
 @class AppEntryFaderView
 @constructor
 @return {object} instantiated AppCoreStackView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var AppEntryFaderView = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });
    return AppEntryFaderView;
});