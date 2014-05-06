/**
 ScenesLoaderView Backbone > View
 @class ScenesLoaderView
 @constructor
 @return {Object} instantiated ScenesLoaderView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var ScenesLoaderView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            // $(Elements.SCENE_CANVAS).fadeTo(1,0.01)
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_scenesEditView) {
                    self._render();
                }
            });
        },

        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        _render: function () {
            var self = this;
            require(['ScenesEditView', 'ScenesToolbarView'], function (ScenesEditView) {
                self.m_scenesEditView = new ScenesEditView();
            });
        }
    });

    return ScenesLoaderView;
});

