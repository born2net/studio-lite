/**
 File menu / Top navigation control
 @class FileMenuView
 @constructor
 @return {Object} instantiated FileMenu
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FileMenuView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            this.render();

            var appContentFaderView = BB.comBroker.getService(BB.SERVICES['APP_CONTENT_FADER_VIEW']);
            var appEntryFaderView = BB.comBroker.getService(BB.SERVICES['APP_ENTRY_FADER_VIEW']);

            $(Elements.CLASS_CAMPAIG_NMANAGER_VIEW).on('click', function () {
                appContentFaderView.selectView(Elements.CAMPAIGN_MANAGER_VIEW);
                self.resetPropertiesView();
            });

            $(Elements.CLASS_RESOURCES_PANEL).on('click', function () {
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
                $.removeCookie('signagestudioweblite', {path: '/'});
                $.cookie('signagestudioweblite', '', { expires: -300 });
            });

            $(Elements.DASHBOARD).on('click', function () {
                self.resetPropertiesView();
            });

            $(Elements.SAVE_CONFIG).on('click', function () {
                appEntryFaderView.selectView(Elements.WAITS_SCREEN_ENTRY_APP);
                jalapeno.save(function(i_status){
                    appEntryFaderView.selectView(Elements.APP_CONTENT);
                    if (!i_status.status){
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
                });
            });
        },

        resetPropertiesView: function(){
            BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
        },

        render: function() {
            $('.navbar-nav').css({
                display: 'block'
            })
        }
    });

    return FileMenuView;
});

