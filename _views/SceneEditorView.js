/**
 Scene Editor Backbone view
 @class SceneEditorView
 @constructor
 @return {object} instantiated SceneEditorView
 **/
define(['jquery', 'backbone', 'fabric', 'BlockRSS'], function ($, Backbone, fabric, BlockRSS) {

    BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW = 'SceneEditorView';

    var SceneEditorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SCREEN_LAYOUT_EDITOR_VIEW'], self);
            self.m_canvas = undefined;
            self.m_canvasID = undefined;
            self.m_properties = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
            self.m_blockFactory = BB.comBroker.getService(BB.SERVICES['BLOCK_FACTORY']);
            BB.comBroker.listenOnce(BB.EVENTS.BLOCKS_LOADED, $.proxy(self._onBlocksLoaded, self));
            self.m_blockFactory.loadBlockModules();
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
            self._render();
            self._listenObjectChanged();
            // $(Elements.SCENE_CANVAS).fadeTo(333,1)
        },

        _render: function () {
            var self = this;
            self.m_canvas = new fabric.Canvas(BB.lib.unhash(Elements.SCENE_CANVAS));

            /*var rect = new fabric.Rect({
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
            */
            self._canvasFactory(1,1);
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
         Unload the editor from DOM using the StackView animated slider
         @method  selectView
         **/
        _deSelectView: function () {
            var self = this;
            self.m_canvas.clear().renderAll();
            $('#screenLayoutEditorCanvasWrap').empty()
            self.m_canvasID = undefined;
            self.m_canvas = undefined;
            self.options.stackView.slideToPage(self.options.from, 'left');
        },

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
                stroke : 'black',
                strokeWidth : 1,
                lineWidth: 1,
                height: 20,
                cornerColor: 'black',
                cornerSize: 5,
                lockRotation: true,
                transparentCorners: false
            });

            var blockRSS;
            blockRSS = new BlockRSS({
                i_placement: 'PLACEMENT_SCENE',
                i_block_id: 10000
            });

            rect.on('selected', function() {
                console.log('object selected a rectangle');
            });

            self.m_canvas.on('object:selected', function(e) {
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
                stroke : 'green',
                strokeWidth : 1,
                lineWidth: 1,
                height: 20,
                cornerColor: 'black',
                cornerSize: 5,
                lockRotation: true,
                transparentCorners: false
            });

            blockRSS = new BlockRSS({
                i_placement: 'PLACEMENT_SCENE',
                i_block_id: 20000
            });

            rect.on('selected', function(e) {
                console.log('object selected a rectangle');
            });

            _.extend(blockRSS, rect);
            blockRSS.listenSceneSelection(self.m_canvas);
            self.m_canvas.add(blockRSS);
            //todo: delete rect after we extend into blockRSS

            function onChange(options) {
                options.target.setCoords();
                self.m_canvas.forEachObject(function(obj) {
                    if (obj === options.target) return;
                    obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
                });
            }
            /*
            setTimeout(function () {
                if (!self.m_canvas)
                    return;
                self.m_canvas.setHeight(i_height);
                self.m_canvas.setWidth(i_width);
                self.m_canvas.renderAll();
            }, 500);
            */
        },

        /**
         Load the editor into DOM using the StackView using animation slider
         @method  selectView
         **/
        selectView: function () {
            var self = this;
            self.options.stackView.slideToPage(self, 'right');
            require(['fabric'], function () {
                self._canvasFactory(_.random(200, 500), _.random(200, 500))
            })
        }
    });

    return SceneEditorView;
});


