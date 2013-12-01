
/*/////////////////////////////////////////////
 AjaxJsonGetter

 Args:
 getData:
 var data = {
 '@functionName':'f_getCustomerInfo',
 '@key': commBroker.getValue('key'),
 '#text':'null'
 } i_callBack: function
 /////////////////////////////////////////////*/

function AjaxJsonGetter(i_url) {
    this.m_url = i_url;
};


AjaxJsonGetter.prototype = {
    constructor: AjaxJsonGetter,

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
                '@version': '1.0',
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
