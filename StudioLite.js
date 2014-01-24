/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'AppRouter', 'Services', 'Elements', 'ComBroker', 'Lib', 'Jalapeno'], function (_, $, Backbone, Bootstrap, AppRouter, Services, Elements, ComBroker, Lib, Jalapeno) {
    var StudioLite = Backbone.Controller.extend({
        initialize: function () {
            Backbone.globs = {};
            Backbone.globs['UNIQUE_COUNTER'] = 0;
            Backbone.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
            Backbone.lib = new Lib();
            Backbone.lib.addBackboneViewOptions();
            Backbone.comBroker = new ComBroker();
            Backbone.Jalapeno = new Jalapeno();
            var appRouter = new AppRouter();
            Backbone.history.start();
            Backbone.comBroker.setService(Services.APP_ROUTER, appRouter);
            window.log = Backbone.lib.log;
            appRouter.navigate('authenticate/_/_', {trigger: true});
        }
    });
    return StudioLite;
});