/**
 ScenesLoaderView Backbone > View
 @class ScenesLoaderView
 @constructor
 @return {Object} instantiated ScenesLoaderView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    BB.SERVICES.SCENES_LOADER_VIEW = 'SCENES_LOADER_VIEW';

    var ScenesLoaderView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            // $(Elements.SCENE_CANVAS).fadeTo(1,0.01)
            BB.comBroker.setService(BB.SERVICES['SCENES_LOADER_VIEW'], self);
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_sceneEditorView) {
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
            require(['SceneFaderView', 'SceneEditorView', 'ScenesToolbarView', 'StackView', 'AddBlockView'], function (SceneFaderView, SceneEditorView, ScenesToolbarView, StackView, AddBlockView) {

                self.m_sceneStackFaderView = new SceneFaderView({
                    el: Elements.SCENE_STACKFADER_VIEW,
                    duration: 500
                });

                self.m_sceneAddBlockView = new AddBlockView({
                    stackView: self.m_sceneStackFaderView,
                    el: Elements.SCENE_ADD_NEW_BLOCK,
                    placement: BB.CONSTS.PLACEMENT_SCENE

                });

                self.m_sceneEditorView = new SceneEditorView({
                    el: Elements.SCENE_PANEL_WRAP
                });

                self.m_sceneStackFaderView.addView(self.m_sceneEditorView)
                self.m_sceneStackFaderView.addView(self.m_sceneAddBlockView)
                self.m_sceneStackFaderView.selectView(self.m_sceneEditorView);
            });
        }
    });

    return ScenesLoaderView;
});

