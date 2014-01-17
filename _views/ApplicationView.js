define(['jquery', 'backbone'], function ($, Backbone) {

    var ApplicationView = Backbone.View.extend({

        initialize: function () {
            this.m_name = '';
        },

        alertMe: function () {
            alert('Ive been alerted' + Backbone);
        },

        setName: function(i_name){
            this.m_name = i_name;
        },

        render: function() {
            this.$el.css({display: 'block'})
            this.$el.text(this.m_name);
        }

    })


    return ApplicationView;

});

