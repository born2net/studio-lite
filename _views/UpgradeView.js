///<reference path="../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'validator'], function ($, validator) {
    //BB.SERVICES['UPGRADE_VIEW'] = 'UpgradeView'
    /**
     Upgrade to Enterprise voew
     @class UpgradeView
     @constructor
     @return {Object} instantiated UpgradeView
     **/
    var UpgradeView = (function (_super) {
        __extends(UpgradeView, _super);
        function UpgradeView(options) {
            this.m_options = options;
            _super.call(this);
        }
        UpgradeView.prototype.initialize = function () {
            var self = this;
            this.id = self.m_options.el;
            this.$el = $(this.id);
            this.el = this.$el.get(0);
            //BB.comBroker.setService(BB.SERVICES['UPGRADE_VIEW'], self);
            $(Elements.CLASS_START_UPGRADE).on('click', function () {
                self.validateAndUpgrade();
                return false;
            });
        };
        UpgradeView.prototype.validateAndUpgrade = function () {
            var errors = [];
            if (!validator.isCreditCard($(Elements.UPG_CREDIT).val()))
                errors.push('credit card number is invalid');
            if ($(Elements.UPG_USERNAME).val().length < 4)
                errors.push('User name is invalid');
            if (!validator.isInt($(Elements.UPG_CV).val()))
                errors.push('credit card security code is invalid');
            if (!validator.isInt($(Elements.UPG_YEAR).val()))
                errors.push('credit card year is invalid');
            if (!validator.isInt($(Elements.UPG_MONTH).val()))
                errors.push('credit card month is invalid');
            if ($(Elements.UPG_YEAR).val().length < 2)
                errors.push('Credit year is invalid');
            if ($(Elements.UPG_PASS).val().length < 4 || $(Elements.UPG_PASS).val() != $(Elements.UPG_PASS2).val())
                errors.push('Password is invalid');
            if (errors.length > 0) {
                bootbox.alert(errors.join('<br/>'));
            }
            else {
                bootbox.dialog({
                    closeButton: false,
                    title: "Please wait, validating...",
                    message: "<br/><br/><br/>\n                                <center>\n                                    <img src=\"./_assets/preload6.gif\"></span>\n                                </center>\n                              <br/><br/><br/>\n                                "
                });
                setTimeout(function (e) {
                    bootbox.hideAll();
                }, 2000);
            }
        };
        return UpgradeView;
    })(Backbone.View);
    return UpgradeView;
});
//# sourceMappingURL=UpgradeView.js.map