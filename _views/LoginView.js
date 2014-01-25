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
            $('#loginButton').on('click', function () {
                if ($(Elements.USER_NAME).val().length > 3 && $(Elements.USER_PASS).val().length > 3) {
                    // $(this).prop('disabled', true);
                    var user = $(Elements.USER_NAME).val();
                    var pass = $(Elements.USER_PASS).val();
                    Backbone.comBroker.getService(Services.LAYOUT_MANAGER).navigate('authenticate/' + user + '/' + pass, {trigger: true});
                }
                return false;
            })
        }
    })

    return LoginView;

});

