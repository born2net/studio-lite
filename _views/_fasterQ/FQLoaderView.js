/**
 Settings Backbone > View
 @class FQLoaderView
 @constructor
 @return {Object} instantiated FQLoaderView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var FQLoaderView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SETTINGS_VIEW'], self);
            self.m_simpleStorage = undefined;
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_rendered) {
                    self.m_rendered = true;
                    self._render();
                }
            });
        },

        _render: function () {
            var self = this;
            require(['FQNavigationView', 'FQManagerView', 'FQCreatorView'], function (FQNavigationView, FQManagerView, FQCreatorView) {

                self.m_stackView = new StackView.Fader({duration: 333});

                self.m_fasterQNavigationView = new FQNavigationView({el: Elements.FASTERQ_NAVIGATION_CONTAINER, stackView: self.m_stackView});

                self.m_fasterQCreatorView = new FQCreatorView({
                    el: Elements.FASTERQ_CREATOR_CONTAINER,
                    stackView: self.m_stackView
                });

                self.m_fasterQManagerView = new FQManagerView({
                    el: Elements.FASTERQ_MANAGER_CONTAINER,
                    stackView: self.m_stackView
                });

                self.m_stackView.addView(self.m_fasterQNavigationView);
                self.m_stackView.addView(self.m_fasterQManagerView);
                self.m_stackView.addView(self.m_fasterQCreatorView);
                self.m_stackView.selectView(self.m_fasterQCreatorView);
                // self.m_stackView.selectView(self.m_fasterQNavigationView);


            });
        }
    });

    return FQLoaderView;
});

