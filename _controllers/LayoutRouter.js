/**
 Application router and layout router responsible for kick starting the application as
 well as management for sizing events
 @class LayoutRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'NavigationView', 'AppEntryFaderView', 'LoginView', 'AppContentFaderView', 'WaitView', 'LivePreView', 'bootbox', 'CampaignManagerView', 'ResourcesLoaderView', 'ResourcesLoaderView', 'StationsViewLoader', 'SettingsView', 'ProStudioView', 'HelpView', 'InstallView', 'LogoutView', 'CampaignSliderStackView', 'ScreenLayoutSelectorView', 'X2JS', 'XDate', 'LanguageSelectorView', 'ScenesLoaderView', 'DashboardView'],
    function (_, $, Backbone, AppAuth, NavigationView, AppEntryFaderView, LoginView, AppContentFaderView, WaitView, LivePreView, Bootbox, CampaignManagerView, ResourcesLoaderView, ResourcesLoaderView, StationsViewLoader, SettingsView, ProStudioView, HelpView, InstallView, LogoutView, CampaignSliderStackView, ScreenLayoutSelectorView, X2JS, XDate, LanguageSelectorView, ScenesLoaderView, DashboardView) {

        BB.SERVICES.LAYOUT_ROUTER = 'LayoutRouter';

        /**
         Event fired when app resized
         @event APP_SIZED
         @static
         @final
         **/
        BB.EVENTS.APP_SIZED = 'APP_SIZED';

        var LayoutRouter = BB.Router.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                var self = this;
                BB.comBroker.setService(BB.SERVICES['LAYOUT_ROUTER'], self);

                // global x2j required by pepper
                window.x2js = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
                BB.comBroker.setService('compX2JS', window.x2js);
                BB.comBroker.setService('XDATE', new XDate());

                self._initLoginPage();
                self._listenLogoHover();
                self._listenSizeChanges();

                $(window).trigger('resize');
                $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom', 'delay': 1000});
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
                    message: $(Elements.MSG_BOOTBOX_WRONG_USER_PASS).text(),
                    title: $(Elements.MSG_BOOTBOX_PROBLEM).text(),
                    buttons: {
                        danger: {
                            label: $(Elements.MSG_BOOTBOX_OK).text(),
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
                    this._disableBack();
                    this._initContentPage();
                    this._initProperties();
                    this._initCampaignWizardPage();
                    this._initModal();
                    this._initDashBoard();
                    this._initCustomer();

                    // inject pseudo scene / player IDs
                    pepper.injectPseudoScenePlayersIDs();
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

                this.m_livePreview = new LivePreView({
                    el: Elements.LIVE_PREVIEW
                });

                this.m_mainAppWaitView = new WaitView({
                    el: Elements.WAITS_SCREEN_ENTRY_APP
                });

                this.m_logoutView = new BB.View({
                    el: Elements.APP_LOGOUT
                });

                this.m_appEntryFaderView.addView(this.m_loginView);
                this.m_appEntryFaderView.addView(this.m_logoutView);
                this.m_appEntryFaderView.addView(this.m_livePreview);
                this.m_appEntryFaderView.addView(this.m_appContentFaderView);
                this.m_appEntryFaderView.addView(this.m_mainAppWaitView);

                BB.comBroker.setService(BB.SERVICES['APP_AUTH'], this.m_appAuth);
                BB.comBroker.setService(BB.SERVICES['APP_ENTRY_FADER_VIEW'], this.m_appEntryFaderView);
                BB.comBroker.setService(BB.SERVICES['APP_CONTENT_FADER_VIEW'], this.m_appContentFaderView);
            },

            /**
             Update the general dashboard with stats
             @method Update
             **/
            _initDashBoard: function () {
                $(Elements.SERVER_NAME).text(pepper.getUserData().domain);
                $(Elements.BUISINESS_ID).text(pepper.getUserData().businessID);
                $(Elements.CLASS_USER_NAME).text(pepper.getUserData().userName);
            },

            /**
             Setup customer account
             @method _initCustomer
             **/
            _initCustomer: function () {
                var self = this;
                if (pepper.getUserData().resellerID == 1 || pepper.getUserData().whiteLabel == 0) {
                    $(Elements.CLASS_RES_HID).fadeIn();
                } else {
                    $(Elements.APP_NAME).text(pepper.getUserData().resellerName);
                    $(Elements.CLASS_RES_HID).remove();
                }
            },

            /**
             Use the previously created m_appContentFaderView to add list of views including campaign, stations, logout etc
             so navigation can be switched between each content div. Also we create one special view called
             CampaignSliderStackView that it itself is a StackView.Slider that will later allow for Campaign wizard slider animated selections.
             @method _initContentPage
             **/
            _initContentPage: function () {
                var self = this;
                self.m_navigationView = new NavigationView({
                    el: Elements.FILE_MENU
                });

                self.m_campaignManagerView = new CampaignManagerView({
                    el: Elements.CAMPAIGN_MANAGER_VIEW
                });

                self.m_campaignSliderStackView = new CampaignSliderStackView({
                    el: Elements.CAMPAIGN_SLIDER
                });

                self.m_ResourcesLoaderView = new ResourcesLoaderView({
                    el: Elements.RESOURCES_PANEL,
                    stackView: self.m_appContentFaderView
                });

                self.m_stationsViewLoader = new StationsViewLoader({
                    el: Elements.STATIONS_PANEL,
                    stackView: self.m_appContentFaderView
                });

                self.m_scenesLoaderView = new ScenesLoaderView({
                    el: Elements.SCENES_PANEL,
                    stackView: self.m_appContentFaderView
                });

                self.m_settingsView = new SettingsView({
                    el: Elements.SETTINGS_PANEL,
                    stackView: self.m_appContentFaderView
                });

                self.m_proStudioView = new ProStudioView({
                    el: Elements.PRO_STUDIO_PANEL,
                    stackView: self.m_appContentFaderView
                });

                self.m_helpView = new HelpView({
                    el: Elements.HELP_PANEL,
                    stackView: this.m_appContentFaderView
                });

                self.m_installView = new InstallView({
                    el: Elements.INSTALL_PANEL,
                    stackView: this.m_appContentFaderView
                });

                this.m_logoutView = new LogoutView({
                    el: Elements.LOGOUT_PANEL,
                    stackView: self.m_appContentFaderView
                });

                self.m_appContentFaderView.addView(self.m_campaignManagerView);
                self.m_appContentFaderView.addView(self.m_ResourcesLoaderView);
                self.m_appContentFaderView.addView(self.m_stationsViewLoader);
                self.m_appContentFaderView.addView(self.m_scenesLoaderView);
                self.m_appContentFaderView.addView(self.m_settingsView);
                self.m_appContentFaderView.addView(self.m_proStudioView);
                self.m_appContentFaderView.addView(self.m_helpView);
                self.m_appContentFaderView.addView(self.m_installView);
                self.m_appContentFaderView.addView(self.m_logoutView);
                // self.m_appContentFaderView.selectView(self.m_scenesLoaderView); // debug mode
                self.m_appContentFaderView.selectView(self.m_campaignManagerView);

                BB.comBroker.setService(BB.SERVICES['NAVIGATION_VIEW'], self.m_navigationView);
            },

            /**
             Use the previously created CampaignSliderStackView to add new views for campaign wizard slider animation which include
             CampaignSelector, Screen Orientation, Screen Resolution and Campaign
             @method _initCampaignWizardPage
             **/
            _initCampaignWizardPage: function () {
                var self = this;

                require(['CampaignSelectorView', 'OrientationSelectorView', 'ResolutionSelectorView', 'CampaignView', 'CampaignNameSelectorView', 'AddBlockView', 'ScreenLayoutEditorView'], function (CampaignSelectorView, OrientationSelectorView, ResolutionSelectorView, CampaignView, CampaignNameSelectorView, AddBlockView, ScreenLayoutEditorView) {

                    self.m_campaignSelectorView = new CampaignSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN,
                        el: Elements.CAMPAIGN_SELECTOR,
                        to: Elements.CAMPAIGN_NAME_SELECTOR_VIEW
                    });
                    BB.comBroker.setService(BB.SERVICES.CAMPAIGN_SELECTOR, self.m_campaignSelectorView);

                    self.m_campaignNameSelectorView = new CampaignNameSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN_SELECTOR,
                        el: Elements.CAMPAIGN_NAME_SELECTOR_VIEW,
                        to: Elements.ORIENTATION_SELECTOR
                    });
                    BB.comBroker.setService(BB.SERVICES.CAMPAIGN_NAME_SELECTOR_VIEW, self.m_campaignNameSelectorView);

                    self.m_orientationSelectorView = new OrientationSelectorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN_NAME_SELECTOR_VIEW,
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
                    BB.comBroker.setService(BB.SERVICES.SCREEN_LAYOUT_SELECTOR_VIEW, self.m_screenLayoutSelectorView);

                    self.m_campaignView = new CampaignView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.SCREEN_LAYOUT_SELECTOR,
                        el: Elements.CAMPAIGN,
                        to: Elements.ADD_BLOCK_VIEW
                    });
                    BB.comBroker.setService(BB.SERVICES.CAMPAIGN_VIEW, self.m_campaignView);

                    self.m_addBlockView = new AddBlockView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN,
                        el: Elements.ADD_BLOCK_VIEW,
                        to: Elements.CAMPAIGN_SELECTOR,
                        placement: BB.CONSTS.PLACEMENT_CHANNEL
                    });
                    BB.comBroker.setService(BB.SERVICES.ADD_BLOCK_VIEW, self.m_addBlockView);

                    self.m_screenLayoutEditorView = new ScreenLayoutEditorView({
                        stackView: self.m_campaignSliderStackView,
                        from: Elements.CAMPAIGN,
                        el: Elements.SCREEN_LAYOUT_EDITOR_VIEW,
                        to: Elements.CAMPAIGN_SELECTOR
                    });

                    self.m_campaignSliderStackView.addView(self.m_campaignSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_campaignNameSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_orientationSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_resolutionSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_screenLayoutSelectorView);
                    self.m_campaignSliderStackView.addView(self.m_campaignView);
                    self.m_campaignSliderStackView.addView(self.m_addBlockView);
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
                        duration: 300
                    });

                    this.m_dashboardPropView = new DashboardView({
                        el: Elements.DASHBOARD_PROPERTIES
                    });

                    self.m_propertiesView.addView(this.m_dashboardPropView);
                    self.m_propertiesView.selectView(this.m_dashboardPropView);
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
             Listen logo mouse hover
             @method _listenLogoHover
             **/
            _listenLogoHover: function () {
                $('.flip').mouseenter(function () {
                    $(this).find('.card').addClass('flipped').mouseleave(function () {
                        $(this).removeClass('flipped');
                    });
                    return false;
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
                var self = BB.comBroker.getService(BB.SERVICES['LAYOUT_ROUTER']);
                var b = $('body');
                self._appHeight = parseInt(b.css('height').replace('px', ''));
                self._appWidth = parseInt(b.css('width').replace('px', ''));
                var h = self._appHeight - 115; // reduce footer

                $(Elements.PROP_PANEL_WRAP).height(h);
                $(Elements.MAIN_PANEL_WRAP).height(h);
                $(Elements.APP_NAVIGATOR).height(h);
                $(Elements.RESOURCE_LIB_LIST_WRAP).height(h - 40);
                $(Elements.PRICING_TABLE_WRAP).height(h - 200);
                $(Elements.BLOCK_SUBPROPERTIES).height(h - 200);
                $(Elements.BLOCK_COMMON_PROPERTIES).height(h - 200);
                $(Elements.CLASS_ADD_NEW_BLOCK_LIST_WRAP).height(h);
                $(Elements.IFRAME_PREVIEW).height(h - 40);
                $(Elements.DASHBOARD_PROPERTIES).height(h - 30);


                BB.comBroker.fire(BB.EVENTS.APP_SIZED, this, null, {width: self._appWidth, height: self._appHeight});
            },

            /**
             Disable browser back button
             @method disableBack
             **/
            _disableBack: function () {
                var self = this;
                window.location.hash = "start_";
                window.location.hash = "Again-start_";//for google chrome
                window.onhashchange = function () {
                    window.location.hash = "start_";
                }
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

        return LayoutRouter;
    });