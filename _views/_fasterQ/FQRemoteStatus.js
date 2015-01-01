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
            self._getServiceID();
        },

        _getServiceID: function () {
            var self = this;
            self.m_model = new QueueModel();
            self.m_model.save({
                businessID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                lineID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id')
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

        _pollQueueStatus: function () {
            var self = this;
            var getServiceID = function(){
                $.ajax({
                    url: '/LastCalledQueue',
                    data: {
                        businessID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                        lineID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id')
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
                getServiceID();
            }, 5000);
            getServiceID();
        }
    });

    return FQRemoteStatus;

});

