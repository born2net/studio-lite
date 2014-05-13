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
                return;
                self.m_sceneStackFaderView = new SceneFaderView({
                    el: Elements.SCENE_STACKFADER_VIEW,
                    duration: 500
                });

                self.m_sceneAddBlockView = new AddBlockView({
                    stackView: self.m_sceneStackFaderView,
                    el: Elements.SCENE_ADD_NEW_BLOCK
                    // appendTo: // el: Elements.ADD_BLOCK_VIEW
                });

                self.m_sceneEditorView = new SceneEditorView({
                    el: Elements.SCENE_PANEL_WRAP
                });

                //self.m_sceneAddBlockView = new Backbone.View({
                //   el: Elements.SCENE_ADD_NEW_BLOCK
                //});

                self.m_sceneStackFaderView.addView(self.m_sceneEditorView)
                self.m_sceneStackFaderView.addView(self.m_sceneAddBlockView)
                self.m_sceneStackFaderView.selectView(self.m_sceneEditorView);
            });
        }
    });

    return ScenesLoaderView;
});

