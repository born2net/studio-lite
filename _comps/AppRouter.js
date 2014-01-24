/**
 Application router / navigator
 @class AppRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'AppSizer', 'FileMenuView', 'AppEntryFaderView', 'LoginView', 'AppContentFaderView', 'WaitView', 'bootbox', 'CampaignSelectorView', 'ResourcesView', 'ResourcesView', 'StationsView', 'SettingsView', 'ProStudioView', 'HelpView', 'LogoutView'], function (_, $, Backbone, AppAuth, AppSizer, FileMenuView, AppEntryFaderView, LoginView, AppContentFaderView, WaitView, Bootbox, CampaignSelectorView, ResourcesView, ResourcesView, StationsView, SettingsView, ProStudioView, HelpView, LogoutView) {

    var AppRouter = Backbone.Router.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            this.appAuth = new AppAuth();
            this.appSizer = new AppSizer();


            ///////////////////////////
            // application entry views
            ///////////////////////////

            this.appEntryFaderView = new AppEntryFaderView({
                el: Elements.APP_ENTRY,
                duration: 500
            });

            this.appContentFaderView = new AppContentFaderView({
                el: Elements.MAIN_PANEL_WRAP,
                duration: 250
            });

            this.loginView = new LoginView({
                el: Elements.APP_LOGIN
            });

            this.mainAppWaitView = new WaitView({
                el: Elements.WAITS_SCREEN_ENTRY_APP
            });

            this.appEntryFaderView.addView(this.loginView);
            this.appEntryFaderView.addView(this.appContentFaderView);
            this.appEntryFaderView.addView(this.mainAppWaitView);


            /////////////////////////////////
            // application main content views
            /////////////////////////////////

            this.campaignSelectorView = new CampaignSelectorView({
                el: Elements.CAMPAIGN_SELECTOR_PANEL
            });

            this.resourcesView = new ResourcesView({
                el: Elements.RESOURCES_PANEL
            });

            this.stationsView = new StationsView({
                el: Elements.STATIONS_PANEL
            });

            this.settingsView = new SettingsView({
                el: Elements.SETTINGS_PANEL
            });

            this.proStudioView = new ProStudioView({
                el: Elements.PRO_STUDIO_PANEL
            });

            this.helpView = new HelpView({
                el: Elements.HELP_PANEL
            });

            this.logoutView = new LogoutView({
                el: Elements.LOGOUT_PANEL
            });

            this.appContentFaderView.addView(this.campaignSelectorView);
            this.appContentFaderView.addView(this.resourcesView);
            this.appContentFaderView.addView(this.stationsView);
            this.appContentFaderView.addView(this.settingsView);
            this.appContentFaderView.addView(this.proStudioView);
            this.appContentFaderView.addView(this.helpView);
            this.appContentFaderView.addView(this.logoutView);
            this.appContentFaderView.selectView(this.campaignSelectorView);

            $('.campaignSelectorPanel').on('click',function(){
                self.appContentFaderView.selectView(self.campaignSelectorView);
            });

            $('.resourcesPanel').on('click',function(){
                self.appContentFaderView.selectView(self.resourcesView);
            });

            $('.stationsPanel').on('click',function(){
                self.appContentFaderView.selectView(self.stationsView);
            });

            $('.settingsPanel').on('click',function(){
                self.appContentFaderView.selectView(self.settingsView);
            });

            $('.proStudioPanel').on('click',function(){
                self.appContentFaderView.selectView(self.proStudioView);
            });

            $('.helpPanel').on('click',function(){
                self.appContentFaderView.selectView(self.helpView);
            });

            $('.logoutPanel').on('click',function(){
                self.appContentFaderView.selectView(self.logoutView);
            });

            /////////////////////////
            // Campaign wizard views
            /////////////////////////

            /*this.appSliderView = new AppSliderView({
                el: Elements.APP_CONTENT
            });


            this.campaignSelectorView = new CampaignSelectorView({
                appCoreStackView: appSliderView,
                from: '#campaign',
                el: '#campaignSelector',
                to: '#orientationSelector'
            });

            this.orientationSelectorView = new OrientationSelectorView({
                appCoreStackView: appSliderView,
                from: '#campaignSelector',
                el: '#orientationSelector',
                to: '#resolutionSelector'
            });


            this.resolutionSelectorView = new ResolutionSelectorView({
                appCoreStackView: appSliderView,
                from: '#orientationSelector',
                el: '#resolutionSelector',
                to: '#campaign'
            });

            this.campaignView = new CampaignView({
                appCoreStackView: appSliderView,
                from: '#resolutionSelector',
                el: '#campaign',
                to: '#campaignSelector'
            }); */

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
                this.fileMenuView = new FileMenuView({
                    el: Elements.FILE_MENU
                });
                this.appEntryFaderView.selectView(this.appContentFaderView);
                $(Elements.APP_CONTENT).fadeIn();
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