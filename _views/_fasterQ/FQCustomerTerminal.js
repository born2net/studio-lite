/**
 A public terminal for users to collect queue numbers
 @class FQCustomerTerminal
 @constructor
 @return {Object} instantiated FQCustomerTerminal
 **/
define(['jquery', 'backbone', 'bootbox', 'qrcode', 'QueueModel'], function ($, Backbone, Bootbox, qrcode, QueueModel) {

    var FQCustomerTerminal = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            $(Elements.FASTERQ_LINE_NAME).text(self.model.get('name'));
            self._initQR();
            self._listenPrintButton();
        },

        _listenPrintButton: function () {
            var self = this;
            $(Elements.FQ_PRINT_NUMBER).on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                self._getServiceID();
                return false;
            });
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
                    $(Elements.FQ_DISPLAY_PRINT_NUMBER).text(model.get('service_id'))
                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        },

        _initQR: function () {
            var self = this;
            var q = $("#qrcode");
            q = q[0];
            var qrcode = new QRCode(q, {
                width: 200,
                height: 200
            });
            qrcode.makeCode('mediasignage.com');
        }
    });

    return FQCustomerTerminal;

});

