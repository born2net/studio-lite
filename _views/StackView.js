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
            this.m_views = {};
            this.m_selectedView = {};
        },

        addView: function (i_view) {
            i_view.$el.hide();
            var oid = i_view.el.id === '' ? i_view.cid : i_view.el.id;
            this.m_views[oid] = i_view;
        },

        getViews: function () {
            return this.m_views;
        },

        getViewByID: function (i_id) {
            var oid = i_id.replace(/#/g, '')
            if (this.m_views[oid])
                return this.m_views[oid];
            var found = _.find(this.m_views, function (v) {
                if (v.cid == oid)
                    return v;
            });
            return found;
        },

        // override
        selectView: function (i_view) {
            this.m_selectedView = i_view;
        }

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

        selectView: function (i_view) {
            StackView.ViewPort.prototype.selectView.apply(this, arguments);
            i_view.$el.fadeIn();
        },

        slideToPage: function (toView, direction) {
            var self = this;
            toView.$el.show();
            // toView.el.offsetWidth;
            // Position the new page at the starting position of the animation
            toView.el.className = "page " + direction;
            // Position the new page and the current page at the ending position of their
            // animation with a transition class indicating the duration of the animation
            // and force reflow of page
            toView.$el.parent().parent()[0].offsetWidth;
            toView.el.className = "page transition center";
            self.m_selectedView.el.className = "page transition " + (direction === "left" ? "right" : "left");
            self.m_selectedView = toView;
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
            options || (options = {});
            this.m_duration = 1000;
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);
            if (options.duration) this.m_duration = options.duration;
            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

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
     Add block wizard is a UI component which allows selection and insertion of a new component (i.e. QR / RSS ...)
     or a resource to be added to the currently selected timeline_channel
     @class StackView.Modal
     @constructor
     @return {Object} instantiated AddBlockWizard
     **/
    StackView.Modal = StackView.ViewPort.extend({

        constructor: function (options) {
            this.m_animation = 'slide_top';
            options || (options = {});
            this.transition = options.transition;
            if (options.views) this.setViews(options.views);
            if (options.animation) this.m_animation = options.animation;
            StackView.ViewPort.prototype.constructor.apply(this, arguments);
        },

        selectView: function (i_view) {
            var self = this;
            console.log(self.m_animation);
            StackView.ViewPort.prototype.selectView.apply(this, arguments);
            $.each(self.m_views, function (id, view) {
                view.$el.hide()
            });
            var a = i_view.$el.show();
            i_view.$el.show();
            self.$el.append(i_view.el)
            $('.modal_close').on('click',function (e) {
                self.close_modal(self.el);
                e.preventDefault();
            });

            self.$el.css({
                'display': 'block',
                'position': 'fixed',
                'opacity': self.m_animation == 'fade' ? 0 : 1,
                'position': 'absolute',
                'z-index': 11000,
                'height': $('body').get(0).scrollHeight + 'px',
                'width': $('body').get(0).scrollWidth + 'px',
                'left': 0,
                'background-color': 'white',
                'top': self.m_animation == 'fade' ? 0 : 0 - $('body').get(0).scrollHeight,
                margin: 0
                // 'left': 50 + '%',
                // 'margin-left': -(modal_width / 2) + "px",
                // 'top': o.top + "px"
            });
            self.$el.animate({
                top: 0,
                opacity: 1}, 400);
        },

        close_modal: function (modal_id) {
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
