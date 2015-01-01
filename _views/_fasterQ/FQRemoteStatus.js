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

        _getServiceID: function(){
            var self = this;
            // fetch with extra parameters
            self.m_model = new QueueModel();
            self.m_model.save({
                businessID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                lineID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id')
            }, {
                success: (function (model, data) {
                    $(Elements.FQ_DISPLAY_QR_NUMBER).text(model.get('service_id'));
                    self._pollStatus();
                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        },

        _pollStatus: function(){
            var self = this;
            self.m_statusHandler = setInterval(function(){
                // fetch with extra parameters
                // var model = new QueueModel();
            },5000);
        }
    });

    return FQRemoteStatus;

});

