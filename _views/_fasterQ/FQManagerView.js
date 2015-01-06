/**
 Settings Backbone > View
 @class FQManagerView
 @constructor
 @return {Object} instantiated FQManagerView
 **/
define(['jquery', 'backbone', 'ScrollToPlugin', 'TweenMax', 'FQQueuePropView'], function ($, Backbone, ScrollToPlugin, TweenMax, FQQueuePropView) {

    var FQManagerView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_offsetPosition = 0;
            self.m_fqCreatorView = BB.comBroker.getService(BB.SERVICES.FQCREATORVIEW);
            self.m_selectedLine = undefined;
            self.m_selectedQueue = 1;
            $(Elements.FASTERQ_MANAGER_BACK).on('click', function () {
                self.options.stackView.selectView(Elements.FASTERQ_CREATOR_CONTAINER);
                self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._render();
            });

            self.m_fqQueuePropView = new FQQueuePropView({
                el: Elements.FASTERQ_QUEUE_PROPERTIES
            });

            self._listenContButtons();
            self._scrollTo($(Elements.FQ_LINE_QUEUE_COMPONENT + ':first-child'));
        },

        _render: function () {
            var self = this;
            self.m_selectedLine = self.m_fqCreatorView.getSelectedLine();
            self.m_fqQueuePropView.showProp();
            var snippet;
            $(Elements.FQ_LINE_QUEUE_COMPONENT).empty();
            for (var i = -8; i < 0; i++) {
                snippet = '<div data-queue_id="' + i + '" class="personInLine"></div>';
                $(Elements.FQ_LINE_QUEUE_COMPONENT).append(snippet);
            }

            for (var i = 0; i < 100; i++) {
                var val = BB.lib.padZeros(i, 3, 0);
                snippet = '<div data-queue_id="' + i + '" class="personInLine"><i style="font-size: 90px" class="fa fa-male"></i><h3 style="position: relative; left: 6px">' + val + '</h3></div>';
                $(Elements.FQ_LINE_QUEUE_COMPONENT).append(snippet);
            }
        },

        _scrollTo: function (i_element) {
            var self = this;
            var scrollXPos = $(i_element).position().left;
            console.log('current offset ' + scrollXPos);
            console.log('going to ' + $(i_element).index());
            self.m_offsetPosition = $(Elements.FQ_LINE_QUEUE_COMPONENT_CONTAINER).scrollLeft();
            scrollXPos += self.m_offsetPosition;
            var final = scrollXPos - 480;
            TweenLite.to(Elements.FQ_LINE_QUEUE_COMPONENT_CONTAINER, 2, {
                scrollTo: {x: final, y: 0},
                ease: Power4.easeOut
            });
        },

        _listenContButtons: function () {
            var self = this;
            $(Elements.FQ_LINE_COMP_PREV).on('click', function () {
                if (self.m_selectedQueue == 1)
                    return;
                self.m_selectedQueue--;
                var elem = self.$('[data-queue_id="' + self.m_selectedQueue + '"]');
                self._scrollTo(elem);
            });

            $(Elements.FQ_LINE_GOTO).on('click', function () {
                var value = $(Elements.FQ_GOTO_LINE_INPUT).val();
                if (!$.isNumeric(value) || value < 1 || value > 99)
                    return;
                self.m_selectedQueue = value;
                var elem = self.$('[data-queue_id="' + self.m_selectedQueue + '"]');
                self._scrollTo(elem);
            });

            $(Elements.FQ_LINE_COMP_SERVICED).on('click', function () {

            });

            $(Elements.FQ_LINE_COMP_NEXT).on('click', function () {
                if (self.m_selectedQueue == 99)
                    return;
                self.m_selectedQueue++;
                var elem = self.$('[data-queue_id="' + self.m_selectedQueue + '"]');
                self._scrollTo(elem);
            });
        }

    });

    return FQManagerView;
});

