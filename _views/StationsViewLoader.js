/**
 StationsViewLoader  StackView navigation
 @class StationsViewLoader
 @constructor
 @return {Object} instantiated StationsViewLoader
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var StationsViewLoader = Backbone.View.extend({

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

        /**
         If the StationListView was already instantiated, let it know it is now out of view
         @method _unrender
         **/
        _unrender: function () {
            var self = this;
            if (self.m_stationsListView)
                self.m_stationsListView.unrender();
        }
    });

    return StationsViewLoader;
});

