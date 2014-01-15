define(['jquery', 'backbone'], function ($, Backbone) {

    var LoginView = Backbone.View.extend({

        initialize: function () {
        },

        alertMe: function () {
            alert('Ive been alerted' + Backbone);
        }

    })


    return LoginView;

});

