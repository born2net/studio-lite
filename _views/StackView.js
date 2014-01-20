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

    /**
     Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
     or a resource to be added to the currently selected timeline_channel
     @class StackView.ViewPort
     @constructor
     @return {Object} instantiated AddBlockWizard
     **/
    StackView.ViewPort = Backbone.View.extend({

        initialize: function () {

            var self = this;
            this.m_counter = 0;
            this.currentPage = document.getElementById("p1");

        },

        addView: function (i_view) {

        },

        selectView: function (i_view) {

        },

        removeView: function (i_view) {

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
            $('#' + this.el.id + '> *').each(function () {
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

            $('#' + this.el.id + '> *').each(function (i) {
                if (i_index == i) {
                    // commBroker.fire(self.VIEW_CHANGED, this, self, i_index);
                    $(this).siblings().hide().end().fadeIn();
                }
            });
        }

        /*slideToPage: function (toPage, direction) {
         var self = this;
         // Position the new page at the starting position of the animation
         toPage.className = "page " + direction;
         // Position the new page and the current page at the ending position of their
         // animation with a transition class indicating the duration of the animation
         // and force reflow of page
         $(toPage).parent().parent()[0].offsetWidth;
         toPage.className = "page transition center";
         self.currentPage.className = "page transition " + (direction === "left" ? "right" : "left");
         self.currentPage = toPage;
         },*/


        /*leanModal: function () {

         $('#someAction').click(function (e) {

         var modal_id = $(this).attr("href");

         $('#close').click(function () {
         close_modal(modal_id);
         });

         $(modal_id).css({
         'display': 'block',
         'position': 'fixed',
         'opacity': 1,
         'position': 'absolute',
         'z-index': 11000,
         'height': $('body').get(0).scrollHeight + 'px',
         'width': $('body').get(0).scrollWidth + 'px',
         'left': 0,
         'top': 0 - $('body').get(0).scrollHeight,
         margin: 0
         // 'left': 50 + '%',
         // 'margin-left': -(modal_width / 2) + "px",
         // 'top': o.top + "px"
         });
         $(modal_id).animate({
         top: 0,
         opacity: 1}, 400);
         e.preventDefault();
         });

         function close_modal(modal_id) {
         //$(modal_id).fadeOut(200, function () {
         // $(this).css({ 'display': 'none' });
         // });

         $(modal_id).animate({
         top: 0 - $('body').get(0).scrollHeight,
         opacity: 1},
         400);
         }
         }*/
    });

    /**
     Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
     or a resource to be added to the currently selected timeline_channel
     @class StackView.Slider
     @constructor
     @return {Object} instantiated AddBlockWizard
     **/
    StackView.Slider = StackView.ViewPort.extend({

        constructor: function (options) {
            this._views = [];
            this._index = null;

            options || (options = {});
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);

            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

        slideToPage: function (toPage, direction) {
            var self = this;
            // Position the new page at the starting position of the animation
            toPage.className = "page " + direction;
            // Position the new page and the current page at the ending position of their
            // animation with a transition class indicating the duration of the animation
            // and force reflow of page
            $(toPage).parent().parent()[0].offsetWidth;
            toPage.className = "page transition center";
            self.currentPage.className = "page transition " + (direction === "left" ? "right" : "left");
            self.currentPage = toPage;
        }
    });

    /**
     Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
     or a resource to be added to the currently selected timeline_channel
     @class StackView.Fader
     @constructor
     @return {Object} instantiated AddBlockWizard
     **/
    StackView.Fader = StackView.ViewPort.extend({

        constructor: function (options) {
            this._views = [];
            this._index = null;

            options || (options = {});
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);

            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

        leanModal: function () {

            $('#someAction').click(function (e) {

                var modal_id = $(this).attr("href");

                $('#close').click(function () {
                    close_modal(modal_id);
                });

                $(modal_id).css({
                    'display': 'block',
                    'position': 'fixed',
                    'opacity': 1,
                    'position': 'absolute',
                    'z-index': 11000,
                    'height': $('body').get(0).scrollHeight + 'px',
                    'width': $('body').get(0).scrollWidth + 'px',
                    'left': 0,
                    'top': 0 - $('body').get(0).scrollHeight,
                    margin: 0
                    // 'left': 50 + '%',
                    // 'margin-left': -(modal_width / 2) + "px",
                    // 'top': o.top + "px"
                });
                $(modal_id).animate({
                    top: 0,
                    opacity: 1}, 400);
                e.preventDefault();
            });

            function close_modal(modal_id) {
                //$(modal_id).fadeOut(200, function () {
                // $(this).css({ 'display': 'none' });
                // });

                $(modal_id).animate({
                        top: 0 - $('body').get(0).scrollHeight,
                        opacity: 1},
                    400);
            }
        }
    });

    /**
     Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
     or a resource to be added to the currently selected timeline_channel
     @class StackView.Modal
     @constructor
     @return {Object} instantiated AddBlockWizard
     **/
    StackView.Modal = StackView.ViewPort.extend({

        constructor: function (options) {
            this._views = [];
            this._index = null;

            options || (options = {});
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);

            ViewKit.ViewPort.prototype.constructor.apply(this, arguments);
        }
    });

    return StackView;

}));
