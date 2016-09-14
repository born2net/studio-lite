/**
 Settings Backbone View
 @class FQManagerView
 @constructor
 @return {Object} instantiated FQManagerView
 **/
define(['jquery', 'backbone', 'ScrollToPlugin', 'TweenMax', 'FQQueuePropView', 'QueuesCollection', 'AnalyticsCollection', 'stopwatch', 'XDate', 'moment'], function ($, Backbone, ScrollToPlugin, TweenMax, FQQueuePropView, QueuesCollection, AnalyticsCollection, stopwatch, XDate, moment) {

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
            self.m_liveUpdatehandler = undefined;
            self.m_inView = false;
            self.m_masterPanelInView = true;
            self.m_fqQueuePropView = new FQQueuePropView({
                el: Elements.FASTERQ_QUEUE_PROPERTIES
            });

            self._listenNextPrev();
            self._listenCalled();
            self._listenServiced();
            self._listenGoBack();
            self._listenOpenRemoteStatus();

            self.listenTo(self.options.stackViewMaster, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e.$el.selector == Elements.FASTERQ_PANEL) {
                    self.m_masterPanelInView = true;
                } else {
                    self.m_masterPanelInView = false;
                }
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    self.m_inView = true;
                    self.m_liveUpdatehandler = setInterval(function () {
                        if (!self.m_masterPanelInView)
                            return;
                        self._getQueues(false);
                        self._pollNowServicing();
                    }, 10000);

                    self._getQueues(true);
                    // self._scrollTo($(Elements.FQ_LINE_QUEUE_COMPONENT + ':first-child'));

                } else {
                    self.m_inView = false;
                    window.clearInterval(self.m_liveUpdatehandler);
                    window.clearInterval(self.m_statusHandler);
                }
            });
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
         @params {boolean} i_scrollTo scroll to
         **/
        _getQueues: function (i_scrollTo) {
            var self = this;
            self.m_queuesCollection = new QueuesCollection();
            self.m_queuesCollection.fetch({
                data: {line_id: self.m_fqCreatorView.getSelectedLine()},
                success: function (models) {
                    self._updateTotalToBeServiced();
                    self._render();
                    if (i_scrollTo)
                        self._scrollToFirstNotServiced();
                },
                error: function () {
                    log('error fetch /Queues collection');
                }
            });
        },

        /**
         Get the last called service_id for line
         @method _pollNowServicing server:LastCalledQueue
         **/
        _pollNowServicing: function () {
            var self = this;
            $.ajax({
                url: BB.CONSTS.ROOT_URL + '/LastCalledQueue',
                data: {
                    business_id: BB.Pepper.getUserData()['businessID'],
                    line_id: self.m_fqCreatorView.getSelectedLine()
                },
                success: function (i_model) {
                    $(Elements.FQ_NOW_SERVICING).text(i_model.service_id);
                },
                error: function (e) {
                    log('error ajax ' + e);
                },
                dataType: 'json'
            });
        },

        /**
         Update the total number of queues left to be serviced
         @method _updateTotalToBeServiced
         **/
        _updateTotalToBeServiced: function () {
            var self = this;
            if (_.isUndefined(self.m_queuesCollection))
                return;
            var total = 0;
            self.m_queuesCollection.each(function (model) {
                if (_.isNull(model.get('serviced')))
                    total++;
                $(Elements.FQ_TOTAL_TO_BE_SERVICED).text(total);
            });

        },

        /**
         Start the stop watch UI
         @method _watchStart
         **/
        _watchStart: function () {
            var self = this;
            self.m_stopWatchHandle.setListener(function (e) {
                $(Elements.FQ_TIME_WITH_CUSTOMER).text(self.m_stopWatchHandle.toString());
            });
            self.m_stopWatchHandle.start();
        },

        /**
         Stop the stop watch UI
         @method _watchStop
         **/
        _watchStop: function () {
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
            if (!self.m_inView)
                return;
            self.m_fqQueuePropView.showProp();
            var snippet;


            $(Elements.FQ_LINE_QUEUE_COMPONENT).empty();

            var selectedLine = self.m_fqCreatorView.getSelectedLine();
            $(Elements.FQ_LINE_NAME).text(self.m_fqCreatorView.getSelectedLineName(selectedLine));

            for (var i = -8; i < 0; i++) {
                snippet = '<div class="' + BB.lib.unclass(Elements.CLASS_PERSON_IN_LINE) + '">';
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
                }

                var val = BB.lib.padZeros(serviceID, 3, 0);
                snippet = '<div data-service_id="' + serviceID + '" class="' + BB.lib.unclass(Elements.CLASS_PERSON_IN_LINE) + '">';
                snippet += '<i style="font-size: 90px; color: ' + color + '"  class="fa fa-male">';
                snippet += '</i><h3 style="position: relative; left: 6px">' + val + '</h3></div>';
                $(Elements.FQ_LINE_QUEUE_COMPONENT).append(snippet);
            });
            self._listenToPersonSelected();
            self._getAnalytics();
        },

        /**
         Get line analytics / stats
         @method _getAnalytics server:lineAnalytics
         **/
        _getAnalytics: function () {
            var self = this;
            self.m_analyticsCollection = new AnalyticsCollection();

            self.m_analyticsCollection.fetch({
                data: {line_id: self.m_fqCreatorView.getSelectedLine()},
                success: function (models) {
                    self._calcAverages();
                },
                error: function () {
                    log('error fetch /Queues collection');
                }
            });
        },

        /**
         Calculate average respond and service line times
         @method _calcAverages
         **/
        _calcAverages: function () {
            var self = this;

            var avgServiceTime = [];
            var avgCalledTime = [];

            self.m_analyticsCollection.forEach(function (i_model) {
                var entered = i_model.get('entered');
                var serviced = i_model.get('serviced');
                var called = i_model.get('called');

                if (_.isNull(called)) {
                    // customer not called, do nothing
                } else if (!_.isNull(serviced)) {

                    // customer called & serviced
                    var xEntered = new XDate(entered);
                    var minFromEnteredToCalled = xEntered.diffMinutes(called);
                    if (minFromEnteredToCalled < 0)
                        minFromEnteredToCalled = 1;
                    avgCalledTime.push(minFromEnteredToCalled);

                    var xCalled = new XDate(called);
                    var minFromCalledToServiced = xCalled.diffMinutes(serviced);
                    avgServiceTime.push(minFromCalledToServiced);

                } else {

                    // customer called not serviced
                    var xEntered = new XDate(entered);
                    var minFromEnteredToCalled = xEntered.diffMinutes(called);
                    if (minFromEnteredToCalled < 0)
                        minFromEnteredToCalled = 1;
                    avgCalledTime.push(minFromEnteredToCalled);
                }
            });

            var avgServiceTimeCalc = _.reduce(avgServiceTime, function (memo, num) {
                    return memo + num;
                }, 0) / (avgServiceTime.length === 0 ? 1 : avgServiceTime.length);

            var avgCalledTimeCalc = _.reduce(avgCalledTime, function (memo, num) {
                    return memo + num;
                }, 0) / (avgCalledTime.length === 0 ? 1 : avgCalledTime.length);

            $(Elements.FQ_AVG_CUSTOMER_SERVICE).text(BB.lib.parseToFloatDouble(avgServiceTimeCalc))
            $(Elements.FQ_AVG_CUSTOMER_WAIT).text(BB.lib.parseToFloatDouble(avgCalledTimeCalc));
        },

        /**
         Scroll to first queue that has not been serviced yet, if non exist, scroll to first queue
         @method _scrollToFirstNotServiced
         **/
        _scrollToFirstNotServiced: function () {
            var self = this;
            var found = false;
            if (self.m_queuesCollection.length == 0)
                return;
            self.m_queuesCollection.each(function (model) {
                if (found)
                    return;
                var service_id = model.get('service_id');
                var serviced = model.get('serviced');
                if (_.isNull(serviced)) {
                    var elem = self.$('[data-service_id="' + service_id + '"]');
                    self._scrollTo(elem);
                    found = true;
                }
            });
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
            self._watchStop();
            if (i_element.length == 0)
                return;
            self.m_selectedServiceID = $(i_element).data('service_id');
            var model = self.m_queuesCollection.where({'service_id': self.m_selectedServiceID})[0];
            self._populatePropsQueue(model);

            var scrollXPos = $(i_element).position().left;
            // console.log('current offset ' + scrollXPos + ' ' + 'going to index ' + $(i_element).index() + ' service_id ' + $(i_element).data('service_id'));
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
        _populatePropsQueue: function (i_model) {
            var self = this;
            if (_.isUndefined(i_model))
                return;
            if (!self.m_inView)
                return;
            $(Elements.FQ_SELECTED_QUEUE).text(i_model.get('service_id'));
            $(Elements.FQ_VERIFICATION).text(i_model.get('verification') == -1 ? 'print out' : i_model.get('verification'));
            $(Elements.FQ_CALLED_BY).text(_.isNull(i_model.get('called_by')) ? 'none' : i_model.get('called_by'));
        },

        /**
         Listen to queue being called, mark on UI and post to server
         @method _listenCalled
         **/
        _listenCalled: function () {
            var self = this;
            $(Elements.FQ_LINE_COMP_CALL).on('click', function () {
                var model = self.m_queuesCollection.where({'service_id': self.m_selectedServiceID})[0];
                if (_.isUndefined(model))
                    return;
                if (!_.isNull(model.get('serviced'))) {
                    bootbox.alert('customer has already been serviced');
                    return;
                }
                self._watchStart();
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID) + '"]');
                $(elem).find('i').fadeOut(function () {
                    $(this).css({color: '#BE6734'}).fadeIn();
                });
                $(Elements.FQ_LAST_CALLED).text(self.m_selectedServiceID);
                var d = new XDate();
                model.set('called', d.toString('M/d/yyyy hh:mm:ss TT'));
                model.set('called_by', pepper.getUserData().userName);
                model.set('called_by_override', false);

                self._populatePropsQueue(model);

                model.save(null,{
                    success: (function (model, data) {
                        if (data.updated == 'alreadyCalled'){
                            bootbox.confirm('Customer already called by user' + data.called_by + ' <br/><br/>Would you like to call the customer again?', function(result) {
                                if (result){
                                    model.set('called_by_override', true);
                                    model.save();
                                }
                            });
                        }
                    }),
                    error: (function (e) {
                        bootbox.alert('Service request failure: ' + e);
                    }),
                    complete: (function (e) {
                    })
                });
            });
        },

        /**
         Listen to queue being serviced, mark on UI and post to server
         @method _listenServiced
         **/
        _listenServiced: function () {
            var self = this;
            $(Elements.FQ_LINE_COMP_SERVICED).on('click', function () {
                self._watchStop();
                var model = self.m_queuesCollection.where({'service_id': self.m_selectedServiceID})[0];
                if (_.isUndefined(model))
                    return;
                if (_.isNull(model.get('called'))) {
                    bootbox.alert('customer has not been called yet');
                    return;
                }
                if (!_.isNull(model.get('serviced'))) {
                    bootbox.alert('customer has already been serviced');
                    return;
                }
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID) + '"]');
                $(elem).find('i').fadeOut(function () {
                    $(this).css({color: '#ACFD89'}).fadeIn();
                });
                $(Elements.FQ_LAST_SERVICED).text(self.m_selectedServiceID);
                var d = new XDate();
                model.set('serviced', d.toString('M/d/yyyy hh:mm:ss TT'));
                log('service ' + model.get('serviced'));
                model.save({
                    success: (function (model, data) {
                        log(model);
                    }),
                    error: (function (e) {
                        log('Service request failure: ' + e);
                    }),
                    complete: (function (e) {
                    })
                });
            });
        },

        /**
         Listen to person navigation button selection to scroll to selected queue index
         @method _listenNextPrev
         **/
        _listenNextPrev: function () {
            var self = this;

            $(Elements.FQ_LINE_COMP_PREV).on('click', function () {
                if (_.isUndefined(self.m_queuesCollection))
                    return;
                if (self.m_selectedServiceID == 1)
                    return;
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID - 1) + '"]');
                self._scrollTo(elem);
            });

            $(Elements.FQ_LINE_GOTO).on('click', function () {
                var value = $(Elements.FQ_GOTO_LINE_INPUT).val();
                if (_.isUndefined(self.m_queuesCollection))
                    return;
                var elem = self.$('[data-service_id="' + value + '"]');
                self._scrollTo(elem);
            });

            $(Elements.FQ_LINE_COMP_NEXT).on('click', function () {
                if (_.isUndefined(self.m_queuesCollection))
                    return;
                if (self.$('[data-service_id]').children().length == self.m_queuesCollection.length)
                    return;
                var elem = self.$('[data-service_id="' + (self.m_selectedServiceID + 1) + '"]');
                self._scrollTo(elem);
            });

        },

        /**
         Open remote status terminal for selected queue
         @method _listenOpenRemoteStatus
         **/
        _listenOpenRemoteStatus: function () {
            var self = this;
            $(Elements.FQ_OPEN_CUSTOMER_REMOTE_STATUS).on('click', function (e) {
                var line_id = self.m_fqCreatorView.getSelectedLine()
                var data = {
                    call_type: 'REMOTE_STATUS',
                    business_id: BB.Pepper.getUserData()['businessID'],
                    line_id: line_id,
                    line_name: self.m_fqCreatorView.getSelectedLineName(line_id)
                };
                data = $.base64.encode(JSON.stringify(data));
                var url = BB.CONSTS.BASE_URL + '?mode=remoteStatus&param=' + data;
                window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=10, left=10, width=400, height=400");
            })
        }
    });

    return FQManagerView;
});

