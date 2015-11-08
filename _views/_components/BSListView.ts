///<reference path="../../typings/lite/app_references.d.ts" />

/** sample interface **/

module BSListView {
    export interface IBSList {
        isAcceptable(s:string):void
        isNotAcceptable(s:string):void
    }
}

define(['jquery'], function ($) {

    class BSListView implements BSListView.IBSList {

        private m_options:any;
        constructor(options?:any) {
            this.m_options = options;
        }

        public isAcceptable(s:string):void {
            BB.lib.log(s);
        }

        public isNotAcceptable(s:string):void {
            BB.lib.log(s);
        }

        initialize() {
            var self = this;
        }

    }
    return BSListView;

});