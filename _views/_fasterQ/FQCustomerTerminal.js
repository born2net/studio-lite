/**
 A public terminal for users to collect queue numbers
 @class FQCustomerTerminal
 @constructor
 @return {Object} instantiated FQCustomerTerminal
 **/
define(['jquery', 'backbone', 'bootbox', 'qrcode', 'QueueModel', 'moment'], function ($, Backbone, Bootbox, qrcode, QueueModel, moment) {

    var FQCustomerTerminal = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_base_url = BB.CONSTS.BASE_URL + '?mode=remoteStatus&param=';
            $(Elements.FASTERQ_LINE_NAME).text(self.model.get('name'));
            $(Elements.FQ_TAKE_NUMBER_LINE_NAME).text(self.model.get('line_name'));
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
            var url = self._buildURL();
            log(url);
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
                $(Elements.FQ_DISPLAY_EMAIL_SENT).text('check your email').fadeIn();
                setTimeout(function () {
                    $(Elements.FQ_DISPLAY_EMAIL_SENT).fadeOut();
                    $(Elements.FQ_ENTER_EMAIL).val('');
                }, 5000);
                self._sendQueueEmail(email);
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
                $(Elements.FQ_DISPLAY_SMS_SENT).text('we will call you').fadeIn();
                setTimeout(function () {
                    $(Elements.FQ_DISPLAY_SMS_SENT).fadeOut();
                    $(Elements.FQ_ENTER_SMS).val('');
                }, 5000);
                self._sendQueueSMS(sms);
            });
            return false;
        },

        /**
         Send customer email with link to create queue
         @method _sendQueueEmail server:sendQueueEmail
         @param {String} i_email
         **/
        _sendQueueEmail: function (i_email) {
            var self = this;
            $.ajax({
                url: BB.CONSTS.ROOT_URL + '/SendQueueSMSEmail',
                data: {
                    business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                    line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                    line_name: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_name'),
                    email: i_email,
                    call_type: 'EMAIL',
                    url: self.m_base_url
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
         @param {String} i_sms
         **/
        _sendQueueSMS: function (i_sms) {
            var self = this;
            $.ajax({
                url: BB.CONSTS.ROOT_URL + '/SendQueueSMSEmail',
                data: {
                    business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                    line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                    line_name: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_name'),
                    sms: i_sms,
                    call_type: 'SMS',
                    url: self.m_base_url
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
                    $(Elements.FQ_DISPLAY_PRINT_NUMBER).text(model.get('service_id'));
                    self._printNumber(model.get('service_id'), model.get('name'));
                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        },

        /**
         Print current customer service id
         @method _printNumber
         @param {Number} i_service_id
         **/
        _printNumber: function(i_service_id, name){
            var self = this;
            var $printDiag = $(Elements.PRINT_DIAG);
            //var div = document.getElementById("printerDiv");
            var p = function(){
                $('body').append('<h2></h2>')
            }
            var arg = BB.lib.base64Encode(i_service_id + ':_:' + name)
            $printDiag.html('<iframe src="print.html?serviceId=' + arg + '" onload="this.contentWindow.print();"></iframe>');

            // $printDiag.find('h1').text('your number is ' + i_service_id);
            // $printDiag.find('h3').text('created on ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
            // var divContents = $(Elements.PRINT_DIAG).html();
            // var printWindow = window.open('', '', 'height=250,width=450');
            // printWindow.document.write('<html><head><title>' + self.model.get('name') + '</title>');
            // printWindow.document.write('</head><body><center>');
            // printWindow.document.write(divContents);
            // printWindow.document.write('</center></body></html>');
            // printWindow.document.close();
            // printWindow.print();
        },

        /**
         Create URL string to load customer terminal UI for FasterQ queue generation
         @method _buildURL
         @return {String} URL
         **/
        _buildURL: function () {
            var self = this;
            var data = {
                line_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('line_id'),
                business_id: BB.comBroker.getService(BB.SERVICES.FQ_LINE_MODEL).get('business_id'),
                call_type: 'QR'
            };
            data = $.base64.encode(JSON.stringify(data));
            return self.m_base_url + data;
        }
    });

    return FQCustomerTerminal;

});

