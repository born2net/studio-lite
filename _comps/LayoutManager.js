/**
 Application router / application instantiator
 @class LayoutManager
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'AppAuth', 'AppSizer', 'NavigationView', 'AppEntryFaderView', 'LoginView', 'AppContentFaderView', 'WaitView', 'bootbox', 'CampaignManagerView', 'ResourcesView', 'ResourcesView', 'StationsView', 'SettingsView', 'ProStudioView', 'HelpView', 'LogoutView', 'CampaignSliderView'],
    function (_, $, Backbone, AppAuth, AppSizer, NavigationView, AppEntryFaderView, LoginView, AppContentFaderView, WaitView, Bootbox, CampaignManagerView, ResourcesView, ResourcesView, StationsView, SettingsView, ProStudioView, HelpView, LogoutView, CampaignSliderView) {

        var LayoutManager = Backbone.Router.extend({

            /**
             Constructor
             @method initialize
             **/
            initialize: function () {
                this.loadLoginPage();
            },

            /**
             Router definition to function maps
             @method routes
             **/
            routes: {
                "app": "routeApp",
                "authenticate/:user/:pass": "routeAuthenticate",
                "authenticating": "routeAuthenticating",
                "authenticated": "routeAuthenticated",
                "unauthenticated": "routeUnauthenticated",
                "authenticationFailed": "routeAuthenticationFailed"
            },

            /**
             Initiate user credential route authentication
             @method authenticate
             @param {String} i_user
             @param {String} i_pass
             **/
            routeAuthenticate: function (i_user, i_pass) {
                this.appAuth.authenticate(i_user, i_pass);
            },

            /**
             In process of route authentication
             @method authenticating
             **/
            routeAuthenticating: function () {
                this.appEntryFaderView.selectView(this.mainAppWaitView);
            },

            /**
             Authentication passed, load app page route
             @method authenticating
             **/
            routeAuthenticated: function () {
                this.navigate('app', {trigger: true});
            },

            /**
             No authentication passed, load Login page route
             @method authenticating
             **/
            routeUnauthenticated: function () {
                this.appEntryFaderView.selectView(this.loginView);
            },

            /**
             Failed user authentication route
             @method authenticationFailed
             **/
            routeAuthenticationFailed: function () {
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
             On successful authentication load main application StackViews per this route App
             @method app
             **/
            routeApp: function () {
                if (this.appAuth.authenticated) {
                    this.loadContentPage();
                    this.loadCampaignWizardPage();
                    this.loadModal();
                    this.loadSlidingPanel();
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
             @method loadLoginPage
             **/
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

            /**
             Use the previously created appContentFaderView to add list of views including campaign, stations, logout etc
             so navigation can be switched between each content div. Also we create one special view called
             CampaignSliderView that it itself is a StackView.Slider that will later allow for Campaign wizard slider animated selections.
             @method loadContentPage
             **/
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
            },

            /**
             Use the previously created CampaignSliderView to add new view to it for campaign wizard slider animation which include
             CampaignSelector, Screen Orientation, Screen Resolution and Campaign
             @method loadCampaignWizardPage
             **/
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

                this.appEntryFaderView.selectView(this.appContentFaderView);
                $(Elements.APP_CONTENT).fadeIn('slow');
            },

            loadModal: function () {

                require(['PopModalView'], function (PopModalView) {
                    var popModalView = new PopModalView({
                        el: Elements.POP_MODAL,
                        animation: 'slide_top', //or 'fade'
                        bgColor: 'white'
                    });

                    var md1 = new Backbone.View({el: '#stackViewModal1'});
                    var md2 = new Backbone.View({el: '#stackViewModal2'});
                    var md3 = new Backbone.View({el: '#stackWaitModalView'});
                    var md4 = new Backbone.View();
                    md4.$el.append('<b class="modal_close">hello world</b>');
                    $('body').append(md3.el);
                    popModalView.addView(md1);
                    popModalView.addView(md2);
                    popModalView.addView(md3);
                    popModalView.addView(md4);

                    var c = 0;
                    $('#someAction').on('click', function () {
                        if (c == 0)
                            popModalView.selectView(md1);
                        if (c == 1)
                            popModalView.selectView(md2);
                        if (c == 2)
                            popModalView.selectView(md3);
                        if (c == 3)
                            popModalView.selectView(md4);
                        if (c == 4)
                            popModalView.selectView(md2);
                        c++;
                    });
                });
            },

            loadSlidingPanel: function(){
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