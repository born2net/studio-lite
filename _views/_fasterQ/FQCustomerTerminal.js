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
            self._listenQRScan();
            self._listenPrintButton();
            self._listenEmailButton();
        },

        _listenEmailButton: function () {
            var self = this;
            $(Elements.FQ_SENDIT_BUTTON).on('click', function (e) {
                var email = $(Elements.FQ_ENTER_EMAIL).val();
                if (!BB.lib.validateEmail(email)) {
                    bootbox.alert('the emailed entered is invalid');
                    return false;
                }
                var url = self._buildURL('email', email);
                $(Elements.FQ_DISPLAY_EMAIL_SENT).text('email sent').fadeIn();
                setTimeout(function () {
                    $(Elements.FQ_DISPLAY_EMAIL_SENT).text('email sent').fadeOut();
                    $(Elements.FQ_ENTER_EMAIL).val('');
                }, 5000);
                self._sendEmail(email, url);
                setTimeout(function () {
                    $(Elements.FQ_DISPLAY_EMAIL_SENT).text('email sent').fadeOut();
                }, 4000);
            });
            return false;
        },

        _sendEmail: function (i_email, i_url) {
            var self = this;
            $.ajax({
                url: '/SendQueueEmail',
                data: {
                    businessID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                    lineID: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                    email: i_email,
                    url: i_url
                },
                success: function (e) {
                },
                error: function (e) {
                    log('error ajax ' + e);
                },
                dataType: 'json'
            });

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

        _getServiceID: function () {
            var self = this;
            // save with extra parameters

            var model = new QueueModel();
            model.save({
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

        _listenQRScan: function () {
            var self = this;
            var q = $("#qrcode");
            q = q[0];
            var qrcode = new QRCode(q, {
                width: 200,
                height: 200
            });
            var url = self._buildURL('qr');
            qrcode.makeCode(url);
        },

        _buildURL: function (i_type, i_data) {
            var self = this;
            var param = '';
            switch (i_type) {
                case 'qr':
                {
                    param = BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id');
                    param += ':' + BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id');
                    param += ':QR';
                    break;
                }
                case 'email':
                {
                    param = BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id');
                    param += ':' + BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id');
                    param += ':EMAIL';
                    param += ':' + i_data;
                    break;
                }
            }
            //todo: build URL dynamically
            param = $.base64.encode(param);
            return 'https://secure.digitalsignage.com:442/_studiolite-dev/studiolite.html?mode=remoteStatus&param=' + param;
        }
    });

    return FQCustomerTerminal;

});

