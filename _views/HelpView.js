/**
 Help Backbone > View
 @class Help
 @constructor
 @return {Object} instantiated Help
 **/
define(['jquery', 'backbone', 'simplestorage'], function ($, Backbone, simplestorage) {

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
                var autopopup = simplestorage.get('autopopup');
                autopopup = _.isUndefined(autopopup) ? 1 : autopopup;
                if (autopopup > 2)
                    return;
                if (autopopup == 1) {
                    $(Elements.AUTO_POPUP_LABEL).hide();
                } else {
                    $(Elements.AUTO_POPUP_LABEL).show();
                }
                simplestorage.set('autopopup',2);
                $(Elements.WATCH_INTRO).trigger('click');
            }, 8000);

            $(Elements.AUTO_POPUP).on('click',function(e){
                var status = $(e.target).prop('checked');
                if (status) {
                    simplestorage.set('autopopup',3);
                } else {
                    simplestorage.set('autopopup',2);
                }

            });

            $(Elements.WATCH_INTRO).click(function (e) {
                bootbox.hideAll()
                var autopopup = simplestorage.get('autopopup');
                if (autopopup < 3){
                    $(Elements.AUTO_POPUP ).prop('checked', false);
                } else {
                    $(Elements.AUTO_POPUP).prop('checked', true);
                }
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

