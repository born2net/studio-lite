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
            $(Elements.CLASS_HELP_LINKS).on('click', function (e) {
                var url = $(e.target).attr('href');
                window.open(url, '_blank');
                return false;
            });


            /*
             bootbox.dialog({
             message: snippet,
             buttons: {
             danger: {
             label: $(Elements.MSG_BOOTBOX_OK).text(),
             className: "btn-danger",
             callback: function () {
             }
             }
             }
             });
             */

            $('#closeModal').click(function () {
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            });

            setTimeout(function () {
                // $('#launchDemoModel').trigger('click');
            }, 3000);

            $('#launchDemoModel').click(function (e) {
                bootbox.hideAll()
                $(Elements.VIDEO_MODAL).modal('show');
                videojs("MY_VIDEO_1").ready(function () {
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

