/**
 Widget to display live editor of label / input
 Will fire LIVE_INPUT_CHANGED on data changed and also will fire a custom event
 if one was give via options.customEvent
 Powered by the awesome validator: https://github.com/chriso/validator.js
 @class LiveInput
 @constructor
 @return {object} instantiated LiveInput
 **/
define(['jquery', 'backbone', 'validator'], function ($, Backbone, validator) {

    var LiveInput = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;
            self.m_validator = validator;
            self.m_validationRules = {};
            self.LIVE_INPUT_CHANGED = 'LIVE_INPUT_CHANGED';
            self.LIVE_INPUT_VALID_ERROR = 'LIVE_INPUT_VALID_ERROR';
            self.m_options = options;
            self.m_prevValue = self.m_options.value;
            var snippet = '<div>';
            snippet += '        <h5 class="liveInput" data-toggle="popover" data-placement="auto right" data-trigger="manual" data-content="">' + self.m_options.value + '</h5>';
            snippet += '        <a class="liveInputLink"><i style="color: gray" class="fa fa-pencil"></i></a>';
            snippet += '        <input class="liveInputRename" type="text" data-localize="' + self.m_options.dataLocalize + '" placeholder="' + self.m_options.placeHolder + '" value="">';
            snippet += '   </div>';

            self.$el.append(snippet);
            self.m_value = 0;
            self.m_liveRename = self.$('.liveInput');
            self.m_liveRenameInput = self.$('.liveInputRename');
            self._listenRename();
            self._extendValidator();
        },

        /**
         Adding our own validation rules
         @method _extendValidator
         @return {Boolean} pass or fail
         **/
        _extendValidator: function () {
            var self = this;
            validator.extend('noEmpty', function (str) {
                return !(_.isUndefined(str) || _.isNull(str) || str.trim().length === 0)
            });
            validator.extend('isNumberInRange', function (str, opts) {
                str = Number(str);
                if (_.isNaN(str))
                    return false;
                if (str < opts.min || str > opts.max)
                    return false;
                return true;
            });
        },

        /**
         Listen to up button increasing meters
         @method _listenUp
         **/
        _listenRename: function () {
            var self = this;
            self.m_faIcon = self.$el.find('i');
            self.$el.on('mousedown mouseup', function (e) {
                // if mouse up, just give focus to control
                if (e.type == "mouseup") {
                    self.m_liveRenameInput.focus();
                    return;
                }
                // already in edit mode, return since blur will kick next
                if (!self.m_faIcon.hasClass('fa-pencil'))
                    return;

                // on entering edit mode
                self.m_liveRenameInput.show();
                self.m_liveRename.hide();
                self.m_faIcon.removeClass('fa-pencil').addClass('fa-check');
                var value = self.m_liveRename.text();
                self.m_liveRenameInput.prop('value', value);

                // on entering view mode
                self.m_liveRenameInput.one('blur', function (e) {
                    var value = self.m_liveRenameInput.prop('value');
                    self.m_faIcon.removeClass('fa-check').addClass('fa-pencil');
                    self.m_liveRename.text(value);
                    self.m_liveRenameInput.toggle();
                    self.m_liveRename.toggle();
                    self.setValue(value, true, true);
                });
            });
        },

        /**
         Validate against all the given rules per instance
         @method _validated
         @param {Number} i_value
         @return {Array} status of array of error messages
         **/
        _validated: function (i_value) {
            var self = this;
            var errors = [];
            _.forEach(self.m_validationRules, function (rule, v) {
                var func = rule[0];
                var err = rule[1];
                var opts = rule[2];
                var value = i_value;
                if (func)
                    if (func(value, opts) == false)
                        errors.push(err);
            });

            if (errors.length > 0) {
                self.trigger(self.LIVE_INPUT_VALID_ERROR, errors);
                self.m_liveRename.attr('data-content', errors[0]);
                //self.m_liveRename.attr('data-content', 'hello world');
                self.m_liveRename.popover('show');
                setTimeout(function () {
                    self.m_liveRename.popover('hide');
                }, 3000);
            }
            return errors;
        },

        /**
         Return the validator object so caller can reference the isXXX functions as validation rules
         @method getValidator
         @return {Object} validator object
         **/
        getValidator: function () {
            var self = this;
            return self.m_validator;
        },

        /**
         Enable validation via config object
         @method rules
         @param {Object} the config objects uses a AND rule and so ALL rules must match for no error message to display.
         if any error we return it in the array of errors.
         **/
        rules: function (i_validationRules) {
            var self = this;
            self.m_validationRules = i_validationRules;
        },

        /**
         Get current input value
         @method getValue
         @return {String} value
         **/
        getValue: function () {
            return self.m_prevValue;
        },

        /**
         Set value and announce the change
         only announce if set to true
         @method _listenUp
         @params {String} i_value
         @params {Boolean} i_announce
         @params {Boolean} i_ignoreValidation
         **/
        setValue: function (i_value, i_announce, i_validate) {
            var self = this;
            if (i_value == self.m_prevValue)
                return;
            var edata = {
                value: i_value,
                preValue: self.m_prevValue,
                el: self.m_options.el
            };

            // check for validation errors
            if (i_validate) {
                var errors = self._validated(i_value);
                if (errors.length > 0) {
                    self.m_liveRename.text(self.m_prevValue);
                    return errors;
                }
            }

            self.m_prevValue = i_value;
            self.m_liveRename.text(i_value);

            if (!i_announce)
                return;
            self.trigger(self.LIVE_INPUT_CHANGED, edata);
            if (self.m_options.customEvent)
                BB.comBroker.fire(self.m_options.customEvent, self, self, edata);
        }
    });

    return LiveInput;
});

