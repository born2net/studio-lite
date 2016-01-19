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
     Upgrade to Enterprise voew
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

            $(Elements.CLASS_START_UPGRADE).on('click', () => {
                self.validateAndUpgrade();
                return false;
            });
        }

        validateAndUpgrade() {
            let errors = [];
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
                setTimeout((e) => {
                    bootbox.hideAll();
                }, 2000);

            }

        }

    }
    return UpgradeView;

});