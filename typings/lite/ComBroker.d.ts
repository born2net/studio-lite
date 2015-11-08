///<reference path="../jquery/jquery.d.ts" />
///<reference path="../backbone/backbone.d.ts" />

interface ComBroker {
    getFramework(): Backbone.Model;
    setValue(i_name, i_value, i_fireEvent);
    getValue (i_name);
    getFramework();
    setService(i_name, i_service);
    getService(i_name);
    getAllServices();
    clearServices();
    fire(i_event, i_context?, i_caller?, i_data?);
    listen(events, func);
    listenWithNamespace(event, caller, func);
    stopListenWithNamespace(event, caller);
    listenOnce(events, func);
    stopListen(events, func);
}

declare module "ComBroker" {
    export = ComBroker;
}

//declare var jQuery: JQueryStatic;
//declare var $: JQueryStatic;
