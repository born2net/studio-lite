/**
 Application router for FQ terminal applications
 well as management for sizing events
 @class fasterQTerminalController
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'XDate', 'StackView', 'FQCustomerTerminal', 'LineModel'], function (_, $, Backbone, XDate, StackView, FQCustomerTerminal, LineModel) {

    BB.SERVICES.FASTERQ_TERMINAL_ROUTER = 'FASTERQ_TERMINAL_ROUTER';

    var fasterQTerminalController = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['FASTERQ_TERMINAL_ROUTER'], self);
            BB.comBroker.setService('XDATE', new XDate());
            $(window).trigger('resize');
            self._initUserTerminal();
        },

        /**
         Init user terminal view
         @method _initUserTerminal
         **/
        _initUserTerminal: function () {
            var self = this;
            var param = $.base64.decode(self.options.param).split(':');
            self._fetchLineModel(param[0], param[1]);
        },

        /**
         Fetch Line model from server and instantiate Terminal view on success
         @method _fetchLineModel
         @param {Number} i_businessID
         @param {Number} i_lineID
         **/
        _fetchLineModel: function(i_businessID, i_lineID){
            var self = this;
            self.m_terminalModel = new LineModel({
                line_id: i_lineID
            });

            self.m_terminalModel.fetch({
                data: {
                    businessID: i_businessID
                },
                success: (function (model, data) {
                    self.m_fasterQCustomerTerminalView = new FQCustomerTerminal({
                        el: Elements.FASTERQ_CUSTOMER_TERMINAL,
                        model: self.m_terminalModel
                    });
                    self.m_stackView = new StackView.Fader({duration: 333});
                    self.m_stackView.addView(self.m_fasterQCustomerTerminalView);
                    self.m_stackView.selectView(self.m_fasterQCustomerTerminalView);

                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        }
    });

    return fasterQTerminalController;
});