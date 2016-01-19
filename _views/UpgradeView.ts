///<reference path="../typings/lite/app_references.d.ts" />


//GULP_ABSTRACT_EXTEND extends Backbone.View<Backbone.Model>
//GULP_ABSTRACT_START
declare module TSLiteModules {
    export class UpgradeView extends Backbone.View<Backbone.Model> {
    }
}
//GULP_ABSTRACT_END
define(['jquery', 'validator'], function ($, validator) {

    //BB.SERVICES['UPGRADE_VIEW'] = 'UpgradeView'

    /**
     Upgrade to Enterprise view
     @class UpgradeView
     @constructor
     @return {Object} instantiated UpgradeView
     **/
    class UpgradeView extends Backbone.View<Backbone.Model> {

        private m_options:any;

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;
            this.id = self.m_options.el;
            this.$el = $(this.id);
            this.el = this.$el.get(0);
            //BB.comBroker.setService(BB.SERVICES['UPGRADE_VIEW'], self);

            $(Elements.CLASS_START_UPGRADE).on('click', (e:MouseEvent) => {
                self.validateAndUpgrade();
                e.stopImmediatePropagation();
                return false;
            });
        }

        detectCardType(number) {
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
            } else if (re.maestro.test(number)) {
                return 'MAESTRO';
            } else if (re.dankort.test(number)) {
                return 'DANKORT';
            } else if (re.interpayment.test(number)) {
                return 'INTERPAYMENT';
            } else if (re.unionpay.test(number)) {
                return 'UNIONPAY';
            } else if (re.visa.test(number)) {
                return 'VISA';
            } else if (re.mastercard.test(number)) {
                return 'MASTERCARD';
            } else if (re.amex.test(number)) {
                return 'AMEX';
            } else if (re.diners.test(number)) {
                return 'DINERS';
            } else if (re.discover.test(number)) {
                return 'DISCOVER';
            } else if (re.jcb.test(number)) {
                return 'JCB';
            } else {
                return undefined;
            }
        }

        private showMessage(i_title:string, i_msg:string, i_status:boolean):void {
            bootbox.hideAll();
            bootbox.dialog({
                closeButton: true,
                title: i_title,
                message: `<br/><br/><br/>
                                <center>
                                ${i_status == true ? '<i style="color: green; font-size: 4em; padding:30px" class="fa fa-thumbs-up"></i>'
                    : '<i style="color: red; font-size: 4em; padding: 30px" class="fa fa-thumbs-down"></i>'}
                                    <h4>${i_msg}</h4>
                                </center>
                              <br/><br/><br/>
                               `
            });
        }

        private  validateAndUpgrade() {
            var self = this;
            let errors = [];
            let resellerName = $(Elements.UPG_USERNAME).val();
            let resellerPass = $(Elements.UPG_PASS).val();
            let resellerPass2 = $(Elements.UPG_PASS2).val();
            let userName = BB.Pepper.getUserData().userName;
            let userPass = BB.Pepper.getUserData().userPass;
            let credit = $(Elements.UPG_CREDIT).val();
            let card = self.detectCardType(credit);
            let cv = $(Elements.UPG_CV).val();
            let year = $(Elements.UPG_YEAR).val().length == 2 ? '20' + $(Elements.UPG_YEAR).val() : $(Elements.UPG_YEAR).val();
            let month = $(Elements.UPG_MONTH).val().replace(/^0+/, '');

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
                //if (false) {
            } else {
                bootbox.dialog({
                    closeButton: false,
                    title: "Please wait, validating...",
                    message: `<br/><br/><br/>
                                <center>
                                    <img src="./_assets/preload6.gif"></span>
                                </center>
                              <br/><br/><br/>
                                `
                });

                var url = `https://galaxy.signage.me/WebService/UpgradeToResellerAccount.ashx?userName=${userName}&userPassword=${userPass}&resellerUserName=${resellerName}&resellerPassword=${resellerPass}&cardType=${card}&cardNumber=${credit}&expirationMonth=${month}&expirationYear=${year}&securityCode=${cv}&callback=?`;
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
                                    var snippet = `Congratulations, be sure to go to the mediaSTORE and install your newly available components...`;
                                    self.showMessage('success', snippet, true);
                                    return;
                                } else {
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
        }
    }
    return UpgradeView;
});