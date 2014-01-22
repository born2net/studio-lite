define(['jquery', 'backbone'], function ($, Backbone) {

    var WaitView = Backbone.View.extend({

        initialize: function () {
            var self = this;
            this.render()

        },

        alertMe: function () {
            alert('Ive been alerted' + Backbone);
        },

        render: function() {
            this.$el.append('<h4>pleasw wait while loading data</h4>')
        }

    })


    return WaitView;

});

