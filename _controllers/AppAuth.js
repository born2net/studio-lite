/**
 Manage user authentication and cookie creation and pass results back to app router
 @class AppAuth
 @constructor
 @return {Object} instantiated AppAuth
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.APP_AUTH = 'AppAuth';

    var AppAuth = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         @return {} Unique clientId.
         **/
        initialize: function () {
            this.authenticated = false;
            this.AUTH_USER_PASS = 0;
            this.AUTH_COOKIE = 1;
            this.AUTH_PARAMS = 2;
        },

        /**
         Initiate user authentication against the Pepper db user credentials
         @method authenticate
         @param {String} i_user
         @param {String} i_pass
         **/
        authenticate: function (i_user, i_pass) {
            var self = this;
            var appRouter = BB.comBroker.getService(BB.SERVICES.LAYOUT_ROUTER);
            appRouter.navigate('authenticating', {trigger: true});
            self._loadCredentials(i_user, i_pass);
        },

        /**
         Check if user / pass were passed in via params
         @method _loadPassedCredentials
         @return {Object} user and pass if passed in or undefined if none
         **/
        _loadPassedCredentials: function () {
            var credentials = BB.lib.getURLParameter('param');
            if (credentials == 'null')
                return undefined;
            credentials = $.base64.decode(credentials);
            var re = /user=(.*),pass=(.*)/;
            var match = re.exec(credentials);
            return {
                user: match[1],
                pass: match[2]
            }
        },

        /**
         Load user credentials from param or cookie or form data
         @method _loadCredentials
         @param {String} i_user
         @param {String} i_pass
         **/
        _loadCredentials: function (i_user, i_pass) {
            var self = this;

            var passedCredentials = self._loadPassedCredentials();
            var cookieCredentials = $.cookie('signagestudioweblite') == undefined ? undefined : $.cookie('signagestudioweblite').split(' ')[0];

            if (passedCredentials){
                self._authServer(passedCredentials.user, passedCredentials.pass, self.AUTH_PARAMS);

            } else if (cookieCredentials) {
                var credentials = self._breakCookie(cookieCredentials);
                self._authServer(credentials.user, credentials.pass, self.AUTH_COOKIE);

            } else if (i_user.length > 2 && i_pass.length > 2) {
                self._authServer(i_user, i_pass, self.AUTH_USER_PASS);

            } else {
                BB.comBroker.getService(BB.SERVICES['LAYOUT_ROUTER']).navigate('unauthenticated', {trigger: true});
            }
        },

        /**
         Process actual authentication against mediaSERVER
         @method _authServer
         @param {String} i_user
         @param {String} i_pass
         @param {Number} i_authMode
         **/
        _authServer: function (i_user, i_pass, i_authMode) {
            var self = this;
            BB.Pepper.dbConnect(i_user, i_pass, function (i_status) {
                if (i_status.status) {
                    self._authPassed(i_user, i_pass, i_status, i_authMode);
                } else {
                    self._authFailed(i_authMode, i_status);
                }
            });
        },

        /**
         User authentication completed successfully
         @method _authPassed
         @param {String} i_user user name
         @param {String} i_pass user password
         @param {String} i_status status message from remote mediaSERVER (could include warnings)
         @param {String} i_authMode indicates if authentication was done via cookie or user input
         **/
        _authPassed: function (i_user, i_pass, i_status, i_authMode) {
            var self = this;

            self.authenticated = true;
            // create cookie
            if (i_authMode == self.AUTH_USER_PASS && $(Elements.REMEMBER_ME).prop('checked'))
                self._bakeCookie(i_user, i_pass);

            if (i_status['warning'].length > 0) {
                // Pro Account (not a Lite account) so limited access

                // if module was not loaded yet wait to be notified from when it does
                var navigationView = BB.comBroker.getService(BB.SERVICES['NAVIGATION_VIEW']);
                if (_.isUndefined(navigationView)) {
                    BB.comBroker.listen(BB.EVENTS.SERVICE_REGISTERED, function (e) {
                        if (e.edata.name == BB.SERVICES['NAVIGATION_VIEW']) {
                            var navigationView = e.edata.service;
                            self._applyLimitedAccess(navigationView);
                        }
                    });
                } else {
                    // just in case we change the order of loadable modules in the future
                    // and navigation module is ready before this module
                    self._applyLimitedAccess(navigationView);
                }
            }
            BB.comBroker.getService(BB.SERVICES['LAYOUT_ROUTER']).navigate('authenticated', {trigger: true});
        },

        /**
         User authentication completed unsuccessfully
         @method _authFailed
         @param {String} i_status status message from remote mediaSERVER (could include warnings)
         @param {String} i_authMode indicates if authentication was done via cookie or user input
         **/
        _authFailed: function (i_authMode, i_status) {
            var self = this;

            // if cookie exists, delete it because obviously it didn't do the job
            if (i_authMode == self.AUTH_COOKIE) {
                $.removeCookie('signagestudioweblite', { path: '/' });
                $.removeCookie('signagestudioweblite', { path: '/_studiolite' });
                $.removeCookie('signagestudioweblite', { path: '/_studiolite-dev' });
                $.removeCookie('signagestudioweblite', { path: '/_studiolite-dist' });
            }

            // let user know authentication failed
            if (i_status.error == "not a studioLite account") {
                bootbox.dialog({
                    message: $(Elements.MSG_BOOTBOX_STUDIO_LITE_ACC).text(),
                    buttons: {
                        info: {
                            label: $(Elements.MSG_BOOTBOX_OK).text(),
                            className: "btn-primary",
                            callback: function () {
                            }
                        }
                    }
                });
            }
            BB.comBroker.getService(BB.SERVICES['LAYOUT_ROUTER']).navigate('authenticationFailed', {trigger: true});
        },

        /**
         Apply limited access to application since user logged in with Pro account intp Lite Studio
         @method _applyLimitedAccess
         @param {Object} i_navigationView
         **/
        _applyLimitedAccess: function (i_navigationView) {
            i_navigationView.applyLimitedAccess();
            i_navigationView.forceStationOnlyViewAndDialog();
        },

        /**
         Create RC4 local encrypted cookie
         @method _bakeCookie
         @param {String} i_user
         @param {String} i_pass
         **/
        _bakeCookie: function (i_user, i_pass) {
            var rc4 = new RC4(BB.globs['RC4KEY']);
            var crumb = i_user + ':SignageStudioLite:' + i_pass + ':' + ' USER'
            crumb = rc4.doEncrypt(crumb);
            $.cookie('signagestudioweblite', crumb, { expires: 300 });
        },

        /**
         Break encrypted cookie RC4 to user credentials
         @method _breakCookie
         @param {String} i_user
         @param {String} i_pass
         @return {Object} credentials
         **/
        _breakCookie: function (i_cookie) {
            var rc4 = new RC4(BB.globs['RC4KEY']);
            var crumb = rc4.doDecrypt(i_cookie).split(':');
            return {
                user: crumb[0],
                pass: crumb[2]
            }
        },

        /**
         Logout of application and delete saved local cookie
         @method logout
         **/
        logout: function () {
            $.removeCookie('signagestudioweblite', {path: '/'});
            $.cookie('signagestudioweblite', '', { expires: -300 });
        }
    });

    return AppAuth;
});


