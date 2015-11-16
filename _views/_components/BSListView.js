///<reference path="../../typings/lite/app_references.d.ts" />
define(["require", "exports"], function (require, exports) {
    /** sample interface **/
    var BSListView;
    (function (BSListView) {
        var MyBSListView = (function () {
            function MyBSListView(options) {
                this.m_options = options;
            }
            MyBSListView.prototype.isAcceptable = function (s) {
                BB.lib.log(s);
            };
            MyBSListView.prototype.isNotAcceptable = function (s) {
                BB.lib.log(s);
            };
            MyBSListView.prototype.initialize = function () {
                var self = this;
            };
            return MyBSListView;
        })();
        BSListView.MyBSListView = MyBSListView;
    })(BSListView = exports.BSListView || (exports.BSListView = {}));
});
