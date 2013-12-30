/**
 App Navigation bar
 @class NavBarView
 @constructor
 @return {Object} instantiated ViewNavBar
 **/
var NavBarView = Backbone.View.extend({

    /**
     Init the instance
     @method init
     @param {Number} i_options
     @return none
     **/
    init: function(i_options){
        this.m_options = i_options;
    },

    /**
     Render the viewer's UI
     @method render
     @return none
     **/
    render: function () {
        var snippet = '<div>' +
            '<h1>' + this.m_options.name + '</h1>' +
            '<p><span class="label">' + this.m_options.category + '</span></p>' +
            '</div>';

        this.$el.html(snippet);
        return this;
    },

    /**
     Destroy this view and release related listeners / members
     @method destroy
     @return none
     **/
    destroy: function(){

    }
});

