/**
 Application router / navigator
 @class AppRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'AppEntryFaderView', 'LoginView', 'AppSliderView', 'WaitView', 'bootbox'], function (_, $, Backbone, AppAuth, AppEntryFaderView, LoginView, AppSliderView, WaitView, Bootbox) {

    var AppRouter = Backbone.Router.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this.appAuth = new AppAuth();

            this.appEntryFaderView = new AppEntryFaderView({
                el: Elements.APP_ENTRY,
                duration: 500
            });

            this.appSliderView = new AppSliderView({
                el: Elements.APP_CONTENT
            });

            this.loginView = new LoginView({
                el: Elements.APP_LOGIN
            });

            this.mainAppWaitView = new WaitView({
                el: Elements.WAITS_SCREEN_ENTRY_APP
            });

            this.appEntryFaderView.addView(this.loginView);
            this.appEntryFaderView.addView(this.appSliderView);
            this.appEntryFaderView.addView(this.mainAppWaitView);
        },

        /**
         Initiate user credential authentication
         @method authenticate
         @param {String} i_user
         @param {String} i_pass
         **/
        authenticate: function (i_user, i_pass) {
            this.appAuth.authenticate(i_user, i_pass);
        },

        /**
         In process of authentication
         @method authenticating
         **/
        authenticating: function () {
            this.appEntryFaderView.selectView(this.mainAppWaitView);
        },

        /**
         Authentication passed, load App page
         @method authenticating
         **/
        authenticated: function () {
            this.navigate('app', {trigger: true});
        },

        /**
         No authentication passed, load Login page
         @method authenticating
         **/
        unauthenticated: function () {
            this.appEntryFaderView.selectView(this.loginView);
        },

        /**
         Failed user authentication
         @method authenticationFailed
         **/
        authenticationFailed: function () {
            Bootbox.dialog({
                message: "Sorry but the user or password did not match",
                title: "Problem",
                buttons: {
                    danger: {
                        label: "OK",
                        className: "btn-danger",
                        callback: function () {
                        }
                    }
                }
            });
            this.appEntryFaderView.selectView(this.loginView);
        },

        /**
         Load main application StackView
         @method app
         **/
        app: function () {
            if (this.appAuth.authenticated) {
                this.appEntryFaderView.selectView(this.appSliderView);
            } else {
                this.navigate('unauthenticated', {trigger: true});
            }
        },

        /**
         Router routes definitions
         @method routes
         **/
        routes: {
            "app": "app",
            "authenticate/:user/:pass": "authenticate",
            "authenticating": "authenticating",
            "authenticated": "authenticated",
            "unauthenticated": "unauthenticated",
            "authenticationFailed": "authenticationFailed"
        }

    });
    return AppRouter;

});