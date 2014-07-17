/**
 Help Backbone > InstallView
 @class Help
 @constructor
 @return {Object} instantiated Help
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var InstallView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            $(Elements.CLASS_HELP_LINKS, self.$el).on('click', function (e) {
                var url = $(e.target).attr('href');
                window.open(url, '_blank');
                return false;
            });
        }
    });

    return InstallView;
});

