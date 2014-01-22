/**
 Backbone > View > Wait dialog used in StackView views
 @class WaitView
 @constructor
 @return {Object} instantiated WaitView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var WaitView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            this.render()

        },

        render: function() {
            this.$el.append('<h4>pleasw wait while loading data</h4>')
        }

    })

    return WaitView;

});

