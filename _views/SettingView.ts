///<reference path="../typings/lite/app_references.d.ts" />

/**
 Application global settings
 @class SettingView
 @constructor
 @return {Object} instantiated SettingView
 **/
//GULP_ABSTRACT_EXTEND extends Backbone.View<Backbone.Model>
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class SettingView extends Backbone.View<Backbone.Model> {
                public link:string;
                public image:string;
                public someNum:number;
   }
}
//GULP_ABSTRACT_END
define(['jquery'], function ($) {

    /**
     Station polling time changes
     @event STATIONS_POLL_TIME_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    //BB.EVENTS.STATIONS_POLL_TIME_CHANGED = 'STATIONS_POLL_TIME_CHANGED';

    /**
     Theme changed
     @event THEME_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    //BB.EVENTS.THEME_CHANGED = 'THEME_CHANGED';

    class SettingView extends Backbone.View<Backbone.Model> {

        private m_simpleStorage:simplestoragejs.SimpleStorage;
        private m_rendered:any;
        private m_stationsPollingSlider:any;
        private m_options:any;

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;
            this.id = self.m_options.el;
            this.$el = $(this.id);
            this.el = this.$el.get(0);

            BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.m_simpleStorage = undefined;
            self.listenTo(self.m_options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e === self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
        }

        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        private _render():void {
            var self = this;
            require(['nouislider', 'simplestorage'], function (nouislider, simpleStorage) {
                self.m_simpleStorage = simpleStorage;

                var pollStationsTime = self.m_simpleStorage.get('pollStationsTime');
                if (_.isUndefined(pollStationsTime)) {
                    pollStationsTime = 120;
                    self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                }

                BB.CONSTS['THEME'] = self.m_simpleStorage.get('theme');
                if (_.isUndefined(BB.CONSTS['THEME'])) {
                    BB.CONSTS['THEME'] = 'light';
                }

                $(Elements.THEME_OPTION).selectpicker('val',BB.CONSTS['THEME']);

                var bannerMode = self.m_simpleStorage.get('bannerMode');
                if (_.isUndefined(bannerMode)) {
                    bannerMode = 1;
                    self.m_simpleStorage.set('bannerMode', bannerMode);
                }
                // $(Elements.PREVIEW_FULL_OPTION + ' option[value=' + bannerMode + ']').attr('selected', 'selected');
                $(Elements.PREVIEW_FULL_OPTION).selectpicker('val',bannerMode);

                var fqSwitchMode = self.m_simpleStorage.get('fqSwitchMode');
                if (_.isUndefined(fqSwitchMode)) {
                    fqSwitchMode = 0;
                    self.m_simpleStorage.set('fqSwitchMode', fqSwitchMode);
                }
                //$(Elements.FQ_SWITCH_OPTION + ' option[value=' + fqSwitchMode + ']').attr('selected', 'selected');
                $(Elements.FQ_SWITCH_OPTION).selectpicker('val',fqSwitchMode);

                var adStatsSwitchMode = self.m_simpleStorage.get('adStatsMode');
                if (_.isUndefined(adStatsSwitchMode)) {
                    adStatsSwitchMode = 0;
                    self.m_simpleStorage.set('adStatsMode', adStatsSwitchMode);
                }
                //$(Elements.AD_STATS_SWITCH_OPTION + ' option[value=' + adStatsSwitchMode + ']').attr('selected', 'selected');
                $(Elements.AD_STATS_SWITCH_OPTION).selectpicker('val',adStatsSwitchMode);

                self.m_stationsPollingSlider = $(Elements.STATION_POLL_SLIDER).noUiSlider({
                    handles: 1,
                    start: [pollStationsTime],
                    step: 1,
                    range: [60, 360],
                    serialization: {
                        to: [$(Elements.STATION_POLL_LABEL), 'text']
                    }
                });
                self._listenStationsPollingSlider();
                self._listenBannerPreviewChange();
                self._listenFasterQueueSwitchChange();
                self._listenAdStatsSwitchChange();
                self._listenThemeChange();
            });
        }

        /**
         Listen to stations polling slider changes
         @method _listenStationsPollingSlider
         **/
        private _listenStationsPollingSlider():void {
            var self = this;
            $(self.m_stationsPollingSlider).change(function (e) {
                var pollStationsTime = $(Elements.STATION_POLL_LABEL).text();
                self.m_simpleStorage.set('pollStationsTime', pollStationsTime);
                BB.comBroker.fire(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'], this, null, pollStationsTime);
            });
        }

        /**
         Listen changes in full screen preview settings options
         @method _listenBannerPreviewChange
         **/
        private _listenBannerPreviewChange():void {
            var self = this;
            $(Elements.PREVIEW_FULL_OPTION).on('change', function (e) {
                // var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val() == "on" ? 1 : 0;
                var state = $(Elements.PREVIEW_FULL_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('bannerMode', state);
            });

        }

        /**
         Listen changes in FasterQueue settings options
         @method _listenFasterQueueSwitchChange
         **/
        private _listenFasterQueueSwitchChange():void {
            var self = this;
            $(Elements.FQ_SWITCH_OPTION).on('change', function (e) {
                var state = $(Elements.FQ_SWITCH_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('fqSwitchMode', state);
                if (state === "1") {
                    $(Elements.CLASS_FASTERQ_PANEL).fadeIn();
                } else {
                    $(Elements.CLASS_FASTERQ_PANEL).fadeOut();
                }
            });
        }

        /**
         Listen changes in FasterQueue settings options
         @method _listenAdStatsSwitchChange
         **/
        private _listenAdStatsSwitchChange():void {
            var self = this;
            $(Elements.AD_STATS_SWITCH_OPTION).on('change', function (e) {
                var state = $(Elements.AD_STATS_SWITCH_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('adStatsMode', state);
                if (state === '1') {
                    $(Elements.CLASS_ADSTATS_PANEL).fadeIn();
                } else {
                    $(Elements.CLASS_ADSTATS_PANEL).fadeOut();
                }
            });
        }

        /**
         Listen changes in theme style
         @method _listenThemeChange
         **/
        private _listenThemeChange():void {
            var self = this;
            $(Elements.THEME_OPTION).on('change', function (e) {
                BB.CONSTS['THEME'] = $(Elements.THEME_OPTION + ' option:selected').val();
                self.m_simpleStorage.set('theme', BB.CONSTS['THEME']);
                if (BB.CONSTS['THEME'] === 'light') {
                    bootbox.alert($(Elements.MSG_BOOTBOX_RELOAD_THEME).text());
                } else {
                    BB.lib.loadCss('style_' + BB.CONSTS['THEME'] + '.css');
                }
                BB.comBroker.fire(BB.EVENTS.THEME_CHANGED);
            });
        }
    }
    return SettingView;

});