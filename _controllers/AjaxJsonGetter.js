/**
 Wrapper for Ajax remote calls
 @class AjaxJsonGetter
 @constructor
 @return {Object} instantiated AjaxJsonGetter
 @example
 var data = {
 '@functionName':'f_getCustomerInfo',
 '@key': BB.comBroker.getValue('key'),
 '#text':'null'
 } i_callBack: function
 **/
define(['jquery', 'backbone', 'AjaxRPC', 'RC4'], function ($, Backbone, AjaxRPC, RC4) {

    BB.SERVICES.AJAXJSONGETTER = 'AjaxJsonGetter';

    var AjaxJsonGetter = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_key = self.options.key;
            self.m_url = self.options.url;
            self.ajax = new AjaxRPC();
        },

        getData: function (i_obj, i_callBack, i_context){
            var self = this;

            var rc4 = new RC4(self.m_key);
            var crumb = pepper.getUserData().userName + ':SignageStudioLite:' + pepper.getUserData().userPass + ':' + ' USER'
            crumb = rc4.doEncrypt(crumb);
            // BB.comBroker.setValue('key', crumb);

            var jData = {
                'dynaWebsApplication':{
                    '@version': '1.1',
                    '@method': "reply",
                    'authenticate':{
                        '@domainName':'hobbycom',
                        '@key': crumb,
                        '#text':''
                    },
                    'xmlFunction':i_obj
                }
            }

            var xData = BB.lib.json2xml(jData,'\n\t');

            self.ajax.getData(
                {data: xData},
                self.m_url,
                i_callBack,
                'json',
                i_context
            );
        },

        abortAll: function(){
        }
    });

    return AjaxJsonGetter;

});