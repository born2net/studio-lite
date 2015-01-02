/**
 Application router for FQ terminal applications
 well as management for sizing events
 @class FQTerminalController
 @constructor
 @return {Object} instantiated AppRouter
 **/
define(['underscore', 'jquery', 'backbone', 'XDate', 'StackView', 'FQCustomerTerminal', 'FQRemoteStatus', 'LineModel'], function (_, $, Backbone, XDate, StackView, FQCustomerTerminal, FQRemoteStatus, LineModel) {

    BB.SERVICES.FQ_TERMINAL_ROUTER = 'FQ_TERMINAL_ROUTER';
    BB.SERVICES.FQ_LINE_MODEL = 'FQ_LINE_MODEL';

    var FQTerminalController = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES.FQ_TERMINAL_ROUTER, self);
            BB.comBroker.setService('XDATE', new XDate());
            $(window).trigger('resize');
            self._initTerminal(self.options.app);
        },

        /**
         Init user terminal view
         @method _initUserTerminal
         **/
        _initTerminal: function (i_app) {
            var self = this;
            var param = $.base64.decode(self.options.param).split(':');
            self.m_lineModel = new LineModel({
                business_id: param[0],
                line_id: param[1],
                type: param[2],
                email: param[3]
            });
            BB.comBroker.setService(BB.SERVICES.FQ_LINE_MODEL, self.m_lineModel);

            switch (i_app){
                case BB.CONSTS.APP_CUSTOMER_TERMINAL: {
                    self._loadCustomerTerminalApp();
                    break;
                }
                case BB.CONSTS.APP_REMOTE_STATUS: {
                    self._loadRemoteStatusApp();
                    break;
                }
            }

        },
        /**
         Fetch Line model from server and instantiate Remote Status view on success
         @method _loadRemoteStatus
         **/
        _loadRemoteStatusApp: function () {
            var self = this;

            // fetch with extra parameters
            self.m_lineModel.fetch({
                data: {
                    businessID: self.m_lineModel.get('business_id')
                },
                success: (function (model, data) {
                    //self.m_lineModel.set('business_id', self.m_lineModel.get('business_id'));
                    self.m_fqRemoteStatusView = new FQRemoteStatus({
                        el: Elements.FQ_REMOTE_STATUS,
                        model: self.m_lineModel
                    });
                    self.m_stackView = new StackView.Fader({duration: 333});
                    self.m_stackView.addView(self.m_fqRemoteStatusView);
                    self.m_stackView.selectView(self.m_fqRemoteStatusView);
                }),
                error: (function (e) {
                    log('Service request failure: ' + e);
                }),
                complete: (function (e) {
                })
            });
        },

        /**
         Fetch Line model from server and instantiate Terminal view on success
         @method _loadCustomerTerminalApp
         **/
        _loadCustomerTerminalApp: function () {
            var self = this;

            // fetch with extra parameters
            self.m_lineModel.fetch({
                data: {
                    businessID: self.m_lineModel.get('business_id')
                },
                success: (function (model, data) {
                    self.m_fasterQCustomerTerminalView = new FQCustomerTerminal({
                        el: Elements.FQ_CUSTOMER_TERMINAL,
                        model: self.m_lineModel
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

    return FQTerminalController;
});