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
     Upgrade to Enterprise view
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
            $(Elements.CLASS_START_UPGRADE).on('click', function (e) {
                self.validateAndUpgrade();
                e.stopImmediatePropagation();
                return false;
            });
        };
        UpgradeView.prototype.detectCardType = function (number) {
            var re = {
                electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
                maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
                dankort: /^(5019)\d+$/,
                interpayment: /^(636)\d+$/,
                unionpay: /^(62|88)\d+$/,
                visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
                mastercard: /^5[1-5][0-9]{14}$/,
                amex: /^3[47][0-9]{13}$/,
                diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                jcb: /^(?:2131|1800|35\d{3})\d{11}$/
            };
            if (re.electron.test(number)) {
                return 'ELECTRON';
            }
            else if (re.maestro.test(number)) {
                return 'MAESTRO';
            }
            else if (re.dankort.test(number)) {
                return 'DANKORT';
            }
            else if (re.interpayment.test(number)) {
                return 'INTERPAYMENT';
            }
            else if (re.unionpay.test(number)) {
                return 'UNIONPAY';
            }
            else if (re.visa.test(number)) {
                return 'VISA';
            }
            else if (re.mastercard.test(number)) {
                return 'MASTERCARD';
            }
            else if (re.amex.test(number)) {
                return 'AMEX';
            }
            else if (re.diners.test(number)) {
                return 'DINERS';
            }
            else if (re.discover.test(number)) {
                return 'DISCOVER';
            }
            else if (re.jcb.test(number)) {
                return 'JCB';
            }
            else {
                return undefined;
            }
        };
        UpgradeView.prototype.showMessage = function (i_title, i_msg, i_status) {
            bootbox.hideAll();
            bootbox.dialog({
                closeButton: true,
                title: i_title,
                message: "<br/><br/><br/>\n                                <center>\n                                " + (i_status == true ? '<i style="color: green; font-size: 4em; padding:30px" class="fa fa-thumbs-up"></i>'
                    : '<i style="color: red; font-size: 4em; padding: 30px" class="fa fa-thumbs-down"></i>') + "\n                                    <h4>" + i_msg + "</h4>\n                                </center>\n                              <br/><br/><br/>\n                               "
            });
        };
        UpgradeView.prototype.validateAndUpgrade = function () {
            var self = this;
            var errors = [];
            var resellerName = $(Elements.UPG_USERNAME).val();
            var resellerPass = $(Elements.UPG_PASS).val();
            var resellerPass2 = $(Elements.UPG_PASS2).val();
            var userName = BB.Pepper.getUserData().userName;
            var userPass = BB.Pepper.getUserData().userPass;
            var credit = $(Elements.UPG_CREDIT).val();
            var card = self.detectCardType(credit);
            var cv = $(Elements.UPG_CV).val();
            var year = $(Elements.UPG_YEAR).val().length == 2 ? '20' + $(Elements.UPG_YEAR).val() : $(Elements.UPG_YEAR).val();
            var month = $(Elements.UPG_MONTH).val().replace(/^0+/, '');
            switch (card) {
                case 'VISA':
                    {
                        card = '0';
                        break;
                    }
                case 'MASTERCARD':
                    {
                        card = '1';
                        break;
                    }
                case 'DISCOVER':
                    {
                        card = '2';
                        break;
                    }
                case 'AMEX':
                    {
                        card = '3';
                        break;
                    }
                default:
                    {
                        card = '-1';
                    }
            }
            if (resellerName.length < 4)
                errors.push('Enterprise user name is invalid');
            if (card == '-1')
                errors.push('Credit card type not supported');
            if (!validator.isCreditCard(credit))
                errors.push('Credit card number is invalid');
            if (!validator.isInt(cv))
                errors.push('Credit card security code is invalid');
            if (!validator.isInt(year))
                errors.push('Credit card year is invalid');
            if (!validator.isInt(month))
                errors.push('credit card month is invalid, must be a number like 1 for Jan');
            if (resellerPass.length < 4 || resellerPass != resellerPass2)
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
                var url = "https://galaxy.signage.me/WebService/UpgradeToResellerAccount.ashx?userName=" + userName + "&userPassword=" + userPass + "&resellerUserName=" + resellerName + "&resellerPassword=" + resellerPass + "&cardType=" + card + "&cardNumber=" + credit + "&expirationMonth=" + month + "&expirationYear=" + year + "&securityCode=" + cv + "&callback=?";
                $.getJSON(url, function (e) {
                    var msg = '';
                    console.log('Credit card status ' + e.result);
                    switch (e.result) {
                        case -4:
                            {
                                msg = 'This user is already under a subscription account';
                                self.showMessage(e.status, msg, false);
                                return;
                            }
                        case -5:
                            {
                                msg = 'Enterprise use name is taken, please pick a different name';
                                self.showMessage(e.status, msg, false);
                                return;
                            }
                        case -3:
                            {
                            }
                        case -2:
                            {
                            }
                        case -1:
                            {
                                msg = 'Problem with credit card, please use a different card';
                                self.showMessage(e.status, msg, false);
                                return;
                            }
                        default:
                            {
                                if (e.result > 100) {
                                    bootbox.hideAll();
                                    $('.modal').modal('hide');
                                    //var snippet = `Congratulations, be sure to checkout the <a href="http://www.digitalsignage.com/_html/video_tutorials.html?videoNumber=liteUpgrade" target="_blank">video tutorial</a> on how to install your newly available components from the mediaSTORE`;
                                    var snippet = "Congratulations, be sure to go to the mediaSTORE and install your newly available components...";
                                    self.showMessage('success', snippet, true);
                                    return;
                                }
                                else {
                                    msg = 'Problem with credit card, please use a different card';
                                    self.showMessage(e.status, msg, false);
                                }
                            }
                    }
                })
                    .done(function (e) {
                })
                    .fail(function (e) {
                    self.showMessage(e.status, 'Could not complete, something went wrong on server side', false);
                })
                    .always(function () {
                });
            }
        };
        return UpgradeView;
    }(Backbone.View));
    return UpgradeView;
});
