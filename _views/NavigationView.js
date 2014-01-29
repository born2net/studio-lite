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
            var self = this;
            this.render();

            var appContentFaderView = Backbone.comBroker.getService(Backbone.SERVICES.APP_CONTENT_FADER_VIEW);
            var appEntryFaderView = Backbone.comBroker.getService(Backbone.SERVICES.APP_ENTRY_FADER_VIEW);

            $('.campaignManagerView').on('click', function () {
                appContentFaderView.selectView(Elements.CAMPAIGN_MANAGER_VIEW);
                self._resetPropertiesView();
            });

            $('.resourcesPanel').on('click', function () {
                appContentFaderView.selectView(Elements.RESOURCES_PANEL);
                self._resetPropertiesView();
            });

            $('.stationsPanel').on('click', function () {
                appContentFaderView.selectView(Elements.STATIONS_PANEL);
                self._resetPropertiesView();
            });

            $('.settingsPanel').on('click', function () {
                appContentFaderView.selectView(Elements.SETTINGS_PANEL);
                self._resetPropertiesView();
            });

            $('.proStudioPanel').on('click', function () {
                appContentFaderView.selectView(Elements.PRO_STUDIO_PANEL);
                self._resetPropertiesView();
            });

            $('.helpPanel').on('click', function () {
                appContentFaderView.selectView(Elements.HELP_PANEL);
                self._resetPropertiesView();
            });

            $('.logoutPanel').on('click', function () {
                self._resetPropertiesView();
                appEntryFaderView.selectView(Elements.APP_LOGOUT);
                $.removeCookie('signagestudioweblite', {path: '/'});
                $.cookie('signagestudioweblite', '', { expires: -300 });
            });
        },

        _resetPropertiesView: function(){
            Backbone.comBroker.getService(Backbone.SERVICES.PROPERTIES_VIEW).selectView(Elements.EMPTY_PROPERTIES);

        },

        render: function() {
            $('.navbar-nav').css({
                display: 'block'
            })
        }

    })

    return FileMenuView;

});

