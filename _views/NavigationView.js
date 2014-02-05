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

            var appContentFaderView = BB.comBroker.getService(BB.SERVICES.APP_CONTENT_FADER_VIEW);
            var appEntryFaderView = BB.comBroker.getService(BB.SERVICES.APP_ENTRY_FADER_VIEW);

            $('.campaignManagerView').on('click', function () {
                appContentFaderView.selectView(Elements.CAMPAIGN_MANAGER_VIEW);
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
            });

            $('.resourcesPanel').on('click', function () {
                appContentFaderView.selectView(Elements.RESOURCES_PANEL);
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
            });

            $('.stationsPanel').on('click', function () {
                appContentFaderView.selectView(Elements.STATIONS_PANEL);
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
            });

            $('.settingsPanel').on('click', function () {
                appContentFaderView.selectView(Elements.SETTINGS_PANEL);
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
            });

            $('.proStudioPanel').on('click', function () {
                appContentFaderView.selectView(Elements.PRO_STUDIO_PANEL);
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
            });

            $('.helpPanel').on('click', function () {
                appContentFaderView.selectView(Elements.HELP_PANEL);
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
            });

            $('.logoutPanel').on('click', function () {
                BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();
                appEntryFaderView.selectView(Elements.APP_LOGOUT);
                $.removeCookie('signagestudioweblite', {path: '/'});
                $.cookie('signagestudioweblite', '', { expires: -300 });
            });
        },

        render: function() {
            $('.navbar-nav').css({
                display: 'block'
            })
        }

    })

    return FileMenuView;

});

