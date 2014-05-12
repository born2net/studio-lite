/**
 Scene Editor Backbone view
 @class SceneEditorView
 @constructor
 @return {object} instantiated SceneEditorView
 **/
define(['jquery', 'backbone', 'fabric', 'BlockScene', 'BlockRSS', 'ScenesToolbarView'], function ($, Backbone, fabric, BlockScene, BlockRSS, ScenesToolbarView) {

    BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW = 'SceneEditorView';

    var ScenesEditView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SCENE_EDIT_VIEW'], self);
            self.m_selectedSceneID = undefined;
            self.m_canvas = undefined;
            self.m_properties = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
            self.m_scenesToolbarView = new ScenesToolbarView({el: Elements.SCENE_TOOLBAR});

            pepper.createScenePlayersIDs();
            self._initializeBlockFactory();
            self._listenSceneSelected();
        },

        _initializeBlockFactory: function () {
            var self = this;
            self.m_blockFactory = BB.comBroker.getService(BB.SERVICES['BLOCK_FACTORY']);

            if (self.m_blockFactory) {
                $(Elements.SCENE_TOOLBAR).fadeTo(500,1);
            } else {
                BB.comBroker.listenOnce(BB.EVENTS['BLOCKS_LOADED'], function () {
                    $(Elements.SCENE_TOOLBAR).fadeTo(500,1);
                });
                require(['BlockFactory'], function (BlockFactory) {
                    self.m_blockFactory = new BlockFactory();
                    self.m_blockFactory.loadBlockModules();
                    $('#sceneToolbar').fadeIn();
                });
            }
        },

        _initializeCanvas: function (w, h) {
            var self = this;
            var canvasID = BB.lib.unhash(Elements.SCENE_CANVAS);
            $(Elements.SCENE_CANVAS_CONTAINER).empty();
            $(Elements.SCENE_CANVAS_CONTAINER).append('<canvas id="' + canvasID + '" width="' + w + 'px" height="' + h + 'px"/>');
            self.m_canvas = new fabric.Canvas(canvasID);

            self._listenObjectChanged();
            self.m_canvas.on('object:selected', function (e) {
                log('object: ' + e.target.m_blockType);
            });

            // scene selected
            self.m_canvas.on('mouse:up', function (options) {
                var active = self.m_canvas.getActiveObject();
                var group = self.m_canvas.getActiveGroup();

                // Group
                if (group) {
                    log('group selected')
                    return;
                }

                // Object
                if (options.target || active) {
                    var selectedObject = options.target || active;
                    log('object: ' + selectedObject.m_blockType);
                    var blockID = selectedObject.getBlockData().blockID;
                    BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
                    return;
                }

                // Scene
                log('scene: ' + self.m_canvas.m_blockType);
                BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.m_selectedSceneID);
                // log('object ' + options.e.clientX + ' ' + options.e.clientY + ' ' + options.target.m_blockType);

            });
        },

        _initializeScene: function () {
            var self = this;
            var scene_player_data = pepper.getScenePlayerData(self.m_selectedSceneID);
            self.m_sceneBlock = self.m_blockFactory.createBlock(self.m_selectedSceneID, scene_player_data, BB.CONSTS.PLACEMENT_IS_SCENE);
            _.extend(self.m_canvas, self.m_sceneBlock);
            // self._render();
        },

        _listenSceneSelected: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.LOAD_SCENE, function (e) {
                self.m_selectedSceneID = e.edata;
                var domPlayerData = pepper.getSceneBlockPlayerdata(self.m_selectedSceneID);
                self._clearCanvas();
                self._initializeCanvas(640, 400);
                self._initializeScene(self.m_selectedSceneID);
                self._render(domPlayerData);
            });
        },

        _clearCanvas: function () {
            var self = this;
            if (!self.m_canvas)
                return;
            _.each(self.m_canvas.getObjects(), function (obj) {
                self.m_canvas.dispose(obj);
            });
        },

        _render: function (i_domPlayerData) {
            var self = this;
            var players = $(i_domPlayerData).find('Players').find('Player').each(function (i, player) {
                var blockID = $(player).attr('id');
                self._createBlocksSamples(blockID, self.m_selectedSceneID);
            });
            // $('.sceneElements').fadeIn();
        },

        _createBlocksSamples: function (i_blockID) {
            var self = this;
            var rect = new fabric.Rect({
                left: 60,
                top: 10,
                fill: '#ececec',
                hasRotatingPoint: false,
                width: 200,
                borderColor: '#5d5d5d',
                stroke: 'black',
                strokeWidth: 1,
                lineWidth: 1,
                height: 20,
                cornerColor: 'black',
                cornerSize: 5,
                lockRotation: true,
                transparentCorners: false
            });

            var player_data = BB.PepperHelper.getBlockBoilerplate('3345').getDefaultPlayerData();
            var blockRSS = self.m_blockFactory.createBlock(i_blockID, player_data, BB.CONSTS.PLACEMENT_SCENE, self.m_selectedSceneID);
            _.extend(blockRSS, rect);
            blockRSS.listenSceneSelection(self.m_canvas);
            self.m_canvas.add(blockRSS);
        },

        /**
         Listen to changes in a viewer changes in cords and update pepper
         @method i_props
         **/
        _listenObjectChanged: function () {
            var self = this;
            self.m_objectMovingHandler = _.debounce(function (e) {
                var o = e.target;
                if (o.width != o.currentWidth || o.height != o.currentHeight) {
                    o.width = o.currentWidth;
                    o.height = o.currentHeight;
                    o.scaleX = 1;
                    o.scaleY = 1;
                }
                self.m_canvas.renderAll();
            });

            self.m_canvas.on({
                'object:moving': self.m_objectMovingHandler,
                'object:scaling': self.m_objectMovingHandler,
                'object:selected': self.m_objectMovingHandler,
                'object:modified': self.m_objectMovingHandler
            });
        },

        /**
         @method _blockSelected
         @param {Event} e
         **/
        _blockSelected: function (i_selected_block_id) {
            var self = this;
            self.selected_block_id = i_selected_block_id;
            BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.selected_block_id);
            $(Elements.CLASS_CHANNEL_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
            return false;
        },

        /**
         When all block modules have loaded, begin creating blocks
         @method _onBlocksLoaded
         **/
        _onBlocksLoaded: function () {
            var self = this;
            // self._render();
            self._listenObjectChanged();
            // $(Elements.SCENE_CANVAS).fadeTo(333,1)
        }


    });

    return ScenesEditView;
});




















/*
 rect = new fabric.Rect({
 left: 60,
 top: 10,
 fill: '#ececec',
 hasRotatingPoint: false,
 width: 20,
 borderColor: '#5d5d5d',
 stroke: 'black',
 strokeWidth: 1,
 lineWidth: 1,
 height: 20,
 cornerColor: 'black',
 cornerSize: 5,
 lockRotation: true,
 transparentCorners: false
 });

 var blockRSS;
 blockRSS = new BlockRSS({
 i_placement: BB.CONSTS['PLACEMENT_SCENE'],
 i_block_id: 0
 });

 rect.on('selected', function () {
 console.log('object selected a rectangle');
 });

 self.m_canvas.on('object:selected', function (e) {
 console.log('object on canvas selected a rectangle');
 self._blockSelected(e.target.m_block_id);
 });

 _.extend(blockRSS, rect);
 self.m_canvas.add(blockRSS);
 self.m_canvas.renderAll();
 */



// BB.comBroker.listenOnce(BB.EVENTS.BLOCKS_LOADED, $.proxy(self._onBlocksLoaded, self));
/* var sceneBlock = new BlockScene({
 i_placement: BB.CONSTS.PLACEMENT_IS_SCENE,
 i_block_id: -1,
 blockType: 3510
 }); */

// self.m_canvas._loadBlockSpecificProps();

/*

 _canvasFactory: function (i_width, i_height) {
 var self = this;
 // self.m_canvasID = _.uniqueId('screenLayoutEditorCanvas');
 // if (self.m_canvas==undefined){
 //     $('#screenLayoutEditorCanvasWrap').append('<canvas id="' + self.m_canvasID + '" width="' + i_width + 'px" height="' + i_height + 'px" style="border: 1px solid rgb(170, 170, 170);"></canvas>')
 //     self.m_canvas = new fabric.Canvas(self.m_canvasID);
 // }

 var rect;

 rect = new fabric.Rect({
 left: 60,
 top: 10,
 fill: '#ececec',
 hasRotatingPoint: false,
 width: 20,
 borderColor: '#5d5d5d',
 stroke: 'black',
 strokeWidth: 1,
 lineWidth: 1,
 height: 20,
 cornerColor: 'black',
 cornerSize: 5,
 lockRotation: true,
 transparentCorners: false
 });

 var blockRSS;
 blockRSS = new BlockRSS({
 i_placement: BB.CONSTS['PLACEMENT_SCENE'],
 i_block_id: 10000
 });

 rect.on('selected', function () {
 console.log('object selected a rectangle');
 });

 self.m_canvas.on('object:selected', function (e) {
 console.log('object on canvas selected a rectangle');
 self._blockSelected(e.target.m_block_id);
 });

 _.extend(blockRSS, rect);
 blockRSS.listenSceneSelection(self.m_canvas);
 self.m_canvas.add(blockRSS);

 self.m_canvas.on({
 'object:moving': onChange,
 'object:scaling': onChange,
 'object:rotating': onChange
 });


 rect = new fabric.Rect({
 left: 160,
 top: 60,
 fill: '#ececec',
 hasRotatingPoint: false,
 width: 20,
 borderColor: '#5d5d5d',
 stroke: 'green',
 strokeWidth: 1,
 lineWidth: 1,
 height: 20,
 cornerColor: 'black',
 cornerSize: 5,
 lockRotation: true,
 transparentCorners: false
 });

 blockRSS = new BlockRSS({
 i_placement: BB.CONSTS['PLACEMENT_SCENE'],
 i_block_id: 20000
 });

 rect.on('selected', function (e) {
 console.log('object selected a rectangle');
 });

 _.extend(blockRSS, rect);
 blockRSS.listenSceneSelection(self.m_canvas);
 self.m_canvas.add(blockRSS);
 //todo: delete rect after we extend into blockRSS

 function onChange(options) {
 options.target.setCoords();
 self.m_canvas.forEachObject(function (obj) {
 if (obj === options.target) return;
 obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
 });
 }


 //setTimeout(function () {
 //if (!self.m_canvas)
 //return;
 //self.m_canvas.setHeight(i_height);
 //self.m_canvas.setWidth(i_width);
 //self.m_canvas.renderAll();
 //}, 500);


 },

 */


/*
 self.m_canvas.on({
 'object:moving': onChange,
 'object:scaling': onChange,
 'object:rotating': onChange
 });
 */

/*
 blockRSS.listenSceneSelection(self.m_canvas);
 self.m_canvas.add(blockRSS);

 function onChange(options) {
 options.target.setCoords();
 self.m_canvas.forEachObject(function (obj) {
 if (obj === options.target) return;
 obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
 });
 }
 */

/*
_renderOld: function () {
    var self = this;
    self.m_canvas = new fabric.Canvas(BB.lib.unhash(Elements.SCENE_CANVAS));

    var rect = new fabric.Rect({
     left: 60,
     top: 10,
     fill: '#ececec',
     hasRotatingPoint: false,
     width: 20,
     borderColor: '#5d5d5d',
     stroke : 'black',
     strokeWidth : 1,
     lineWidth: 1,
     height: 20,
     cornerColor: 'black',
     cornerSize: 5,
     lockRotation: true,
     transparentCorners: false
     });

     self.m_canvas.add(rect);
     self.m_canvas.renderAll();

    self._canvasFactory(1, 1);
},

 */


/*
 Unload the editor from DOM using the StackView animated slider
 @method  selectView

_deSelectView: function () {
    var self = this;
    self.m_canvas.clear().renderAll();
    $('#screenLayoutEditorCanvasWrap').empty()
    self.m_canvasID = undefined;
    self.m_canvas = undefined;
    self.options.stackView.slideToPage(self.options.from, 'left');
},
 */


/*
 Load the editor into DOM using the StackView using animation slider
 @method  selectView

 selectView: function () {
            var self = this;
            self.options.stackView.slideToPage(self, 'right');
            require(['fabric'], function () {
                self._canvasFactory(_.random(200, 500), _.random(200, 500))
            })
        }
 */