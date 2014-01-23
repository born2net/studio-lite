/**
 Application router / navigator
 @class AppRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'AppEntryFaderView', 'LoginView', 'AppSliderView', 'WaitView'],
    function (_, $, Backbone, AppAuth, AppEntryFaderView, LoginView, AppSliderView, WaitView) {

        var AppRouter = Backbone.Router.extend({

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

            authenticate: function (i_user, i_pass) {
                this.appAuth.authenticate(i_user, i_pass);
            },

            authenticating: function () {
                this.appEntryFaderView.selectView(this.mainAppWaitView);
            },

            authenticated: function () {
                this.navigate('app', {trigger: true});
            },

            unauthenticated: function () {
                this.appEntryFaderView.selectView(this.loginView);
            },

            app: function () {
                if (this.appAuth.authenticated) {
                    this.appEntryFaderView.selectView(this.appSliderView);
                } else {
                    this.navigate('unauthenticated', {trigger: true});
                }
            },

            routes: {
                "app": "app",
                "authenticate/:user/:pass": "authenticate",
                "authenticating": "authenticating",
                "authenticated": "authenticated",
                "unauthenticated": "unauthenticated"
                // "search/:query": "search",  // #search/kiwis
            }

        });
        return AppRouter;
    });