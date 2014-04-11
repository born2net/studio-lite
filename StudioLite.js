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




            $(".dropdownlang dt a").click(function() {
                $(".dropdownlang dd ul").toggle();
            });

            $(".dropdownlang dd ul li a").click(function() {
                var text = $(this).html();
                $(".dropdownlang dt a span").html(text);
                $(".dropdownlang dd ul").hide();
               log(getSelectedValue("languageSelector"));
            });

            function getSelectedValue(id) {
                return $("#" + id).find("dt a span.value").html();
            }

            $(document).bind('click', function(e) {
                var $clicked = $(e.target);
                if (! $clicked.parents().hasClass("dropdownlang"))
                    $(".dropdownlang dd ul").hide();
            });







            // internationalization
            require(['localizer'], function () {
                var lang = "en";
                var opts = { language: lang, pathPrefix: "./_lang" };
                $("[data-localize]").localize("local", opts);
            });

            // router init
            require(['LayoutRouter'], function (LayoutRouter) {
                var LayoutRouter = new LayoutRouter();
                BB.history.start();
                BB.comBroker.setService(BB.SERVICES['LAYOUT_ROUTER'], LayoutRouter);
                LayoutRouter.navigate('authenticate/_/_', {trigger: true});
            })
        }
    });

    return StudioLite;
});