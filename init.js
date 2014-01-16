/**
 init.js
 @class Require JS config file
 **/
require.config({
    baseUrl: '/_studiolite-dev/',
    paths: {
        "jquery": '_common/_jquery/std/jq1.9.1/jquery-1.9.1',
        "backbone": '_common/_js/backbone/backbone',
        "underscore": '_common/_js/underscore/underscore',
        "bootstrap": '_common/_js/bootstrap/js/bootstrap',
        "Elements": 'Elements',
        "menuitemdetails": '_views/menuitemdetails',
        "StackView": '_views/StackView',
        "AppCoreStackView": '_views/AppCoreStackView',
        "ApplicationView": '_views/ApplicationView',
        "LoginView": '_views/LoginView'
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
        },
        "Elements": {
            exports: 'Elements'
        }
    }
});

require(['router'],function(router){
    new router();
});