/**
 Settings Backbone > View
 @class FasterQManagerView
 @constructor
 @return {Object} instantiated FasterQManagerView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FasterQManagerView = Backbone.View.extend({

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

    return FasterQManagerView;
});

