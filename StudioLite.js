/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'backbone.controller', 'ComBroker', 'Lib', 'Jalapeno', 'JalapenoHelper', 'X2JS'], function (_, $, Backbone, Bootstrap, backbonecontroller, ComBroker, Lib, Jalapeno, JalapenoHelper, X2JS) {
    var StudioLite = Backbone.Controller.extend({

        // application init
        initialize: function () {
            window.BB = Backbone;
            BB.globs = {};
            BB.SERVICES = {};
            BB.EVENTS = {};
            BB.CONSTS = {};
            BB.globs['UNIQUE_COUNTER'] = 0;
            BB.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
            BB.lib = new Lib();
            BB.lib.addBackboneViewOptions();
            BB.comBroker = new ComBroker();
            BB.Jalapeno = new Jalapeno();
            BB.JalapenoHelper = new JalapenoHelper();
            var compX2JS = x2js = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
            BB.comBroker.setService('compX2JS', compX2JS);
            window.jalapeno = BB.Jalapeno;
            window.model = BB.JalapenoHelper;
            window.log = BB.lib.log;

            // router init
            require(['LayoutManager'], function (LayoutManager) {
                var layoutManager = new LayoutManager();
                BB.history.start();
                BB.comBroker.setService(BB.SERVICES['LAYOUT_MANAGER'], layoutManager);
                layoutManager.navigate('authenticate/_/_', {trigger: true});
            })
        }
    });

    return StudioLite;
});