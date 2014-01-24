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
            this.authenticated = false;
            this.AUTH_USER_PASS = 0
            this.AUTH_COOKIE = 1
        },

        authenticate: function (i_user, i_pass) {
            var self = this;
            var appRouter = Backbone.comBroker.getService(Services.APP_ROUTER);
            appRouter.navigate('authenticating', {trigger: true});
            self._loadCredentials(i_user, i_pass);
        },

        _loadCredentials: function (i_user, i_pass) {
            var self = this;

            var cookie = $.cookie('signagestudioweblite') == undefined ? undefined : $.cookie('signagestudioweblite').split(' ')[0];
            if (cookie) {
                var rc4 = new RC4(Backbone.globs['RC4KEY']);
                var crumb = rc4.doDecrypt(cookie).split(':');
                var user = crumb[0];
                var pass = crumb[2];
                self._serverAuthenticate(user, pass, this.AUTH_COOKIE);
            } else if (i_user.length > 2 && i_pass.length > 2) {
                self._serverAuthenticate(i_user, i_pass, this.AUTH_USER_PASS);
            } else {
                Backbone.comBroker.getService(Services.APP_ROUTER).navigate('unauthenticated', {trigger: true});
            }
        },

        _serverAuthenticate: function (i_user, i_pass, i_authMode) {
            var self = this;

            Backbone.Jalapeno.dbConnect(i_user, i_pass, function (i_status) {

                if (i_status.status) {
                    self.authenticated = true;
                    //todo: add check on checkbox remember me
                    if (i_authMode == self.AUTH_USER_PASS){
                        var rc4 = new RC4(Backbone.globs['RC4KEY']);
                        var crumb = i_user + ':SignageStudioLite:' + i_pass + ':' + ' USER'
                        crumb = rc4.doEncrypt(crumb);
                        $.cookie('signagestudioweblite', crumb, { expires: 300 });
                    }
                    Backbone.comBroker.getService(Services.APP_ROUTER).navigate('authenticated', {trigger: true});

                } else {

                    if (i_authMode == self.AUTH_COOKIE)
                        $.removeCookie('signagestudioweblite', { path: '/' });
                    Backbone.comBroker.getService(Services.APP_ROUTER).navigate('authenticationFailed', {trigger: true});
                }
            });
        }
    });

    return AppAuth;
}));


