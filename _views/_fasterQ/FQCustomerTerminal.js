    /**
 A public terminal for users to collect queue numbers
 @class FQCustomerTerminal
 @constructor
 @return {Object} instantiated FQCustomerTerminal
 **/
define(['jquery', 'backbone', 'bootbox', 'qrcode'], function ($, Backbone, Bootbox, qrcode) {

    var FQCustomerTerminal = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            $(Elements.FASTERQ_LINE_NAME).text(self.model.get('name'));
            self._initQR();
        },

        _initQR: function(){
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

