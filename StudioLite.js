/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'backbone.controller', 'ComBroker', 'Lib', 'Jalapeno', 'X2JS'], function (_, $, Backbone, Bootstrap, backbonecontroller, ComBroker, Lib, Jalapeno, X2JS) {
    var StudioLite = Backbone.Controller.extend({

        // application init
        initialize: function () {

            Backbone.globs = {};
            Backbone.SERVICES = {};
            Backbone.EVENTS = {};
            Backbone.CONSTS = {};
            Backbone.globs['UNIQUE_COUNTER'] = 0;
            Backbone.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
            Backbone.lib = new Lib();
            Backbone.lib.addBackboneViewOptions();
            Backbone.comBroker = new ComBroker();
            Backbone.Jalapeno = new Jalapeno();

            var compX2JS = x2js = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
            Backbone.comBroker.setService('compX2JS', compX2JS);

            window.jalapeno = Backbone.Jalapeno;
            window.log = Backbone.lib.log;

            // router init
            require(['LayoutManager'], function (LayoutManager) {
                var layoutManager = new LayoutManager();
                Backbone.history.start();
                Backbone.comBroker.setService(Backbone.SERVICES.LAYOUT_MANAGER, layoutManager);
                layoutManager.navigate('authenticate/_/_', {trigger: true});
            })
        }
    });
    return StudioLite;
});