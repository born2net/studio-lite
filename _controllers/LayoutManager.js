/**
 Application router and layout manager responsible for kick starting the application as
 well as management for sizing events
 @class LayoutManager
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'NavigationView', 'AppEntryFaderView', 'LoginView', 'AppContentFaderView', 'WaitView', 'bootbox', 'CampaignManagerView', 'ResourcesView', 'ResourcesView', 'StationsView', 'SettingsView', 'ProStudioView', 'HelpView', 'LogoutView', 'CampaignSliderStackView', 'ScreenLayoutSelectorView'],
    function (_, $, Backbone, AppAuth, NavigationView, AppEntryFaderView, LoginView, AppContentFaderView, WaitView, Bootbox, CampaignManagerView, ResourcesView, ResourcesView, StationsView, SettingsView, ProStudioView, HelpView, LogoutView, CampaignSliderStackView, ScreenLayoutSelectorView) {

        BB.SERVICES.LAYOUT_MANAGER = 'LayoutManager';

        /**
         Event fired when app resized
         @event APP_SIZED
         @static
         @final
         **/
        BB.EVENTS.APP_SIZED = 'APP_SIZED';

        var LayoutManager = BB.Router.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                this._initLoginPage();
                this._listenSizeChanges();
                $(window).trigger('resize');
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

                this.m_logoutView = new BB.View({
                    el: Elements.APP_LOGOUT
                });

                this.m_appEntryFaderView.addView(this.m_loginView);
                this.m_appEntryFaderView.addView(this.m_logoutView);
                this.m_appEntryFaderView.addView(this.m_appContentFaderView);
                this.m_appEntryFaderView.addView(this.m_mainAppWaitView);

                BB.comBroker.setService(BB.SERVICES.APP_ENTRY_FADER_VIEW, this.m_appEntryFaderView);
                BB.comBroker.setService(BB.SERVICES.APP_CONTENT_FADER_VIEW, this.m_appContentFaderView);
            },

            /**
             Use the previously created m_appContentFaderView to add list of views including campaign, stations, logout etc
             so navigation can be switched between each content div. Also we create one special view called
             CampaignSliderStackView that it itself is a StackView.Slider that will later allow for Campaign wizard slider animated selections.
             @method _initContentPage
             **/
            _initContentPage: function () {

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

            /**
             Use the previously created CampaignSliderStackView to add new views to it for campaign wizard slider animation which include
             CampaignSelector, Screen Orientation, Screen Resolution and Campaign
             @method _initCampaignWizardPage
             **/
            _initCampaignWizardPage: function () {
                var self = this;

                require(['CampaignSelectorView', 'OrientationSelectorView', 'ResolutionSelectorView', 'CampaignView'], function (CampaignSelectorView, OrientationSelectorView, ResolutionSelectorView, CampaignView) {

                    self.m_campaignSelectorView = new CampaignSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN,
                        el: Elements.CAMPAIGN_SELECTOR,
                        to: Elements.ORIENTATION_SELECTOR
                    });
                    BB.comBroker.setService(BB.SERVICES.CAMPAIGN_SELECTOR, self.m_campaignSelectorView);

                    self.m_orientationSelectorView = new OrientationSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN_SELECTOR,
                        el: Elements.ORIENTATION_SELECTOR,
                        to: Elements.RESOLUTION_SELECTOR,
                        model: new BB.Model({screenOrientation: null})
                    });
                    BB.comBroker.setService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW, self.m_orientationSelectorView);

                    self.m_resolutionSelectorView = new ResolutionSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.ORIENTATION_SELECTOR,
                        el: Elements.RESOLUTION_SELECTOR,
                        to: Elements.SCREEN_LAYOUT_SELECTOR,
                        model: new BB.Model({screenResolution: null})
                    });
                    BB.comBroker.setService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW, self.m_resolutionSelectorView);

                    self.m_screenLayoutSelectorView = new ScreenLayoutSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.RESOLUTION_SELECTOR,
                        el: Elements.SCREEN_LAYOUT_SELECTOR,
                        to: Elements.CAMPAIGN,
                        model: new BB.Model({screenLayout: null})
                    });

                    self.m_campaignView = new CampaignView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.SCREEN_LAYOUT_SELECTOR,
                        el: Elements.CAMPAIGN,
                        to: Elements.CAMPAIGN_SELECTOR
                    });
                    BB.comBroker.setService(BB.SERVICES.CAMPAIGN_VIEW, self.m_campaignView);

                    self.m_campaignSliderStackView.addView(self.m_campaignSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_orientationSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_resolutionSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_screenLayoutSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_campaignView);
                    self.m_campaignSliderStackView.selectView(self.m_campaignSelectorView);
                });

                this.m_appEntryFaderView.selectView(this.m_appContentFaderView);
            },

            /**
             Create properties panel view
             @method _initProperties
             **/
            _initProperties: function () {
                require(['PropertiesView'], function (PropertiesView) {
                    this.m_propertiesView = new PropertiesView({
                        el: Elements.PROP_PANEL,
                        duration: 400
                    });
                    this.m_emptyPropView = new BB.View({
                        el: Elements.EMPTY_PROPERTIES
                    });
                    self.m_propertiesView.addView(this.m_emptyPropView);
                    self.m_propertiesView.selectView(this.m_emptyPropView);
                    BB.comBroker.setService(BB.SERVICES.PROPERTIES_VIEW, this.m_propertiesView);
                });
            },

            /**
             Create a popup modal view that's used for About Us and properties content on small screens
             @method _initModal
             **/
            _initModal: function () {
                var self = this;
                require(['PopModalView'], function (PopModalView) {
                    var popModalView = new PopModalView({
                        el: Elements.POP_MODAL,
                        animation: 'slide_top', //or 'fade'
                        bgColor: 'white'
                    });
                    self.m_popUpProperties = new BB.View({el: Elements.POPUP_PROPERTIES});
                    popModalView.addView(self.m_popUpProperties);

                    self.m_popUpAboutUs = new BB.View({el: Elements.ABOUT_US});
                    popModalView.addView(self.m_popUpAboutUs);

                    self.m_popUpWait = new BB.View({el: Elements.STACK_WAIT_MODAL_VIEW});
                    popModalView.addView(self.m_popUpWait);

                    BB.comBroker.setService(BB.SERVICES.POP_MODAL_VIEW, popModalView);
                });
            },

            /**
             Listen to application size changes and lazy update when so
             @method _listenSizeChanges
             **/
            _listenSizeChanges: function () {
                var self = this;
                var lazyLayout = _.debounce(self._updateLayout, 150);
                $(window).resize(lazyLayout);
            },

            /**
             Update key element height changes on size change and notify event subscribers
             @method _updateLayout
             **/
            _updateLayout: function () {
                var self = BB.comBroker.getService(BB.SERVICES.LAYOUT_MANAGER);
                var b = $('body');
                self._appHeight = b.css('height').replace('px', '');
                self._appWidth = b.css('width').replace('px', '');
                var h = self._appHeight - 115; // reduce footer
                $(Elements.PROP_PANEL_WRAP).height(h);
                $(Elements.MAIN_PANEL_WRAP).height(h);
                $(Elements.APP_NAVIGATOR).height(h);
                // $('#screenLayoutList').height(h)+200;

                BB.comBroker.fire(BB.EVENTS.APP_SIZED);
            },

            /**
             Get latest registered app width
             @return {Number} width
             **/
            getAppWidth: function () {
                return this._appWidth;
            },

            /**
             Get latest registered app height
             @return {Number} height
             **/
            getAppHeight: function () {
                return this._appHeight;
            }
        });

        return LayoutManager;
    });