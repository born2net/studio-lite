/**
 Settings Backbone > View
 @class FQLinePropView
 @constructor
 @return {Object} instantiated FQLinePropView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FQLinePropView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_selectedLineID = undefined;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel('#' + self.el.id);
            self._listenOpenCustomerTerminal();
            self._listenInputNameChange();
            self._listenInputReminderChange();
        },

        /**
         Listen to open customer terminal
         @method _listenOpenCustomerTerminal
         **/
        _listenOpenCustomerTerminal: function () {
            var self = this;
            $(Elements.OPEN_FASTERQ_CUSTOMER_TERMINAL).on('click', function (e) {
                var data = {
                    call_type: 'CUSTOMER_TERMINAL',
                    business_id: BB.Pepper.getUserData().businessID,
                    line_id: self.m_selectedLineID,
                    line_name: self.collection.get(self.m_selectedLineID).get('name')
                };
                data = $.base64.encode(JSON.stringify(data));
                var url = BB.CONSTS.BASE_URL + '?mode=customerTerminal&param=' + data;
                window.open(url, '_blank');
            });
        },

        /**
         Listen to changes in Line item reminder minutes value
         @method _listenInputReminderChange server:updateLine
         @return none
         **/
        _listenInputReminderChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                var text = $(e.target).val();
                if (_.isUndefined(self.m_selectedLineID))
                    return;
                var model = self.collection.get(self.m_selectedLineID);
                model.set('reminder', text);
                model.save({}, {
                    success: function (model, response) {
                    },
                    error: function () {
                        log('error delete failed');
                    }
                });

            }, 400);
            $(Elements.FQ_REMINDER_LINE).on("input", onChange);
        },

        /**
         Listen to changes in Line item rename value
         @method _listenInputNameChange server:updateLine
         @return none
         **/
        _listenInputNameChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                var text = $(e.target).val();
                if (_.isUndefined(self.m_selectedLineID))
                    return;
                var model = self.collection.get(self.m_selectedLineID);
                model.set('name', text);
                model.save({}, {
                    success: function (model, response) {
                    },
                    error: function () {
                        log('error delete failed');
                    }
                });

            }, 400);
            $(Elements.SELECTED_LINE_NAME).on("input", onChange);
        },

        /**
         Populate the properties UI on line selected
         @method lineSelected
         @param {Number} i_lineID
         **/
        lineSelected: function (i_lineID) {
            var self = this;
            self.m_selectedLineID = i_lineID;
            self.m_property.viewPanel(Elements.FASTERQ_LINE_PROPERTIES);
            $(Elements.SELECTED_LINE_NAME).val(self.collection.get(self.m_selectedLineID).get('name'));
            $(Elements.FQ_REMINDER_LINE).val(self.collection.get(self.m_selectedLineID).get('reminder'));
        }
    });

    return FQLinePropView;
});

