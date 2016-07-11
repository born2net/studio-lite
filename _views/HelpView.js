/**
 Help Backbone > View
 @class Help
 @constructor
 @return {Object} instantiated Help
 **/
define(['jquery', 'backbone', 'video'], function ($, Backbone, videojs) {

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
            self._initVideo();
        },

        /**
         Listen to watch intro button
         @method _listenWatchIntro
         **/
        _listenWatchIntro: function(){
            var self = this;
            $(Elements.CLASS_VIDEOS).click(function (e) {
                bootbox.hideAll();
                var videoName = $(e.target).attr('name');
                if (_.isUndefined(videoName))
                    videoName = $(e.target).closest('button').attr('name');

                $(Elements.VIDEO_INTRO).find('video:nth-child(1)').attr("src",videoName);
                $(Elements.VIDEO_MODAL).modal('show');
                var w = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth() - 100;
                var h = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppHeight() - 200;;
                $(Elements.VIDEO_INTRO).width(w).height(h);
            });
        },

        /**
         init HTML5 video.js component
         @method _initVideo
         **/
        _initVideo: function(){
            var self = this;
            videojs(BB.lib.unhash(Elements.VIDEO_INTRO)).ready(function () {
                self.m_videoPlayer = this;
                //var w = $(Elements.VIDEO_MODAL).width();
                //var h = $(Elements.VIDEO_MODAL).height() - 100;
                var w = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth() - 100;
                var h = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppHeight() - 200;;
                $(Elements.VIDEO_INTRO).width(w).height(h);
                self.m_videoPlayer.load();
                //self.m_videoPlayer.play();

                BB.comBroker.listen(BB.EVENTS.APP_SIZED, function(){
                    var w = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth() - 100;
                    var h = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppHeight() - 200;;
                    $(Elements.VIDEO_INTRO).width(w).height(h);
                });
            });
        },

        /**
         Listen to help links clicks
         @method _listenHelpLinks
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
         @method _listenStopVideo
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

