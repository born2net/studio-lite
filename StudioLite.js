/**
 StudioLite MediaSignage Inc (c) open source digital signage project
 Visit Github for licenses and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'backbone.controller', 'ComBroker', 'Lib', 'Pepper', 'PepperHelper', 'Elements', 'bootbox', 'platform'], function (_, $, Backbone, Bootstrap, backbonecontroller, ComBroker, Lib, Pepper, PepperHelper, Elements, bootbox, platform) {

    var StudioLite = Backbone.Controller.extend({

        // app init
        initialize: function () {
            var self = this;
            window.BB = Backbone;
            window.bootbox = bootbox;
            BB.globs = {};
            BB.globs['CREDENTIALS'] = '';
            BB.SERVICES = {};
            BB.EVENTS = {};
            BB.CONSTS = {};
            BB.CONSTS.APP_STUDIO_LITE = '0';
            BB.CONSTS.APP_CUSTOMER_TERMINAL = '1';
            BB.CONSTS.APP_REMOTE_STATUS = '2';
            BB.globs['UNIQUE_COUNTER'] = 0;
            BB.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
            BB.lib = new Lib();
            BB.lib.addBackboneViewOptions();
            BB.lib.addBackboneCollectionSave();
            BB.lib.selectionSwitcher();
            BB.comBroker = new ComBroker();
            BB.comBroker.name = 'AppBroker';
            BB.Pepper = new Pepper();
            _.extend(BB.Pepper, BB.comBroker);
            BB.Pepper.clearServices();
            BB.Pepper.name = 'JalapenoBroker';
            BB.PepperHelper = new PepperHelper();
            window.pepper = BB.Pepper;
            window.log = BB.lib.log;
            BB.platform = platform;
            BB.lib.forceBrowserCompatibility();
            BB.lib.promptOnExit();
            BB.CONSTS.ROOT_URL = 'https://secure.digitalsignage.com' + (BB.lib.inDevMode() ? ':442' : '');
            BB.CONSTS.BASE_URL = BB.CONSTS.ROOT_URL + (BB.lib.inDevMode() ? '/_studiolite-dev/studiolite.html' : '/_studiolite-dist/studiolite.html');

            $.ajaxSetup({
                cache: false,
                timeout: 3000,
                crossDomain: true
            });

            _.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };

            // localization
            require(['LanguageSelectorView', 'Elements'], function (LanguageSelectorView, Elements) {
                new LanguageSelectorView({appendTo: Elements.LANGUAGE_SELECTION_LOGIN});
            });

            // theme
            require(['simplestorage'], function (simplestorage) {
                var theme = simplestorage.get('theme');
                if (theme && theme != 'light')
                    BB.lib.loadCss('style_' + theme + '.css');
                BB.CONSTS['THEME'] = _.isUndefined(theme) ? 'light' : theme;
            });

            var mode = window.location.href.match(RegExp("(mode=)(.*)(&param=)(.*)"));
            var app;

            // FQ Customer Terminal
            if (!_.isNull(mode) && (mode[2] == 'customerTerminal' || mode[2] == 'remoteStatus')) {
                switch (mode[2]) {
                    case 'customerTerminal':
                    {
                        app = BB.CONSTS.APP_CUSTOMER_TERMINAL;
                        break;
                    }
                    case 'remoteStatus':
                    {
                        app = BB.CONSTS.APP_REMOTE_STATUS;
                        break;
                    }
                }
                require(['FQTerminalController', 'Events'], function (FQTerminalController) {
                    new FQTerminalController({
                        param: mode[4],
                        app: app
                    });
                });
                return;
            }

            // StudioLite
            require(['LayoutRouter', 'Events'], function (LayoutRouter, Events) {
                var LayoutRouter = new LayoutRouter({app: BB.CONSTS.APP_STUDIO_LITE});
                console.log(BB.EVENTS.ADDED_RESOURCE);
                console.log(BB.EVENTS.REMOVED_RESOURCE);
                BB.history.start();
                LayoutRouter.navigate('authenticate/_/_', {trigger: true});
            });

            /*
             var token64 = 'eyJhY2Nlc3NfdG9rZW4iOiJ5YTI5LmhRSG5oR19McFhZOHhXeHRaN0hGbFBJUzlCdWpJVlpJX3pOUVc0dGRWLXVEN2FYMjd1dXVZZmtLQ2ZFbVh5d0NuZHQtNk1CV25iaGVQUSIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJpZF90b2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW10cFpDSTZJbVEyWm1NNE1qRXdaREEwWmpka016bGpOamczT0RNeFpUZGxOelF4T0dVNE1tWmhaVGt5TURRaWZRLmV5SnBjM01pT2lKaFkyTnZkVzUwY3k1bmIyOW5iR1V1WTI5dElpd2ljM1ZpSWpvaU1URTBNVEEzTlRrd056VXpOemM1TnpZNU9EUXhJaXdpWVhwd0lqb2lPVGd4T1RNMU56WTVNRE10T0dad2JHcGljM1EyTjJkMk1HSmljemhvWTI1MGEyWTJOVEJuWXpKMk5qVXVZWEJ3Y3k1bmIyOW5iR1YxYzJWeVkyOXVkR1Z1ZEM1amIyMGlMQ0poZEY5b1lYTm9Jam9pVjFsbE5VWkNSa0pGTkRSNE15MTRUbTVFWTFCTVFTSXNJbUYxWkNJNklqazRNVGt6TlRjMk9UQXpMVGhtY0d4cVluTjBOamRuZGpCaVluTTRhR051ZEd0bU5qVXdaMk15ZGpZMUxtRndjSE11WjI5dloyeGxkWE5sY21OdmJuUmxiblF1WTI5dElpd2lhV0YwSWpveE5ETXpNVGd4TWpFeExDSmxlSEFpT2pFME16TXhPRFE0TVRGOS5abjYzYXFtLW83WmZsQ3VNN1Rvc1I5MHh3VHdzYjlvajdiLWZ6QlQ5dzNfYVk4N3NpeG9UTUoxU0N1VER1NktCNURmaUF4blc3QjRBMjBBTGZ0UzlzakJfNUxxeXJZelNsUUF1MUN4aVB0bjN4czg4akUwWGgwbnlJQ2tBSTBTYmQ0MmstTEFMTkJzelRJMjZTVWhCUWlIdXdFNTBubXd3UkJJMFBPLXh3ZkUiLCJyZWZyZXNoX3Rva2VuIjoiMS9qa0RlLWdSdTNBODhFd05jX3BBQWxEX3FjR3NhUjMtZ2wyM0hRZWk2QzZrIiwiZXhwaXJ5X2RhdGUiOjE0MzMxODQ5ODU1MjN9';
             var fileid = '0B8cIoiRdLq3JNGd4RjZDckJWMVE';
             var url = 'https://secure.digitalsignage.com:442/GoogleAjaxFileLink/' + token64 + '/' + fileid;
             $.get(url, function (res) {
             window.location.href = res.url;
             console.log(res.url)
             });
             */
        }
    });

    return StudioLite;
});