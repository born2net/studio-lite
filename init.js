/**
 Require js initialization module definition file
 @class Require init.js
 **/
require.config({
    baseUrl: '/_studiolite-dev/',
    paths: {
        "jquery": '_common/_jquery/std/jq1.9.1/jquery-1.9.1',
        "backbone": '_common/_js/backbone/backbone',
        "backbone.controller": '_common/_js/backbone-controller/backbone.controller',
        "underscore": '_common/_js/underscore/underscore',
        "bootstrap": '_common/_js/bootstrap/js/bootstrap',
        "bootbox": '_common/_js/bootbox/bootbox',
        "Cookie": '_common/_js/cookie/jquery.cookie',
        "RC4": '_common/_js/rc4/RC4',
        "Base64": '_common/_js/base64/jquery.base64',
        "Jalapeno": '_jalapeno/Jalapeno',
        "Services": 'Services',
        "Elements": 'Elements',
        "AppRouter": '_comps/AppRouter',
        "ComBroker": '_controllers/ComBroker',
        "AppAuth": '_controllers/AppAuth',
        "AppSizer": '_controllers/AppSizer',
        "StackView": '_views/StackView',
        "FileMenuView": '_views/FileMenuView',
        "WaitView": '_views/WaitView',
        "AppContentFaderView": '_views/AppContentFaderView',
        "AppEntryFaderView": '_views/AppEntryFaderView',
        "LoginView": '_views/LoginView',
        "CampaignView": '_views/CampaignView',
        "ResourcesView": '_views/ResourcesView',
        "StationsView": '_views/StationsView',
        "SettingsView": '_views/SettingsView',
        "ProStudioView": '_views/ProStudioView',
        "HelpView": '_views/HelpView',
        "LogoutView": '_views/LogoutView',
        "AppSliderView": '_views/AppSliderView',
        "CampaignSelectorView": '_views/CampaignSelectorView',
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
        'backbone.controller': {
            deps: ['underscore', 'jquery']
        },
        "AppRouter": {
            deps: ["Elements", "backbone.controller"]
        },
        "Lib": {
            deps: ['backbone', "jquery"]
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
        "AppAuth": {
            deps: ["RC4","Cookie"]
        },
        "Services": {
            exports: 'Services'
        },
        "Elements": {
            exports: 'Elements'
        },
        "RC4": {
            exports: 'RC4'
        },
        "ComBroker": {
            deps: ["backbone", "jquery"]
        },
        "Jalapeno": {
            deps: ['jquery', 'Base64'],
            exports: 'Jalapeno'
        },
        "Base64": {
            deps: ['jquery'],
            exports: 'base64'
        }
    }
});

require(['StudioLite'],function(StudioLite){
    new StudioLite();
});