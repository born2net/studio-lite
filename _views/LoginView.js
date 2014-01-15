define(['jquery', 'backbone'], function ($, Backbone) {

    var LoginView = Backbone.View.extend({

        initialize: function () {
        },

        transitions: new Backbone.ViewKit.Transitions.Fade(),

        alertMe: function () {
            alert('Ive been alerted' + Backbone);
        }

    })


    return LoginView;

});

