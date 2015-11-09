///<reference path="./typings/lite/app_references.d.ts" />

/**
 Application global declarations for BB framework and TypeScript assistance
 @class BB.Declarations
 @constructor
 @return {Object} instantiated Declarations
 **/
module BB {

    //declare var BB:Backbone.Model;
    export var comBroker:ComBroker;
    export var lib:any;
    export var SERVICES:any;
    export var CONSTS:any;
    export var Pepper: any;
    export var PepperHelper:any;
}

//declare var bootbox;
declare var platform;
declare var videojs;

// example of declaring a type alias
declare type bootBox = any;
declare var bootbox: bootBox;