/**
 Settings Backbone > View
 @class SettingsView
 @constructor
 @return {Object} instantiated SettingsView
 **/
define(['jquery', 'backbone', 'nouislider'], function ($, Backbone, nouislider) {

    var SettingsView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            $("#sample-minimal").noUiSlider({
                handles: 1,
                start: [120],
                step: 1,
                range: [60, 360],
                serialization: {
                    to: [ $("#stationPollLabel"), 'text' ]
                }
            }).change(function (e) {
                    log(e);
                });
        }
    });

    return SettingsView;
});

