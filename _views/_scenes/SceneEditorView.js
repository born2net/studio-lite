/**
 Scene Editor Backbone view
 @class SceneEditorView
 @constructor
 @return {object} instantiated the SceneEditorView
 **/
define(['jquery', 'backbone', 'fabric', 'BlockScene', 'BlockRSS', 'ScenesToolbarView', 'BlockFactory', 'contextmenu'], function ($, Backbone, fabric, BlockScene, BlockRSS, ScenesToolbarView, BlockFactory, contextmenu) {

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
            self.m_sceneScrollTop = 0;
            self.m_sceneScrollLeft = 0;
            self.m_objectScaling = 0;
            self.m_mouseX = 0;
            self.m_mouseY = 0;
            self.m_gridMagneticMode = 0;
            self.m_rendering = false;
            self.m_memento = {};
            self.m_canvasMouseState = 0;
            self.m_copiesObjects = [];
            self.PUSH_TOP = 1;
            self.PUSH_BOTTOM = 0;
            self.m_blocks = {
                blocksPre: [],
                blocksPost: {},
                blockSelected: undefined
            };
            self.m_dimensionProps = undefined;
            self.m_canvas = undefined;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();

            new ScenesToolbarView({
                stackView: self.options.stackView,
                el: Elements.SCENE_TOOLBAR
            });

            self.m_canvasScale = 1;
            self.SCALE_FACTOR = 1.2;

            self._listenSceneViewStackSelected();
            self._listenSceneSelection();
            self._initializeBlockFactory();
            self._listenAddBlockWizard();
            self._listenZoom();
            self._listenToCanvasScroll();
            self._listenPushToTop();
            self._listenPushToBottom();
            self._listenSceneChanged();
            self._listenContextMenu();
            self._listenSelectNextBlock();
            self._listenSceneRemove();
            self._listenSceneBlockRemove();
            self._listenSceneNew();
            self._listenMemento();
            self._listenGridMagnet();
            self._listenCanvasSelectionsFromToolbar();
            self._listenAppResized();
            self._listenStackViewSelected();
            self._delegateSceneBlockModified();
        },

        /**
         Listen to when a new scene is selected via Slider View
         @method _listenSceneViewStackSelected
         **/
        _listenSceneViewStackSelected: function () {
            var self = this;
            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    log('load new scene');
                }
            });
        },

        /**
         Listen to changes in a new scene selection
         @method _listenSceneSelection
         **/
        _listenSceneSelection: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.LOAD_SCENE, function (e) {
                self.m_selectedSceneID = e.edata;
                self._loadScene();
                self._sceneCanvasSelected();
                BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
                if (self._mementoInit())
                    self._mementoAddState();
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
                    showAngle: true,
                    showLock: true,
                    hideSpinners: true
                });
                // self.m_dimensionProps.hideSpinners();
                BB.comBroker.setService(BB.SERVICES['DIMENSION_PROPS_LAYOUT'], self.m_dimensionProps);
                $(self.m_dimensionProps).on('changed', function (e) {
                    var block = self.m_canvas.getActiveObject();
                    if (_.isNull(block))
                        return;
                    var props = e.target.getValues();
                    var block_id = block.getBlockData().blockID;
                    self._updateBlockCords(block, false, props.x, props.y, props.w, props.h, props.a);
                    BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, [block_id]);
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
            $(Elements.SCENE_CANVAS_CONTAINER).append('<canvas id="' + canvasID + '" width="' + w + 'px" height="' + h + 'px" />');
            self.m_canvas = new fabric.Canvas(canvasID);
            self.m_canvas.renderOnAddRemove = false;
            $(Elements.SCENE_CANVAS).addClass('basicBorder');

            self._listenBlockModified();
            self._listenCanvasSelections();
            self._listenKeyboard();
        },

        /**
         Init a new scene and subclass off a standard Block
         @method _initializeScene
         **/
        _initializeScene: function () {
            var self = this;
            var scene_player_data = pepper.getScenePlayerdata(self.m_selectedSceneID);
            self.m_sceneBlock = self.m_blockFactory.createBlock(self.m_selectedSceneID, scene_player_data, BB.CONSTS.PLACEMENT_IS_SCENE);
            self.m_sceneBlock.setCanvas(self.m_canvas, self.m_gridMagneticMode);
            //_.extend(self.m_canvas, self.m_sceneBlock);
        },

        /**
         Announce that block count changed with block array of ids
         @method self._updateBlockCount();
         **/
        _updateBlockCount: function () {
            var self = this;
            var blocks = [];
            if (_.isUndefined(self.m_selectedSceneID)) {
                BB.comBroker.fire(BB.EVENTS.SCENE_BLOCK_LIST_UPDATED, this, null, null);
                return;
            }
            // cpu breather
            setTimeout(function () {
                if (_.isUndefined(self.m_canvas))
                    return;
                var objects = self.m_canvas.getObjects().length;
                for (var i = 0; i < objects; i++) {
                    blocks.push({
                        id: self.m_canvas.item(i).m_block_id,
                        name: self.m_canvas.item(i).m_blockName
                    });
                }
                BB.comBroker.fire(BB.EVENTS.SCENE_BLOCK_LIST_UPDATED, this, null, blocks);
            }, 500);

        },

        /**
         Load a new scene and dispose of any previous ones
         @return {Number} Unique clientId.
         **/
        _loadScene: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return -1;
            self._sceneProcessing(true, $.proxy(function () {
                self._disposeBlocks();
                self.disposeScene();
                self._zoomReset();
                self.m_property.resetPropertiesView();
                var domPlayerData = pepper.getScenePlayerdataDom(self.m_selectedSceneID);
                var l = $(domPlayerData).find('Layout').eq(0);
                var w = $(l).attr('width');
                var h = $(l).attr('height');
                self._initializeCanvas(w, h);
                self._initializeScene(self.m_selectedSceneID);
                self._preRender(domPlayerData);
            }), self);

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
         **/
        _listenSceneBlockRemove: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_ITEM_REMOVE, function () {
                self._onContentMenuSelection('remove');
            });
        },

        /**
         Listen to when a user selects to delete a scene
         @method _listenSceneRemove
         **/
        _listenSceneRemove: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_EDITOR_REMOVE, function (e) {
                if (self.m_canvas)
                    self.m_canvas.setBackgroundColor('#ffffff', function () {
                    }).renderAll();

                // remove a scene and notify before so channel instances
                // can remove corresponding blocks and after so channelList can refresh UI
                var sceneID = pepper.getSceneIdFromPseudoId(e.edata);
                BB.comBroker.fire(BB.EVENTS.REMOVING_SCENE, this, null, sceneID);
                pepper.removeBlocksWithSceneID(sceneID);
                pepper.removeSceneFromBlockCollectionInScenes(sceneID);
                pepper.removeSceneFromBlockCollectionsInChannels(sceneID);
                pepper.removeScene(sceneID);
                BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, null);
                self.disposeScene();
                self._zoomReset();
                self.m_property.resetPropertiesView();
                self.m_selectedSceneID = undefined;
                $(Elements.SCENE_CANVAS).removeClass('basicBorder');
                self._updateBlockCount();
                BB.comBroker.fire(BB.EVENTS.REMOVED_SCENE, this, null, self.m_selected_resource_id);
            });
        },

        /**
         Listen to keyboard events
         @method _listenKeyboard
         **/
        _listenKeyboard: function () {
            var self = this;
            if (_.isUndefined(self.m_canvas))
                return;
            $('canvas').attr('tabindex', '1');
            var keyDown = _.debounce(function (e) {
                if (self.m_objectScaling)
                    return;
                if (self.m_canvasMouseState)
                    return;
                var block = self.m_canvas.getActiveObject();
                if (_.isNull(block))
                    return;
                var dimensionProps = BB.comBroker.getService(BB.SERVICES['DIMENSION_PROPS_LAYOUT']);
                var values = dimensionProps.getValues();
                var val = e.shiftKey ? 25 : 1;
                switch (e.keyCode) {
                    case 38:
                    {
                        values.y = values.y - val;
                        break;
                    }
                    case 40:
                    {
                        values.y = values.y + val;
                        break;
                    }
                    case 37:
                    {
                        values.x = values.x - val;
                        break;
                    }
                    case 39:
                    {
                        values.x = values.x + val;
                        break;
                    }
                }
                dimensionProps.setValues(values, true);
                return false;
            }, 100);
            $('.upper-canvas').keydown(keyDown);
        },

        /**
         Listen to user selection of new scene
         @method _listenSceneNew
         **/
        _listenSceneNew: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.NEW_SCENE_ADD, function (e) {
                var player_data = BB.PepperHelper.getBlockBoilerplate('3510').getDefaultPlayerData(BB.CONSTS.PLACEMENT_IS_SCENE);
                self.createScene(player_data, false, true, e.edata.mimeType, e.edata.name);
            });
        },

        /**
         Listen when mouse enters canvas wrapper and announce it
         @method _listenMouseEnterCanvas
         **/
        _listenMouseEnterCanvas: function () {
            var self = this;
            $(Elements.SCENE_CANVAS_CONTAINER).on("mouseover", function (e) {
                BB.comBroker.fire(BB.EVENTS.MOUSE_ENTERS_CANVAS, self, self);
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
                if (self.m_rendering)
                    return;
                var blockIDs = e.edata;
                log('block(s) edited ' + blockIDs);
                var domPlayerData = pepper.getScenePlayerdataDom(self.m_selectedSceneID);
                self.m_blocks.blockSelected = blockIDs[0];
                self._preRender(domPlayerData, blockIDs);
                self._mementoAddState();
            });
        },

        /**
         Listen to any canvas right click
         @method _listenContextMenu
         **/
        _listenContextMenu: function () {
            var self = this;
            $(Elements.SCENE_CANVAS_CONTAINER).contextmenu({
                target: Elements.SCENE_CONTEXT_MENU,
                before: function (e, element, target) {
                    e.preventDefault();
                    // no canvas
                    if (_.isUndefined(self.m_canvas)) {
                        this.closemenu();
                        return false;
                    }
                    // remember right click position for pasting
                    self.m_mouseX = e.offsetX;
                    self.m_mouseY = e.offsetY;

                    // group selected
                    var active = self.m_canvas.getActiveGroup();
                    if (active) {
                        $('.blocksOnly', Elements.SCENE_CONTEXT_MENU).show();
                        return true;
                    }
                    // scene selected
                    var block = self.m_canvas.getActiveObject();
                    if (_.isNull(block)) {
                        $('.blocksOnly', Elements.SCENE_CONTEXT_MENU).hide();
                        return true;
                    }
                    // object selected
                    $('.blocksOnly', Elements.SCENE_CONTEXT_MENU).show();
                    return true;
                },
                onItem: function (context, e) {
                    self._onContentMenuSelection($(e.target).attr('name'))
                }
            });
        },

        /**
         On Scene right click context menu selection command
         @method _onContentMenuSelection
         @param {String} i_command
         **/
        _onContentMenuSelection: function (i_command) {
            var self = this;
            var blocks = [];

            var contextCmd = function (i_blocks) {
                switch (i_command) {
                    case 'copy':
                    {
                        self.m_copiesObjects = [];
                        _.each(i_blocks, function (selectedObject) {
                            var blockPlayerData = selectedObject.getBlockData().blockData;
                            blockPlayerData = pepper.stripPlayersID(blockPlayerData);
                            self.m_copiesObjects.push(blockPlayerData);
                        });
                        break;
                    }

                    case 'cut':
                    {
                        self.m_copiesObjects = [];
                        _.each(i_blocks, function (selectedObject) {
                            var blockData = selectedObject.getBlockData();
                            var blockPlayerData = blockData.blockData;
                            self._discardSelections();
                            pepper.removeScenePlayer(self.m_selectedSceneID, blockData.blockID);
                            self._disposeBlocks(blockData.blockID);
                            blockPlayerData = pepper.stripPlayersID(blockPlayerData);
                            self.m_copiesObjects.push(blockPlayerData);
                        });
                        self.m_canvas.renderAll();
                        self._updateBlockCount();
                        break;
                    }

                    case 'remove':
                    {
                        _.each(i_blocks, function (selectedObject) {
                            var blockData = selectedObject.getBlockData();
                            self._discardSelections();
                            pepper.removeScenePlayer(self.m_selectedSceneID, blockData.blockID);
                            self._disposeBlocks(blockData.blockID);
                        });
                        self.m_canvas.renderAll();
                        self._updateBlockCount();
                        break;
                    }

                    case 'paste':
                    {
                        var x, y, blockID, origX, origY, blockIDs = [];
                        _.each(self.m_copiesObjects, function (domPlayerData, i) {
                            blockID = pepper.generateSceneId();
                            $(domPlayerData).attr('id', blockID);
                            blockIDs.push(blockID);
                            var layout = $(domPlayerData).find('Layout');
                            if (i == 0) {
                                origX = parseInt(layout.attr('x'));
                                origY = parseInt(layout.attr('y'));
                                x = self.m_mouseX;
                                y = self.m_mouseY;
                            } else {
                                x = self.m_mouseX + (parseInt(layout.attr('x') - origX));
                                y = self.m_mouseY + (parseInt(layout.attr('y') - origY));
                            }
                            layout.attr('x', x);
                            layout.attr('y', y);
                            var player_data = (new XMLSerializer()).serializeToString(domPlayerData);
                            pepper.appendScenePlayerBlock(self.m_selectedSceneID, player_data);
                        });
                        self._discardSelections();
                        if (self.m_copiesObjects.length == 1) {
                            BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, [blockID]);
                        } else {
                            BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, blockIDs);
                        }
                        self._updateBlockCount();
                        break;
                    }
                }
            };

            // no canvas
            if (_.isUndefined(self.m_canvas)) {
                return;
            }
            // group selected
            var group = self.m_canvas.getActiveGroup();
            if (group) {
                log(i_command + ' on group');
                blocks = [];
                _.each(group.objects, function (selectedObject) {
                    blocks.push(selectedObject);
                });
                contextCmd(blocks);
                return;
            }
            // scene selected
            var block = self.m_canvas.getActiveObject();
            if (_.isNull(block)) {
                log(i_command + ' on scene');
                contextCmd(null);
                return;
            }
            // object selected
            log(i_command + ' on object');
            blocks = [];
            blocks.push(block);
            contextCmd(blocks);
            return true;
        },

        /**
         Listen to canvas scrolling
         @method _listenToCanvasScroll
         **/
        _listenToCanvasScroll: function () {
            var self = this;
            var sceneScrolling = _.debounce(function () {
                $(Elements.SCENE_CANVAS_CONTAINER).scroll(function (e) {
                    self.m_sceneScrollTop = $('#scenesPanel').scrollTop();
                    self.m_sceneScrollLeft = $('#scenesPanel').scrollLeft();
                    self.m_canvas.calcOffset();
                });
            }, 500);
            $(Elements.SCENE_CANVAS_CONTAINER).scroll(sceneScrolling);
        },

        /**
         Listen to and add new component / resources to scene
         @method _listenAddBlockWizard
         @param {event} e
         **/
        _listenAddBlockWizard: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.ADD_NEW_BLOCK_SCENE, function (e) {
                var blockID = pepper.generateSceneId();
                var player_data = BB.PepperHelper.getBlockBoilerplate(e.edata.blockCode).getDefaultPlayerData(BB.CONSTS.PLACEMENT_SCENE, e.edata.resourceID);
                var domPlayerData = $.parseXML(player_data);
                $(domPlayerData).find('Player').attr('id', blockID);
                player_data = (new XMLSerializer()).serializeToString(domPlayerData);
                pepper.appendScenePlayerBlock(self.m_selectedSceneID, player_data);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, [blockID]);
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
                if (_.isNull(block)) {
                    self._discardSelections();
                    return;
                }
                self.m_canvas.bringToFront(block);
                self._updateZorder(self.PUSH_TOP, block);
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
                if (_.isNull(block)) {
                    self._discardSelections();
                    return;
                }
                self.m_canvas.sendToBack(block);
                self._updateZorder(self.PUSH_BOTTOM, block);
                self._mementoAddState();
            });
        },

        /**
         Listen grid magnet when dragging objects
         @method _listenGridMagnet
         **/
        _listenGridMagnet: function () {
            var self = this;
            $(Elements.SCENE_GRID_MAGNET).on('click', function () {
                if (self.m_rendering || _.isUndefined(self.m_canvas))
                    return;
                switch (self.m_gridMagneticMode) {
                    case 0:
                    {
                        self.m_gridMagneticMode = 1;
                        break;
                    }
                    case 1:
                    {
                        self.m_gridMagneticMode = 2;
                        break;
                    }
                    case 2:
                    {
                        self.m_gridMagneticMode = 0;
                        break;
                    }
                }
                self.m_sceneBlock.setCanvas(self.m_canvas, self.m_gridMagneticMode);
            });
        },

        /**
         @method _sceneProcessing
         **/
        _sceneProcessing: function (i_status, i_callBack) {
            var self = this;
            if (i_status) {
                $(Elements.SCENE_PROCESSING).css({
                    width: $('#scenePanelWrap').width(),
                    height: $('#scenePanelWrap').height()
                })
                $(Elements.SCENE_PROCESSING).fadeTo('fast', 0.7, i_callBack);
            } else {
                $(Elements.SCENE_PROCESSING).fadeOut('slow', i_callBack);
            }
        },

        /**
         Listen to undo and redo
         @method _listenMemento
         **/
        _listenMemento: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_UNDO, function (e) {
                if (self.m_rendering)
                    return;
                self.m_blocks.blockSelected = undefined;
                self._discardSelections();
                self._mementoLoadState('undo');
            });
            BB.comBroker.listen(BB.EVENTS.SCENE_REDO, function (e) {
                if (self.m_rendering)
                    return;
                self.m_blocks.blockSelected = undefined;
                self._discardSelections();
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
         Update the z-order index of an object
         @method _updateZorder
         @param {String} i_pushDirection
         @param {Object} i_block
         **/
        _updateZorder: function (i_pushDirection, i_block) {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            var active = self.m_canvas.getActiveGroup();
            if (active)
                return;
            var blockID = i_block.getBlockData().blockID;
            var sceneDomPlayerData = pepper.getScenePlayerdataDom(self.m_selectedSceneID);
            var domBlockData = $(sceneDomPlayerData).find('[id="' + blockID + '"]');
            switch (i_pushDirection) {
                case self.PUSH_TOP:
                {
                    $(sceneDomPlayerData).find('Players').append($(domBlockData));
                    break;
                }
                case self.PUSH_BOTTOM:
                {
                    $(sceneDomPlayerData).find('Players').prepend($(domBlockData));
                    break;
                }
            }
            pepper.setScenePlayerData(self.m_selectedSceneID, (new XMLSerializer()).serializeToString(sceneDomPlayerData));
        },

        /**
         Pre render creates all of the Fabric blocks that will later get added when we call _render
         This allows for smooth (non flickering) rendering since when we are ready to render, the blocks have
         already been instantiated and ready to be added to canvas
         @method _preRender
         @param {Object} i_domPlayerData
         @param {Object} [i_blockIDs] optionally render only a single block
         **/
        _preRender: function (i_domPlayerData, i_blockIDs) {
            var self = this;
            var zIndex = -1;
            self._renderPause();
            self.m_blocks.blocksPre = [];
            self.m_blocks.blocksPost = {};
            log('pre-rendering new blocks');

            // if rendering specific blocks instead of entire canvas
            if (i_blockIDs) {
                $(i_domPlayerData).find('Players').children('Player').each(function (i, player) {
                    zIndex++;
                    var blockID = $(player).attr('id');
                    if (_.indexOf(i_blockIDs, blockID) > -1) {
                        var block = {
                            blockID: blockID,
                            blockType: $(player).attr('player'),
                            zIndex: zIndex,
                            player_data: (new XMLSerializer()).serializeToString(player)
                        };
                        self.m_blocks.blocksPre.push(block);
                    }
                });
            } else {
                $(i_domPlayerData).find('Players').children('Player').each(function (i, player) {
                    var block = {
                        blockID: $(player).attr('id'),
                        blockType: $(player).attr('player'),
                        zIndex: -1,
                        player_data: (new XMLSerializer()).serializeToString(player)

                    };
                    self.m_blocks.blocksPre.push(block);
                });
            }
            self._createBlock(i_blockIDs);
        },

        /**
         Render the pre created blocks (via _preRender) and add all blocks to fabric canvas
         @method _render
         **/
        _render: function (i_blockIDs) {
            var self = this;
            if (!self.m_canvas)
                return;
            var nZooms = Math.round(Math.log(1 / self.m_canvasScale) / Math.log(1.2));
            var selectedBlockID = self.m_blocks.blockSelected;
            var createAll = i_blockIDs[0] == undefined ? true : false; // if to re-render entire canvas

            if (createAll) {
                self._disposeBlocks();
                self._zoomReset();
            } else {
                // if to re-render only changed blocks
                for (var i = 0; i < i_blockIDs.length; i++)
                    self._disposeBlocks(i_blockIDs[i]);
            }
            _.forEach(self.m_blocks.blocksPost, function (i_block) {
                self.m_canvas.add(i_block);
            });
            if (createAll) {
                self._resetAllObjectScale();
                self._zoomTo(nZooms);
            } else {
                // if to re-render only changed blocks
                _.forEach(self.m_blocks.blocksPost, function (i_block) {
                    var zIndex = i_block.getZindex();
                    if (zIndex > -1)
                        i_block.moveTo(zIndex);
                    self.m_canvas.setActiveObject(i_block);
                    self._zoomToBlock(nZooms, i_block);
                    self._resetObjectScale(i_block);
                });
            }
            self._scrollTo(self.m_sceneScrollTop, self.m_sceneScrollLeft);
            self.m_canvas.renderAll();
            self._sceneProcessing(false, function () {
            });
            self._renderContinue();
            if (createAll)
                self._updateBlockCount();

            // select previous selection
            if (_.isUndefined(selectedBlockID))
                return;
            if (createAll) {
                for (var i = 0; i < self.m_canvas.getObjects().length; i++) {
                    if (selectedBlockID == self.m_canvas.item(i).getBlockData().blockID) {
                        self._blockSelected(self.m_canvas.item(i));
                        break;
                    }
                }
            } else {
                var block = self.m_blocks.blocksPost[Object.keys(self.m_blocks.blocksPost)[0]];
                self._blockSelected(block);
            }
        },

        /**
         Prevent rendering of canvas to continue and remove canvas listeners
         @method _renderPause
         **/
        _renderPause: function () {
            var self = this;
            self.m_rendering = true;
            if (_.isUndefined(self.m_canvas))
                return;
            self.m_canvas.removeListeners();
        },

        /**
         Allow rendering of canvas to continue and add canvas listeners
         @method _renderContinue
         **/
        _renderContinue: function () {
            var self = this;
            self.m_rendering = false;
            if (_.isUndefined(self.m_canvas))
                return;
            self.m_canvas._initEventListeners();
        },

        /**
         Create all the blocks that have been pre injected to m_blocks.blocksPre and after each block
         is created created the next block; thus creating blocks sequentially due to fabric bug. When no
         more blocks are to be created (m_blocks.blocksPre queue is empty) we _render the canvas
         @method _createBlock
         @param {Array} [i_blockIDs] optional array of block ids to render, or non if we render the entire canvas
         **/
        _createBlock: function (i_blockIDs) {
            var self = this;
            var blockData = self.m_blocks.blocksPre.shift();
            if (blockData == undefined) {
                self._render([i_blockIDs]);
                return;
            }
            var newBlock = self.m_blockFactory.createBlock(blockData.blockID, blockData.player_data, BB.CONSTS.PLACEMENT_SCENE, self.m_selectedSceneID);
            newBlock.setZindex(blockData.zIndex);
            var blockID = newBlock.getBlockData().blockID;
            newBlock.fabricateBlock(self.m_canvasScale, function () {
                self.m_blocks.blocksPost[blockID] = newBlock;
                self._createBlock(i_blockIDs);
            });
        },

        /**
         Announce to all that scene was re-rendered but do it via debounce
         @method _delegateSceneBlockModified
         **/
        _delegateSceneBlockModified: function () {
            var self = this;
            self._sceneBlockModified = _.debounce(function (e) {
                BB.comBroker.fire(BB.EVENTS.SCENE_BLOCKS_RENDERED, self, self.m_canvas);
                self._mementoAddState();
                // self._drawGrid();
            }, 200);
        },

        /**
         Anytime the containing StackView is selected, re-render
         removed while we were gone
         @method _listenStackViewSelected
         **/
        _listenStackViewSelected: function () {
            var self = this;
            var appContentFaderView = BB.comBroker.getService(BB.SERVICES['APP_CONTENT_FADER_VIEW']);
            appContentFaderView.on(BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == BB.comBroker.getService(BB.SERVICES['SCENES_LOADER_VIEW'])) {
                    setTimeout(function () {
                        if (_.isUndefined(self.m_canvas))
                            return;
                        self.m_canvas.calcOffset();
                    }, 500);
                }
            });
        },

        /**
         Listen to when the app is resized so we can re-render
         @method _listenAppResized
         **/
        _listenAppResized: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.APP_SIZED, function (e) {
                if (_.isUndefined(self.m_canvas))
                    return;
                self.m_canvas.calcOffset();
            });
        },

        /**
         Scene block scales via mouse UI
         @method _sceneBlockScaled
         @param {Event} e
         **/
        _sceneBlockScaled: function (e) {
            var self = this;
            if (self.m_objectScaling)
                return;
            self.m_objectScaling = 1;
            var block = e.target;
            if (_.isUndefined(block))
                return;
            block.on('modified', function () {
                setTimeout(function () {
                    block.off('modified');
                    var blockID = block.getBlockData().blockID;
                    BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, [blockID]);
                    self.m_objectScaling = 0;
                }, 15);
            });
        },

        /**
         Scene block moving
         @method _sceneBlockMoving
         @param {Object} i_options
         **/
        _sceneBlockMoving: function (i_options) {
            var self = this;
            var grid = 0;
            if (i_options.target.lockMovementX)
                return;
            if (self.m_gridMagneticMode == 0)
                return;
            if (self.m_gridMagneticMode == 1)
                grid = 5;
            if (self.m_gridMagneticMode == 2)
                grid = 10;
            i_options.target.set({
                left: Math.round(i_options.target.left / grid) * grid,
                top: Math.round(i_options.target.top / grid) * grid
            });
        },

        /**
         Listen to changes in scale so we can reset back to non-zoom on any block object
         @method _listenBlockModified
         **/
        _listenBlockModified: function () {
            var self = this;
            self.m_canvas.on({
                //'object:moving': self.m_objectScaleHandler,
                //'object:selected': self.m_objectScaleHandler,
                'object:modified': self._sceneBlockModified,
                'object:scaling': $.proxy(self._sceneBlockScaled, self)
            });
            self.m_canvas.on('object:moving', $.proxy(self._sceneBlockMoving, self));
        },

        _drawGrid: function () {
            var self = this;
            self.m_canvas.setBackgroundColor('', self.m_canvas.renderAll.bind(self.m_canvas));
            var context = $(self.m_canvas)[0].getContext("2d");
            var h = 600;
            var w = 700;
            for (var x = 0.5; x < (w + 1); x += 10) {
                context.moveTo(x, 0);
                context.lineTo(x, (h + 1));
            }
            for (var y = 0.5; y < (h + 1); y += 10) {
                context.moveTo(0, y);
                context.lineTo(w, y);
            }
            context.globalAlpha = 0.1;
            context.strokeStyle = "black";
            context.stroke();
            context.globalAlpha = 1;
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

            self.m_canvas.on('mouse:down', function (options) {
                self.m_canvasMouseState = 1;
            });

            self.m_canvas.on('mouse:up', function (options) {
                self.m_canvasMouseState = 0;
                var active = self.m_canvas.getActiveObject();
                var group = self.m_canvas.getActiveGroup();

                //options.e.stopImmediatePropagation();
                //options.e.preventDefault();

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
                            // objectPos.x = objectPos.x * -1;
                            // objectPos.y = objectPos.y * -1;
                            return;
                        }
                        var blockID = selectedObject.getBlockData().blockID;
                        log('object: ' + selectedObject.m_blockType + ' ' + blockID);
                        self._updateBlockCords(selectedObject, true, objectPos.x, objectPos.y, selectedObject.currentWidth, selectedObject.currentHeight, selectedObject.angle);
                        // self._updateZorder();
                    });
                    // self._mementoAddState();
                    selectedGroup.hasControls = false;
                    self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
                    return;
                }

                //// Object
                if (options.target || active) {
                    var block = options.target || active;
                    self._blockSelected(block);
                    return;
                }

                //// Scene
                self._sceneCanvasSelected();
                log('scene: ' + self.m_selectedSceneID);
                // log('object ' + options.e.clientX + ' ' + options.e.clientY + ' ' + options.target.m_blockType);

            });
        },

        /**
         Select a block object on the canvas
         @method _blockSelected
         @param {Object} i_block
         **/
        _blockSelected: function (i_block) {
            var self = this;
            self.m_canvas.setActiveObject(i_block);
            var blockID = i_block.getBlockData().blockID;
            log('object: ' + i_block.m_blockType + ' ' + blockID);
            self._updateBlockCords(i_block, true, i_block.left, i_block.top, i_block.currentWidth, i_block.currentHeight, i_block.angle);
            BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, blockID);
        },

        /**
         Deselect current group and or block selections
         @method _canvasDiscardSelections
         **/
        _discardSelections: function () {
            var self = this;
            if (!self.m_canvas)
                return;
            self.m_canvas.discardActiveGroup();
            self.m_canvas.discardActiveObject();
        },

        /**
         Set the scene (i.e.: Canvas) as the selected block
         @method _sceneCanvasSelected
         **/
        _sceneCanvasSelected: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            self._discardSelections();
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
                        self._blockSelected(self.m_canvas.item(i));
                        break;
                    }
                }
            });
        },

        /**
         Update the coordinates of a block in pepper db, don't allow below w/h MIN_SIZE
         @method _updateBlockCords
         @param {String} blockID
         @param {Boolean} i_calcScale
         @param {Number} x
         @param {Number} y
         @param {Number} w
         @param {Number} h
         **/
        _updateBlockCords: function (i_block, i_calcScale, x, y, w, h, a) {
            var self = this;

            var blockID = i_block.getBlockData().blockID;
            var blockMinWidth = i_block.getBlockData().blockMinWidth;
            var blockMinHeight = i_block.getBlockData().blockMinHeight;

            if (i_calcScale) {
                var sy = 1 / self.m_canvasScale;
                var sx = 1 / self.m_canvasScale;
                h = h * sy;
                w = w * sx;
                x = x * sx;
                y = y * sy;
            }

            if (h < blockMinHeight)
                h = blockMinHeight;
            if (w < blockMinWidth)
                w = blockMinWidth;

            var domPlayerData = pepper.getScenePlayerdataBlock(self.m_selectedSceneID, blockID);
            var layout = $(domPlayerData).find('Layout');
            layout.attr('rotation', parseInt(a));
            layout.attr('x', parseInt(x));
            layout.attr('y', parseInt(y));
            layout.attr('width', parseInt(w));
            layout.attr('height', parseInt(h));
            var player_data = (new XMLSerializer()).serializeToString(domPlayerData);
            pepper.setScenePlayerdataBlock(self.m_selectedSceneID, blockID, player_data);
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
            // self.m_canvas.renderAll();
        },

        /**
         Reset a canvas object so its scale is set to 1
         @method _resetObjectScale
         **/
        _resetObjectScale: function (i_target) {
            var self = this;
            if (_.isNull(i_target))
                return;
            if (i_target.width != i_target.currentWidth || i_target.height != i_target.currentHeight) {
                i_target.width = i_target.currentWidth;
                i_target.height = i_target.currentHeight;
                i_target.scaleX = 1;
                i_target.scaleY = 1;
            }
        },

        /**
         Remove all block instances
         @method _disposeBlocks
         @params {Number} [i_blockID] optional to remove only a single block
         **/
        _disposeBlocks: function (i_blockID) {
            var self = this, i;
            if (_.isUndefined(self.m_canvas))
                return;
            var totalObjects = self.m_canvas.getObjects().length;
            var c = -1;
            for (i = 0; i < totalObjects; i++) {
                c++;
                var block = self.m_canvas.item(c);
                // single block
                if (i_blockID) {
                    if (block.getBlockData().blockID == i_blockID) {
                        block.selectable = false; // fix fabric scale block bug
                        self.m_canvas.remove(block);
                        block.deleteBlock();
                        break;
                    }
                } else {
                    // all blocks
                    block.selectable = false; // fix fabric scale block bug
                    self.m_canvas.remove(block);
                    if (block) {
                        block.deleteBlock();
                        c--;
                    }
                }
            }
            if (!i_blockID)
                self.m_canvas.clear();
        },

        _canvasUnselectable: function () {
            var self = this, i;
            if (_.isUndefined(self.m_canvas))
                return;
            self.m_canvas.removeListeners();
            //self.m_canvas.interactive = false;
            // self.m_canvas.selection = false;
            var totalObjects = self.m_canvas.getObjects().length;
            var c = -1;
            for (i = 0; i < totalObjects; i++) {
                c++;
                var block = self.m_canvas.item(c);
                block.selectable = false;
                if (block)
                    c--;
            }
        },

        /**
         Listen to all zoom events via wiring the UI
         @method _listenZoom
         **/
        _listenZoom: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.SCENE_ZOOM_IN, function (e) {
                self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
                self._zoomIn();
                self._discardSelections();
                self._resetAllObjectScale();
                self.m_canvas.renderAll();
            });
            BB.comBroker.listen(BB.EVENTS.SCENE_ZOOM_OUT, function (e) {
                self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
                self._zoomOut();
                self._discardSelections();
                self._resetAllObjectScale();
                self.m_canvas.renderAll();
            });
            BB.comBroker.listen(BB.EVENTS.SCENE_ZOOM_RESET, function (e) {
                self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).resetPropertiesView();
                self._zoomReset();
                self._resetAllObjectScale();
                self.m_canvas.renderAll();
            });
        },

        /**
         Zoom to scale size
         @method _zoomTo
         @param {Number} nZooms
         **/
        _zoomTo: function (nZooms) {
            var self = this, i;
            if (nZooms > 0) {
                for (i = 0; i < nZooms; i++)
                    self._zoomOut();
            } else {
                for (i = 0; i > nZooms; nZooms++)
                    self._zoomIn();
            }
        },

        /**
         Zoom to scale size
         @method _zoomTo
         @param {Number} nZooms
         **/
        _zoomToBlock: function (nZooms, block) {
            var self = this, i;
            if (nZooms > 0) {
                for (i = 0; i < nZooms; i++)
                    self._zoomOutBlock(block);
            } else {
                for (i = 0; i > nZooms; nZooms++)
                    self._zoomInBlock(block);
            }
        },

        /**
         Scroll canvas to set position
         @method _scrollTo
         @param {Number} i_top
         @param {Number} i_left
         **/
        _scrollTo: function (i_top, i_left) {
            var self = this;
            $(Elements.SCENES_PANEL).scrollTop(i_top);
            $(Elements.SCENES_PANEL).scrollLeft(i_left);
        },

        /**
         Zoom scene in
         @method _zoomIn
         **/
        _zoomIn: function () {
            var self = this;
            if (_.isUndefined(self.m_selectedSceneID))
                return;
            self.m_canvasScale = self.m_canvasScale * self.SCALE_FACTOR;
            self.m_canvas.setHeight(self.m_canvas.getHeight() * self.SCALE_FACTOR);
            self.m_canvas.setWidth(self.m_canvas.getWidth() * self.SCALE_FACTOR);

            var objects = self.m_canvas.getObjects();
            for (var i in objects) {
                if (_.isNull(objects[i]))
                    return;
                self._zoomInBlock(objects[i]);
            }
        },

        /**
         Zoom scene in
         @method _zoomIn
         **/
        _zoomInBlock: function (i_block) {
            var self = this;
            var scaleX = i_block.scaleX;
            var scaleY = i_block.scaleY;
            var left = i_block.left;
            var top = i_block.top;
            var tempScaleX = scaleX * self.SCALE_FACTOR;
            var tempScaleY = scaleY * self.SCALE_FACTOR;
            var tempLeft = left * self.SCALE_FACTOR;
            var tempTop = top * self.SCALE_FACTOR;

            i_block['canvasScale'] = self.m_canvasScale;
            i_block.scaleX = tempScaleX;
            i_block.scaleY = tempScaleY;
            i_block.left = tempLeft;
            i_block.top = tempTop;
            i_block.setCoords();

            if (i_block.forEachObject != undefined) {
                i_block.forEachObject(function (obj) {
                    var scaleX = obj.scaleX;
                    var scaleY = obj.scaleY;
                    var left = obj.left;
                    var top = obj.top;
                    var tempScaleX = scaleX * self.SCALE_FACTOR;
                    var tempScaleY = scaleY * self.SCALE_FACTOR;
                    var tempLeft = left * self.SCALE_FACTOR;
                    var tempTop = top * self.SCALE_FACTOR;
                    obj['canvasScale'] = self.m_canvasScale;
                    obj.scaleX = tempScaleX;
                    obj.scaleY = tempScaleY;
                    obj.left = tempLeft;
                    obj.top = tempTop;
                    obj.setCoords();
                });
            }
        },

        /**
         Zoom scene out
         @method _zoomOut
         **/
        _zoomOutBlock: function (i_block) {
            var self = this;
            var scaleX = i_block.scaleX;
            var scaleY = i_block.scaleY;
            var left = i_block.left;
            var top = i_block.top;
            var tempScaleX = scaleX * (1 / self.SCALE_FACTOR);
            var tempScaleY = scaleY * (1 / self.SCALE_FACTOR);
            var tempLeft = left * (1 / self.SCALE_FACTOR);
            var tempTop = top * (1 / self.SCALE_FACTOR);
            i_block['canvasScale'] = self.m_canvasScale;
            i_block.scaleX = tempScaleX;
            i_block.scaleY = tempScaleY;
            i_block.left = tempLeft;
            i_block.top = tempTop;
            i_block.setCoords();

            if (i_block.forEachObject != undefined) {
                i_block.forEachObject(function (obj) {
                    var scaleX = obj.scaleX;
                    var scaleY = obj.scaleY;
                    var left = obj.left;
                    var top = obj.top;
                    var tempScaleX = scaleX * (1 / self.SCALE_FACTOR);
                    var tempScaleY = scaleY * (1 / self.SCALE_FACTOR);
                    var tempLeft = left * (1 / self.SCALE_FACTOR);
                    var tempTop = top * (1 / self.SCALE_FACTOR);
                    obj['canvasScale'] = self.m_canvasScale;
                    obj.scaleX = tempScaleX;
                    obj.scaleY = tempScaleY;
                    obj.left = tempLeft;
                    obj.top = tempTop;
                    obj.setCoords();
                });
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
            self.m_canvasScale = self.m_canvasScale / self.SCALE_FACTOR;
            self.m_canvas.setHeight(self.m_canvas.getHeight() * (1 / self.SCALE_FACTOR));
            self.m_canvas.setWidth(self.m_canvas.getWidth() * (1 / self.SCALE_FACTOR));
            var objects = self.m_canvas.getObjects();
            for (var i in objects) {
                if (_.isNull(objects[i]))
                    return;
                self._zoomOutBlock(objects[i]);
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
            self._discardSelections();
            self.m_canvas.setHeight(self.m_canvas.getHeight() * (1 / self.m_canvasScale));
            self.m_canvas.setWidth(self.m_canvas.getWidth() * (1 / self.m_canvasScale));
            var objects = self.m_canvas.getObjects();
            for (var i in objects) {
                if (_.isNull(objects[i]))
                    return;
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

                if (objects[i].forEachObject != undefined) {
                    objects[i].forEachObject(function (obj) {
                        var scaleX = obj.scaleX;
                        var scaleY = obj.scaleY;
                        var left = obj.left;
                        var top = obj.top;
                        var tempScaleX = scaleX * (1 / self.m_canvasScale);
                        var tempScaleY = scaleY * (1 / self.m_canvasScale);
                        var tempLeft = left * (1 / self.m_canvasScale);
                        var tempTop = top * (1 / self.m_canvasScale);
                        obj.scaleX = tempScaleX;
                        obj.scaleY = tempScaleY;
                        obj.left = tempLeft;
                        obj.top = tempTop;
                        obj.setCoords();
                        obj['canvasScale'] = 1;
                    });
                }
            }
            self.m_canvasScale = 1;
        },

        /**
         Remove a Scene and cleanup after
         @method disposeScene
         **/
        disposeScene: function () {
            var self = this;
            if (_.isUndefined(self.m_canvas))
                return;
            self.m_canvas.off('mouse:up');
            self.m_blocks.blocksPost = {};
            self._disposeBlocks();
            self.m_sceneBlock.deleteBlock();
            self.m_canvas.dispose();
            self.m_canvas = undefined;
            self.m_property.resetPropertiesView();
        },

        /**
         Create a new scene based on player_data and strip injected IDs if arged
         @method createScene
         @param {String} i_scenePlayerData
         @optional {Boolean} i_stripIDs
         @optional {Boolean} i_loadScene
         @optional {String} i_mimeType
         @optional {String} i_name
         **/
        createScene: function (i_scenePlayerData, i_stripIDs, i_loadScene, i_mimeType, i_name) {
            var self = this;
            if (i_stripIDs)
                i_scenePlayerData = pepper.stripPlayersID(i_scenePlayerData);
            self.m_selectedSceneID = pepper.createScene(i_scenePlayerData, i_mimeType, i_name);
            // BB.comBroker.fire(BB.EVENTS.NEW_SCENE_ADDED, this, null, self.m_selectedSceneID);
            if (i_loadScene)
                self._loadScene();
            BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this, null);
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