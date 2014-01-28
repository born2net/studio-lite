/**
 Backbone > View Resource selector
 @class ResolutionSelectorView
 @constructor
 @return {Object} instantiated ResolutionSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ResolutionSelectorView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            $(this.el).find('#next').on('click',function(e){
                if (self.options.to==null)
                    return;
                self.options.appCoreStackView.slideToPage(self.options.to, 'right');
                return false;
            });
            $(this.el).find('#prev').on('click',function(e){
                if (self.options.from==null)
                    return;
                self.options.appCoreStackView.slideToPage(self.options.from, 'left');
                return false;
            });
        },

        render: function() {
        }

    })


    return ResolutionSelectorView;

});

