/**
 @class Require JS config file
 **/
require.config({
    baseUrl: '/_studiolite-dev/',
    paths: {
        "jquery": '_common/_jquery/std/jq1.9.1/jquery-1.9.1',
        "backbone": '_common/_js/backbone/backbone',
        "viewkit": '_common/_js/backbone-viewkit/backbone.viewkit',
        "underscore": '_common/_js/underscore/underscore',
        "bootstrap": '_common/_js/bootstrap/js/bootstrap',
        menuitemdetails: '_view/menuitemdetails',
        AppOuterFrameView: '_views/AppOuterFrameView',
        ApplicationView: '_views/ApplicationView',
        LoginView: '_views/LoginView'


    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        "bootstrap": {
            deps: ["jquery"]
        }/*,
        "viewkit":{
            deps: ['underscore', 'jquery'],
            exports: 'viewkit'
        }*/
    }
});

require(['studiolite-bs'],function(studioLite){
    new studioLite();
});