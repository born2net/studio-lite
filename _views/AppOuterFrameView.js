define(['jquery', 'backbone'], function ($, Backbone) {

    var AppOuterFrameView = Backbone.ViewKit.ViewSelector.extend({

        initialize: function () {
        },

        transitions: new Backbone.ViewKit.Transitions.Fade(),

        alertMe: function () {
            alert('Ive been alerted' + Backbone);
        }

    })


    return AppOuterFrameView;

});

