/**
 File menu / Top navigation control
 @class FileMenuView
 @constructor
 @return {Object} instantiated FileMenu
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FileMenuView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this.render();

            var appContentFaderView = Backbone.comBroker.getService(Services.APP_CONTENT_FADER_VIEW);
            var appEntryFaderView = Backbone.comBroker.getService(Services.APP_ENTRY_FADER_VIEW);


            $('.campaignManagerView').on('click', function () {
                appContentFaderView.selectView(Elements.CAMPAIGN_MANAGER_VIEW);
            });

            $('.resourcesPanel').on('click', function () {
                appContentFaderView.selectView(Elements.RESOURCES_PANEL);
            });

            $('.stationsPanel').on('click', function () {
                appContentFaderView.selectView(Elements.STATIONS_PANEL);
            });

            $('.settingsPanel').on('click', function () {
                appContentFaderView.selectView(Elements.SETTINGS_PANEL);
            });

            $('.proStudioPanel').on('click', function () {
                appContentFaderView.selectView(Elements.PRO_STUDIO_PANEL);
            });

            $('.helpPanel').on('click', function () {
                appContentFaderView.selectView(Elements.HELP_PANEL);
            });

            $('.logoutPanel').on('click', function () {
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

