(function (window, factory) {
    'use strict';
    var Backbone = window.Backbone;
    if (typeof define === 'function' && define.amd) {
        return define(['backbone', 'underscore'], function () {
            return factory.apply(window, arguments);
        });
    } else if (typeof module === 'object' && module.exports) {
        factory.call(window, require('backbone'), require('underscore'));
    } else {
        factory.call(window, Backbone, window._);
    }
}(typeof global === "object" ? global : this, function (Backbone, _) {

    var AppAuth = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         @return {} Unique clientId.
         **/
        initialize: function () {
        },

        authenticate: function () {
            var self = this;
            var appRouter = Backbone.comBroker.getService(Services.APP_ROUTER);
            appRouter.navigate('authenticating', {trigger: true});
            self.credentialsCheck();
        },

        credentialsCheck: function () {
            var self = this;
            var appRouter = Backbone.comBroker.getService(Services.APP_ROUTER);

            var cookie = $.cookie('signagestudioweblite') == undefined ? undefined : $.cookie('signagestudioweblite').split(' ')[0];

            if (cookie === undefined) {
                appRouter.navigate('unauthenticated', {trigger: true});
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
                        appRouter.navigate('authenticated', {trigger: true});
                    } else {
                        appRouter.navigate('unauthenticated', {trigger: true});
                    }
                });
            }
        }
    });

    return AppAuth;
}));


