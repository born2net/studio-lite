/**
 Login manager extends Backbone > View for management of user login and cookie creation
 @class LoginView
 @constructor
 @return {Object} instantiated LoginView
 **/
define(['jquery', 'backbone', 'bootbox'], function ($, Backbone, Bootbox) {

    var LoginView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            if (BB.HIDE_CREATE_ACCOUNT){
                $(Elements.CREATE_ACCOUNT_BUTTON).hide();
            }
            $(Elements.LOGIN_BUTTON).on('click', function () {
                if ($(Elements.USER_NAME).val().length > 1 && $(Elements.USER_PASS).val().length > 1) {
                    var user = $.base64.encode($(Elements.USER_NAME).val());
                    var pass = $.base64.encode($(Elements.USER_PASS).val());
                    Backbone.comBroker.getService(Backbone.SERVICES.LAYOUT_ROUTER).navigate('authenticate/' + user + '/' + pass, {trigger: true});
                }
                return false;
            });

            $(Elements.CREATE_ACCOUNT_BUTTON).on('click', function () {
                $(window).off('beforeunload');
                window.open('http://www.digitalsignage.com/msgetstarted/msgetstarted.html#studioSelectView/3', '_self');
                //window.open('http://galaxy.mediasignage.com/WebService/signagestudio.aspx', '_self');
                return false;
            })
        }
    })

    return LoginView;

});

