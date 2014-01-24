/**
 Login manager extends Backbone > View for management of user login and cookie creation
 @class LoginView
 @constructor
 @return {Object} instantiated LoginView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var LoginView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            $('#loginButton').on('click',function(){
                var user = $('#userName').val();
                var pass = $('#userPass').val();
                Backbone.comBroker.getService(Services.APP_ROUTER).navigate('authenticate/'+user+'/'+pass,{trigger: true});
                return false;
            })
        }

    })

    return LoginView;

});

