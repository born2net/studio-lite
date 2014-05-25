/**
 Scene Editor Backbone view
 @class SceneEditorView
 @constructor
 @return {object} instantiated SceneEditorView
 **/
define(['jquery', 'backbone', 'fabric', 'BlockScene', 'BlockRSS', 'ScenesToolbarView', 'BlockFactory'], function ($, Backbone, fabric, BlockScene, BlockRSS, ScenesToolbarView, BlockFactory) {

    BB.SERVICES.SCENE_EDIT_VIEW = 'SceneEditorView';

    var SceneEditorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['SCENE_EDIT_VIEW'], self);
            self.m_selectedSceneID = undefined;
            self.m_blocks = {};
            self.m_memento = {};
            self.m_dimensionProps = undefined;
            self.m_canvas = undefined;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
            new ScenesToolbarView({el: Elements.SCENE_TOOLBAR});

            self.m_canvasScale = 1;
            self.SCALE_FACTOR = 1.2;

            self._initializeBlockFactory();
            self._listenAddBlockWizard();
            self._listenSceneToolbarSelected();
            self._listenZoom();
            self._listenPushToTop();
            self._listenPushToBottom();
            self._listenSceneChanged();
            self._listenSelectNextBlock();
            self._listenSceneRemove();
            self._listenSceneBlockRemove();
            self._listenSceneNew();
            self._listenMemento();
            self._listenCanvasSelectionsFromToolbar();
            self._delegateRenderAnnouncer();
        },

        /**
         Init block factory if it hasn't already been loaded
         @method _initializeBlockFactory
         **/
        _initializeBlockFactory: function () {
            var self = this;
            self.m_blockFactory = BB.comBroker.getService(BB.SERVICES['BLOCK_FACTORY']);
            if (self.m_blockFactory && self.m_blockFactory.blocksLoaded()) {
                self._initDimensionProps();
                return
            }

            BB.comBroker.listenOnce(BB.EVENTS['BLOCKS_LOADED'], function () {
                self._initDimensionProps();
            });
            require(['BlockFactory'], function (BlockFactory) {
                self.m_blockFactory = new BlockFactory();
                self.m_blockFactory.loadBlockModules();
            });
        },

        /**
         Init block factory if it hasn't already been loaded
         @method _initializeBlockFactory
         **/
        _initializeBlockFactory: function () {
            var self = this;
            self.m_blockFactory = BB.comBroker.getService(BB.SERVICES['BLOCK_FACTORY']);

            if (self.m_blockFactory && self.m_blockFactory.blocksLoaded()) {
                self._initDimensionProps();

            } else {

                BB.comBroker.listenOnce(BB.EVENTS['BLOCKS_LOADED'], function () {
                    self._initDimensionProps();
                });

                require(['BlockFactory'], function (BlockFactory) {
                    self.m_blockFactory = new BlockFactory();
                    self.m_blockFactory.loadBlockModules();
                });
            }
        },

        /**
         Init the dimension props class
         @method _initDimensionProps
         **/
        _initDimensionProps: function () {
            var self = this;
            require(['DimensionProps'], function (DimensionProps) {
                self.m_dimensionProps = new DimensionProps({
                    appendTo: Elements.SCENE_BLOCK_PROPS,
                    showAngle: true
                });
                BB.comBroker.setService(BB.SERVICES['DIMENSION_PROPS_LAYOUT'], self.m_dimensionProps);
                $(self.m_dimensionProps).on('changed', function (e) {
                    var block = self.m_canvas.getActiveObject();
                    if (_.isNull(block))
                        return;
                    var props = e.target.getValues();
                    var block_id = block.getBlockData().blockID;
                    self._updateBlockCords(block_id, false, props.x, props.y, props.w, props.h, props.a);
                    BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, block_id);
                });
                self._sceneActive();
            })
        },

        /**
         Bring the scene into view
         @method _sceneActive
         **/
        _sceneActive: function () {
            var self = this;
            $('#sceneToolbar').fadeIn();
            $(Elements.SCENE_TOOLBAR).fadeTo(500, 1);
        },

        /**
         Init a new canvas and listen to even changes on that new canvas
         @method _initializeCanvas
         @param {Number} w width
         @param {Number} h height
         **/
        _initializeCanvas: function (w, h) {
            var self = this;
            var canvasID = BB.lib.unhash(Elements.SCENE_CANVAS);
            $(Elements.SCENE_CANVAS_CONTAINER).empty();
            $(Elements.SCENE_CANVAS_CONTAINER).append('<canvas id="' + canvasID + '" width="' + w + 'px" height="' + h + 'px"/>');
            self.m_canvas = new fabric.Canvas(canvasID);
            self.m_canvas.renderOnAddRemove = false;

            self._listenObjectChangeResetScale();
            self._listenCanvasSelections();

        },

        /**
         Init a new scene and subclass off a standard Block
         @method _initializeScene
         **/
        _initializeScene: function () {
            var self = this;
            var scene_player_data = pepper.getScenePlayerdata(self.m_selectedSceneID);
            self.m_sceneBlock = self.m_blockFactory.createBlock(self.m_selectedSceneID, scene_player_data, BB.CONSTS.PLACEMENT_IS_SCENE);
            _.extend(self.m_canvas, self.m_sceneBlock);
        },

        /**
         Listen to changes in a new scene selection
         @method _listenSceneToolbarSelected
         **/
        _listenSceneToolbarSelected: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.LOAD_SCENE, function (e) {
                self.m_selectedSceneID = e.edata;
                self._loadScene();
                self._sceneCanvasSelected();
                if (self._mementoInit())
                    self._mementoAddState();
            });
        },

        /**
         Announce that block count changed with block array of ids
         @method self._blockCountChanged();
         **/
        _blockCountChanged: function () {
            var self = this;
            var blocks = [];
            if (_.isUndefined(self.m_selectedSceneID)) {
                BB.comBroker.fire(BB.EVENTS.SCENE_BLOCK_LIST_UPDATED, this, null, null);
                return;
            }
            for (var i = 0; i < self.m_canvas.getObjects().length; i++) {
                blocks.push({
                    id: self.m_canvas.item(i).getBlockData().blockID,
                    name: self.m_canvas.item(i).getBlockData().blockName
                });
            }
            BB.comBroker.fire(BB.EVENTS.SCENE_BLOCK_LIST_UPDATED, this, null, blocks);
        },

        /**
         Load a new scene and dispose of any previous ones
         @return {Number} Unique clientId.
         **/
        _loadScene: function () {
            var self = this;
            self._disposeScene();
            self._zoomReset();
            self.m_property.resetPropertiesView();
            var domPlayerData = pepper.getScenePlayerdataDom(self.m_selectedSceneID);
            var l = $(domPlayerData).find('Layout').eq(0);
            var w = $(l).attr('width');
            var h = $(l).attr('height');
            self._initializeCanvas(w, h);
            self._initializeScene(self.m_selectedSceneID);
            self._render(domPlayerData);
            $(Elements.SCENE_CANVAS).addClass('basicBorder');
            self._blockCountChanged();
        },

        /**
         Listen to selection of next block
         @method _listenSelectNextDivision
         **/
        _listenSelectNextBlock: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS['SCENE_SELECT_NEXT'], function () {
                if (_.isUndefined(self.m_selectedSceneID))
                    return;
                var viewer = self.m_canvas.getActiveObject();
                var viewIndex = self.m_canvas.getObjects().indexOf(viewer);
                var totalViews = self.m_canvas.getObjects().length;
                var blockID = undefined;
                if (viewIndex == totalViews - 1) {
                    self.m_canvas.setActiveObject(self.m_canvas.item(0));
                    blockID = self.m_canvas.getActiveObject().getBlockData().blockID;
                    BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
                } else {
                    self.m_canvas.setActiveObject(self.m_canvas.item(viewIndex + 1));
                    blockID = self.m_canvas.getActiveObject().getBlockData().blockID;
                    BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
                }
            });
        },

        /**
         Listen to when a user selects to delete a block
         @method _listenSceneBlockRemove

         _listenSceneBlockRemove: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_ITEM_REMOVE, function () {
                if (_.isUndefined(self.m_selectedSceneID))
                    return;
                var block = self.m_canvas.getActiveObject();
                if (block == null)
                    return;
                var blockID = block.getBlockData().blockID;
                self.m_canvas.discardActiveObject();
                delete self.m_blocks[blockID];
                pepper.removeScenePlayer(self.m_selectedSceneID, blockID);
                self._loadScene();
                // BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, null);
                // block.deleteBlock();
                // self._blockCountChanged();
            });
        },
         **/
        /**
         Listen to when a user selects to delete a block
         @method _listenSceneBlockRemove
         **/
        _listenSceneBlockRemove: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_ITEM_REMOVE, function () {
                self.m_property.resetPropertiesView();
                if (_.isUndefined(self.m_selectedSceneID))
                    return;
                var block = self.m_canvas.getActiveObject();
                if (block == null)
                    return;
                var blockID = block.getBlockData().blockID;
                self.m_canvas.discardActiveObject();
                self.m_canvas.remove(block);
                delete self.m_blocks[blockID];
                pepper.removeScenePlayer(self.m_selectedSceneID, blockID);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, null);
                block.deleteBlock();
                self._blockCountChanged();
                self._mementoAddState();
            });
        },


        /**
         Listen to when a user selects to delete a scene
         @method _listenSceneRemove
         **/
        _listenSceneRemove: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_EDITOR_REMOVE, function () {
                if (_.isUndefined(self.m_selectedSceneID))
                    return;

                bootbox.confirm($(Elements.MSG_BOOTBOX_SCENE_REMOVE).text(), function (result) {
                    if (result == true) {
                        pepper.removeScene(self.m_selectedSceneID);
                        BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, null);
                        self._disposeScene();
                        self._zoomReset();
                        self.m_property.resetPropertiesView();
                        self.m_selectedSceneID = undefined;
                        $(Elements.SCENE_CANVAS).removeClass('basicBorder');
                        self._blockCountChanged();
                    }
                });
            });
        },

        /**
         Listen to user selection of new scene
         @method _listenSceneNew
         **/
        _listenSceneNew: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.NEW_SCENE, function (e) {
                var player_data = BB.PepperHelper.getBlockBoilerplate('3510').getDefaultPlayerData(BB.CONSTS.PLACEMENT_IS_SCENE);
                self.m_selectedSceneID = pepper.createScene(player_data);
                self._loadScene();
                BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, null);
            });
        },

        /**
         Listen to the event of scene changes which normally comes from a block that modified its data
         and re-render all scene content
         @method _listenSceneChanged
         **/
        _listenSceneChanged: function (e) {
            var self = this;

            BB.comBroker.listen(BB.EVENTS['SCENE_BLOCK_CHANGE'], function (e) {
                var blockID = e.edata, i;
                log('block edited ' + blockID);
                var domPlayerData = pepper.getScenePlayerdataDom(self.m_selectedSceneID);
                var nZooms = Math.round(Math.log(1 / self.m_canvasScale) / Math.log(1.2));
                self._zoomReset();
                self._render(domPlayerData);
                BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
                for (i = 0; i < self.m_canvas.getObjects().length; i++) {
                    if (blockID == self.m_canvas.item(i).getBlockData().blockID) {
                        self.m_canvas.setActiveObject(self.m_canvas.item(i));
                        break;
                    }
                }
                if (nZooms > 0) {
                    for (i = 0; i < nZooms; i++)
                        self._zoomOut();
                } else {
                    for (i = 0; i > nZooms; nZooms++)
                        self._zoomIn();
                }
                self._resetAllObjectScale();
                self.m_canvas.renderAll();
                self._announceSceneRendered();

            });
        },

        /**
         Listen to and add new component / resources to scene
         @method _listenAddBlockWizard
         @param {event} e
         **/
        _listenAddBlockWizard: function (e) {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.ADD_NEW_BLOCK_SCENE, function (e) {
                var blockID = pepper.generateSceneId();
                var player_data = BB.PepperHelper.getBlockBoilerplate(e.edata.blockCode).getDefaultPlayerData(BB.CONSTS.PLACEMENT_SCENE, e.edata.resourceID);
                var domPlayerData = $.parseXML(player_data);
                $(domPlayerData).find('Player').attr('id', blockID);
                player_data = (new XMLSerializer()).serializeToString(domPlayerData);
                pepper.appendScenePlayerBlock(self.m_selectedSceneID, player_data);
                self._createBlock(blockID, player_data);
                self._blockCountChanged();
                self.m_canvas.renderAll();
                self._mementoAddState();
                e.stopImmediatePropagation();
                e.preventDefault();
            });
        },

        /**
         Listen to re-order of screen division, putting selected on top
         @method _listenPushToTop
         **/
        _listenPushToTop: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_PUSH_TOP, function () {
                if (_.isUndefined(self.m_selectedSceneID))
                    return;
                var block = self.m_canvas.getActiveObject();
                if (_.isUndefined(block))
                    return;
                self.m_canvas.bringToFront(block);
                self._updateZorder();
                self._mementoAddState();
            });
        },

        /**
         Listen to re-order of screen division, putting selected at bottom
         @method _listenPushToBottom
         **/
        _listenPushToBottom: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_PUSH_BOTTOM, function () {
                if (_.isUndefined(self.m_selectedSceneID))
                    return;
                var block = self.m_canvas.getActiveObject();
                if (_.isUndefined(block))
                    return;
                self.m_canvas.sendToBack(block);
                self._updateZorder();
                self._mementoAddState();
            });
        },

        /**
         Listen to undo and redo
         @method _listenMemento
         **/
        _listenMemento: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_UNDO, function (e) {
                self._mementoLoadState('undo');
            });
            BB.comBroker.listen(BB.EVENTS.SCENE_REDO, function (e) {
                self._mementoLoadState('redo');
            });
        },

        /**
         Init a undo / redo via memento pattern
         @method _mementoInit
         @return {Boolean} return true if memento created false if one already existed
         **/
        _mementoInit: function () {
            var self = this;
            if (_.isUndefined(self.m_memento[self.m_selectedSceneID])) {
                self.m_memento[self.m_selectedSceneID] = {
                    playerData: [],
                    cursor: -1
                };
                return true;
            }
            return false;
        },

        /**
         Remember current memento state
         @method _mementoAddState
         **/
        _mementoAddState: function () {
            var self = this;
            var MAX = 100;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            self._mementoInit(self.m_selectedSceneID);

            // maintain memento to stack MAX value
            if (self.m_memento[self.m_selectedSceneID].playerData.length > MAX)
                self.m_memento[self.m_selectedSceneID].playerData.shift();

            // if undo / redo was executed, remove ahead mementos
            if (self.m_memento[self.m_selectedSceneID].cursor != self.m_memento[self.m_selectedSceneID].playerData.length - 1)
                self.m_memento[self.m_selectedSceneID].playerData.splice(self.m_memento[self.m_selectedSceneID].cursor + 1);

            var player_data = pepper.getScenePlayerdata(self.m_selectedSceneID);
            self.m_memento[self.m_selectedSceneID].playerData.push(player_data);
            self.m_memento[self.m_selectedSceneID].cursor = self.m_memento[self.m_selectedSceneID].playerData.length - 1;
        },

        /**
         Remember current memento state
         @method _mementoLoadState
         **/
        _mementoLoadState: function (i_direction) {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            self._mementoInit(self.m_selectedSceneID);
            if (self.m_memento[self.m_selectedSceneID].playerData.length == 0)
                return;

            switch (i_direction) {
                case 'undo':
                {
                    var cursor = self.m_memento[self.m_selectedSceneID].cursor;
                    if (cursor == 0)
                        return;
                    self.m_memento[self.m_selectedSceneID].cursor--;
                    cursor = self.m_memento[self.m_selectedSceneID].cursor;
                    break;
                }
                case 'redo':
                {
                    var cursor = self.m_memento[self.m_selectedSceneID].cursor;
                    if (cursor == self.m_memento[self.m_selectedSceneID].playerData.length - 1)
                        return;
                    self.m_memento[self.m_selectedSceneID].cursor++;
                    cursor = self.m_memento[self.m_selectedSceneID].cursor;
                    break;
                }
            }
            var player_data = self.m_memento[self.m_selectedSceneID].playerData[cursor];
            pepper.setScenePlayerData(self.m_selectedSceneID, player_data);
            self._loadScene();
            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, null);
        },

        /**
         Change the z-order of objects in pepper
         @method _updateZorder
         **/
        _updateZorder: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            var active = self.m_canvas.getActiveGroup();
            if (active)
                return;
            // var totalViews = self.m_canvas.getObjects().length;
            // var i = 0;
            // log('--------------------');
            var domSceneData = pepper.getScenePlayerdataDom(self.m_selectedSceneID);
            self.m_canvas.forEachObject(function (obj) {
                // i++;
                var blockID = obj.getBlockData().blockID;
                // log((totalViews - i) + ' ' + blockID);
                var o = $(domSceneData).find('[id="' + blockID + '"]');
                $(domSceneData).find('Players').prepend(o);
            });
            pepper.setScenePlayerData(self.m_selectedSceneID, (new XMLSerializer()).serializeToString(domSceneData));
        },

        /**
         Render the canvas thus creating all associated player blocks of the scene
         @method _render
         @param {Object} i_domPlayerData
         **/
        _render: function (i_domPlayerData) {
            var self = this;
            self.m_canvas.clear();
            self._disposeBlocks();
            log('rendering new blocks');
            $(i_domPlayerData).find('Players').find('Player').each(function (i, player) {
                var blockID = $(player).attr('id');
                var player_data = (new XMLSerializer()).serializeToString(player);
                var block = self._createBlock(blockID, player_data);
                self.m_canvas.bringToFront(block);
            });
        },

        /**
         Create a block inside a scene using it's player_data
         @method _createBlock
         @param {Number} i_blockID
         @return {Object} block
         **/
        _createBlock: function (i_blockID, i_player_data) {
            var self = this;
            var domPlayerData = $.parseXML(i_player_data);
            var layout = $(domPlayerData).find('Layout');

            var rect = new fabric.Rect({
                left: parseInt(layout.attr('x')),
                top: parseInt(layout.attr('y')),
                width: parseInt(layout.attr('width')),
                height: parseInt(layout.attr('height')),
                angle: parseInt(layout.attr('rotation')),
                fill: '#ececec',
                hasRotatingPoint: false,
                borderColor: '#5d5d5d',
                stroke: 'black',
                strokeWidth: 1,
                lineWidth: 1,
                cornerColor: 'black',
                cornerSize: 5,
                lockRotation: true,
                transparentCorners: false
            });

            var block = self.m_blockFactory.createBlock(i_blockID, i_player_data, BB.CONSTS.PLACEMENT_SCENE, self.m_selectedSceneID);
            self.m_blocks[i_blockID] = block;
            _.extend(block, rect);
            // block.listenSceneSelection(self.m_canvas);
            block['canvasScale'] = self.m_canvasScale;
            self.m_canvas.add(block);
            return block;
        },

        /**
         Listen to canvas user selections
         @method _listenCanvasSelections
         **/
        _listenCanvasSelections: function () {
            var self = this;

            //self.m_canvas.on('object:selected', function (e) {
            //    var blockID = e.target.m_blockType;
            //    BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
            //});

            self.m_canvas.on('mouse:up', function (options) {
                var active = self.m_canvas.getActiveObject();
                var group = self.m_canvas.getActiveGroup();

                //// Group
                if (group) {
                    log('group selected');
                    var selectedGroup = options.target || group;
                    _.each(group.objects, function (selectedObject) {
                        var objectPos = {
                            x: (selectedGroup.left + (selectedObject.left)),
                            y: (selectedGroup.top + (selectedObject.top))
                        };
                        if (objectPos.x < 0 && objectPos.y < 0) {
                            objectPos.x = objectPos.x * -1;
                            objectPos.y = objectPos.y * -1;
                        }
                        var blockID = selectedObject.getBlockData().blockID;
                        log('object: ' + selectedObject.m_blockType + ' ' + blockID);
                        self._updateBlockCords(blockID, true, objectPos.x, objectPos.y, selectedObject.currentWidth, selectedObject.currentHeight, selectedObject.angle);
                        self._updateZorder();
                    });
                    self._mementoAddState();
                    selectedGroup.hasControls = false;
                    self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
                    self.m_canvas.renderAll();
                    return;
                }

                //// Object
                if (options.target || active) {
                    var block = options.target || active;
                    self._sceneBlockSelected(block);
                    self._mementoAddState();
                    return;
                }

                //// Scene
                self._sceneCanvasSelected();
                log('scene: ' + self.m_canvas.m_blockType + ' ' + self.m_selectedSceneID);
                // log('object ' + options.e.clientX + ' ' + options.e.clientY + ' ' + options.target.m_blockType);

            });
        },

        /**
         Select a block object on the canvas
         @method _sceneBlockSelected
         @param {Object} i_block
         **/
        _sceneBlockSelected: function (i_block) {
            var self = this;
            self.m_canvas.setActiveObject(i_block);
            var blockID = i_block.getBlockData().blockID;
            log('object: ' + i_block.m_blockType + ' ' + blockID);
            // var zoomedOut = 1 - selectedObject.scaleY;
            self._updateBlockCords(blockID, true, i_block.left, i_block.top, i_block.currentWidth, i_block.currentHeight, i_block.angle);
            BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
            self._updateZorder();
        },

        /**
         Set the scene (i.e.: Canvas) as the selected block
         @method _sceneCanvasSelected
         **/
        _sceneCanvasSelected: function () {
            var self = this;
            self.m_canvas.discardActiveGroup();
            self.m_canvas.discardActiveObject();
            BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.m_selectedSceneID);
        },

        /**
         Listen to scene block / item selection initiated by user selection of toolbar dropdown
         @method _listenCanvasSelectionsFromToolbar
         **/
        _listenCanvasSelectionsFromToolbar: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_ITEM_SELECTED, function (e) {
                var blockID = e.edata;

                // Scene selected
                if (blockID == BB.CONSTS.SCENE_CANVAS_SELECTED) {
                    self._sceneCanvasSelected();
                    return;
                }

                // block selected
                for (var i = 0; i < self.m_canvas.getObjects().length; i++) {
                    if (self.m_canvas.item(i).getBlockData().blockID == blockID) {
                        self._sceneBlockSelected(self.m_canvas.item(i));
                        break;
                    }
                }
            });
        },

        /**
         Update the coordinates of a block in pepper db
         @method _updateBlockCords
         @param {String} i_blockID
         @param {Boolean} i_calcScale
         @param {Number} x
         @param {Number} y
         @param {Number} w
         @param {Number} h
         **/
        _updateBlockCords: function (i_blockID, i_calcScale, x, y, w, h, a) {
            var self = this;
            if (i_calcScale) {
                var sy = 1 / self.m_canvasScale;
                var sx = 1 / self.m_canvasScale;
                h = h * sy;
                w = w * sx;
                x = x * sx;
                y = y * sy;
            }
            var domPlayerData = pepper.getScenePlayerdataBlock(self.m_selectedSceneID, i_blockID);
            var layout = $(domPlayerData).find('Layout');
            layout.attr('rotation', parseInt(a));
            layout.attr('x', parseInt(x));
            layout.attr('y', parseInt(y));
            layout.attr('width', parseInt(w));
            layout.attr('height', parseInt(h));
            var player_data = (new XMLSerializer()).serializeToString(domPlayerData);
            pepper.setScenePlayerdataBlock(self.m_selectedSceneID, i_blockID, player_data);
        },

        /**
         Reset all canvas objects to their scale is set to 1
         @method _resetAllObjectScale
         **/
        _resetAllObjectScale: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            _.each(self.m_canvas.getObjects(), function (obj) {
                self._resetObjectScale(obj);
            });
        },

        /**
         Reset a canvas object so its scale is set to 1
         @method _resetObjectScale
         **/
        _resetObjectScale: function (i_target) {
            var self = this;
            if (i_target.width != i_target.currentWidth || i_target.height != i_target.currentHeight) {
                i_target.width = i_target.currentWidth;
                i_target.height = i_target.currentHeight;
                i_target.scaleX = 1;
                i_target.scaleY = 1;
                self.m_canvas.renderAll();
            }
        },

        /**
         Announce to all that scene was re-rendered but do it via debounce
         @method _delegateRenderAnnouncer
         **/
        _delegateRenderAnnouncer: function () {
            var self = this;
            self._announceSceneRendered = _.debounce(function (e) {
                BB.comBroker.fire(BB.EVENTS.SCENE_BLOCKS_RENDERED, self, self.m_canvas);
                log('announcing rendering done, now blocks can populate')
                self._mementoAddState();
            }, 200);
        },

        /**
         Listen to changes in scale so we can reset back to non-zoom on any block object
         @method _listenObjectChangeResetScale
         **/
        _listenObjectChangeResetScale: function () {
            var self = this;
            self.m_objectMovingHandler = _.debounce(function (e) {
                self._resetObjectScale(e.target);
            });
            self.m_canvas.on({
                'object:moving': self.m_objectMovingHandler,
                'object:scaling': self.m_objectMovingHandler,
                'object:selected': self.m_objectMovingHandler,
                'object:modified': self.m_objectMovingHandler
            });
        },

        /**
         Remove a Scene and cleanup after
         @method _disposeScene
         **/
        _disposeScene: function () {
            var self = this;
            if (_.isUndefined(self.m_canvas))
                return;
            self.m_canvas.off('mouse:up');
            _.each(self.m_canvas.getObjects(), function (obj) {
                self.m_canvas.dispose(obj);
            });
            self._disposeBlocks();
            self.m_sceneBlock.deleteBlock();
            self.m_canvas = undefined;
        },

        /**
         Remove all block instances
         @method _disposeBlocks
         **/
        _disposeBlocks: function () {
            var self = this;
            if (_.isUndefined(self.m_canvas))
                return;
            _.each(self.m_blocks, function (block) {
                block.deleteBlock();
            });
            self.m_blocks = {};
        },

        /**
         Listen to all zoom events via wiring the UI
         @method _listenZoom
         **/
        _listenZoom: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_ZOOM_IN, function (e) {
                self._zoomIn();
                self._resetAllObjectScale();
            });
            BB.comBroker.listen(BB.EVENTS.SCENE_ZOOM_OUT, function (e) {
                self._zoomOut();
                self._resetAllObjectScale();
            });
            BB.comBroker.listen(BB.EVENTS.SCENE_ZOOM_RESET, function (e) {
                self._zoomReset();
                self._resetAllObjectScale();
            });
        },

        /**
         Zoom scene in
         @method _zoomIn
         **/
        _zoomIn: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            self.m_canvas.discardActiveGroup();
            self.m_canvasScale = self.m_canvasScale * self.SCALE_FACTOR;
            self.m_canvas.setHeight(self.m_canvas.getHeight() * self.SCALE_FACTOR);
            self.m_canvas.setWidth(self.m_canvas.getWidth() * self.SCALE_FACTOR);

            var objects = self.m_canvas.getObjects();
            for (var i in objects) {
                var scaleX = objects[i].scaleX;
                var scaleY = objects[i].scaleY;
                var left = objects[i].left;
                var top = objects[i].top;
                var tempScaleX = scaleX * self.SCALE_FACTOR;
                var tempScaleY = scaleY * self.SCALE_FACTOR;
                var tempLeft = left * self.SCALE_FACTOR;
                var tempTop = top * self.SCALE_FACTOR;

                objects[i]['canvasScale'] = self.m_canvasScale;
                objects[i].scaleX = tempScaleX;
                objects[i].scaleY = tempScaleY;
                objects[i].left = tempLeft;
                objects[i].top = tempTop;
                objects[i].setCoords();
            }
        },

        /**
         Zoom scene out
         @method _zoomOut
         **/
        _zoomOut: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            self.m_canvas.discardActiveGroup();
            self.m_canvasScale = self.m_canvasScale / self.SCALE_FACTOR;
            self.m_canvas.setHeight(self.m_canvas.getHeight() * (1 / self.SCALE_FACTOR));
            self.m_canvas.setWidth(self.m_canvas.getWidth() * (1 / self.SCALE_FACTOR));

            var objects = self.m_canvas.getObjects();
            for (var i in objects) {
                var scaleX = objects[i].scaleX;
                var scaleY = objects[i].scaleY;
                var left = objects[i].left;
                var top = objects[i].top;
                var tempScaleX = scaleX * (1 / self.SCALE_FACTOR);
                var tempScaleY = scaleY * (1 / self.SCALE_FACTOR);
                var tempLeft = left * (1 / self.SCALE_FACTOR);
                var tempTop = top * (1 / self.SCALE_FACTOR);

                objects[i]['canvasScale'] = self.m_canvasScale;
                objects[i].scaleX = tempScaleX;
                objects[i].scaleY = tempScaleY;
                objects[i].left = tempLeft;
                objects[i].top = tempTop;
                objects[i].setCoords();
            }
        },

        /**
         Zoom reset back to scale 1
         @method _zoomReset
         **/
        _zoomReset: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID) || _.isUndefined(self.m_canvas)) {
                self.m_canvasScale = 1;
                return;
            }

            self.m_canvas.discardActiveGroup();
            self.m_canvas.setHeight(self.m_canvas.getHeight() * (1 / self.m_canvasScale));
            self.m_canvas.setWidth(self.m_canvas.getWidth() * (1 / self.m_canvasScale));

            var objects = self.m_canvas.getObjects();
            for (var i in objects) {
                var scaleX = objects[i].scaleX;
                var scaleY = objects[i].scaleY;
                var left = objects[i].left;
                var top = objects[i].top;
                var tempScaleX = scaleX * (1 / self.m_canvasScale);
                var tempScaleY = scaleY * (1 / self.m_canvasScale);
                var tempLeft = left * (1 / self.m_canvasScale);
                var tempTop = top * (1 / self.m_canvasScale);

                objects[i].scaleX = tempScaleX;
                objects[i].scaleY = tempScaleY;
                objects[i].left = tempLeft;
                objects[i].top = tempTop;
                objects[i].setCoords();
                objects[i]['canvasScale'] = 1;
            }
            self.m_canvasScale = 1;
        },

        /**
         Get currently selected scene id
         @method getSelectedSceneID
         @return {Number} scene id
         **/
        getSelectedSceneID: function () {
            var self = this;
            return self.m_selectedSceneID;
        }
    });

    return SceneEditorView;

});