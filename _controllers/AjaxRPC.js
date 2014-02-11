/**
 Super Ajax class with support for queue
 @class AjaxRPC
 @constructor
 @return {Object} instantiated AjaxRPC
 @example
 ------------------------------------------
 FOR XML:

 To send XML Data use the following method/data:

 SEND:
 this.ajax.getData(
 {userName: self.userName,userPass: self.userPass},
 'http://my.server.com', 'onReply', 'xml', this
 );

 RECEIVE:
 var xmlDoc = data.response;
 var resultTag = $(xmlDoc).find( "result" );
 var status = $(resultTag).attr("status");
 ------------------------------------------
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.EVENTS.AJAX_ERROR = 'AJAX_ERROR';

    var AjaxRPC = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this.m_timeout = 15000;
            this.m_abort = false;
            this.m_ajax = '';
            this.m_queue = $({});
        },

        abortAll: function(){
            this.m_abort = true;
            // this.m_ajax.abort();
        },

        resumeAll: function(){
            this.m_abort = false;
        },

        getData : function(i_data, i_url, i_callback, i_type, i_context){
            var self = this;
            if (self.m_abort)
                return;

            self.m_ajax = self.ajaxQueue({
                url: i_url,
                data: i_data,
                context: i_context,
                cache: false,
                timeout: self.m_timeout
            }, i_callback, i_type)
        },

        ajaxQueue: function( i_ajaxOpts, i_callBack, i_type) {

            var self = this;
            self.ajaxOpts = i_ajaxOpts;
            var jqXHR,
                dfd = $.Deferred(),
                promise = dfd.promise();

            function doRequest( next ) {
                jqXHR = $.ajax( i_ajaxOpts );
                jqXHR.done( dfd.resolve ).fail( dfd.reject ).then( next, next);
            }

            dfd.always(function(i_data){
                if (self.m_abort)
                    return;

                if (!self.checkReplyStatus(jqXHR.status))
                    return;

                switch (i_type){
                    case 'xml': {
                        i_callBack({
                            textStatus: jqXHR.statusText,
                            status: jqXHR.status,
                            context: this,
                            response: $.parseXML(i_data)
                            // response: StringtoXML(i_data)

                        });
                        break;
                    }
                    case 'json': {

                        var jData;

                        try {
                            jData = eval("(" + i_data + ")");
                        } catch (e) {
                            BB.comBroker.fire(BB.EVENTS.AJAX_ERROR);
                            return;
                        }

                        i_callBack({
                            textStatus: jqXHR.statusText,
                            status: jqXHR.status,
                            context: this,
                            responce: jData
                        });
                        break;
                    }

                    default: {
                        i_callBack({
                            textStatus: jqXHR.statusText,
                            status: jqXHR.status,
                            context: this,
                            response: i_data
                        });
                    }
                }
            });

            //dfd.done(...
            //dfd.fail(...

            // queue our ajax request
            // log('adding to queue ' + self.getQueueSize() );

            self.m_queue.queue( doRequest );

            // add the abort method
            promise.abort = function( statusText ) {
                var self = this.self;
                // console.log('aborted');
                // proxy abort to the jqXHR if it is active
                if ( jqXHR ) {
                    return jqXHR.abort( statusText );
                }

                // if there wasn't already a jqXHR we need to remove from queue
                var queue = self.m_queue.queue(),
                    index = $.inArray( doRequest, queue );

                if ( index > -1 ) {
                    queue.splice( index, 1 );
                }

                // and then reject the deferred
                dfd.rejectWith( self.ajaxOpts.context || self.ajaxOpts, [ promise, statusText, "" ] );
                return promise;
            };

            return promise;
        },

        getQueueSize: function(){
            var self = this;
            var a = self.m_queue[0];
            for (var b in a){
                var c = a[b];
                return c['fxqueue'].length;
            }
            return 0;
        },

        checkReplyStatus: function(status){

            var msg = '';
            switch (String(status)){
                case '200': {return true; break}
                case '0':   {msg="server reply timed out, please try again soon"; break}
                case '408': {msg="server reply timed out, please try again soon"; break}
                case '400': {msg="bad request to server, please try again soon"; break}
                case '404': {msg="file missing on server, please try again soon"; break}
                default:    {msg="problem with server, please try again soon"; break;}

            }
            BB.comBroker.fire(BB.EVENTS.AJAX_ERROR, this);
            return false;
        }
    });

    return AjaxRPC;

});