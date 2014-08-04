/**
 File menu / Top navigation control
 @class NavigationView
 @constructor
 @return {Object} instantiated FileMenu
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.NAVIGATION_VIEW = 'NavigationView';

    /**
     Custom event fired when scene list should be refreshed
     @event SCENE_LIST_UPDATED
     @param {This} caller
     @param {Self} context caller
     @param {Event} event
     @static
     @final
     **/
    BB.EVENTS.SCENE_LIST_UPDATED = 'SCENE_LIST_UPDATED';

    var NavigationView = BB.View.extend({

        /**
         Constructor
         @method initialize all listeners on all navigation UI buttons
         **/
        initialize: function () {
            var self = this;
            self.m_limitedAccess = false;

            this._render();


            /*$(function() {
                $('.navbar-nav').on('click', function(){
                    if($('.navbar-header .navbar-toggle').css('display') !='none'){
                        $(".navbar-header .navbar-toggle").trigger( "click" );
                    }
                });
            });*/

            var appContentFaderView = BB.comBroker.getService(BB.SERVICES['APP_CONTENT_FADER_VIEW']);
            var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);

            var appWidth = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER).getAppWidth();
            self._toggleIcons(appWidth);

            BB.comBroker.listen(BB.EVENTS.APP_SIZED, $.proxy(self._onAppResized, self));

            $(Elements.CLASS_CAMPAIG_NMANAGER_VIEW).on('click', function () {
                self._checkLimitedAccess();
                appContentFaderView.selectView(Elements.CAMPAIGN_MANAGER_VIEW);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_RESOURCES_PANEL).on('click', function () {
                self._checkLimitedAccess();
                appContentFaderView.selectView(Elements.RESOURCES_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_STATIONS_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.STATIONS_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_SCENES_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.SCENES_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_SETTINGS_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.SETTINGS_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASSS_PRO_STUDIO_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.PRO_STUDIO_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_HELP_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.HELP_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_INSTALL_PANEL).on('click', function () {
                appContentFaderView.selectView(Elements.INSTALL_PANEL);
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.CLASS_LOGOUT_PANEL).on('click', function () {
                self.resetPropertiesView();
                appEntryFaderView.selectView(Elements.APP_LOGOUT);
                BB.comBroker.getService(BB.SERVICES['APP_AUTH']).logout();
                self._closeMobileNavigation();
            });

            $(Elements.DASHBOARD).on('click', function () {
                self.resetPropertiesView();
                self._closeMobileNavigation();
            });

            $(Elements.SAVE_CONFIG).on('click', function () {
                self.saveAndRestartPrompt(function () {
                });
                self._closeMobileNavigation();
            });

            $(Elements.LIVE_CHAT).on('click', function () {
                window.open('http://www.digitalsignage.com/_html/live_chat.html', '_blank');
                self._closeMobileNavigation();
            });

            $(Elements.LANGUAGE_PROMPT).on('click', function () {
                require(['LanguageSelectorView'], function (LanguageSelectorView) {
                    var uniqueID = _.uniqueId('languagePrompt')
                    var modal = bootbox.dialog({
                        message: '<div id="' + uniqueID + '"></div>',
                        title: $(Elements.MSG_BOOTBOX_COSTUME_TITLE).text(),
                        show: false,
                        buttons: {
                            success: {
                                label: '<i style="font-size: 1em" class="fa fa-forward "></i>',
                                className: "btn-success",
                                callback: function () {
                                    $('#' + uniqueID).empty();
                                }
                            }
                        }
                    });
                    modal.modal("show");
                    new LanguageSelectorView({appendTo: '#' + uniqueID});
                });
            });
        },

        _closeMobileNavigation: function(){
            if($('.navbar-header .navbar-toggle').css('display') !='none'){
                $(".navbar-header .navbar-toggle").trigger( "click" );
            }
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
                message: $(Elements.MSG_BOOTBOX_LOGIN_WRONG_CRED).text(),
                title: $(Elements.MSG_BOOTBOX_LOGIN_PRO_CRED).text(),
                buttons: {
                    info: {
                        label: $(Elements.MSG_BOOTBOX_OK).text(),
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
            self.m_stationsListView = BB.comBroker.getService(BB.SERVICES['STATIONS_LIST_VIEW']);
            if (self.m_stationsListView != undefined) {
                var totalStations = self.m_stationsListView.getTotalActiveStation();
                if (totalStations == 0) {
                    self.save(function () {
                    });
                    return;
                }
            }

            bootbox.dialog({
                message: $(Elements.MSG_BOOTBOX_RESTART_STATIONS).text(),
                title: $(Elements.MSG_BOOTBOX_SAVE_REMOTE_SRV).text(),
                buttons: {
                    success: {
                        label: $(Elements.MSG_BOOTBOX_SAVE).text(),
                        className: "btn-success",
                        callback: function () {
                            self.save(function () {
                            });
                        }
                    },
                    danger: {
                        label: $(Elements.MSG_BOOTBOX_SAVE_RESTART).text(),
                        className: "btn-success",
                        callback: function () {
                            self.save(function () {
                                pepper.sendCommand('rebootPlayer', -1, function () {
                                });

                            });
                        }
                    },
                    main: {
                        label: $(Elements.MSG_BOOTBOX_CANCEL).text(),
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
            var self = this;
            var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);
            appEntryFaderView.selectView(Elements.WAITS_SCREEN_ENTRY_APP);
            pepper.stripScenePlayersIDs();
            pepper.save(function (i_status) {
                appEntryFaderView.selectView(Elements.APP_CONTENT);
                pepper.restoreScenesWithPlayersIDs();
                if (!i_status.status) {
                    bootbox.dialog({
                        message: i_status.error,
                        title: $(Elements.MSG_BOOTBOX_PROBLEM_SAVING).text(),
                        buttons: {
                            danger: {
                                label: $(Elements.MSG_BOOTBOX_OK).text(),
                                className: "btn-danger",
                                callback: function () {
                                }
                            }
                        }
                    });
                }
                BB.comBroker.fire(BB.EVENTS['SCENE_LIST_UPDATED'], self);
                i_callBack(i_status);
            });
        }
    });

    return NavigationView;
});

