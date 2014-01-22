/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'bootbox', 'Elements', 'ComBroker', 'Lib'], function (_, $, Backbone, Bootstrap, Bootbox, Elements, ComBroker, Lib) {
    var StudioLite = Backbone.View.extend({

        initialize: function(){

            Backbone.lib = new Lib.module();
            Backbone.lib.addBackboneViewOptions();
            window.log = Backbone.lib.log;
            Backbone.comBroker = new ComBroker.module();
        }
    });

    return StudioLite;
});