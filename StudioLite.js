/**
 StudioLite MediaSignage Inc (c) open source digital signage project.
 Visit Github for license and docs: http://git.digitalsignage.com
 @class StudioLite
 @constructor
 @return {Object} instantiated StudioLite
 **/
define(['underscore', 'jquery', 'backbone', 'bootstrap', 'bootbox', 'AppRouter', 'Services', 'Elements', 'ComBroker', 'Lib', 'LoginView', 'AppEntryFaderView', 'AppSliderView', 'WaitView', 'Cookie', 'RC4', 'Jalapeno'],
    function (_, $, Backbone, Bootstrap, Bootbox, AppRouter, Services, Elements, ComBroker, Lib, LoginView, AppEntryFaderView, AppSliderView, WaitView, Cookie, RC4, Jalapeno) {
        var StudioLite = Backbone.View.extend({

            initialize: function () {

                Backbone.globs = {};
                Backbone.globs['UNIQUE_COUNTER'] = 0;
                Backbone.globs['RC4KEY'] = '226a3a42f34ddd778ed2c3ba56644315';
                Backbone.lib = new Lib.module();
                Backbone.lib.addBackboneViewOptions();
                Backbone.comBroker = new ComBroker.module();
                Backbone.Jalapeno = new Jalapeno();
                var appRouter = new AppRouter();
                Backbone.history.start();
                Backbone.comBroker.setService(Services.APP_ROUTER, appRouter);
                window.log = Backbone.lib.log;
                this.credentialsCheck();

                /*
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

                 var appEntryWaitView = new WaitView({
                 el: Elements.WAITS_SCREEN_ENTRY_APP
                 });

                 appEntryFaderView.addView(loginView);
                 appEntryFaderView.addView(appSliderView);
                 appEntryFaderView.addView(appEntryWaitView);

                 appEntryFaderView.selectView(loginView);

                 setTimeout(function () {
                 appEntryFaderView.selectView(appEntryWaitView);
                 }, 2000);

                 setTimeout(function () {
                 appEntryFaderView.selectView(appSliderView);
                 }, 4000);
                 */
            },

            credentialsCheck: function () {
                var self = this;
                var cookie = $.cookie('signagestudioweblite') == undefined ? undefined : $.cookie('signagestudioweblite').split(' ')[0];
                if (cookie === undefined) {

                } else {

                    var rc4 = new RC4(Backbone.globs['RC4KEY']);
                    var crumb = rc4.doDecrypt(cookie).split(':');
                    var user = crumb[0];
                    var pass = crumb[2];

                    Backbone.Jalapeno.dbConnect(user, pass, function (i_status) {
                        var userData = {
                            result: i_status,
                            user: user,
                            pass: pass
                        }
                        if (i_status.status) {
                            self.credentialsPass(userData);
                        } else {
                            self.credentialsFail();
                        }
                    });
                }
            },

            credentialsPass: function (i_userData) {
                log('result ' + i_userData);
                var router = Backbone.comBroker.getService(Services.APP_ROUTER);
                router.navigate('app', {trigger: true});

            },

            credentialsFail: function () {
                var router = Backbone.comBroker.getService(Services.APP_ROUTER);
                router.navigate('login', {trigger: true});
            }

        });

        return StudioLite;
    });