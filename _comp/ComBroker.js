/*/////////////////////////////////////////////
 ComBrokder

 var com = new ComBroker();
 com.setService('me',function(i_var){
 alert('I am a service ' + i_var)});
 var g = com.getService('me');
 g("hello again");
 $(com).bind('change',function(e){
 alert('pop ' +e);
 });
 $(com).triggerHandler('change');

 example: commBroker.fire(loginManager.LOGINBUTTON, this, '#loginButton', "hellow world" );
 example: commBroker.listen(loginManager.AUTHENITCATING,loginManager.LOGINBUTTON,function(e){});
 /////////////////////////////////////////////*/

function ComBroker() {
    this.m_services = [];
};

ComBroker.prototype = {
    constructor: ComBroker,

    setValue: function (i_name, i_value, i_fireEvent) {
        this.m_services[i_name] = i_value;
        if (i_fireEvent)
            this.fire(i_name, this, null, {edata: i_value})
    },

    getValue: function (i_name) {
        if (this.m_services[i_name]) {
            return this.m_services[i_name]
        } else {
            return undefined;
        }
    },

    setService: function (i_name, i_service) {
        this.m_services[i_name] = i_service;

    },

    getService: function (i_name) {
        if (this.m_services[i_name]) {
            return this.m_services[i_name]
        } else {
            return undefined;
        }
    },

    getAllServices: function () {
        return this.m_services;
    },


    fire: function (i_event, i_context, i_caller, i_data) {
        $(this).trigger(this.event(i_event, i_context, i_caller, i_data));
    },

    listen: function (events, func) {
        if (arguments.length > 2) {
            var totalArgs = Number([arguments.length - 1]);
            var events = $(arguments).splice(0, totalArgs);
            var func = arguments[totalArgs]

            for (var i = 0; i < events.length; i++) {
                events[i] = "'" + events[i] + "'";
            }
            events = events.join(',');
            $(this).bind(eval(events), func);

        } else {

            $(this).bind(events, func);
        }

    },

    listenOnce: function (events, func) {
        $(this).one(events, func);
    },

    stopListen: function (events, func) {
        $(this).unbind(events, func);
    },

    event: function (i_event, i_context, i_caller, i_data) {
        return $.Event(i_event, {context: i_context, caller: i_caller, edata: i_data});
    }


};

