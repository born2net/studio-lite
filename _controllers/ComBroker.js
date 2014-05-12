/**
 The ComBroker is lite weight event bus that can be used inside MV* frameworks and offer services for the application.
 Services provided include registration and query of data members, registration and query of
 instances (often registered instances are service providers themselves) and a central location
 for binding and triggering of events.
 @class ComBroker
 @constructor
 @return {Object} instantiated ComBroker
 @example
 <pre>
 Backbone.comBroker = new ComBroker.bus();
 Backbone.comBroker.setService('me',function(i_var){
                 alert('I am a service ' + i_var)});
 var g = com.getService('me');
 g("hello again");
 $(com).bind('change',function(e){
                 alert('pop ' +e);
             });
 $(Backbone.comBroker).triggerHandler('change');
 example: Backbone.comBroker.fire(loginManager.LOGINBUTTON, this, '#loginButton', "hellow world" );
 example: Backbone.comBroker.listen(loginManager.AUTHENITCATING,loginManager.LOGINBUTTON,function(e){});
 </pre>
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    Backbone.EVENTS = Backbone.EVENTS ? Backbone.EVENTS : {};
    Backbone.EVENTS.SERVICE_REGISTERED = 'SERVICE_REGISTERED';

    var ComBroker = Backbone.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            this.m_services = [];
            Backbone.EVENTS.SERVICE_REGISTERED = 'SERVICE_REGISTERED'
        },

        /**
         Register a data member that others can query.
         @method setValue
         @param {String} i_name
         @param {Object} i_value
         @param {Event} i_fireEvent
         @return none
         **/
        setValue: function (i_name, i_value, i_fireEvent) {
            this.m_services[i_name] = i_value;
            if (i_fireEvent)
                this.fire(i_name, this, null, {edata: i_value})
        },

        /**
         Get a registered data member.
         @method getValue
         @param {String} i_name
         @return {Object} m_services member
         **/
        getValue: function (i_name) {
            if (this.m_services[i_name]) {
                return this.m_services[i_name]
            } else {
                return undefined;
            }
        },

        /**
         Register a service  that others can query.
         @method setService
         @param {String} i_name
         @param {Object} i_service
         @return none
         **/
        setService: function (i_name, i_service) {
            this.m_services[i_name] = i_service;
            this.fire(Backbone.EVENTS['SERVICE_REGISTERED'], this, null, {name: i_name, service: i_service})
        },

        /**
         Get a registered service.
         @method getService
         @param {String} i_name
         @return {Object} m_services member
         **/
        getService: function (i_name) {
            if (i_name == undefined) {
                log('cant get set undefined service ' + i_name);
                return undefined;
            }
            if (this.m_services[i_name]) {
                return this.m_services[i_name]
            } else {
                return undefined;
            }
        },

        /**
         Expose all services and data members.
         @method getAllServices
         @return {Object} m_services
         **/
        getAllServices: function () {
            return this.m_services;
        },

        /**
         Clear all current registered services
         @method clearServices
         **/
        clearServices: function () {
            var self = this;
            // delete self.m_services;
            self.m_services = undefined;
        },

        /**
         Trigger an event within the context of the CommBroker thus reducing DOM capture / bubble.
         @method fire
         @param {Event} i_event
         @param {Event} i_context
         @param {Event} i_caller
         @param {Event} i_data
         @return none
         **/
        fire: function (i_event, i_context, i_caller, i_data) {
            $(this).trigger(this.event(i_event, i_context, i_caller, i_data));
        },

        /**
         Listen to events within the context of the CommBroker thus reducing DOM capture / bubble.
         Once the even is triggered func will get called back.
         @method listen
         @param {Event} events
         @param {Function} func
         @return none
         **/
        listen: function (events, func) {
            if (arguments.length > 2) {
                var totalArgs = Number([arguments.length - 1]);
                var events = $(arguments).splice(0, totalArgs);
                var func = arguments[totalArgs]

                for (var i = 0; i < events.length; i++) {
                    events[i] = "'" + events[i] + "'";
                }
                events = events.join(',');
                return $(this).bind(eval(events), func);
            } else {
                return $(this).bind(events, func);
            }
        },

        /**
         Listen to events within the context of the CommBroker thus reducing DOM capture / bubble.
         However we only listen within the namespace of a unique context id so we can remove it
         later for a specific listener instance.
         @method listenWithNamespace
         @param {Event} events
         @param {Object} caller
         @param {Function} call back
         @return none
         **/
        listenWithNamespace: function (event, caller, func) {
            if (caller.eventNamespace == undefined)
                caller.eventNamespace = _.uniqueId();
            var namespacEvent = event + '.' + caller.eventNamespace;
            $(this).bind(namespacEvent, func);
        },

        /**
         Stop listening to an event but only within the context of a specific listener instance.
         @method stopListenWithNamespace
         @param {String} event
         @param {Function} func
         @return none
         **/
        stopListenWithNamespace: function (event, caller) {
            var namespacEvent = event + '.' + caller.eventNamespace;
            $(this).unbind(namespacEvent);
        },

        /**
         Listen only once to an event and unbind.
         Once the event is triggered func will get called back.
         @method listenOnce
         @param {Event} events
         @param {Function} func
         @return none
         **/
        listenOnce: function (events, func) {
            $(this).one(events, func);
        },

        /**
         Stop listening to an event.
         @method stopListen
         @param {Event} events
         @param {Function} func
         @return none
         **/
        stopListen: function (events, func) {
            if (func == false) {
                $(this).unbind(events);
            } else {
                $(this).unbind(events, func);
            }
        },

        /**
         The jQuery.Event constructor is exposed and can be used when calling trigger. The new operator is optional.
         @method event
         @param {Event} i_event
         @param {Object} i_context
         @param {Object} i_caller
         @param {Object} i_data
         @return none.
         **/
        event: function (i_event, i_context, i_caller, i_data) {
            return $.Event(i_event, {context: i_context, caller: i_caller, edata: i_data});
        }
    });

    return ComBroker;
});


