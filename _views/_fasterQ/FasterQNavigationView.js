/**
 Settings Backbone > View
 @class FasterQNavigationView
 @constructor
 @return {Object} instantiated FasterQNavigationView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var FasterQNavigationView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._listenNavigation();
        },

        _listenNavigation: function(){
            var self = this;
            $(Elements.FASTERQ_MANAGE_NAV_BUTTON).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_MANAGER_CONTAINER);
            });
            $(Elements.FASTERQ_CREATE_NAV_BUTTON).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_CREATOR_CONTAINER);
            });
        }
    });

    return FasterQNavigationView;
});

