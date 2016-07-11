///<reference path="../../typings/lite/app_references.d.ts" />

/** sample interface **/

export module BSListView {
    export class MyBSListView {

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
}

