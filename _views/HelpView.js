/**
 Help Backbone > View
 @class Help
 @constructor
 @return {Object} instantiated Help
 **/
define(['jquery', 'backbone', 'simplestorage', 'video'], function ($, Backbone, simplestorage, videojs) {

    var HelpView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._listenStopVideo();
            self._listenHelpLinks();
            self._listenWatchIntro();
            self._listenAutoPopup();
            self._initVideo();

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

        },

        /**
         Listen to auto popup enable and disable
         @method _listenAutoPopup
         **/
        _listenAutoPopup: function(){
            var self = this;
            $(Elements.AUTO_POPUP).on('click',function(e){
                var status = $(e.target).prop('checked');
                if (status) {
                    simplestorage.set('autopopup',3);
                } else {
                    simplestorage.set('autopopup',2);
                }
            });
        },

        /**
         Listen to watch intro button
         @method _listenAutoPopup
         **/
        _listenWatchIntro: function(){
            var self = this;
            $(Elements.WATCH_INTRO).click(function (e) {
                bootbox.hideAll()
                var autopopup = simplestorage.get('autopopup');
                if (autopopup < 3){
                    $(Elements.AUTO_POPUP ).prop('checked', false);
                } else {
                    $(Elements.AUTO_POPUP).prop('checked', true);
                }
                $(Elements.VIDEO_MODAL).modal('show');
                var w = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth() - 100;
                var h = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppHeight() - 200;;
                $('.video-js').width(w).height(h);
            });
        },

        /**
         init HTML5 video.js component
         @method _listenAutoPopup
         **/
        _initVideo: function(){
            var self = this;
            videojs(BB.lib.unhash(Elements.VIDEO_INTRO)).ready(function () {
                self.m_videoPlayer = this;
                //var w = $(Elements.VIDEO_MODAL).width();
                //var h = $(Elements.VIDEO_MODAL).height() - 100;
                var w = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth() - 100;
                var h = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppHeight() - 200;;
                $('.video-js').width(w).height(h);
                self.m_videoPlayer.load();
                //self.m_videoPlayer.play();

                BB.comBroker.listen(BB.EVENTS.APP_SIZED, function(){
                    var w = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth() - 100;
                    var h = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppHeight() - 200;;
                    $('.video-js').width(w).height(h);
                });
            });
        },

        /**
         Listen to help links clicks
         @method _listenAutoPopup
         **/
        _listenHelpLinks: function(){
            var self = this;
            $(Elements.CLASS_HELP_LINKS, self.$el).on('click', function (e) {
                var url = $(e.target).attr('href');
                window.open(url, '_blank');
                return false;
            });
        },

        /**
         Listen to stop video clicks
         @method _listenAutoPopup
         **/
        _listenStopVideo: function(){
            var self = this;
            var stopVideo = function(){
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            };
            $('.close').on('click',function(){
                stopVideo();
            });
            $(Elements.CLOSE_MODAL).on('click',function(){
                stopVideo();
            });
        }
    });

    return HelpView;
});

