///<reference path="../../typings/lite/app_references.d.ts" />
define(['jquery'], function ($) {
    var BSListView = (function () {
        function BSListView(options) {
            this.m_options = options;
        }
        BSListView.prototype.isAcceptable = function (s) {
            BB.lib.log(s);
        };
        BSListView.prototype.isNotAcceptable = function (s) {
            BB.lib.log(s);
        };
        BSListView.prototype.initialize = function () {
            var self = this;
        };
        return BSListView;
    })();
    return BSListView;
});
//# sourceMappingURL=BSListView.js.map