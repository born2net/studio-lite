/**
 This class manages a set of elements all designed to provide user with UI for font settings
 @class FontSelector
 @constructor
 @return {Object} instantiated FontSelector
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.FONT_SELECTOR = 'FontSelector';

    var FontSelector = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.$el = $(Elements.FONT_SELECTOR_TEMPLATE).clone()
            self.el = self.$el[0];
            $(self.options.appendTo).append(self.el).fadeIn('fast');
            self.$el.show();
        },

        events: {
          'click': 'onClick'
        },


        onClick: function(e){
            $(e.target).closest('button').toggleClass('active');
        }

    });

    return FontSelector;

});