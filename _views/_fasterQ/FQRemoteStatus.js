/**
 A public terminal for checking queue status
 @class FQRemoteStatus
 @constructor
 @return {Object} instantiated FQRemoteStatus
 **/
define(['jquery', 'backbone', 'bootbox', 'QueueModel'], function ($, Backbone, Bootbox, QueueModel) {

    var FQRemoteStatus = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._setQueue();
        },

        /**
         Create queue in table as well as matching data in analytics
         @method _setQueue server:setQueue
         **/
        _setQueue: function () {
            var self = this;
            self.m_model = new QueueModel();
            self.m_model.save({
                business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                type: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('type'),
                email: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('email')
            }, {
                success: (function (model, data) {
                    $(Elements.FQ_DISPLAY_QR_NUMBER).text(model.get('service_id'));
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
            var lastCalledQueue = function(){
                $.ajax({
                    url: '/LastCalledQueue',
                    data: {
                        business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                        line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id')
                    },
                    success: function (e) {
                        $(Elements.FQ_CURRENTLY_SERVING).text(e.service_id);
                    },
                    error: function (e) {
                        log('error ajax ' + e);
                    },
                    dataType: 'json'
                });
            }
            self.m_statusHandler = setInterval(function () {
                lastCalledQueue();
            }, 5000);
            lastCalledQueue();
        }
    });

    return FQRemoteStatus;

});

