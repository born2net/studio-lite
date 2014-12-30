/**
 Application router for FasterQ terminal applications
 well as management for sizing events
 @class fasterQTerminalRouter
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'XDate', 'StackView', 'FasterQCustomerTerminal'], function (_, $, Backbone, XDate, StackView, FasterQCustomerTerminal) {

    BB.SERVICES.FASTERQ_TERMINAL_ROUTER = 'FASTERQ_TERMINAL_ROUTER';

    var fasterQTerminalRouter = BB.Controller.extend({

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

        _initUserTerminal: function () {
            var self = this;

            self.m_stackView = new StackView.Fader({duration: 333});

            self.m_fasterQCustomerTerminalView = new FasterQCustomerTerminal({
                el: Elements.FASTERQ_CUSTOMER_TERMINAL//,
                //stackView: self.m_stackView
            });

            self.m_stackView.addView(self.m_fasterQCustomerTerminalView);
            self.m_stackView.selectView(self.m_fasterQCustomerTerminalView);

        }
    });

    return fasterQTerminalRouter;
});