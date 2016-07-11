/**
 A public terminal for checking queue status
 @class FQRemoteStatus
 @constructor
 @return {Object} instantiated FQRemoteStatus
 **/
define(['jquery', 'backbone', 'bootbox', 'QueueModel', 'simplestorage', 'moment'], function ($, Backbone, Bootbox, QueueModel, simplestorage, moment) {

    var FQRemoteStatus = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_base_url = BB.CONSTS.BASE_URL + '?mode=remoteStatus&param=';
            self.m_queueModel = new QueueModel();
            self.m_lineModel = BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL);
            self._getServerDateTime(self._initServices);
            self._listenForgetSpot();
            self._listenGetNewNumber();
        },

        /**
         Check if service id exists in local storage, if not get one from server
         @method _initServices
         **/
        _initServices: function (i_dateTime) {
            var self = this;

            // STORAGE FIRST
            var storage = simplestorage.get('data');
            if (!_.isUndefined(storage)) {
                var storedDate = storage.date;
                if (storedDate != i_dateTime.date) {
                    simplestorage.deleteKey('data');

                } else {
                    self.m_queueModel.set('service_id', storage.service_id);
                    self.m_queueModel.set('verification', storage.verification);
                    self._populateCustomerInfo();
                    self._pollNowServicing();
                    return;
                }
            }

            // EMAIL OR SMS
            var call_type = self.m_lineModel.get('call_type');

            if (call_type == 'SMS' || call_type == 'EMAIL')  {
                // xxx if (i_dateTime != self.m_lineModel.get('date')) {
                if (i_dateTime.date != self.m_lineModel.get('date')) {
                    bootbox.alert('your number expired on ' + self.m_lineModel.get('date') + ', so we generated a new number for you...');
                    self._getServiceID();
                    return;
                }
                $(Elements.FQ_DISPLAY_QR_NUMBER).text(self.model.get('service_id'));
                $(Elements.FQ_DISPLAY_VERIFICATION).text(self.model.get('verification'));
                $(Elements.FQ_DISPLAY_LINE_NAME).text(self.model.get('line_name'));

                self._createStorage(self.model.get('service_id'), self.model.get('verification'), self.model.get('date'));
                self._pollNowServicing();
            }

            // QR
            if (call_type == 'QR'){
                self._getServiceID();
            }
        },

        /**
         Forget spot in line
         @method _listenForgetSpot
         **/
        _listenForgetSpot: function () {
            var self = this;
            $(Elements.FQ_RELEASE_SPOT).on('click', function () {
                bootbox.prompt('are you sure you want to let go of your spot (type yes or no)?', function (i_answer) {
                    if (i_answer) {
                        if (i_answer.toLowerCase() == 'yes') {
                            $(Elements.APP_ENTRY).html('<h1 style="text-align: center; padding: 100px">have a nice day</h1>');
                            simplestorage.deleteKey('data');
                            window.clearInterval(self.m_statusHandler);
                        }
                    }
                })
            });
        },

        /**
         Forget spot in line
         @method _listenGetNewNumber
         **/
        _listenGetNewNumber: function () {
            var self = this;
            $(Elements.FQ_GET_NEW_NUMBER).on('click', function () {
                bootbox.prompt('are you sure you want to get a new number (type yes or no)?', function (i_answer) {
                    if (i_answer) {
                        if (i_answer.toLowerCase() == 'yes') {
                            simplestorage.deleteKey('data');
                            window.clearInterval(self.m_statusHandler);
                            var url = self._buildURL();
                            $(location).attr('href',url);
                        }
                    }
                })
            });
        },

        _createStorage: function (i_service_id, i_verification, i_date) {
            var self = this;
            simplestorage.set('data', {
                service_id: i_service_id,
                date: i_date,
                verification: i_verification
            });
        },

        /**
         Create queue in table as well as matching data in analytics
         @method _getServiceID server:setQueue
         **/
        _getServiceID: function () {
            var self = this;
            self.m_queueModel.save({
                business_id: self.m_lineModel.get('business_id'),
                line_id: self.m_lineModel.get('line_id'),
                call_type: self.m_lineModel.get('call_type'),
                email: self.m_lineModel.get('email')
            }, {
                success: (function (model, data) {
                    self._createStorage(self.m_queueModel.get('service_id'), self.m_queueModel.get('verification'), self.m_queueModel.get('date'));
                    self._populateCustomerInfo();
                    self._pollNowServicing();
                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        },

        _populateCustomerInfo: function () {
            var self = this;
            $(Elements.FQ_DISPLAY_QR_NUMBER).text(self.m_queueModel.get('service_id'));
            $(Elements.FQ_DISPLAY_VERIFICATION).text(self.m_queueModel.get('verification'));
            $(Elements.FQ_DISPLAY_LINE_NAME).text(self.m_lineModel.get('line_name'));
        },

        /**
         Get the last called service_id for line
         @method _pollNowServicing server:LastCalledQueue
         **/
        _pollNowServicing: function () {
            var self = this;
            var lastCalledQueue = function () {
                $.ajax({
                    url: BB.CONSTS.ROOT_URL + '/LastCalledQueue',
                    data: {
                        business_id: self.m_lineModel.get('business_id'),
                        line_id: self.m_lineModel.get('line_id')
                    },
                    success: function (i_model) {
                        $(Elements.FQ_CURRENTLY_SERVING).text(i_model.service_id);

                    },
                    error: function (e) {
                        log('error ajax ' + e);
                    },
                    dataType: 'json'
                });
            };
            self.m_statusHandler = setInterval(function () {
                lastCalledQueue();
            }, 5000);
            lastCalledQueue();
        },

        /**
         Get current server date / time
         @method _getServerDateTime server:getDateTime
         @param {Function} i_cb
         **/
        _getServerDateTime: function (i_cb) {
            var self = this;
            $.ajax({
                url: BB.CONSTS.ROOT_URL + '/GetDateTime',
                success: function (dateTime) {
                    $.proxy(i_cb, self)(dateTime);
                },
                error: function (e) {
                    log('error ajax ' + e);
                },
                dataType: 'json'
            });
        },

        /**
         Create URL string to load customer terminal UI for FasterQ queue generation
         @method _buildURL
         @return {String} URL
         **/
        _buildURL: function () {
            var self = this;
            var data = {
                line_id: self.m_lineModel.get('line_id'),
                business_id: self.m_lineModel.get('business_id'),
                line_name: self.model.get('line_name'),
                call_type: 'QR'
            };
            data = $.base64.encode(JSON.stringify(data));
            return self.m_base_url + data;
        }

    });

    return FQRemoteStatus;

});

