(function (window, factory) {
    'use strict';
    var Backbone = window.Backbone;

    if (typeof define === 'function' && define.amd) {
        return define(['backbone', 'underscore'], function () {
            return factory.apply(window, arguments);
        });
    } else if (typeof module === 'object' && module.exports) {
        factory.call(window, require('backbone'), require('underscore'));
    } else {
        factory.call(window, Backbone, window._);
    }
}(typeof global === "object" ? global : this, function (Backbone, _) {

    var StackView = Backbone.StackView = {};

    /**
     Base class for all StackView components. StackView allows for dynamic changes of elements (show/hide) and it works
     with the Backbone framework, thus allowing for view control.
     @class StackView.ViewPort
     @constructor
     @return none instead instantiate derived classes
     **/
    StackView.ViewPort = Backbone.View.extend({

        /**
         initialize class
         @method initialize
         **/
        initialize: function () {
            this.m_views = {};
            this.m_selectedView = {};
            this.m_selectedWaitView = undefined;
        },

        /**
         Add a backbone view so we can control its display mode via one of the derived classes
         @method addView
         @param {View} i_view add a backbone view to control
         **/
        addView: function (i_view) {
            i_view.$el.hide();
            var oid = i_view.el.id === '' ? i_view.cid : i_view.el.id;
            this.m_views[oid] = i_view;
        },

        /**
         Get all registered views
         @method getViews
         @return {Object} registered views
         **/
        getViews: function () {
            return this.m_views;
        },

        /**
         Find a registered backbone view by its id or cid
         @method getViewByID
         @param {String} i_id
         @return {Object} view object retrieved
         **/
        getViewByID: function (i_id) {
            var oid = i_id.replace(/#/g, '');
            if (this.m_views[oid])
                return this.m_views[oid];
            var f = _.find(this.m_views, function (v) {
                if (v.cid == oid)
                    return v;
            });
            return f;
        },

        /**
         Select a view to present in the DOM, implementation varies per derived class
         @method selectView
         @param {Object} i_view
         **/
        selectView: function (i_view) {
            this.m_selectedView = i_view;
        }

    });

    /**
     An animated backbone view slider that supports unlimited number of separated views.
     Be sure to check CSS file for additional configuration via classes:
     .page.left  .page.center .page.right .page.transition
     Animation can be configured for GPU hardware acceleration as well as in vertical and horizontal modes (all via CSS).
     @class StackView.Slider
     @constructor
     @return {Object} instantiated StackView.Slider
     **/
    StackView.Slider = StackView.ViewPort.extend({

        /**
         Class init
         @method constructor
         @param {Object} options backbone (config done through CSS)
         **/
        constructor: function (options) {
            this._views = [];
            this._index = null;
            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

        /**
         Select the initial default view
         @method selectView
         @param {Object} i_view backbone view
         **/
        selectView: function (i_view) {
            var self = this;
            StackView.ViewPort.prototype.selectView.apply(this, arguments);
            $.each(self.m_views, function (id, view) {
                if (view !== i_view)
                    view.$el.fadeOut(self.m_duration).promise().done(function () {
                        i_view.$el.fadeIn(self.m_duration);
                    });
            });
        },

        /**
         The main functions which allows the animated sliding of one view to the next
         @method slideToPage
         @param {Object} i_toView backbone view
         @param {Object} i_direction provide 'left' or 'right'
         **/
        slideToPage: function (i_toView, i_direction) {
            var self = this;
            i_toView.$el.show();
            // toView.el.offsetWidth;
            // Position the new page at the starting position of the animation
            i_toView.el.className = "page " + i_direction;
            // Position the new page and the current page at the ending position of their
            // animation with a transition class indicating the duration of the animation
            // and force reflow of page
            i_toView.$el.parent().parent()[0].offsetWidth;
            i_toView.el.className = "page transition center";
            self.m_selectedView.el.className = "page transition " + (i_direction === "left" ? "right" : "left");
            self.m_selectedView = i_toView;
        }
    });

    /**
     Select a view thus fading it in and hiding all other views managed by this class
     @class StackView.Fader
     @constructor
     @return {Object} instantiated StackView.Fader
     **/
    StackView.Fader = StackView.ViewPort.extend({

        /**
         Class init
         @method constructor
         @param {Object} options duration, default 1000ms
         **/
        constructor: function (options) {
            options || (options = {});
            this.m_duration = 1000;
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);
            if (options.duration) this.m_duration = options.duration;
            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

        /**
         Bring the selected view into display while hiding siblings
         @method selectView
         @param {Object} i_view backbone view
         **/
        selectView: function (i_view) {
            var self = this;
            StackView.ViewPort.prototype.selectView.apply(this, arguments);
            $.each(self.m_views, function (id, view) {
                if (view !== i_view)
                    view.$el.fadeOut(self.m_duration).promise().done(function () {
                        i_view.$el.fadeIn(self.m_duration);
                    });
            });
        }
    });

    /**
     Load a backbone view inside a full page modal window while maintaining persistency between modals.
     @class StackView.Modal
     @constructor
     @return {Object} instantiated StackView.Modal
     **/
    StackView.Modal = StackView.ViewPort.extend({

        /**
         Class init
         @method constructor
         @param {Object} options include (slide_top | fade), (bgColor)
         **/
        constructor: function (options) {
            this.m_animation = 'slide_top';
            this.m_bgColor = 'white';
            options || (options = {});
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);
            if (options.animation) this.m_animation = options.animation;
            if (options.bgColor) this.m_bgColor = options.bgColor;
            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

        /**
         Load up selected backbone view into a full screen modal and present it (persistent)
         @method selectView
         @param {Object} i_view backbone
         **/
        selectView: function (i_view) {
            var self = this;
            StackView.ViewPort.prototype.selectView.apply(this, arguments);
            $.each(self.m_views, function (id, view) {
                view.$el.hide()
            });
            i_view.$el.show();
            self.$el.append(i_view.el);
            $('.modal_close').on('click',function (e) {
                self.closeModal(self.el);
                e.preventDefault();
            });

            var bh = $('body').get(0).scrollHeight + 'px';
            self.$el.css({
                'display': 'block',
                'opacity': self.m_animation == 'fade' ? 0 : 1,
                'position': 'absolute',
                'z-index': 9999,
                'height': bh,
                'width': bh,
                'left': 0,
                'border-bottom': '3px solid gray',
                'background-color': self.m_bgColor,
                'top': self.m_animation == 'fade' ? 0 : '-'+bh,
                margin: 0
                // 'left': 50 + '%',
                // 'margin-left': -(modal_width / 2) + "px",
                // 'top': o.top + "px"
            });
            self.$el.animate({
                top: 0,
                opacity: 1}, 400);
        },

        /**
         Close via animation the currently opened modal
         @method closeModal
         @param {String} modal_id
         **/
        closeModal: function (modal_id) {
            var self = this;
            $(modal_id).animate({
                    top: self.m_animation == 'fade' ? 0 : 0 - $('body').get(0).scrollHeight,
                    opacity: 0},
                400, function(){
                    $(this).css({display: 'none'})
                });
        }
    });

    return StackView;

}));
