define(['jquery', 'backbone'], function ($, Backbone) {

    var ResolutionSelectorView = Backbone.View.extend({

        initialize: function () {
            var self = this;

            $(this.el).find('#next').on('click',function(e){
                if (self.options.to==null)
                    return;
                var toView = self.options.appCoreStackView.getViewByID(self.options.to);
                self.options.appCoreStackView.slideToPage(toView, 'right');
                return false;
            });
            $(this.el).find('#prev').on('click',function(e){
                if (self.options.from==null)
                    return;
                self.options.appCoreStackView.slideToPage($(self.options.from)[0], 'left');
                return false;
            });
        },

        render: function() {
        }

    })


    return ResolutionSelectorView;

});

