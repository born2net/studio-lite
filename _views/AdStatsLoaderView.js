/**
 Settings Backbone > AdStatsLoaderView
 @class AdStatsLoaderView
 @constructor
 @return {Object} instantiated AdStatsLoaderView
 **/
define(['jquery', 'backbone', 'simplestorage'], function ($, Backbone, simpleStorage) {

    var AdStatsLoaderView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_simpleStorage = simpleStorage;
            BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
            self._adStatsSwitchMode();
        },

        /**
         Enable / Disable FasterQueue App mode
         @method _adStatsSwitchMode
         **/
        _adStatsSwitchMode: function () {
            var self = this;
            var adStatsMode = self.m_simpleStorage.get('adStatsMode');
            if (_.isUndefined(adStatsMode) || adStatsMode == '0') {
                $(Elements.CLASS_ADSTATS_PANEL).fadeOut();
            } else {
                $(Elements.CLASS_ADSTATS_PANEL).fadeIn();
            }
        },

        /**
         Instantiate AdStatsView
         @method _render
         **/
        _render: function () {
            var self = this;
            require(['AdStatsView'], function (AdStatsView) {
                self.m_adStatsView = new AdStatsView({
                    el: Elements.AD_STATS_PANEL_CONTAINER,
                    stackViewMaster: self.options.stackView
                });
            });
        }
    });

    return AdStatsLoaderView;
});

