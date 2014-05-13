/**
 ScenesToolbarView Backbone > View
 @class ScenesToolbarView
 @constructor
 @return {Object} instantiated ScenesToolbarView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     event fires when block is selected
     @event Block.BLOCK_SELECTED
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.LOAD_SCENE = 'LOAD_SCENE';

    var ScenesToolbarView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SCENE_TOOLBAR_VIEW'], self);
            self.m_stackFaderView = BB.comBroker.getService(BB.SERVICES['SCENE_FADER_VIEW']);
            self.m_selectedSceneID = undefined;
            self._render();
            self._listenSceneSelection();
            self._listenAddNew();
        },

        /**
         Draw UI
         @method _render
         **/
        _render: function () {
            var self = this;
            self._populateSceneSelection();
        },

        /**
         Listen to user selection of existing scene
         @method _listenSceneSelection
         **/
        _listenSceneSelection: function () {
            var self = this;
            $(Elements.CLASS_SELECT_SCENE_DROPDOWN, self.el).on('click', function (e) {
                var selectedSceneID = $(e.target).data('scene_player_data_id');
                var scenenames = BB.Pepper.getSceneNames();
                _.forEach(scenenames, function (i_name, i_id) {
                    if (selectedSceneID == i_id) {
                        self._loadScene(i_name, i_id)
                    }
                });
            });
        },

        /**
         Listen to user selection of existing scene
         @method _listenAddNew
         **/
        _listenAddNew: function () {
            var self = this;
            $(Elements.CLASS_SCENE_ADD_NEW, self.el).on('click', function (e) {
                switch ($(e.target).attr('name')){
                    case 'component': {
                        self.m_stackFaderView.selectView(Elements.SCENE_ADD_NEW_BLOCK);
                        // self.m_stackFaderView.selectView(Elements.ADD_BLOCK_VIEW);
                        break;
                    }
                    case 'scene': {
                        break;
                    }
                }
            });
        },


        /**
         Load a selected Scene
         @method _loadScene
         @param {String} i_name
         @param {String} i_id
         **/
        _loadScene: function (i_name, i_id) {
            self.m_selectedSceneID = i_id;
            $(Elements.SCENE_SELECTED_NAME).val(i_name);
            BB.comBroker.fire(BB.EVENTS.LOAD_SCENE, this, null, i_id);
        },

        /**
         Populate dropdown UI of all available scenes
         @method _listenSceneSelection
         **/
        _populateSceneSelection: function () {
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (i_name, i_id) {
                var snippet = '<li><a data-scene_player_data_id="' + i_id + '" href="#">' + i_name + '</a></li>';
                $(Elements.SCENE_SELECT_LIST).append(snippet);
            });
        }
    });

    return ScenesToolbarView;
});

