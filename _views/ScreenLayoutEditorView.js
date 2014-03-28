/**
 Screen Layout editor is used to edit an existing screen division layout (aka: template > viewers) and when done
 editing, create new ScreenTemplates via ScreenTemplateFactory for both Thumb and main Timeline UIs
 @class ScreenLayoutEditorView
 @constructor
 @return {object} instantiated ScreenLayoutEditorView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory', 'spinner'], function ($, Backbone, StackView, ScreenTemplateFactory, spinner) {

    BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW = 'ScreenLayoutEditorView';

    var ScreenLayoutEditorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SCREEN_LAYOUT_EDITOR_VIEW'], self);
            self.RATIO = 5;
            self.m_canvas = undefined;
            self.m_canvasID = undefined;
            self.m_selectedViewerID = undefined;

            this.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.VIEWER_EDIT_PROPERTIES);

            $(this.el).find('#prev').on('click', function (e) {
                self._deSelectView();
                return false;
            });

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self)
                    self._render();
            });

            // self.m_fontSizeInput = $('#screenEditorProps').find(Elements.CLASS_SPINNER_INPUT);
            // self.m_fontSizeSelector = self.m_fontSizeInput.closest('div');
            // self.m_fontSizeSelector.spinner({value: 12, min: 1, max: 127, step: 1});

            $('#rssPollSpinner2').spinner({value: 12, min: 1, max: 127, step: 1});
            $('#rssMinRefreshTime2').closest('div').spinner('value', 123);



            // var a = $('input', Elements.SCREEN_EDITOR_PROPS).closest('.spinner').spinner({value: 12, min: 10, max: 127, step: 1});
           // $('#aaa').spinner({value: 12, min: 10, max: 127, step: 1});
            // self._listenViewPropChanges();
        },

        /**
         Listen to spinner changes in x / y / width / height
         @method _listenViewPropChanges
         **/
        _listenViewPropChanges: function () {
            $('button', Elements.SCREEN_EDITOR_PROPS).on('click', function (e) {
                log($(e.target).closest('div').attr('name'));
                log($(e.target).closest('div').siblings('input').val());
            });

            $('input', Elements.SCREEN_EDITOR_PROPS).on('focusout', function (e) {
                log($(e.target).val());
            });
        },

        /**
         On render load default dashboard properties
         @method _render
         **/
        _render: function () {
            var self = this;
            self.m_property.resetPropertiesView();
        },

        /**
         Unload the editor from DOM using the StackView animated slider
         @method  selectView
         **/
        _deSelectView: function () {
            var self = this;
            self._destroy();
            self.m_property.resetPropertiesView();
            self.options.stackView.slideToPage(self.options.from, 'left');
        },

        /**
         Create the canvas to render the screen division
         @method _canvasFactory
         @param {Number} i_width
         @param {Number} i_height
         **/
        _canvasFactory: function (i_width, i_height) {
            var self = this;
            var offsetH = i_height / 2;
            var offsetW = (i_width / 2) + 30;
            self.m_canvasID = _.uniqueId('screenLayoutEditorCanvas');
            $('#screenLayoutEditorCanvasWrap').append('' +
                '<div>' +
                '<span align="center">' + self.m_resolution.split('x')[0] + 'px </span>' +
                '<canvas id="' + self.m_canvasID + '" width="' + i_width + 'px" height="' + i_height + 'px" style="border: 1px solid rgb(170, 170, 170);"></canvas>' +
                '<span style="position: relative; top: -' + offsetH + 'px; left: -' + offsetW + 'px;">' + self.m_resolution.split('x')[1] + 'px</span>' +
                '</div>');

            self.m_canvas = new fabric.Canvas(self.m_canvasID);
            self.m_canvas.selection = false;

            var screenTemplateData = {
                orientation: self.m_orientation,
                resolution: self.m_resolution,
                screenProps: self.m_screenProps,
                scale: self.RATIO
            };

            var screenTemplate = new ScreenTemplateFactory({
                i_screenTemplateData: screenTemplateData,
                i_type: ScreenTemplateFactory.VIEWER_SELECTABLE,
                i_owner: this});

            var rects = screenTemplate.createDivisions();
            for (var i = 0; i < rects.length; i++) {
                var rectProperties = rects[i];
                var rect = new fabric.Rect({
                    left: rectProperties.x.baseVal.value,
                    top: rectProperties.y.baseVal.value,
                    fill: '#ececec',
                    id: $(rectProperties).data('campaign_timeline_board_viewer_id'),
                    hasRotatingPoint: false,
                    borderColor: '#5d5d5d',
                    stroke: 'black',
                    strokeWidth: 1,
                    lineWidth: 1,
                    width: rectProperties.width.baseVal.value,
                    height: rectProperties.height.baseVal.value,
                    cornerColor: 'black',
                    cornerSize: 5,
                    lockRotation: true,
                    transparentCorners: false
                });
                self.m_canvas.add(rect);

                //rect.on('selected', function () {
                //  console.log('object selected a rectangle');
                //});
            }

            self.m_canvas.on('selection:cleared', function (e) {
                self.m_property.resetPropertiesView();
            });

            self.m_canvas.on('object:selected', function (e) {
                self.m_selectedViewerID = e.target.id;
                log(self.m_selectedViewerID);
                self.m_property.viewPanel(Elements.VIEWER_EDIT_PROPERTIES);
            });

            var objectMovingHandler = _.debounce(function (e) {
                var x = BB.lib.parseToFloatDouble(e.target.left) * self.RATIO;
                var y = BB.lib.parseToFloatDouble(e.target.top) * self.RATIO;
                var w = BB.lib.parseToFloatDouble(e.target.currentWidth) * self.RATIO;
                var h = BB.lib.parseToFloatDouble(e.target.currentHeight) * self.RATIO;

                var props = {
                    w: w,
                    h: h,
                    x: x,
                    y: y
                };

                jalapeno.setBoardTemplateViewer(self.m_campaign_timeline_board_template_id, e.target.id, props);
            }, 200);
            self.m_canvas.on({
                'object:moving': objectMovingHandler,
                'object:scaling': objectMovingHandler
            });


            //self.m_canvas.on('object:moving', function (e) {
            //    log('savings: ' + self.m_global_board_template_id);
            //});

            self.m_canvas.on({
                'object:moving': onChange,
                'object:scaling': onChange,
                'object:rotating': onChange
            });

            function onChange(options) {
                options.target.setCoords();
                self.m_canvas.forEachObject(function (obj) {
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
         One exit UI destroy all members
         @method _destroy
         **/
        _destroy: function () {
            var self = this;
            self.m_canvas.clear().renderAll();
            $('#screenLayoutEditorCanvasWrap').empty()
            self.m_canvasID = undefined;
            self.m_canvas = undefined;
            self.m_campaign_timeline_id = undefined;
            self.m_campaign_timeline_board_template_id = undefined;
            self.m_screenProps = undefined;
            self.m_orientation = undefined;
            self.m_resolution = undefined;
            self.m_global_board_template_id = undefined;
            self.m_selectedViewerID = undefined;
        },

        /**
         Load the editor into DOM using the StackView using animation slider
         @method  selectView
         **/
        selectView: function (i_campaign_timeline_id, i_campaign_timeline_board_template_id) {
            var self = this;
            self.m_campaign_timeline_id = i_campaign_timeline_id;
            self.m_campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
            self.m_global_board_template_id = jalapeno.getGlobalTemplateIdOfTimeline(i_campaign_timeline_board_template_id)[0];
            self.m_screenProps = jalapeno.getTemplateViewersScreenProps(self.m_campaign_timeline_id, self.m_campaign_timeline_board_template_id);
            self.m_orientation = BB.comBroker.getService(BB.SERVICES['ORIENTATION_SELECTOR_VIEW']).getOrientation();
            self.m_resolution = BB.comBroker.getService(BB.SERVICES['RESOLUTION_SELECTOR_VIEW']).getResolution();

            self.options.stackView.slideToPage(self, 'right');
            require(['fabric'], function () {
                // var resolution = BB.comBroker.getService(BB.SERVICES['RESOLUTION_SELECTOR_VIEW']).getResolution();
                var w = parseInt(self.m_resolution.split('x')[0]) / self.RATIO;
                var h = parseInt(self.m_resolution.split('x')[1]) / self.RATIO;
                self._canvasFactory(w, h);
            })
        }
    });

    return ScreenLayoutEditorView;
});

