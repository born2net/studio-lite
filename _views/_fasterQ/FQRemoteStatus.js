/**
 A public terminal for checking queue status
 @class FQRemoteStatus
 @constructor
 @return {Object} instantiated FQRemoteStatus
 **/
define(['jquery', 'backbone', 'bootbox', 'QueueModel', 'simplestorage'], function ($, Backbone, Bootbox, QueueModel, simplestorage) {

    var FQRemoteStatus = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_model = new QueueModel();
            self._checkServiceIdExists();
            self._listenForgetSpot();
            self._listenGetNewNumber();
        },

        /**
         Forget spot in line
         @method _listenForgetSpot
         **/
        _listenForgetSpot: function(){
            var self = this;
            $(Elements.FQ_RELEASE_SPOT).on('click', function () {
                bootbox.prompt('are you sure you want to let go of your spot (type yes or no)?', function (i_answer) {
                    if (i_answer){
                        if (i_answer.toLowerCase()=='yes'){
                            $(Elements.APP_ENTRY).html('<h1 style="text-align: center; padding: 100px">have a nice day</h1>');
                            simplestorage.deleteKey('service_id');
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
        _listenGetNewNumber: function(){
            var self = this;
            $(Elements.FQ_GET_NEW_NUMBER).on('click', function () {
                bootbox.prompt('are you sure you want to get a new number (type yes or no)?', function (i_answer) {
                    if (i_answer){
                        if (i_answer.toLowerCase()=='yes'){
                            simplestorage.deleteKey('service_id');
                            window.clearInterval(self.m_statusHandler);
                            location.reload()
                        }
                    }
                })
            });
        },

        /**
         Check if service id exists in local storage, if not get one from server
         @method _checkServiceIdExists
         **/
        _checkServiceIdExists: function () {
            var self = this;
            var service_id = simplestorage.get('service_id');
            if (_.isUndefined(service_id)) {
                self._getServiceID();
            } else {
                self.m_model.set('service_id', service_id);
                self._pollQueueStatus();
            }
        },

        /**
         Create queue in table as well as matching data in analytics
         @method _getServiceID server:setQueue
         **/
        _getServiceID: function () {
            var self = this;
            self.m_model.save({
                business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                type: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('type'),
                email: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('email')
            }, {
                success: (function (model, data) {
                    simplestorage.set('service_id', self.m_model.get('service_id'));
                    self._pollQueueStatus();
                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        },

        /**
         Get the last called service_id for line
         @method _pollQueueStatus server:LastCalledQueue
         **/
        _pollQueueStatus: function () {
            var self = this;
            var lastCalledQueue = function () {
                $.ajax({
                    url: '/LastCalledQueue',
                    data: {
                        business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                        line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id')
                    },
                    success: function (e) {
                        $(Elements.FQ_CURRENTLY_SERVING).text(e.service_id);
                        $(Elements.FQ_DISPLAY_QR_NUMBER).text(self.m_model.get('service_id'));
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
        }
    });

    return FQRemoteStatus;

});

