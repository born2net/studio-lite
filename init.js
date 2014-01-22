/**
 Require js initialization module definition file
 @class Require init.js
 **/
require.config({
    baseUrl: '/_studiolite-dev/',
    paths: {
        "jquery": '_common/_jquery/std/jq1.9.1/jquery-1.9.1',
        "backbone": '_common/_js/backbone/backbone',
        "underscore": '_common/_js/underscore/underscore',
        "bootstrap": '_common/_js/bootstrap/js/bootstrap',
        "bootbox": '_common/_js/bootbox/bootbox',
        "Elements": 'Elements',
        "AppRouter": '_comps/AppRouter',
        "ComBroker": '_comps/ComBroker',
        "StackView": '_views/StackView',
        "WaitView": '_views/WaitView',
        "AppEntryFaderView": '_views/AppEntryFaderView',
        "LoginView": '_views/LoginView',
        "AppSliderView": '_views/AppSliderView',
        "CampaignSelectorView": '_views/CampaignSelectorView',
        "CampaignView": '_views/CampaignView',
        "ResolutionSelectorView": '_views/ResolutionSelectorView',
        "OrientationSelectorView": '_views/OrientationSelectorView',
        "PopModal": '_views/PopModal',
        "Lib": '_comps/Lib'
    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'sdk': {
            exports: 'sdk'
        },
        'underscore': {
            exports: '_'
        },
        "bootstrap": {
            deps: ["jquery"]
        },
        "bootbox": {
            deps: ["jquery"],
            exports: 'bootbox'
        },
        "Elements": {
            exports: 'Elements'
        },
        "ComBroker": {
            deps: ["backbone", "jquery"]
        },
        "Lib": {
            deps: ["backbone", "jquery"]
        }
    }
});

require(['StudioLite'],function(StudioLite){
    new StudioLite();
});