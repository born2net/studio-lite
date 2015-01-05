/**
 Settings Backbone > View
 @class FQManagerView
 @constructor
 @return {Object} instantiated FQManagerView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var FQManagerView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_fqCreatorView = BB.comBroker.getService(BB.SERVICES.FQCREATORVIEW);
            $(Elements.FASTERQ_MANAGER_BACK).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_CREATOR_CONTAINER);
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_rendered)
                    self._render();
            });
        },

        _render: function(){
            var self = this;
            self.m_selectedLine = self.m_fqCreatorView.getSelectedLine();
            log(self.m_selectedLine);
        }

    });

    return FQManagerView;
});

