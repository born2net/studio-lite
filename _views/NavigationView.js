/**
 File menu / Top navigation control
 @class NavigationView
 @constructor
 @return {Object} instantiated FileMenu
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.NAVIGATION_VIEW = 'NavigationView';

    var NavigationView = BB.View.extend({

        /**
         Constructor
         @method initialize all listeners on all navigation UI buttons
         **/
        initialize: function () {
            var self = this;
            self.m_limitedAccess = false;

            this._render();

            var appContentFaderView = BB.comBroker.getService(BB.SERVICES['APP_CONTENT_FADER_VIEW']);
            var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);

            var appWidth = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth();
            self._toggleIcons(appWidth);

            BB.comBroker.listen(BB.EVENTS.APP_SIZED, $.proxy(self._onAppResized, self));

            $(Elements.CLASS_CAMPAIG_NMANAGER_VIEW).on('click', function () {
                self._checkLimitedAccess();
                appContentFaderView.selectView(Elements.CAMPAIGN_MANAGER_VIEW);
                self.resetPropertiesView();
            });

            $(Elements.CLASS_RESOURCES_PANEL).on('click', function () {
                self._checkLimitedAccess();
                appContentFaderView.selectView(Elements.RESOURCES_PANEL);
                self.resetPropertiesView();
            });

            $(Elements.CLASS_STATIONS_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.STATIONS_PANEL);
                self.resetPropertiesView();
            });

            $(Elements.CLASS_SETTINGS_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.SETTINGS_PANEL);
                self.resetPropertiesView();
            });

            $(Elements.CLASSS_PRO_STUDIO_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.PRO_STUDIO_PANEL);
                self.resetPropertiesView();
            });

            $(Elements.CLASS_HELP_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.HELP_PANEL);
                self.resetPropertiesView();
            });

            $(Elements.CLASS_LOGOUT_PANEL).on('click', function () {
                self.resetPropertiesView();
                appEntryFaderView.selectView(Elements.APP_LOGOUT);
                BB.comBroker.getService(BB.SERVICES['APP_AUTH']).logout();
            });

            $(Elements.DASHBOARD).on('click', function () {
                self.resetPropertiesView();
            });

            $(Elements.SAVE_CONFIG).on('click', function () {
                self.saveAndRestartPrompt(function () {
                });
            });
        },

        /**
         Action on application resize
         @method _onAppResized
         @param {Event} e
         **/
        _onAppResized: function (e) {
            var self = this;
            self._toggleIcons(e.edata.width)
        },

        /**
         Toggle visibility of navigation icons depending on app total width
         @method _toggleIcons
         @param {Number} i_size
         **/
        _toggleIcons: function (i_size) {
            if (i_size > 1500) {
                $(Elements.CLASS_NAV_ICONS).show();
            } else {
                $(Elements.CLASS_NAV_ICONS).hide();
            }
        },

        /**
         Check is app is in limited access mode (station only) and if so show dialog model
         @method _checkLimitedAccess
         **/
        _checkLimitedAccess: function () {
            var self = this;
            if (self.m_limitedAccess) {
                self.forceStationOnlyViewAndDialog();
            }
        },

        _render: function () {
            $('.navbar-nav').css({
                display: 'block'
            })
        },

        /**
         Select one of the navigation UI buttons by triggering a user click event thus allowing for soft navigation
         @method _selectNavigation
         @param {String} elementID
         **/
        _selectNavigation: function (elementID) {
            $(elementID).trigger('click');
        },

        /**
         Set the navigation as limited access since user authenticated with Pro credentials and not Lite credentials
         which allows access only to Stations module
         @method applyLimitedAccess
         **/
        applyLimitedAccess: function () {
            var self = this;
            self.m_limitedAccess = true;
        },

        /**
         Force app into station only mode by showing dialog message to user and pushing back into Stations Panel
         @method forceStationOnlyViewAndDialog
         **/
        forceStationOnlyViewAndDialog: function () {
            var self = this;
            bootbox.dialog({
                message: "You are logged with FREE SignageStudio Pro credentials and not FREE StudioLite credentials so only the Stations module is available. Be sure to create a new FREE StudioLite account to get the full experience...",
                title: "Login in with Pro credentials..",
                buttons: {
                    info: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function () {
                            self._selectNavigation(Elements.CLASS_STATIONS_PANEL);
                        }
                    }
                }
            });
        },

        /**
         Reset back to default properties view which is the dashboard
         @method resetPropertiesView
         **/
        resetPropertiesView: function () {
            BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
        },

        /**
         Save and serialize configuration to remote mediaSERVER> Save and restart will check if
         the Stations module has been loaded and if no connected stations are present, it will NOT
         prompt for option to restart station on save, otherwise it will.
         @method saveAndRestartPrompt
         @param {Function} call back after save
         **/
        saveAndRestartPrompt: function (i_callBack) {
            var self = this;
            self.m_stationsListView = BB.comBroker.getService(BB.SERVICES['STATIONS_LIST_VIEW'])
            if (self.m_stationsListView != undefined) {
                var totalStations = self.m_stationsListView.getTotalActiveStation();
                if (totalStations == 0) {
                    self.save(function () {
                    });
                    return;
                }
            }

            bootbox.dialog({
                message: "Restart connected stations to apply your latest saved work?",
                title: "Save work to remote server",
                buttons: {
                    success: {
                        label: "Save",
                        className: "btn-success",
                        callback: function () {
                            self.save(function () {
                            });
                        }
                    },
                    danger: {
                        label: "Save & restart stations",
                        className: "btn-success",
                        callback: function () {
                            self.save(function () {
                                jalapeno.sendCommand('rebootPlayer', -1, function () {
                                });

                            });
                        }
                    },
                    main: {
                        label: "Cancel",
                        callback: function () {
                            return;
                        }
                    }
                }
            });
        },

        /**
         Save config to remote mediaSERVER
         @method save
         @params {Function} i_callBack
         **/
        save: function (i_callBack) {
            var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);
            appEntryFaderView.selectView(Elements.WAITS_SCREEN_ENTRY_APP);
            jalapeno.save(function (i_status) {
                appEntryFaderView.selectView(Elements.APP_CONTENT);
                if (!i_status.status) {
                    bootbox.dialog({
                        message: i_status.error,
                        title: "Problem saving",
                        buttons: {
                            danger: {
                                label: "OK",
                                className: "btn-danger",
                                callback: function () {
                                }
                            }
                        }
                    });
                }
                i_callBack(i_status);
            });
        }
    });

    return NavigationView;
});

