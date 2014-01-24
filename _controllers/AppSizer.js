/**
 Manages application size changes
 @class AppSizer
 @constructor
 @return {Object} instantiated AppAuth
 **/
(function (window, factory) {
    'use strict';
    var Backbone = window.Backbone;
    if (typeof define === 'function' && define.amd) {
        return define(['backbone', 'underscore'], function () {
            return factory.apply(window, arguments);
        });
    } else if (typeof module === 'object' && module.exports) {
        factory.call(window, require('backbone'), require('underscore'));
    } else {
        factory.call(window, Backbone, window._);
    }
}(typeof global === "object" ? global : this, function (Backbone, _) {

    var AppSizer = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this.listenSizeChanges();
            $(window).trigger('resize');
        },

        /**
         Apply style changes to application specific elements upon size changes
         @method listenSizeChanges
         **/
        listenSizeChanges: function () {
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
}));


