/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'backbone.controller', 'ComBroker', 'Lib', 'Jalapeno', 'JalapenoHelper'], function (_, $, Backbone, Bootstrap, backbonecontroller, ComBroker, Lib, Jalapeno, JalapenoHelper) {
    var StudioLite = Backbone.Controller.extend({

        // app init
        initialize: function () {
            var self = this;

            window.BB = Backbone;
            BB.globs = {};
            BB.SERVICES = {};
            BB.EVENTS = {};
            BB.LOADING = {};
            BB.CONSTS = {};
            BB.globs['UNIQUE_COUNTER'] = 0;
            BB.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
            BB.lib = new Lib();
            BB.lib.addBackboneViewOptions();
            BB.comBroker = new ComBroker();
            BB.comBroker.name = 'AppBroker';
            BB.Jalapeno = new Jalapeno();
            _.extend(BB.Jalapeno,BB.comBroker);
            BB.Jalapeno.clearServices();
            BB.Jalapeno.name = 'JalapenoBroker';
            BB.JalapenoHelper = new JalapenoHelper();
            window.jalapeno = BB.Jalapeno;
            window.log = BB.lib.log;

            // internationalization
            require(['LanguageSelectorView'], function (LanguageSelectorView) {
                self.m_languageSelectionLogin = new LanguageSelectorView({appendTo: Elements.LANGUAGE_SELECTION_LOGIN});
                var lang = self.m_languageSelectionLogin.getLanguage();
                if (lang)
                    self.m_languageSelectionLogin.setLanguage(lang);
            });

            // router init
            require(['LayoutRouter'], function (LayoutRouter) {
                var LayoutRouter = new LayoutRouter();
                BB.history.start();
                LayoutRouter.navigate('authenticate/_/_', {trigger: true});
            })
        }
    });

    return StudioLite;
});