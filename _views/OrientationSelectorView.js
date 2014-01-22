/**
 Orientation selector Backbone > View
 @class OrientationSelectorView
 @constructor
 @return {Object} instantiated OrientationSelectorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var OrientationSelectorView = Backbone.View.extend({

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
                var fromView = self.options.appCoreStackView.getViewByID(self.options.from);
                self.options.appCoreStackView.slideToPage(fromView, 'left');
                return false;
            });
        },

        render: function() {
        }
    });

    return OrientationSelectorView;

});

