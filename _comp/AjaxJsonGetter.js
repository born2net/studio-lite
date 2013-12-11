/**
 An ajax wrapper for json calls that support automatic serialization on remote i/o
 @class AjaxJsonGetter
 @constructor
 @param {string} url to load
 @return {object} instantiated AjaxJsonGetter
 @example
 Args:
 getData:
 var data = {
 '@functionName':'f_getCustomerInfo',
 '@key': commBroker.getValue('key'),
 '#text':'null'
 }
 **/

function AjaxJsonGetter(i_url) {
    this.m_url = i_url;
};

AjaxJsonGetter.prototype = {
    constructor: AjaxJsonGetter,

    /**
     Get the data from specified server url and callback on server reply
     @method getData
     @param {object} i_obj data to send to server
     @param {function} i_callBack on data back from server
     @param {object} i_context pass back i_context on callback to preserve 'this'
     @return {object} AjaxJsonGetter instantiated
     **/
    getData: function (i_obj, i_callBack, i_context) {

        for (v in i_obj) {
            i_obj[v] = cleanChar(i_obj[v]);
        }

        var ajax = commBroker.getService('ajax');

        var key = commBroker.getValue('key');
        if (!key)
            key = '';

        var jData = {
            'dynaWebsApplication': {
                '@version': '1.1',
                '@method': "reply",
                'authenticate': {
                    '@domainName': 'hobbycom',
                    '@key': key,
                    '#text': ''
                },
                'xmlFunction': i_obj
            }
        }

        var xData = json2xml(jData, '\n\t');

        ajax.getData(
            {data: xData},
            this.m_url,
            i_callBack,
            'json',
            i_context
        );
    },

    abortAll: function () {
    }

};
