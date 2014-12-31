/**
 Settings Backbone > View
 @class FQManagerView
 @constructor
 @return {Object} instantiated FQManagerView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FQManagerView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            $(Elements.FASTERQ_MANAGER_BACK).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_NAVIGATION_CONTAINER);
            });
        }

    });

    return FQManagerView;
});

