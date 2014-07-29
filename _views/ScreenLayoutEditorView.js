/**
 Singleton Screen Layout editor is used to create / edit an existing screen division layout (aka: template > viewers) and when done
 editing, create new ScreenTemplates via ScreenTemplateFactory for both Thumb and main Timeline UIs
 @class ScreenLayoutEditorView
 @constructor
 @return {object} instantiated ScreenLayoutEditorView
 **/
define(['jquery', 'backbone', 'StackView', 'ScreenTemplateFactory'], function ($, Backbone, StackView, ScreenTemplateFactory) {

    /**
     Custom event fired when a screen division / viewer has been removed
     @event VIEWER_REMOVED
     @param {This} caller
     @param {Self} context caller
     @param {Event} rss link
     @static
     @final
     **/
    BB.EVENTS.VIEWER_REMOVED = 'VIEWER_REMOVED';

    BB.SERVICES.SCREEN_LAYOUT_EDITOR_VIEW = 'ScreenLayoutEditorView';

    var ScreenLayoutEditorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SCREEN_LAYOUT_EDITOR_VIEW'], self);
            self.RATIO = 4;
            self.m_canvas = undefined;
            self.m_canvasID = undefined;
            self.m_selectedViewerID = undefined;
            self.m_dimensionProps = undefined;

            this.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.VIEWER_EDIT_PROPERTIES);

            $(this.el).find('#prev').on('click', function (e) {
                self._deSelectView();
                BB.comBroker.fire(BB.EVENTS.CAMPAIGN_TIMELINE_CHANGED, self);
                return false;
            });

            self._listenAddDivision();
            self._listenRemoveDivision();
            self._listenPushToTopDivision();
            self._listenPushToBottomDivision();
            self._listenSelectNextDivision();

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    if (self.m_dimensionProps == undefined) {
                        require(['DimensionProps'], function (DimensionProps) {
                            self.m_dimensionProps = new DimensionProps({
                                appendTo: Elements.VIEWER_DIMENSIONS,
                                showAngle: false
                            });
                            $(self.m_dimensionProps).on('changed', function (e) {
                                var props = e.target.getValues();
                                self._updateDimensionsInDB(self.m_canvas.getActiveObject(), props);
                                self._moveViewer(props);
                            });
                            self._render();
                        });
                    } else {
                        self._render();
                    }
                }
            });
        },

        /**
         Load the editor into DOM using the StackView using animation slider
         @method  selectView
         **/
        selectView: function (i_campaign_timeline_id, i_campaign_timeline_board_template_id) {
            var self = this;
            self.m_campaign_timeline_id = i_campaign_timeline_id;
            self.m_campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
            self.m_global_board_template_id = pepper.getGlobalTemplateIdOfTimeline(i_campaign_timeline_board_template_id);
            self.m_screenProps = pepper.getTemplateViewersScreenProps(self.m_campaign_timeline_id, self.m_campaign_timeline_board_template_id);
            self.m_orientation = BB.comBroker.getService(BB.SERVICES['ORIENTATION_SELECTOR_VIEW']).getOrientation();
            self.m_resolution = BB.comBroker.getService(BB.SERVICES['RESOLUTION_SELECTOR_VIEW']).getResolution();

            self.options.stackView.slideToPage(self, 'right');

            require(['fabric'], function () {
                var w = parseInt(self.m_resolution.split('x')[0]) / self.RATIO;
                var h = parseInt(self.m_resolution.split('x')[1]) / self.RATIO;

                self._canvasFactory(w, h);
                self._listenObjectChanged();
                self._listenObjectsOverlap();
                self._listenBackgroundSelected();
            })
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
         Listen to the addition of a new viewer
         @method (totalViews - i)
         **/
        _listenAddDivision: function () {
            var self = this;
            $(Elements.LAYOUT_EDITOR_ADD_NEW, self.$el).on('click', function () {
                var props = {
                    x: 0,
                    y: 0,
                    w: 100,
                    h: 100
                }
                var board_viewer_id = pepper.createViewer(self.m_global_board_template_id, props);
                var campaign_timeline_chanel_id = pepper.createTimelineChannel(self.m_campaign_timeline_id);
                pepper.assignViewerToTimelineChannel(self.m_campaign_timeline_board_template_id, board_viewer_id, campaign_timeline_chanel_id);

                var viewer = new fabric.Rect({
                    left: 0,
                    top: 0,
                    fill: '#ececec',
                    id: board_viewer_id,
                    hasRotatingPoint: false,
                    borderColor: '#5d5d5d',
                    stroke: 'black',
                    strokeWidth: 1,
                    borderScaleFactor: 0,
                    lineWidth: 1,
                    width: 100,
                    height: 100,
                    cornerColor: 'black',
                    cornerSize: 5,
                    lockRotation: true,
                    transparentCorners: false
                });
                self.m_canvas.add(viewer);

                var props = {
                    x: 0,
                    y: 0,
                    w: viewer.get('width') * self.RATIO,
                    h: viewer.get('height') * self.RATIO
                }
                self._updateDimensionsInDB(viewer, props);
            });
        },

        /**
         Listen to the removal of an existing screen division
         @method _listenRemoveDivision
         **/
        _listenRemoveDivision: function () {
            var self = this;
            $(Elements.LAYOUT_EDITOR_REMOVE, self.$el).on('click', function () {

                var totalViews = self.m_canvas.getObjects().length;
                if (totalViews < 2) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_AT_LEAST_ONE_DIV).text());
                    return;
                }

                var campaign_timeline_chanel_id = pepper.removeTimelineBoardViewerChannel(self.m_selectedViewerID);
                pepper.removeBoardTemplateViewer(self.m_campaign_timeline_board_template_id, self.m_selectedViewerID);
                pepper.removeChannelFromTimeline(campaign_timeline_chanel_id);
                pepper.removeBlocksFromTimelineChannel(campaign_timeline_chanel_id);
                self.m_canvas.remove(self.m_canvas.getActiveObject());
                self.m_canvas.renderAll();
                /*var viewer = self.m_canvas.item(0);
                var props = {
                    y: viewer.get('top'),
                    x: viewer.get('left'),
                    w: viewer.get('width') * self.RATIO,
                    h: viewer.get('height') * self.RATIO
                };
                self._updateDimensionsInDB(viewer, props);*/
                BB.comBroker.fire(BB.EVENTS.VIEWER_REMOVED, this, this, {
                    campaign_timeline_chanel_id: campaign_timeline_chanel_id
                });
                pepper.announceTemplateViewerEdited(self.m_campaign_timeline_board_template_id);
            });
        },

        /**
         Listen to re-order of screen division, putting selected on top
         @method _listenPushToTopDivision
         **/
        _listenPushToTopDivision: function () {
            var self = this;
            $(Elements.LAYOUT_EDITOR_PUSH_TOP, self.$el).on('click', function () {
                var viewer = self.m_canvas.getActiveObject();
                if (!viewer)
                    return;
                self.m_canvas.bringToFront(viewer);
                self._updateZorder();
            });
        },

        /**
         Listen to re-order of screen division, putting selected at bottom
         @method _listenPushToBottomDivision
         **/
        _listenPushToBottomDivision: function () {
            var self = this;
            $(Elements.LAYOUT_EDITOR_PUSH_BOTTOM, self.$el).on('click', function () {
                var viewer = self.m_canvas.getActiveObject();
                if (!viewer)
                    return;
                self.m_canvas.sendToBack(viewer);
                self._updateZorder();
            });
        },

        /**
         Change the z-order of viewers in pepper
         @method _updateZorder
         **/
        _updateZorder: function () {
            var self = this;
            var totalViews = self.m_canvas.getObjects().length;
            var i = 0;
            self.m_canvas.forEachObject(function (obj) {
                i++;
                // log((totalViews - i) + ' ' + obj.get('id'))
                pepper.updateTemplateViewerOrder(obj.get('id'), (totalViews - i));
            });
        },

        /**
         Listen to selection of next viewer
         @method _listenSelectNextDivision
         **/
        _listenSelectNextDivision: function () {
            var self = this;
            $(Elements.LAYOUT_EDITOR_NEXT, self.$el).on('click', function () {
                var viewer = self.m_canvas.getActiveObject();
                var viewIndex = self.m_canvas.getObjects().indexOf(viewer);
                var totalViews = self.m_canvas.getObjects().length;
                if (viewIndex == totalViews - 1) {
                    self.m_canvas.setActiveObject(self.m_canvas.item(0));
                } else {
                    self.m_canvas.setActiveObject(self.m_canvas.item(viewIndex + 1));
                }
            });
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
                i_selfDestruct: true,
                i_owner: this});

            var rects = screenTemplate.getDivisions();

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
                    borderScaleFactor: 0,
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
                //  log('object selected a rectangle');
                //});
            }

            //self.m_canvas.on('object:moving', function (e) {
            //    log('savings: ' + self.m_global_board_template_id);
            //});

            setTimeout(function () {
                if (!self.m_canvas)
                    return;
                self.m_canvas.setHeight(i_height);
                self.m_canvas.setWidth(i_width);
                self.m_canvas.renderAll();
            }, 500);
        },

        /**
         Listen to changes on selecting the background canvas
         @method _listenBackgroundSelected
         **/
        _listenBackgroundSelected: function () {
            var self = this;
            self.m_bgSelectedHandler = function (e) {
                self.m_property.resetPropertiesView();
            };
            self.m_canvas.on('selection:cleared', self.m_bgSelectedHandler);
        },

        /**
         Listen to changes in viewer overlaps
         @method _listenObjectsOverlap
         **/
        _listenObjectsOverlap: function () {
            var self = this;
            self.m_onOverlap = function (options) {
                options.target.setCoords();
                self.m_canvas.forEachObject(function (obj) {
                    if (obj === options.target) return;
                    obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
                });
            }

            self.m_canvas.on({
                'object:moving': self.m_onOverlap,
                'object:scaling': self.m_onOverlap,
                'object:rotating': self.m_onOverlap
            });
        },

        /**
         Make sure that at least one screen division is visible within the canvas
         @method _enforceViewerVisible
         **/
        _enforceViewerVisible: function () {
            var self = this;
            var pass = 0;
            var viewer;
            self.m_canvas.forEachObject(function (o) {
                viewer = o;
                if (pass)
                    return;
                if (o.get('left') < (0 - o.get('width')) + 20) {
                } else if (o.get('left') > self.m_canvas.getWidth() - 20) {
                } else if (o.get('top') < (0 - o.get('height') + 20)) {
                } else if (o.get('top') > self.m_canvas.getHeight() - 20) {
                } else {
                    pass = 1;
                }
            });
            if (!pass && viewer) {
                viewer.set({left: 0, top: 0}).setCoords();
                viewer.setCoords();
                self.m_canvas.renderAll();
                bootbox.alert({
                    message: $(Elements.MSG_BOOTBOX_AT_LEAST_ONE_DIV).text(),
                    title: $(Elements.MSG_BOOTBOX_SCREEN_DIV_POS_RESET).text()
                });
                var props = {
                    x: viewer.get('top'),
                    y: viewer.get('left'),
                    w: viewer.get('width') * self.RATIO,
                    h: viewer.get('height') * self.RATIO
                }
                self._updateDimensionsInDB(viewer, props);
            }
        },

        /**
         Enforce minimum x y w h props
         @method self._enforceViewerMinimums(i_viewer);
         @param {Object} i_rect
         **/
        _enforceViewerMinimums: function (i_viewer) {
            var self = this;
            var MIN_SIZE = 50;
            if ((i_viewer.width * self.RATIO) < MIN_SIZE || (i_viewer.height * self.RATIO) < MIN_SIZE) {
                i_viewer.width = MIN_SIZE / self.RATIO;
                i_viewer.height = MIN_SIZE / self.RATIO;
                var props = {
                    x: i_viewer.get('top'),
                    y: i_viewer.get('left'),
                    w: MIN_SIZE,
                    h: MIN_SIZE
                }
                self._updateDimensionsInDB(i_viewer, props);
            }
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

                self._enforceViewerMinimums(o);
                self._enforceViewerVisible();

                var x = BB.lib.parseToFloatDouble(o.left) * self.RATIO;
                var y = BB.lib.parseToFloatDouble(o.top) * self.RATIO;
                var w = BB.lib.parseToFloatDouble(o.currentWidth) * self.RATIO;
                var h = BB.lib.parseToFloatDouble(o.currentHeight) * self.RATIO;
                // var a = o.get('angle');
                var props = {
                    w: w,
                    h: h,
                    x: x,
                    y: y
                };
                self.m_property.viewPanel(Elements.VIEWER_EDIT_PROPERTIES);
                self.m_dimensionProps.setValues(props);
                self.m_selectedViewerID = o.id;
                self._updateDimensionsInDB(o, props);

            }, 200);

            self.m_canvas.on({
                'object:moving': self.m_objectMovingHandler,
                'object:scaling': self.m_objectMovingHandler,
                'object:selected': self.m_objectMovingHandler,
                'object:modified': self.m_objectMovingHandler
            });
        },

        /**
         Move the object / viewer to new set of coords
         @method _moveViewer
         @param {Object} i_props
         **/
        _moveViewer: function (i_props) {
            var self = this;
            // log('moving viewer');
            var viewer = self.m_canvas.getActiveObject();
            if (viewer) {
                viewer.setWidth(i_props.w / self.RATIO);
                viewer.setHeight(i_props.h / self.RATIO);
                viewer.set('left', i_props.x / self.RATIO);
                viewer.set('top', i_props.y / self.RATIO);

                self._enforceViewerMinimums(viewer);
                self._enforceViewerVisible();

                viewer.setCoords();
                self.m_canvas.renderAll();
            }
        },

        /**
         Update Pepper with latest object dimensions
         @method _updateDimensionsInDB
         @param {Object} i_props
         **/
        _updateDimensionsInDB: function (i_viewer, i_props) {
            var self = this;
            log('Pepper ' +i_viewer.get('id') + ' ' + JSON.stringify(i_props));
            pepper.setBoardTemplateViewer(self.m_campaign_timeline_board_template_id, i_viewer.get('id'), i_props);
            i_viewer.setCoords();
            self.m_canvas.renderAll();
        },

        /**
         One exit UI destroy all members
         @method _destroy
         **/
        _destroy: function () {
            var self = this;

            self.m_canvas.off('selection:cleared', self.m_bgSelectedHandler);
            self.m_canvas.off({
                'object:moving': self.m_objectMovingHandler,
                'object:scaling': self.m_objectMovingHandler,
                'object:selected': self.m_objectMovingHandler,
                'object:modified': self.m_objectMovingHandler
            });

            self.m_canvas.off({
                'object:moving': self.m_onOverlap,
                'object:scaling': self.m_onOverlap,
                'object:rotating': self.m_onOverlap
            });

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
        }
    });

    return ScreenLayoutEditorView;
});

