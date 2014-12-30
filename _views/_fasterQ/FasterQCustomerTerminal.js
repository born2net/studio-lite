/**
 A public terminal for users to collect queue numbers
 @class FasterQCustomerTerminal
 @constructor
 @return {Object} instantiated FasterQCustomerTerminal
 **/
define(['jquery', 'backbone', 'bootbox', 'qrcode'], function ($, Backbone, Bootbox, qrcode) {

    var FasterQCustomerTerminal = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {

            var q = $("#qrcode");
            q = q[0];
            var qrcode = new QRCode(q, {
                width: 200,
                height: 200
            });
            qrcode.makeCode('mediasignage.com');
        }
    });

    return FasterQCustomerTerminal;

});

