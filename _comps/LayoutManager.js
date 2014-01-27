/**
 Application router and layout manager
 @class LayoutManager
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'AppSizer', 'NavigationView', 'AppEntryFaderView', 'LoginView', 'AppContentFaderView', 'WaitView', 'bootbox', 'CampaignManagerView', 'ResourcesView', 'ResourcesView', 'StationsView', 'SettingsView', 'ProStudioView', 'HelpView', 'LogoutView', 'CampaignSliderStackView'],
    function (_, $, Backbone, AppAuth, AppSizer, NavigationView, AppEntryFaderView, LoginView, AppContentFaderView, WaitView, Bootbox, CampaignManagerView, ResourcesView, ResourcesView, StationsView, SettingsView, ProStudioView, HelpView, LogoutView, CampaignSliderStackView) {

        var LayoutManager = Backbone.Router.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                this._initLoginPage();
            },

            /**
             Router definition to function maps
             @method routes
             **/
            routes: {
                "app": "_routeApp",
                "authenticate/:user/:pass": "_routeAuthenticate",
                "authenticating": "_routeAuthenticating",
                "authenticated": "_routeAuthenticated",
                "unauthenticated": "_routeUnauthenticated",
                "authenticationFailed": "_routeAuthenticationFailed"
            },

            /**
             Initiate user credential route authentication
             @method authenticate
             @param {String} i_user
             @param {String} i_pass
             **/
            _routeAuthenticate: function (i_user, i_pass) {
                this.m_appAuth.authenticate(i_user, i_pass);
            },

            /**
             In process of route authentication
             @method authenticating
             **/
            _routeAuthenticating: function () {
                this.m_appEntryFaderView.selectView(this.m_mainAppWaitView);
            },

            /**
             Authentication passed, load app page route
             @method authenticating
             **/
            _routeAuthenticated: function () {
                this.navigate('app', {trigger: true});
            },

            /**
             No authentication passed, load Login page route
             @method authenticating
             **/
            _routeUnauthenticated: function () {
                this.m_appEntryFaderView.selectView(this.m_loginView);
            },

            /**
             Failed user authentication route
             @method authenticationFailed
             **/
            _routeAuthenticationFailed: function () {
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
                this.m_appEntryFaderView.selectView(this.m_loginView);
            },

            /**
             On successful authentication load main application StackViews per this route App
             @method app
             **/
            _routeApp: function () {
                if (this.m_appAuth.authenticated) {
                    this._initContentPage();
                    this._initProperties();
                    this._initCampaignWizardPage();
                    this._initModal();
                    this._listenOnSlidingPanel();
                } else {
                    this.navigate('unauthenticated', {trigger: true});
                }
            },

            /**
             Create two StackView views: AppEntryFaderView and AppContentFaderView
             AppEntryFaderView allows for page selection between login page and main app content page
             AppContentFaderView serves as dual purpose view. On one hand it serves as simple show/hide div for  main login page / content page,
             on the other hand it itself is a StackView.Fader that allows for show/hide between main content sections including campaigns,
             stations, resources, settings etc
             @method _initLoginPage
             **/
            _initLoginPage: function () {
                this.m_appAuth = new AppAuth();

                this.m_appEntryFaderView = new AppEntryFaderView({
                    el: Elements.APP_ENTRY,
                    duration: 500
                });

                this.m_appContentFaderView = new AppContentFaderView({
                    el: Elements.APP_CONTENT,
                    duration: 650
                });

                this.m_loginView = new LoginView({
                    el: Elements.APP_LOGIN
                });

                this.m_mainAppWaitView = new WaitView({
                    el: Elements.WAITS_SCREEN_ENTRY_APP
                });

                this.m_logoutView = new Backbone.View({
                    el: Elements.APP_LOGOUT
                });

                this.m_appEntryFaderView.addView(this.m_loginView);
                this.m_appEntryFaderView.addView(this.m_logoutView);
                this.m_appEntryFaderView.addView(this.m_appContentFaderView);
                this.m_appEntryFaderView.addView(this.m_mainAppWaitView);

                Backbone.comBroker.setService(Services.APP_ENTRY_FADER_VIEW, this.m_appEntryFaderView);
                Backbone.comBroker.setService(Services.APP_CONTENT_FADER_VIEW, this.m_appContentFaderView);
            },

            /**
             Use the previously created m_appContentFaderView to add list of views including campaign, stations, logout etc
             so navigation can be switched between each content div. Also we create one special view called
             CampaignSliderStackView that it itself is a StackView.Slider that will later allow for Campaign wizard slider animated selections.
             @method _initContentPage
             **/
            _initContentPage: function () {
                var self = this;

                this.m_appSizer = new AppSizer();
                this.m_navigationView = new NavigationView({
                    el: Elements.FILE_MENU
                });

                this.m_campaignManagerView = new CampaignManagerView({
                    el: Elements.CAMPAIGN_MANAGER_VIEW
                });

                this.m_campaignSliderStackView = new CampaignSliderStackView({
                    el: Elements.CAMPAIGN_SLIDER
                });

                this.m_resourcesView = new ResourcesView({
                    el: Elements.RESOURCES_PANEL
                });

                this.m_stationsView = new StationsView({
                    el: Elements.STATIONS_PANEL
                });

                this.m_settingsView = new SettingsView({
                    el: Elements.SETTINGS_PANEL
                });

                this.m_proStudioView = new ProStudioView({
                    el: Elements.PRO_STUDIO_PANEL
                });

                this.m_helpView = new HelpView({
                    el: Elements.HELP_PANEL
                });

                this.m_logoutView = new LogoutView({
                    el: Elements.LOGOUT_PANEL
                });

                this.m_appContentFaderView.addView(this.m_campaignManagerView);
                this.m_appContentFaderView.addView(this.m_resourcesView);
                this.m_appContentFaderView.addView(this.m_stationsView);
                this.m_appContentFaderView.addView(this.m_settingsView);
                this.m_appContentFaderView.addView(this.m_proStudioView);
                this.m_appContentFaderView.addView(this.m_helpView);
                this.m_appContentFaderView.addView(this.m_logoutView);
                this.m_appContentFaderView.selectView(this.m_campaignManagerView);
            },

            _initProperties: function () {
                require(['PropertiesFaderView'], function (PropertiesFaderView) {
                    this.m_propertiesFaderView = new PropertiesFaderView({
                        el: Elements.PROP_PANEL
                    });
                });
            },

            /**
             Use the previously created CampaignSliderStackView to add new views to it for campaign wizard slider animation which include
             CampaignSelector, Screen Orientation, Screen Resolution and Campaign
             @method _initCampaignWizardPage
             **/
            _initCampaignWizardPage: function () {
                var self = this;

                require(['CampaignSelectorView', 'OrientationSelectorView', 'ResolutionSelectorView', 'CampaignView'], function (CampaignSelectorView, OrientationSelectorView, ResolutionSelectorView, CampaignView) {

                    self.m_campaignSelectorView = new CampaignSelectorView({
                        appCoreStackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN,
                        el: Elements.CAMPAIGN_SELECTOR,
                        to: Elements.ORIENTATION_SELECTOR
                    });

                    self.m_orientationSelectorView = new OrientationSelectorView({
                        appCoreStackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN_SELECTOR,
                        el: Elements.ORIENTATION_SELECTOR,
                        to: Elements.RESOLUTION_SELECTOR
                    });


                    self.m_resolutionSelectorView = new ResolutionSelectorView({
                        appCoreStackView: self.m_campaignSliderStackView,
                        from: Elements.ORIENTATION_SELECTOR,
                        el: Elements.RESOLUTION_SELECTOR,
                        to: Elements.CAMPAIGN
                    });

                    self.m_campaignView = new CampaignView({
                        appCoreStackView: self.m_campaignSliderStackView,
                        from: Elements.RESOLUTION_SELECTOR,
                        el: Elements.CAMPAIGN,
                        to: Elements.CAMPAIGN_SELECTOR
                    });

                    self.m_campaignSliderStackView.addView(self.m_campaignSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_orientationSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_resolutionSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_campaignView);
                    self.m_campaignSliderStackView.selectView(self.m_campaignSelectorView);
                });

                this.m_appEntryFaderView.selectView(this.m_appContentFaderView);
            },

            /**
             Create a popup modal view that's used for About Us and properties content on small screens
             @method _initModal
             **/
            _initModal: function () {

                require(['PopModalView'], function (PopModalView) {
                    var popModalView = new PopModalView({
                        el: Elements.POP_MODAL,
                        animation: 'slide_top', //or 'fade'
                        bgColor: 'white'
                    });
                    var md1 = new Backbone.View({el: Elements.POPUP_PROPERTIES});
                    var md2 = new Backbone.View({el: Elements.ABOUT_US});
                    var md3 = new Backbone.View({el: Elements.STACK_WAIT_MODAL_VIEW});
                    popModalView.addView(md1);
                    popModalView.addView(md2);
                    popModalView.addView(md3);
                    var c = 0;
                    $('#someAction').on('click', function () {
                        c++;
                        if (c == 1)
                            popModalView.selectView(md1);
                        if (c == 2)
                            popModalView.selectView(md2);
                        if (c == 3)
                            popModalView.selectView(md3);
                    });
                });
            },

            /**
             Listen for open/close actions on properties panel that can slide in and out
             @method _listenOnSlidingPanel
             **/
            _listenOnSlidingPanel: function () {
                $(Elements.TOGGLE_PANEL).on('click', function () {
                    if ($(Elements.TOGGLE_PANEL).hasClass('buttonStateOn')) {
                        $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                        $(Elements.PROP_PANEL_WRAP).fadeOut(function () {
                            $(Elements.TOGGLE_PANEL).html('<');
                            $(Elements.PROP_PANEL_WRAP).addClass('hidden-sm hidden-md');
                            $(Elements.MAIN_PANEL_WRAP).removeClass('col-sm-9 col-md-9');
                            $(Elements.MAIN_PANEL_WRAP).addClass('col-md-12');
                        });
                    } else {
                        $(Elements.TOGGLE_PANEL).toggleClass('buttonStateOn');
                        $(Elements.TOGGLE_PANEL).html('>');
                        $(Elements.MAIN_PANEL_WRAP).addClass('col-sm-9 col-md-9');
                        setTimeout(function () {
                            $(Elements.MAIN_PANEL_WRAP).removeClass('col-md-12');
                            $(Elements.PROP_PANEL_WRAP).children().hide();
                            $(Elements.PROP_PANEL_WRAP).removeClass('hidden-sm hidden-md');
                            $(Elements.PROP_PANEL_WRAP).children().fadeIn();
                        }, 500)
                    }
                });
            }
        });

        return LayoutManager;
    });