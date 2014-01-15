(function (window, factory) {
    'use strict';
    var Backbone = window.Backbone;

    // AMD. Register as an anonymous module.  Wrap in function so we have access
    // to root via `this`.
    if (typeof define === 'function' && define.amd) {
        return define(['backbone', 'underscore'], function () {
            return factory.apply(window, arguments);
        });
    } else if (typeof module === 'object' && module.exports) {
        // NodeJS. Calling with required packages
        factory.call(window, require('backbone'), require('underscore'));
    } else {
        // Browser globals.
        factory.call(window, Backbone, window._);
    }
}(typeof global === "object" ? global : this, function (Backbone, _) {
    
    var StackView = Backbone.StackView = {};

    StackView.ViewPort = Backbone.View.extend({

        initialize: function(){
            this.m_counter = 0;
            this.Config = {};
        },

        getView: function () {
            return null;
        },

        render: function () {
        },

        /**
         Create a new child (view) in this viewstack instance.
         @method addChild the element id to gran from the DOM and append into the viewstack.
         @param {Number} i_view
         @return {Number} t the newly created index
         **/
        addChild: function (i_view) {
            var elem = $(i_view.el).appendTo(this.el);
            $(i_view.el).siblings().hide();
            this.m_counter++;
            $(i_view.el).attr('data-viewstackname', 'tab' + this.m_counter);
            var t = -1;
            $('#'+this.el.id + '> *').each(function () {
                t++;
                if (this === elem[0]) {
                    return false;
                }
            });
            return t;
        },

        /**
         Select an index from viewstacks to bring into view and hide all other views.
         @method selectIndex
         @param {index} i_index to load into view
         @return none
         **/
        selectIndex: function (i_index) {

            var self = this.self;

            $('#'+this.el.id + '> *').each(function (i) {
                if (i_index == i) {
                    // commBroker.fire(self.VIEW_CHANGED, this, self, i_index);
                    $(this).siblings().hide().end().fadeIn();
                }
            });
        }

    });

    return StackView;

}));
