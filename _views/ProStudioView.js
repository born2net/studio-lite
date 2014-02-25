/**
 ProStudio Backbone > View
 @class ProStudioView
 @constructor
 @return {Object} instantiated ProStudioView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ProStudioView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._wireUI();
        },

        _wireUI:function () {
            var self = this;
            $(Elements.CONVERT_ACCOUNT).on('click',function(){
                window.open('http://galaxy.mediasignage.com/WebService/signagestudio.aspx?mode=login&v=4&eri=f7bee07a7e79c8efdb961c4d30d20e10c66442110de03d6141', '_blank');
            });

            $(Elements.SUBSCRIBE_ACCOUNT).on('click',function(){
                window.open('http://www.digitalsignage.com/_html/signup.html', '_blank');
            });
        }
    });



    return ProStudioView;
});

