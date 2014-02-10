/**
 StationsView  StackView navigation
 @class StationsView
 @constructor
 @return {Object} instantiated StationsView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var StationsView = Backbone.View.extend({

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
         Init the ResourceList View
         @method _render
         **/
        _render: function () {
            var self = this;
            if (!self.m_stationsListView) {
                require(['StationsListView'], function (StationsListView) {
                    self.m_stationsListView = new StationsListView({
                        el: Elements.STATION_LIST_VIEW
                    });
                });
            } else {
                self.m_stationsListView.render();
            }
        },

        _unrender: function () {
            var self = this;
            if (self.m_stationsListView)
                self.m_stationsListView.unrender();
        }
    });

    return StationsView;
});

