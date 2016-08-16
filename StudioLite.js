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
            window.TSLiteModules = {};
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
            BB.CONSTS.ROOT_URL = 'https://secure.digitalsignage.com' + (BB.lib.inDevMode() ? ':442' : ''); // change to 442 for debuggin
            BB.CONSTS.BASE_URL = BB.CONSTS.ROOT_URL + (BB.lib.inDevMode() ? '/_studiolite-dev/studiolite.html' : '/_studiolite-dist/studiolite.html');

            //console.log(platform.name + ' ' + platform.version);

            $.ajaxSetup({
                cache: false,
                timeout: 8000,
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

            // dev mode module loader
            if (BB.lib.inDevMode()) {
                $.getJSON('https://secure.digitalsignage.com/getIp', function (e) {
                    var ip = e.ip.replace(/\./ig, '');
                    if (ip.match('76255130')) {
                        require(['SampleView'], function (i_SampleView) {
                            new i_SampleView();
                        });
                    }
                })
            }

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

            // hand out to app controller
            require(['LayoutRouter', 'Events'], function (LayoutRouter, Events) {
                var LayoutRouter = new LayoutRouter({app: BB.CONSTS.APP_STUDIO_LITE});
                BB.history.start();
                LayoutRouter.navigate('authenticate/_/_', {trigger: true});
            });
        }
    });

    return StudioLite;
});