/**
 Resources view StackView for navigation selection
 @class ResourcesLoaderView
 @constructor
 @return {Object} instantiated ResourcesLoaderView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ResourcesLoaderView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    self._render();
                } else {
                    self._unrender();
                }
            });
        },

        /**
         Create the StationListView singleton instance if it does not exist, if it does
         we notify it that it is in view now
         @method _render
         **/
        _render: function () {
            var self = this;
            if (!self.m_resourceListView) {
                require(['ResourceListView'], function (ResourceListView) {
                    self.m_resourceListView = new ResourceListView({
                        el: Elements.RESOURCES_LIST_VIEW
                    });
                });
            } else {
                self.m_resourceListView.render();
            }
        },

        /**
         If the StationListView was already instantiated, let it know it is now out of view
         @method _unrender
         **/
        _unrender: function () {
            var self = this;
            if (self.m_resourceListView)
                self.m_resourceListView.unrender();
        }
    });

    return ResourcesLoaderView;
});

