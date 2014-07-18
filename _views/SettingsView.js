/**
 Settings Backbone > View
 @class SettingsView
 @constructor
 @return {Object} instantiated SettingsView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     Station polling time changes
     @event STATIONS_POLL_TIME_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    BB.EVENTS.STATIONS_POLL_TIME_CHANGED = 'STATIONS_POLL_TIME_CHANGED';

    var SettingsView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.m_simpleStorage = undefined;
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
        },

        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        _render: function () {
            var self = this;
            require(['nouislider', 'simplestorage'], function (nouislider, simpleStorage) {
                self.m_simpleStorage = simpleStorage;

                var pollStationsTime = self.m_simpleStorage.get('pollStationsTime');
                if (_.isUndefined(pollStationsTime)) {
                    pollStationsTime = 120;
                    self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                }

                var theme = self.m_simpleStorage.get('theme');
                if (_.isUndefined(theme))
                    theme = 'light';
                $(Elements.THEME_OPTION + ' option[value=' + theme + ']').attr("selected", "selected");

                var bannerMode = self.m_simpleStorage.get('bannerMode');
                if (_.isUndefined(bannerMode)) {
                    bannerMode = 1;
                    self.m_simpleStorage.set('bannerMode', bannerMode);
                }
                $(Elements.PREVIEW_FULL_OPTION + ' option[value=' + bannerMode + ']').attr("selected", "selected");

                self.m_stationsPollingSlider = $(Elements.STATION_POLL_SLIDER).noUiSlider({
                    handles: 1,
                    start: [pollStationsTime],
                    step: 1,
                    range: [60, 360],
                    serialization: {
                        to: [ $(Elements.STATION_POLL_LABEL), 'text' ]
                    }
                });

                self._listenStationsPollingSlider();
                self._listenBannerPreviewChange();
                self._listenThemeChange();

            });
        },

        /**
         Listen changes in full screen preview settings options
         @method _listenBannerPreviewChange
         **/
        _listenBannerPreviewChange: function () {
            var self = this;
            $(Elements.PREVIEW_FULL_OPTION).on('change', function (e) {
                // var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val() == "on" ? 1 : 0;
                var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('bannerMode', state);
            });
        },

        /**
         Listen changes in theme style
         @method _listenThemeChange
         **/
        _listenThemeChange: function () {
            var self = this;
            $(Elements.THEME_OPTION).on('change', function (e) {
                var theme = $(Elements.THEME_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('theme', theme);
                if (theme == 'light'){
                    bootbox.alert($(Elements.MSG_BOOTBOX_RELOAD_THEME).text());
                } else {
                    BB.lib.loadCss('style_' + theme + '.css');
                }
            });
        },

        /**
         Listen to stations polling slider changes
         @method _listenStationsPollingSlider
         **/
        _listenStationsPollingSlider: function () {
            var self = this;
            $(self.m_stationsPollingSlider).change(function (e) {
                var pollStationsTime = $(Elements.STATION_POLL_LABEL).text();
                self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                BB.comBroker.fire(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'], this, null, pollStationsTime);
            });
        }
    });

    return SettingsView;
});

