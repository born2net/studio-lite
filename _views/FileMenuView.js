/**
 File menu / Top navigation control
 @class FileMenuView
 @constructor
 @return {Object} instantiated FileMenu
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FileMenuView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this.render();
        },

        render: function() {
            $('.navbar-nav').css({
                display: 'block'
            })
        }

    })

    return FileMenuView;

});

