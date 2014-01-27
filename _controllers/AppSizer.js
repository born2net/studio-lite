/**
 Manages application size changes
 @class AppSizer
 @constructor
 @return {Object} instantiated AppAuth
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var AppSizer = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this._listenSizeChanges();
            $(window).trigger('resize');
        },

        /**
         Apply style changes to application specific elements upon size changes
         @method _listenSizeChanges
         **/
        _listenSizeChanges: function () {
            $(window).resize(function () {
                var b = $('body');
                var h = b.css('height').replace('px', '');
                // var w = b.css('width').replace('px', '');
                // reduce footer
                h = h - 115;
                $(Elements.PROP_PANEL_WRAP).height(h);
                $(Elements.MAIN_PANEL_WRAP).height(h);
                $(Elements.APP_NAVIGATOR).height(h);
            });
        }
    });

    return AppSizer;
});


