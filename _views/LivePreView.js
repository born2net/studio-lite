/**
 Live preview  in StackView views
 @class LivePreView
 @constructor
 @return {Object} instantiated WaitView
 **/
define(['jquery', 'backbone', 'flashdetect'], function ($, Backbone, flashdetect) {

    BB.SERVICES.LIVEPREVIEW = 'LivePreView';

    var LivePreView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['LIVEPREVIEW'], self);
            self.m_lastLaunce = undefined;
            self.m_sceneID = undefined;
            self.m_campaignID = undefined;
            self.m_campaignTimelineID = undefined;
            self._listenReplay();
            self._listenStop();
            self._listenExit();
        },

        /**
         Listen to live preview replay
         @method _listenReplay
         **/
        _listenReplay: function () {
            var self = this;
            $(Elements.PLAYER_PREVIEW_REPLAY, self.$el).on('click', function () {
                self.m_lastLaunce();
            });
        },

        /**
         Listen to live preview stop
         @method _listenStop
         **/
        _listenStop: function () {
            var self = this;
            $(Elements.PLAYER_PREVIEW_STOP, self.$el).on('click', function () {
                $(Elements.IFRAME_EMBEDDED).attr('src', '');
            });
        },

        /**
         Listen to live preview exit
         @method _listenExit
         **/
        _listenExit: function () {
            var self = this;
            $(Elements.PLAYER_PREVIEW_EXIT, self.$el).on('click', function () {
                $(Elements.IFRAME_EMBEDDED).attr('src', '');
                var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);
                appEntryFaderView.selectView(Elements.APP_CONTENT);
            });
        },

        /**
         Check that flash is installed
         @method _checkFlash
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _checkFlash: function () {
            if (!FlashDetect.installed || !FlashDetect.versionAtLeast(13)) {
                bootbox.alert({
                    message: $(Elements.MSG_BOOTBOX_NO_FLASH).text()
                });
                return false;
            } else {
                return true;
            }
        },

        /**
         Listen to live preview launch
         @method launch
         **/
        launchScene: function (i_sceneID) {
            var self = this;
            if (_.isUndefined(i_sceneID) && _.isUndefined(self.m_sceneID))
                return;
            if (self._checkFlash() == false)
                return;
            self.m_sceneID = i_sceneID != undefined ? i_sceneID : self.m_sceneID;
            self.m_lastLaunce = self.launchScene;
            var navigationView = BB.comBroker.getService(BB.SERVICES['NAVIGATION_VIEW']);
            navigationView.save(function () {
                require(['simplestorage'], function (simpleStorage) {
                    var bannerMode = simpleStorage.get('bannerMode');
                    if (_.isUndefined(bannerMode))
                        bannerMode = 1;
                    var url = pepper.livePreviewScene(self.m_sceneID, bannerMode);
                    var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);
                    appEntryFaderView.selectView(Elements.LIVE_PREVIEW);
                    $(Elements.IFRAME_EMBEDDED).attr('src', url);
                });
            });
        },

        /**
         Listen to live preview launch
         @method launch  i_campaignTimelineNativeID
         **/
        launchTimeline: function (i_campaignID, i_campaignTimelineID) {
            var self = this;
            if (_.isUndefined(i_campaignTimelineID) && _.isUndefined(self.m_campaignTimelineID))
                return;
            if (self._checkFlash() == false)
                return;
            self.m_campaignTimelineID = i_campaignTimelineID != undefined ? i_campaignTimelineID : self.m_campaignTimelineID;
            self.m_campaignID = i_campaignID != undefined ? i_campaignID : self.m_campaignID;
            self.m_lastLaunce = self.launchTimeline;

            var navigationView = BB.comBroker.getService(BB.SERVICES['NAVIGATION_VIEW']);
            navigationView.save(function () {
                require(['simplestorage'], function (simpleStorage) {
                    var bannerMode = simpleStorage.get('bannerMode');
                    if (_.isUndefined(bannerMode))
                        bannerMode = 1;
                    var url = pepper.livePreviewTimeline(self.m_campaignID, self.m_campaignTimelineID, bannerMode);
                    var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);
                    appEntryFaderView.selectView(Elements.LIVE_PREVIEW);
                    $(Elements.IFRAME_EMBEDDED).attr('src', url);
                });
            });
        },

        /**
         Listen to live view launch
         @method launch
         **/
        launchCampaign: function (i_campaignID) {
            var self = this;
            if (_.isUndefined(i_campaignID) && _.isUndefined(self.m_campaignID))
                return;
            if (self._checkFlash() == false)
                return;
            self.m_campaignID = i_campaignID != undefined ? i_campaignID : self.m_campaignID;
            self.m_lastLaunce = self.launchCampaign;

            var navigationView = BB.comBroker.getService(BB.SERVICES['NAVIGATION_VIEW']);
            navigationView.save(function () {
                require(['simplestorage'], function (simpleStorage) {
                    var bannerMode = simpleStorage.get('bannerMode');
                    if (_.isUndefined(bannerMode))
                        bannerMode = 1;
                    var url = pepper.livePreviewCampaign(self.m_campaignID, bannerMode);
                    var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);
                    appEntryFaderView.selectView(Elements.LIVE_PREVIEW);
                    $(Elements.IFRAME_EMBEDDED).attr('src', url);
                });
            });
        }
    });

    return LivePreView;

});

