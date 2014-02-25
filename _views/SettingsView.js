/**
 Settings Backbone > View
 @class SettingsView
 @constructor
 @return {Object} instantiated SettingsView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.EVENTS.STATIONS_POLL_TIME_CHANGED = 'STATIONS_POLL_TIME_CHANGED';

    var SettingsView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
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
                if (_.isUndefined(pollStationsTime)){
                    pollStationsTime = 120;
                    self.m_simpleStorage.set('pollStationsTime',pollStationsTime);
                }

                var stationsPollingSlider = $(Elements.STATION_POLL_SLIDER).noUiSlider({
                    handles: 1,
                    start: [pollStationsTime],
                    step: 1,
                    range: [60, 360],
                    serialization: {
                        to: [ $(Elements.STATION_POLL_LABEL), 'text' ]
                    }
                });

                $(stationsPollingSlider).change(function (e) {
                    var pollStationsTime = $(Elements.STATION_POLL_LABEL).text();
                    self.m_simpleStorage.set('pollStationsTime',pollStationsTime);
                    BB.comBroker.fire(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'],this,null,pollStationsTime);
                });

            });
        }
    });

    return SettingsView;
});

