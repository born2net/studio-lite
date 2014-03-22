/**
 Screen Layout editor
 @class ScreenLayoutEditorView
 @constructor
 @return {object} instantiated ScreenLayoutEditorView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW = 'ScreenLayoutEditorView';

    var ScreenLayoutEditorView = BB.View.extend({

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
                left: 100,
                top: 100,
                fill: 'red',
                width: 20,
                height: 20,
                cornerColor: 'gray',
                cornerSize: 10,
                transparentCorners: false
            });
            self.m_canvas.add(rect);

            rect = new fabric.Rect({
                left: 60,
                top: 10,
                fill: 'green',
                width: 20,
                height: 20,
                cornerColor: 'gray',
                cornerSize: 10,
                transparentCorners: false
            });
            self.m_canvas.add(rect);

            rect = new fabric.Rect({
                left: 70,
                top: 40,
                fill: 'red',
                width: 30,
                height: 40,
                cornerColor: 'gray',
                cornerSize: 10,
                transparentCorners: false
            });
            self.m_canvas.add(rect);




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

    return ScreenLayoutEditorView;
});

