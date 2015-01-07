/**
 Settings Backbone > View
 @class FQManagerView
 @constructor
 @return {Object} instantiated FQManagerView
 **/
define(['jquery', 'backbone', 'ScrollToPlugin', 'TweenMax', 'FQQueuePropView', 'QueuesCollection', 'stopwatch', 'XDate'], function ($, Backbone, ScrollToPlugin, TweenMax, FQQueuePropView, QueuesCollection, stopwatch, XDate) {

    var FQManagerView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_offsetPosition = 0;
            self.m_selectedServiceID = -1;
            self.m_fqCreatorView = BB.comBroker.getService(BB.SERVICES.FQCREATORVIEW);
            self.m_stopWatchHandle = new Stopwatch();
            self.m_fqQueuePropView = new FQQueuePropView({
                el: Elements.FASTERQ_QUEUE_PROPERTIES
            });

            self._listenButtons();
            self._listenGoBack();

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._getQueues();
            });

            // self._scrollTo($(Elements.FQ_LINE_QUEUE_COMPONENT + ':first-child'));
        },

        /**
         Listen to go back to Line selection
         @method _listenGoBack
         **/
        _listenGoBack: function () {
            var self = this;
            $(Elements.FASTERQ_MANAGER_BACK).on('click', function () {
                self.options.stackView.selectView(Elements.FASTERQ_CREATOR_CONTAINER);
                self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
            });
        },

        /**
         Get Queues collection from server and render UI
         @method _getLines server:getQueues
         **/
        _getQueues: function () {
            var self = this;
            self.m_queuesCollection = new QueuesCollection();

            self.m_queuesCollection.fetch({
                data: {line_id: self.m_fqCreatorView.getSelectedLine()},
                success: function (models) {
                    self._render();
                },
                error: function () {
                    log('error fetch /Queues collection');
                }
            });
        },

        _startStopWatch: function () {
            var self = this;
            self.m_stopWatchHandle.setListener(function(e){
                $(Elements.FQ_TIME_WITH_CUSTOMER).text(self.m_stopWatchHandle.toString());
            });
            self.m_stopWatchHandle.start();
        },

        _stopStopWatch: function () {
            var self = this;
            self.m_stopWatchHandle.stop();
            self.m_stopWatchHandle.reset();
            $(Elements.FQ_TIME_WITH_CUSTOMER).text('00:00:00');
        },

        /**
         Render the UI queues list from returned server data
         @method _render
         **/
        _render: function () {
            var self = this;
            var firstNotServiced = undefined;
            self.m_fqQueuePropView.showProp();
            var snippet;


            $(Elements.FQ_LINE_QUEUE_COMPONENT).empty();
            for (var i = -8; i < 0; i++) {
                snippet = '<div data-service_id="' + i + '" class="' + BB.lib.unclass(Elements.CLASS_PERSON_IN_LINE) + '">';
                $(Elements.FQ_LINE_QUEUE_COMPONENT).append(snippet);
            }

            self.m_queuesCollection.each(function (model) {
                var serviceID = model.get('service_id');
                var called = model.get('called');
                var serviced = model.get('serviced');
                var color = 'gray';

                if (serviced) {
                    color = '#ACFD89';
                } else if (called) {
                    color = '#BE6734';
                } else {
                    color = '#D0D0D0';
                    if (_.isUndefined(firstNotServiced))
                        firstNotServiced = serviceID;
                }

                var val = BB.lib.padZeros(serviceID, 3, 0);
                snippet = '<div data-service_id="' + serviceID + '" class="' + BB.lib.unclass(Elements.CLASS_PERSON_IN_LINE) + '">';
                snippet += '<i style="font-size: 90px; color: ' + color + '"  class="fa fa-male">';
                snippet += '</i><h3 style="position: relative; left: 6px">' + val + '</h3></div>';
                $(Elements.FQ_LINE_QUEUE_COMPONENT).append(snippet);
            });
            self._listenToPersonSelected();

            // scroll to first person that has not been serviced, if non exist, scroll to first person
            if (self.m_queuesCollection.length == 0)
                return;
            firstNotServiced = firstNotServiced ? firstNotServiced : self.m_queuesCollection.at(0).get('service_id');
            var elem = self.$('[data-service_id="' + firstNotServiced + '"]');
            self._scrollTo(elem);
        },

        /**
         Listen to UI person / queue click to load selected properties and scroll to selection
         @method _listenToPersonSelected
         **/
        _listenToPersonSelected: function () {
            var self = this;
            $(Elements.CLASS_PERSON_IN_LINE).off().on('click', function (e) {
                var person = $(this).closest('[data-service_id]');
                $(person).data('service_id');
                self._scrollTo(person);
            })
        },

        /**
         Scroll to position of selected queue / UI person
         @method _scrollTo
         @param {Element} i_element
         **/
        _scrollTo: function (i_element) {
            var self = this;
            if (i_element.length == 0)
                return;

            self.m_selectedServiceID = $(i_element).data('service_id');
            self._populatePropsQueue(self.m_selectedServiceID);

            var scrollXPos = $(i_element).position().left;
            console.log('current offset ' + scrollXPos + ' ' + 'going to index ' + $(i_element).index() + ' service_id ' + $(i_element).data('service_id'));
            self.m_offsetPosition = $(Elements.FQ_LINE_QUEUE_COMPONENT_CONTAINER).scrollLeft();
            scrollXPos += self.m_offsetPosition;
            var final = scrollXPos - 480;
            TweenLite.to(Elements.FQ_LINE_QUEUE_COMPONENT_CONTAINER, 2, {
                scrollTo: {x: final, y: 0},
                ease: Power4.easeOut
            });
        },

        /**
         Populate the selected queue's properties UI
         @method _populatePropsQueue
         @params {Number} i_value
         **/
        _populatePropsQueue: function (i_value) {
            var self = this;
            $(Elements.FQ_SELECTED_QUEUE).text(i_value);
        },

        /**
         Listen to person navigation button selection to scroll to selected queue index
         @method _listenButtons
         **/
        _listenButtons: function () {
            var self = this;

            $(Elements.FQ_LINE_COMP_CALL).on('click', function () {
                var model = self.m_queuesCollection.where({'service_id': self.m_selectedServiceID})[0];
                if (_.isUndefined(model))
                    return;
                if (!_.isNull(model.get('serviced'))){
                    bootbox.alert('customer has already been serviced');
                    return;
                }
                self._startStopWatch();
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID) + '"]');
                $(elem).find('i').fadeOut(function(){
                    $(this).css({color: '#BE6734'}).fadeIn();
                });
                var d = new XDate();
                model.set('called', d.toString('M/d/yyyy hh:mm:ss TT'));
                model.save({
                    success: (function (model, data) {
                        log('aa');
                    }),
                    error: (function (e) {
                        log('Service request failure: ' + e);
                    }),
                    complete: (function (e) {
                    })
                });
            });

            $(Elements.FQ_LINE_COMP_PREV).on('click', function () {
                self._stopStopWatch();
                if (self.m_selectedServiceID == 1)
                    return;
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID - 1) + '"]');
                self._scrollTo(elem);
            });

            $(Elements.FQ_LINE_GOTO).on('click', function () {
                self._stopStopWatch();
                var value = $(Elements.FQ_GOTO_LINE_INPUT).val();
                if (!$.isNumeric(value) || value < 1 || value > self.m_queuesCollection.length)
                    return;
                var elem = self.$('[data-service_id="' + value + '"]');
                self._scrollTo(elem);
            });

            $(Elements.FQ_LINE_COMP_SERVICED).on('click', function () {
                self._stopStopWatch();
            });

            $(Elements.FQ_LINE_COMP_NEXT).on('click', function () {
                self._stopStopWatch();
                if (self.m_selectedServiceID == self.m_queuesCollection.length)
                    return;
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID + 1) + '"]');
                self._scrollTo(elem);
            });
        }
    });

    return FQManagerView;
});

