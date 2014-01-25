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
                var oid = appContentFaderView.getViewByID(Elements.CAMPAIGN_MANAGER_VIEW);
                appContentFaderView.selectView(oid);
            });

            $('.resourcesPanel').on('click', function () {
                var oid = appContentFaderView.getViewByID(Elements.RESOURCES_PANEL);
                appContentFaderView.selectView(oid);
            });

            $('.stationsPanel').on('click', function () {
                var oid = appContentFaderView.getViewByID(Elements.STATIONS_PANEL);
                appContentFaderView.selectView(oid);
            });

            $('.settingsPanel').on('click', function () {
                var oid = appContentFaderView.getViewByID(Elements.SETTINGS_PANEL);
                appContentFaderView.selectView(oid);
            });

            $('.proStudioPanel').on('click', function () {
                var oid = appContentFaderView.getViewByID(Elements.PRO_STUDIO_PANEL);
                appContentFaderView.selectView(oid);
            });

            $('.helpPanel').on('click', function () {
                var oid = appContentFaderView.getViewByID(Elements.HELP_PANEL);
                appContentFaderView.selectView(oid);
            });

            $('.logoutPanel').on('click', function () {
                var oid = appEntryFaderView.getViewByID(Elements.APP_LOGOUT);
                appEntryFaderView.selectView(oid);
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

