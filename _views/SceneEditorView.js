/**
 Scene Editor Backbone view
 @class SceneEditorView
 @constructor
 @return {object} instantiated SceneEditorView
 **/
define(['jquery', 'backbone', 'StackView','BlockRSS'], function ($, Backbone, StackView, BlockRSS) {

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

            $(this.el).find('#prev').on('click', function (e) {
                self._deSelectView();
                return false;
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._render();
            });
        },

        _render: function () {
            var self = this;
            BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
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
            self.m_canvasID = _.uniqueId('screenLayoutEditorCanvas');
            if (self.m_canvas==undefined){
                $('#screenLayoutEditorCanvasWrap').append('<canvas id="' + self.m_canvasID + '" width="' + i_width + 'px" height="' + i_height + 'px" style="border: 1px solid rgb(170, 170, 170);"></canvas>')
                self.m_canvas = new fabric.Canvas(self.m_canvasID);
            }

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

            self.m_canvas.on('object:selected', function() {
                console.log('object on canvas selected a rectangle');
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

            rect.on('selected', function() {
                console.log('object selected a rectangle');
            });

            _.extend(blockRSS, rect);
            blockRSS.listenSceneSelection(self.m_canvas);
            self.m_canvas.add(blockRSS);

            function onChange(options) {
                options.target.setCoords();
                self.m_canvas.forEachObject(function(obj) {
                    if (obj === options.target) return;
                    obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
                });
            }

            setTimeout(function () {
                if (!self.m_canvas)
                    return;
                self.m_canvas.setHeight(i_height);
                self.m_canvas.setWidth(i_width);
                self.m_canvas.renderAll();
            }, 500);
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

