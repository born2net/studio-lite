/**
 Application router / navigator
 @class AppRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'AppSizer', 'NavigationView', 'AppEntryFaderView', 'LoginView', 'AppContentFaderView', 'WaitView', 'bootbox', 'CampaignManagerView', 'ResourcesView', 'ResourcesView', 'StationsView', 'SettingsView', 'ProStudioView', 'HelpView', 'LogoutView', 'CampaignSliderView'],
    function (_, $, Backbone, AppAuth, AppSizer, NavigationView, AppEntryFaderView, LoginView, AppContentFaderView, WaitView, Bootbox, CampaignManagerView, ResourcesView, ResourcesView, StationsView, SettingsView, ProStudioView, HelpView, LogoutView, CampaignSliderView) {

        var AppRouter = Backbone.Router.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                this.loadLoginPage();
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
                    this.loadContentPage();
                    $(Elements.APP_CONTENT).fadeIn();
                } else {
                    this.navigate('unauthenticated', {trigger: true});
                }
            },

            loadLoginPage: function () {
                this.appAuth = new AppAuth();

                this.appEntryFaderView = new AppEntryFaderView({
                    el: Elements.APP_ENTRY,
                    duration: 500
                });

                this.appContentFaderView = new AppContentFaderView({
                    el: Elements.MAIN_PANEL_WRAP,
                    duration: 250
                });
                Backbone.comBroker.setService(Services.APP_CONTENT_FADER_VIEW, this.appContentFaderView);

                this.loginView = new LoginView({
                    el: Elements.APP_LOGIN
                });

                this.mainAppWaitView = new WaitView({
                    el: Elements.WAITS_SCREEN_ENTRY_APP
                });

                this.appEntryFaderView.addView(this.loginView);
                this.appEntryFaderView.addView(this.appContentFaderView);
                this.appEntryFaderView.addView(this.mainAppWaitView);
            },

            loadContentPage: function () {
                var self = this;

                this.appSizer = new AppSizer();
                this.navigationView = new NavigationView({
                    el: Elements.FILE_MENU
                });

                this.campaignManagerView = new CampaignManagerView({
                    el: Elements.CAMPAIGN_MANAGER_VIEW
                });

                this.campaignSliderView = new CampaignSliderView({
                    el: Elements.CAMPAIGN_SLIDER
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

                this.appContentFaderView.addView(this.campaignManagerView);
                this.appContentFaderView.addView(this.resourcesView);
                this.appContentFaderView.addView(this.stationsView);
                this.appContentFaderView.addView(this.settingsView);
                this.appContentFaderView.addView(this.proStudioView);
                this.appContentFaderView.addView(this.helpView);
                this.appContentFaderView.addView(this.logoutView);
                this.appContentFaderView.selectView(this.campaignManagerView);
                this.appEntryFaderView.selectView(this.appContentFaderView);

                this.loadCampaignWizardPage();
            },

            loadCampaignWizardPage: function () {
                var self = this;

                require(['CampaignSelectorView', 'OrientationSelectorView', 'ResolutionSelectorView', 'CampaignView'], function (CampaignSelectorView, OrientationSelectorView, ResolutionSelectorView, CampaignView) {

                    self.campaignSelectorView = new CampaignSelectorView({
                        appCoreStackView: self.campaignSliderView,
                        from: Elements.CAMPAIGN,
                        el: Elements.CAMPAIGN_SELECTOR,
                        to: Elements.ORIENTATION_SELECTOR
                    });

                    self.orientationSelectorView = new OrientationSelectorView({
                        appCoreStackView: self.campaignSliderView,
                        from: Elements.CAMPAIGN_SELECTOR,
                        el: Elements.ORIENTATION_SELECTOR,
                        to: Elements.RESOLUTION_SELECTOR
                    });


                    self.resolutionSelectorView = new ResolutionSelectorView({
                        appCoreStackView: self.campaignSliderView,
                        from: Elements.ORIENTATION_SELECTOR,
                        el: Elements.RESOLUTION_SELECTOR,
                        to: Elements.CAMPAIGN
                    });

                    self.campaignView = new CampaignView({
                        appCoreStackView: self.campaignSliderView,
                        from: Elements.RESOLUTION_SELECTOR,
                        el: Elements.CAMPAIGN,
                        to: Elements.CAMPAIGN_SELECTOR
                    });

                    self.campaignSliderView.addView(self.campaignSelectorView);
                    self.campaignSliderView.addView(self.orientationSelectorView);
                    self.campaignSliderView.addView(self.resolutionSelectorView);
                    self.campaignSliderView.addView(self.campaignView);
                    self.campaignSliderView.selectView(self.campaignSelectorView);
                });


            }
        });
        return AppRouter;

    });