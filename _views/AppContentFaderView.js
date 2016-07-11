/**
 The Core Application StackView between main modules (campaign / resources / settings etc)
 @class AppContentFaderView
 @constructor
 @return {object} instantiated AppContentFaderView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    Backbone.SERVICES.APP_CONTENT_FADER_VIEW = 'AppContentFaderView';

    var AppContentFaderView = Backbone.StackView.Fader.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            Backbone.StackView.ViewPort.prototype.initialize.call(this);
        }
    });

    return AppContentFaderView;
});