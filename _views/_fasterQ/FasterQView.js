/**
 Settings Backbone > View
 @class FasterQView
 @constructor
 @return {Object} instantiated FasterQView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    var FasterQView = Backbone.View.extend({

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
            require(['FasterQNavigationView', 'FasterQManagerView', 'FasterQCreatorView'], function (FasterQNavigationView, FasterQManagerView, FasterQCreatorView) {

                self.m_stackView = new StackView.Fader({duration: 333});

                self.m_fasterQNavigationView = new FasterQNavigationView({el: Elements.FASTERQ_NAVIGATION_CONTAINER, stackView: self.m_stackView});

                self.m_fasterQManagerView = new FasterQManagerView({
                    el: Elements.FASTERQ_MANAGER_CONTAINER,
                    stackView: self.m_stackView
                });

                self.m_fasterQCreatorView = new FasterQCreatorView({
                    el: Elements.FASTERQ_CREATOR_CONTAINER,
                    stackView: self.m_stackView
                });

                self.m_stackView.addView(self.m_fasterQNavigationView);
                self.m_stackView.addView(self.m_fasterQManagerView);
                self.m_stackView.addView(self.m_fasterQCreatorView);
                self.m_stackView.selectView(self.m_fasterQNavigationView);


            });
        }
    });

    return FasterQView;
});

