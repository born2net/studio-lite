/**
 Custom event fired when authentication received from server
 @event LoginComponent.AUTHENTICATION_STATUS
 @param {This} caller
 @param {Self} context caller
 @param {Event} player_code which represents a specific code assigned for each block type
 @static
 @final
 **/
LoginComponent.AUTHENTICATION_STATUS = 'AUTHENTICATION_STATUS';

/**
 Manage user login and account creation
 @class LoginComponent
 @constructor
 @return {Object} instantiated LoginComponent
 @example:
 requires: jquery.cookie
 optional: jquery.validate.password
 **/
function LoginComponent() {

    // events
    this.LOGINBUTTON = 'LOGINBUTTON';
    this.USERID = 'USERID';
    this.USERPASSID = 'USERPASSID';
    this.SIGNUPPASS1 = 'SIGNUPPASS1';
    this.SIGNUPPASS2 = 'SIGNUPPASS2';
    this.SIGNUPSUBMIT = 'SIGNUPSUBMIT';
    this.SIGNUPUSER = 'SIGNUPUSER';
    this.UNIQUEUSER = 'UNIQUEUSER';
    this.UNIQUEUSERPROGRESS = 'UNIQUEUSERPROGRESS';
    this.UNIQUEUSERMICROLINE = 'UNIQUEUSERMICROLINE';
    this.UNIQUEUSERMESSAGE = 'UNIQUEUSERMESSAGE';
    this.SIGNUPPASSMATCHMSG = 'SIGNUPPASSMATCHMSG';
    this.SIGNUPPASSMATCHLINE = 'SIGNUPPASSMATCHLINE';
    this.SIGNUPCANCEL = 'SIGNUPCANCEL';
    this.REMEBERME = 'REMEBERME';
    this.FORGOTPASSWORD = 'FORGOTPASSWORD';
    this.AUTHENTICATED = 'AUTHENTICATED';
    this.ALERT_MSG = 'ALERT_MSG';

    this.m_forceTypeAccount = '';
    this.ajax = commBroker.getService('ajax');

    this.userNameID = Elements.USER_NAME
    this.userPassID = Elements.USER_PASS;
    this.logButton = Elements.LOGIN_BUTTON;

    this.registerEvents();

};


LoginComponent.prototype = {
    constructor: LoginComponent,

    registerEvents: function () {
        var self = this;

        $(self.logButton).on('click tap', function (e) {
            self.onLogon(e);
            return false;
        });

        commBroker.listen(this.REMEBERME, function (e) {
            self.rememberMeID = $(e.context);
            self.rememberMeID.bind('change', 'focusout', function (e) {
                self.rememberMeID.is(':checked') == true ? self.rememberMe = true : self.rememberMe = false;
                self.rememberMeID.is(':checked') == true ? self.rememberMeID.val('1') : self.rememberMeID.val(0);
                return false;
            });
        });

        commBroker.listen(this.FORGOTPASSWORD, function (e) {
            self.forgotPassword = $(e.context);
            self.forgotPassword.bind('click', function (e) {
                if (self.userNameID.val().length < 4) {
                    $().toastmessage('showToast', {
                        text: 'please fill your user name or email address first<br/> and click again',
                        sticky: false,
                        position: 'middle-center',
                        stayTime: 7000,
                        type: 'warning'
                    });
                    return false;
                }

                if (confirm('Proceed with sending your email?')) {
                    var obj = {
                        '@functionName': 'f_forgotPassword',
                        '@userName': $(self.userNameID).val()
                    }

                    commBroker.fire(globs.WAITSCREENON);
                    var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWS-debug.php' : 'https://secure.dynawebs.net/_php/msWS.php');

                    ajaxWrapper.getData(obj, onForgotPasswordReply);

                    function onForgotPasswordReply(data) {
                        commBroker.fire(globs.WAITSCREENOFF);
                        if (data.responce.status == 'pass') {
                            $().toastmessage('showToast', {
                                text: 'your password was sent to: ' + data.responce.email,
                                sticky: false,
                                position: 'middle-center',
                                stayTime: 7000,
                                type: 'warning'
                            });
                        } else {
                            $().toastmessage('showToast', {
                                text: 'sorry but we could not find a user / email by that name',
                                sticky: false,
                                position: 'middle-center',
                                stayTime: 7000,
                                type: 'warning'
                            });
                        }
                    }
                }
                return false;
            });
        });

        commBroker.listen(this.UNIQUEUSERMESSAGE, function (e) {
            self.uniqueUserMessage = $(e.context);
        });

        commBroker.listen(this.UNIQUEUSERMICROLINE, function (e) {
            self.uniqueUserMicroLine = $(e.context);
        });

        commBroker.listen(this.USERID, function (e) {
            self.userNameID = $(e.context);
        });

        commBroker.listen(this.USERPASSID, function (e) {
            self.userPassID = $(e.context);
        });

        commBroker.listen(this.SIGNUPUSER, function (e) {
            self.signUpUserID = e.context;
            self.signupElemSetup(e);
        });

        commBroker.listen(this.SIGNUPSUBMIT, function (e) {
            self.signUp = $(e.context);
            $(self.signUp).bind('click', function (e) {
                self.onSignupSubmit(e);
                return false;
            });
        });

        commBroker.listen(this.UNIQUEUSER, function (e) {
            self.uniqueUser = $(e.context);
        });

        commBroker.listen(this.UNIQUEUSERPROGRESS, function (e) {
            self.uniqueUserProgress = $(e.context);
        });

        commBroker.listen(this.SIGNUPPASSMATCHMSG, function (e) {
            self.signUpPassMatchMsgID = $(e.context);
        });

        commBroker.listen(this.SIGNUPPASSMATCHLINE, function (e) {
            self.signUpMatchLineID = $(e.context);
        });

        commBroker.listen(this.SIGNUPPASS1, function (e) {
            self.signUpPassID1 = $(e.context);
            self.signUpPassID1.bind('change focusout keyup', {caller: self}, self.comparePasswords);
        });

        commBroker.listen(this.SIGNUPPASS2, function (e) {
            self.signUpPassID2 = $(e.context);
            self.signUpPassID2.bind('change focusout keyup', {caller: self}, self.comparePasswords);
        });

    },

    cookieSetup: function (self, data) {
        /* if ( self.rememberMe == true ){
         $.cookie('digitalsignage', data, { expires: 1095, path: '/' });
         } */
    },

    signupElemSetup: function (e) {
        self.signUpUserID = e.context;

        $(self.signUpUserID).keypress(function (e) {
            var regex = new RegExp("^[a-zA-Z0-9_@.!#+-^|~]+$");
            var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (regex.test(str)) {
                return true;
            }
            e.preventDefault();
            return false;
        });

        $(self.signUpUserID).bind('blur', function () {

            if ($(self.signUpUserID).val().length < 5) {
                $().toastmessage('showToast', {
                    text: 'User name picked is too short, plesae try again',
                    sticky: false,
                    position: 'middle-center',
                    stayTime: 4000,
                    type: 'warning'
                });
                return;
            }

            $(self.signUpUserID).prop('disabled', true);
            $(self.uniqueUser).hide();
            $(self.uniqueUserProgress).show();

            var obj = {
                '@functionName': 'f_checkUserNameExists',
                '@userName': $(self.signUpUserID).val()
            }

            var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWS-debug.php' : 'https://secure.dynawebs.net/_php/msWS.php');
            ajaxWrapper.getData(obj, onCheckUserNameExistsReply);

            function onCheckUserNameExistsReply(data) {
                if (data.responce.status == 'pass') {

                    $(self.uniqueUserMessage).text('Verified');
                    $(self.uniqueUserMicroLine).css('background-color', 'green')

                } else {

                    $(self.uniqueUserMessage).text('Already used');
                    $(self.uniqueUserMicroLine).css('background-color', '#e0e0e0')

                    $().toastmessage('showToast', {
                        text: 'User name already exists, please pick a different name',
                        sticky: false,
                        position: 'middle-center',
                        stayTime: 4000,
                        type: 'warning'
                    });
                }

                $(self.uniqueUser).show();
                $(self.uniqueUserProgress).hide();

                setTimeout(function () {
                    $(self.signUpUserID).prop('disabled', false);
                }, 2000)
            }
        });
    },

    onLogon: function () {
        var self = this;

        var user = $.trim($(self.userNameID).val());
        var pass = $.trim($(self.userPassID).val());
        if (user == '' || pass == '')
            return;
        commBroker.fire(globs.WAITSCREENON);
        self.onDBAuthenticate(user, pass);
    },

    onDBAuthenticate: function (i_user, i_pass) {
        var self = this;

        jalapeno.dbConnect(i_user, i_pass, function (i_status) {
            var userData = {
                status: i_status,
                user: i_user,
                pass: i_pass
            }
            commBroker.fire(LoginComponent.AUTHENTICATION_STATUS, this, null, userData);
        });
    },

    onSignupSubmit: function (e) {
        var self = this;
        var msg = $(".password-meter-message").text();

        // if we didn't find '.password-meter-message' via jquery.validate.password we don't verify pass
        if (msg.length) {
            switch ($.trim(msg.toLowerCase())) {
                case 'too similar to username':
                {
                }
                case 'too short':
                {
                }
                case 'very weak':
                {
                }
                case 'weak':
                {
                    $().toastmessage('showToast', {
                        text: 'please select a stronger password',
                        sticky: false,
                        position: 'middle-center',
                        type: 'warning'
                    });
                    return false;
                }
            }
        }

        if ($(self.signUpPassID1).val() != $(self.signUpPassID2).val()) {
            $().toastmessage('showToast', {
                text: 'the two passwords do not match',
                sticky: false,
                position: 'middle-center',
                type: 'warning'
            });
            return false;
            ;
        }

        commBroker.fire(globs.WAITSCREENON);

        var obj = {
            '@functionName': 'f_createUserAccount',
            '@userName': $(self.signUpUserID).val(),
            '@userPass': $(self.signUpPassID1).val()
        }
        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWS-debug.php' : 'https://secure.dynawebs.net/_php/msWS.php');
        ajaxWrapper.getData(obj, onCreateUserAccountReply);

        function onCreateUserAccountReply(data) {

            if (data.responce.status == 'pass') {

                $().toastmessage('showToast', {
                    text: 'Account created successfully',
                    sticky: false,
                    position: 'middle-center',
                    type: 'success'
                });

                $(self.userNameID).val(self.signUpUserID.val());
                $(self.userPassID).val(self.signUpPassID1.val());
                $(self.logButton).prop('type', 'submit');  // IE8 bug so using prop
                $(self.logButton).click();  // $(self.logButton).unbind().click();

            } else {

                commBroker.fire(globs.WAITSCREENOFF);

                $().toastmessage('showToast', {
                    text: 'there was a problem creating your account, try using a different user name',
                    sticky: false,
                    position: 'middle-center',
                    type: 'warning'
                });
            }
        }

        return false;
    },

    comparePasswords: function (e) {

        var self = e.data['caller'];
        if ($(self.signUpPassID1).val() == $(self.signUpPassID2).val() && $(self.signUpPassID2).val().length > 3) {
            $(self.signUpPassMatchMsgID).text('Match');
            $(self.signUpMatchLineID).css('background-color', 'green')
        } else {
            $(self.signUpPassMatchMsgID).text('No match');
            $(self.signUpMatchLineID).css('background-color', '#e0e0e0')
        }
    },


    loginAuthenticateReply: function (data) {

        var self = data.context;

        if (data.responce.status == 'pass') {
            commBroker.fire(self.AUTHENTICATED, null, null, data);

        } else {

            commBroker.fire(globs.WAITSCREENOFF);
            if ($().toastmessage != null) {
                $().toastmessage('showToast', {
                    text: 'User or password are invalid, you may try again',
                    sticky: false,
                    stayTime: 6000,
                    position: 'middle-center',
                    type: 'error'
                });
            } else {
                commBroker.fire('ALERT_MSG', this, null, 'User or password or your account type are invalid, you may try again');
            }
        }
    },

    forceRememberMe: function () {
        var self = this;
        $(self.rememberMeID).attr('checked', 'checked');
        $(self.rememberMeID).attr('disabled', 'disabled');
    },

    // Optional argument that will pass authentication only if account type & user & pass match
    typeAccountEnforce: function (i_forceTypeAccount) {
        this.m_forceTypeAccount = i_forceTypeAccount;
    },

    submitFormSuccessLogin: function (data) {

        var self = data.context;

        if (data.responce.status == 'pass') {
            self.ajax.abortAll();
            $(self.userNameID).val(data.responce.data);
            $(self.logButton).prop('type', 'submit');  // IE8 bug so using prop
            $(self.logButton).unbind().click();
            return false;

        } else {

            commBroker.fire(globs.WAITSCREENOFF);
            $().toastmessage('showToast', {
                text: 'User or password entered are invalid, you may try again',
                sticky: false,
                stayTime: 6000,
                position: 'middle-center',
                type: 'error'
            });
        }
    }
};
