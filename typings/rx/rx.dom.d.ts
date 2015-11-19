// Type definitions for RxJS-Time v2.2.28
// Project: http://rx.codeplex.com/
// Definitions by: Carl de Billy <http://carl.debilly.net/>, Igor Oleinikov <https://github.com/Igorbek>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="rx.d.ts" />
///<reference path="rx.time-lite.d.ts" />

declare module Rx {
    export module DOM {
        export function ajax(obj:any);
        export function fromEvent(input:any, keyup:string);
        export module Request {
            export function jsonpRequestCold(url:string);
            export function ajax(url:{});
            export function getJSON(url:string);
        }
    }
}

declare module "rx.dom" {
    export = Rx;
}

