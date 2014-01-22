/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'bootbox', 'Elements', 'ComBroker', 'Lib', 'LoginView', 'AppEntryFaderView', 'AppSliderView', 'WaitView'], function (_, $, Backbone, Bootstrap, Bootbox, Elements, ComBroker, Lib, LoginView, AppEntryFaderView, AppSliderView, WaitView) {
    var StudioLite = Backbone.View.extend({

        initialize: function(){

            Backbone.lib = new Lib.module();
            Backbone.lib.addBackboneViewOptions();
            window.log = Backbone.lib.log;
            Backbone.comBroker = new ComBroker.module();
            log('init');

            var appEntryFaderView = new AppEntryFaderView({
                el: Elements.APP_ENTRY,
                duration: 500
            });

            var loginView = new LoginView({
                el: Elements.APP_LOGIN
            });

            var appSliderView = new AppSliderView({
                el: Elements.APP_CONTENT
            });

            var mainAppWaitView = new WaitView({
                el: '#waitScreenApp'
            });

            appEntryFaderView.addView(loginView);
            appEntryFaderView.addView(appSliderView);
            appEntryFaderView.addView(mainAppWaitView);

            appEntryFaderView.selectView(loginView);

            setTimeout(function(){
                appEntryFaderView.selectView(mainAppWaitView);
            },2000);

            setTimeout(function(){
                appEntryFaderView.selectView(appSliderView);
            },4000);
        }
    });

    return StudioLite;
});