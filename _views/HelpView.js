/**
 Help Backbone > View
 @class Help
 @constructor
 @return {Object} instantiated Help
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var HelpView = Backbone.View.extend({

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

            $('#closeModal').click(function () {
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            });

            setTimeout(function () {
                // $(Elements.WATCH_INTRO).trigger('click');
            }, 3000);

            $(Elements.WATCH_INTRO).click(function (e) {
                bootbox.hideAll()
                $(Elements.VIDEO_MODAL).modal('show');
                videojs(BB.lib.unhash(Elements.VIDEO_INTRO)).ready(function () {
                    self.m_videoPlayer = this;
                    var w = $(Elements.VIDEO_MODAL).width();
                    var h = $(Elements.VIDEO_MODAL).height() - 100;
                    $('.video-js').width(w).height(h);
                    self.m_videoPlayer.load();
                    //self.m_videoPlayer.play();
                });


            });
        }
    });

    return HelpView;
});

