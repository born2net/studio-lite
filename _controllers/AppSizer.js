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
            this.listenSizeChanges();
            $(window).trigger('resize');
            /*setTimeout(function(){
                $(Elements.APP_CONTENT).fadeIn();
            },500)*/



            $(Elements.TOGGLE_PANEL).on('click', function () {
                if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')) {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.PROP_PANEL_WRAP).fadeOut(function () {
                        $(Elements.TOGGLE_PANEL).html('<');
                        $(Elements.PROP_PANEL_WRAP).addClass('hidden-sm hidden-md');
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-sm-9 col-md-9');
                        $(Elements.MAIN_PANEL_WRAP).addClass('col-md-12');
                    });
                } else {
                    $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                    $(Elements.TOGGLE_PANEL).html('>');
                    $(Elements.MAIN_PANEL_WRAP).addClass('col-sm-9 col-md-9');
                    setTimeout(function () {
                        $(Elements.MAIN_PANEL_WRAP).removeClass('col-md-12');
                        $(Elements.PROP_PANEL_WRAP).children().hide();
                        $(Elements.PROP_PANEL_WRAP).removeClass('hidden-sm hidden-md');
                        $(Elements.PROP_PANEL_WRAP).children().fadeIn();
                    }, 500)
                }
            });

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
});


