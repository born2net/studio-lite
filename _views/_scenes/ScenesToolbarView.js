/**
 ScenesToolbarView Backbone > View
 @class ScenesToolbarView
 @constructor
 @return {Object} instantiated ScenesToolbarView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     Indicates the scene canvas was selected
     @property BB.CONSTS.SCENE_CANVAS_SELECTED
     @static
     @final
     @type String
     */
    BB.CONSTS.SCENE_CANVAS_SELECTED = 'SCENE_CANVAS_SELECTED';

    /**
     events
     **/
    BB.EVENTS.SCENE_LIST_UPDATED = 'SCENE_LIST_UPDATED';
    BB.EVENTS.SCENE_BLOCK_LIST_UPDATED = 'SCENE_BLOCK_LIST_UPDATED';
    BB.EVENTS.SCENE_ITEM_SELECTED = 'SCENE_ITEM_SELECTED';
    BB.EVENTS.LOAD_SCENE = 'LOAD_SCENE';
    BB.EVENTS.SCENE_ZOOM_IN = 'SCENE_ZOOM_IN';
    BB.EVENTS.SCENE_ZOOM_OUT = 'SCENE_ZOOM_OUT';
    BB.EVENTS.SCENE_ZOOM_RESET = 'SCENE_ZOOM_RESET';
    BB.EVENTS.SCENE_PUSH_TOP = 'SCENE_PUSH_TOP';
    BB.EVENTS.SCENE_PUSH_BOTTOM = 'SCENE_PUSH_BOTTOM';
    BB.EVENTS.SCENE_EDITOR_REMOVE = 'SCENE_EDITOR_REMOVE';
    BB.EVENTS.SCENE_ITEM_REMOVE = 'SCENE_ITEM_REMOVE';
    BB.EVENTS.NEW_SCENE = 'NEW_SCENE';

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
            self._listenSceneItemSelection();
            self._listenSceneDimensionsChanged();
            self._listenSceneRenamed();
            self._listenAddNew();
            self._listenRemoves();
            self._listenZoom();
            self._listenPushToTop();
            self._listenPushToBottom();
            self._listenSceneBlockList();
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
         Listen to changes in the block list within a scene (canvas) and update the dropdown selection dialog
         @method _listenSceneBlockList
         **/
        _listenSceneBlockList: function () {
            BB.comBroker.listen(BB.EVENTS.SCENE_BLOCK_LIST_UPDATED, function (e) {
                var blocks = e.edata;
                $(Elements.SCENE_BLOCK_LIST).empty();
                if (blocks != null) {
                    var snippet = '<li><a data-block_id="' + BB.CONSTS.SCENE_CANVAS_SELECTED + '" href="#">Canvas</a></li>';
                    $(Elements.SCENE_BLOCK_LIST).append(snippet);
                }
                _.forEach(blocks, function (i_block) {
                    var snippet = '<li><a data-block_id="' + i_block.id + '" href="#">' + i_block.name + '</a></li>';
                    $(Elements.SCENE_BLOCK_LIST).append(snippet);
                });
            });
        },

        /**
         Listen to re-order of screen division, putting selected on top
         @method _listenPushToTop
         **/
        _listenPushToTop: function () {
            var self = this;
            $(Elements.SCENE_EDITOR_PUSH_TOP, self.$el).on('click', function () {
                BB.comBroker.fire(BB.EVENTS.SCENE_PUSH_TOP);
            });
        },

        /**
         Listen to re-order of screen division, putting selected at bottom
         @method _listenPushToBottom
         **/
        _listenPushToBottom: function () {
            var self = this;
            $(Elements.SCENE_EDITOR_PUSH_BOTTOM, self.$el).on('click', function () {
                BB.comBroker.fire(BB.EVENTS.SCENE_PUSH_BOTTOM);
            });
        },

        /**
         Listen to all zoom events via wiring the UI
         @method _listenZoom
         **/
        _listenZoom: function () {
            var self = this;
            $(Elements.SCENE_ZOOM_IN).on('click', function (e) {
                BB.comBroker.fire(BB.EVENTS.SCENE_ZOOM_IN);
            });
            $(Elements.SCENE_ZOOM_OUT).on('click', function (e) {
                BB.comBroker.fire(BB.EVENTS.SCENE_ZOOM_OUT);
            });
            $(Elements.SCENE_ZOOM_RESET).on('click', function (e) {
                BB.comBroker.fire(BB.EVENTS.SCENE_ZOOM_RESET);
            });
        },

        /**
         Listen to changes in scene name
         @method _listenSceneRenamed
         **/
        _listenSceneRenamed: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_LIST_UPDATED, function (e) {
                self._populateSceneSelection();
            });
        },

        /**
         Populate dropdown UI of all available scenes
         @method _populateSceneSelection
         **/
        _populateSceneSelection: function () {
            $(Elements.SCENE_SELECT_LIST).empty();
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (i_name, i_id) {
                var snippet = '<li><a data-scene_player_data_id="' + i_id + '" href="#">' + i_name + '</a></li>';
                $(Elements.SCENE_SELECT_LIST).append(snippet);
            });
        },

        /**
         Listen to user selection of existing scene
         @method _listenSceneSelection
         **/
        _listenSceneSelection: function () {
            var self = this;
            $(Elements.CLASS_SELECT_SCENE_DROPDOWN, self.el).on('click', function (e) {
                var id = $(e.target).data('scene_player_data_id');
                self._loadScene(id);
            });
        },

        /**
         Listen to user selection a scene block / item
         @method _listenSceneItemSelection
         **/
        _listenSceneItemSelection: function () {
            var self = this;
            $(Elements.CLASS_SELECT_SCENE_ITEM_DROPDOWN, self.el).on('click', function (e) {
                var id = $(e.target).data('block_id');
                if (_.isUndefined(id))
                    return;
                BB.comBroker.fire(BB.EVENTS.SCENE_ITEM_SELECTED, this, null, id);
            });
        },

        /**
         Listen to event of scene dimensions changed
         @method _listenSceneDimensionsChanged
         @param {event} e
         **/
        _listenSceneDimensionsChanged: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS['SCENE_BLOCK_DIMENSIONS_CHANGE'], function (e) {
                self._loadScene(e.edata)
            });
        },

        /**
         Listen to user selection of existing scene
         @method _listenAddNew
         **/
        _listenRemoves: function () {
            var self = this;
            $(Elements.CLASS_SCENE_REMOVES, self.el).on('click', function (e) {
                switch ($(e.target).attr('name')) {
                    case 'removeScene':
                    {
                        BB.comBroker.fire(BB.EVENTS.SCENE_EDITOR_REMOVE);
                        break;
                    }
                    case 'removeItem':
                    {
                        BB.comBroker.fire(BB.EVENTS.SCENE_ITEM_REMOVE);
                        break;
                    }
                }
            });
        },

        /**
         Listen to user selection of existing scene
         @method _listenAddNew
         **/
        _listenAddNew: function () {
            var self = this;
            $(Elements.CLASS_SCENE_ADD_NEW, self.el).on('click', function (e) {
                switch ($(e.target).attr('name')) {
                    case 'addItem':
                    {
                        var sceneEditorView = BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']);
                        if (_.isUndefined(sceneEditorView.getSelectedSceneID())) {
                            bootbox.alert({
                                message: $(Elements.MSG_BOOTBOX_MUST_SELECT_SCENE).text()
                            });
                            return;
                        }
                        self.m_stackFaderView.selectView(Elements.SCENE_ADD_NEW_BLOCK);
                        break;
                    }
                    case 'addScene':
                    {
                        BB.comBroker.fire(BB.EVENTS.NEW_SCENE, this, null);
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
        _loadScene: function (i_id) {
            self.m_selectedSceneID = i_id;
            BB.comBroker.fire(BB.EVENTS.LOAD_SCENE, this, null, i_id);
        }
    });

    return ScenesToolbarView;
});

