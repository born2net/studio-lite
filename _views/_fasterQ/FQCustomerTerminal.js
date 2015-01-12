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
            self._createQRcode();
            self._listenPrintButton();
            self._listenEmailButton();
            self._listenSMSButton();
        },

        /**
         Listen to custom selection on queue id creator via Print button
         @method _listenPrintButton
         **/
        _listenPrintButton: function () {
            var self = this;
            $(Elements.FQ_PRINT_NUMBER).on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                self._getServiceID();
                return false;
            });
        },

        /**
         Listen to custom selection on queue id creator via QR scan
         @method _createQRcode
         **/
        _createQRcode: function () {
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

        /**
         Listen to custom selection on queue id creator via email
         @method _listenEmailButton
         **/
        _listenEmailButton: function () {
            var self = this;
            $(Elements.FQ_SENDIT_BUTTON).on('click', function (e) {
                var email = $(Elements.FQ_ENTER_EMAIL).val();
                if (!BB.lib.validateEmail(email)) {
                    bootbox.alert('the emailed entered is invalid');
                    return false;
                }
                var url = self._buildURL('email', email);
                $(Elements.FQ_DISPLAY_EMAIL_SENT).text('check your email').fadeIn();
                setTimeout(function () {
                    $(Elements.FQ_DISPLAY_EMAIL_SENT).fadeOut();
                    $(Elements.FQ_ENTER_EMAIL).val('');
                }, 5000);
                self._sendQueueEmail(email, url);
            });
            return false;
        },

        /**
         Listen to custom selection on queue id creator via SMS
         @method _listenEmailButton
         **/
        _listenSMSButton: function () {
            var self = this;
            $(Elements.FQ_CALL_IT).on('click', function (e) {
                var sms = $(Elements.FQ_ENTER_SMS).val();
                if (sms.length < 6) {
                    bootbox.alert('the phone number entered is invalid');
                    return false;
                }
                var url = self._buildURL('sms', sms);
                $(Elements.FQ_DISPLAY_SMS_SENT).text('we will call you').fadeIn();
                setTimeout(function () {
                    $(Elements.FQ_DISPLAY_SMS_SENT).fadeOut();
                    $(Elements.FQ_ENTER_SMS).val('');
                }, 5000);
                self._sendQueueSMS(sms, url);
            });
            return false;
        },

        /**
         Send customer email with link to create queue
         @method _sendQueueEmail server:sendQueueEmail
         @param {String} i_email
         @param {String} i_url
         **/
        _sendQueueEmail: function (i_email, i_url) {
            var self = this;
            $.ajax({
                url: '/SendQueueEmail',
                data: {
                    business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                    line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
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

        /**
         Send customer SMS / call when service id is up
         @method _sendQueueSMS server:sendQueueSMS
         @param {String} i_email
         @param {String} i_url
         **/
        _sendQueueSMS: function (i_sms, i_url) {
            var self = this;
            $.ajax({
                url: '/SendQueueSMS',
                data: {
                    business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                    line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                    sms: i_sms,
                    url: i_url
                },
                success: function (e) {
                    log('aa');
                },
                error: function (e) {
                    log('error ajax ' + e);
                },
                dataType: 'json'
            });
        },

        /**
         Get the next service id from remote server
         @method _getServiceID server:setQueue
         **/
        _getServiceID: function () {
            var self = this;
            // save with extra parameters

            var model = new QueueModel();
            model.save({
                business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                type: 'PRINT'
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

        /**
         Create URL string to load customer terminal UI for FasterQ queue generation
         @method _buildURL
         @param {String} i_type
         @param {String} i_data
         @return {String} created URL
         **/
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
                case 'sms':
                {
                    param = BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id');
                    param += ':' + BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id');
                    param += ':SMS';
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

