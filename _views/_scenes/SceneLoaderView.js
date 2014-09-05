/**
 SceneLoaderView Backbone > View
 @class SceneLoaderView
 @constructor
 @return {Object} instantiated SceneLoaderView
 **/
define(['jquery', 'backbone', 'SceneSelectionView'], function ($, Backbone, SceneSelectionView) {

    BB.SERVICES.SCENES_LOADER_VIEW = 'SceneLoaderView';

    var SceneLoaderView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._listenResourceRemoved();
            BB.comBroker.setService(BB.SERVICES['SCENES_LOADER_VIEW'], self);
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self && !self.m_sceneEditorView) {
                    self._render();
                }
            });
        },

        /**
         Listen to when a resource is removed, and delete it from matching scenes
         @method _listenResourceRemoved
         **/
        _listenResourceRemoved: function(){
            var self = this;
            BB.comBroker.listen(BB.EVENTS.REMOVED_RESOURCE, function(e){
                pepper.removeAllScenePlayersWithResource(e.edata);
                var sceneEditView = BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']);
                if (!_.isUndefined(sceneEditView)){
                    var selectedSceneID = sceneEditView.getSelectedSceneID();
                    BB.comBroker.fire(BB.EVENTS.LOAD_SCENE, this, null, selectedSceneID);
                }
            });
        },

        /**
         Draw UI settings (singleton event) including station poll slider and load corresponding modules
         @method _render
         **/
        _render: function () {
            var self = this;
            require(['SceneSliderView', 'SceneEditorView', 'ScenesToolbarView', 'StackView', 'AddBlockView'], function (SceneSliderView, SceneEditorView, ScenesToolbarView, StackView, AddBlockView) {

                self.m_sceneSliderView = new SceneSliderView({
                    el: Elements.SCENES_PANEL
                });

                self.m_sceneSelector = new SceneSelectionView({
                    stackView: self.m_sceneSliderView,
                    el: Elements.SCENE_SELECTOR,
                    to: Elements.SCENE_ADD_NEW_BLOCK
                });


                self.m_sceneAddBlockView = new AddBlockView({
                    stackView: self.m_sceneSliderView,
                    from: Elements.SCENE_SLIDER_VIEW,
                    el: Elements.SCENE_ADD_NEW_BLOCK,
                    placement: BB.CONSTS.PLACEMENT_SCENE
                });

                self.m_sceneEditorView = new SceneEditorView({
                    stackView: self.m_sceneSliderView,
                    el: Elements.SCENE_SLIDER_VIEW
                });

                self.m_sceneSliderView.addView(self.m_sceneSelector);
                self.m_sceneSliderView.addView(self.m_sceneEditorView);
                self.m_sceneSliderView.addView(self.m_sceneAddBlockView);
                self.m_sceneSliderView.selectView(self.m_sceneSelector);
            });
        }
    });

    return SceneLoaderView;
});

