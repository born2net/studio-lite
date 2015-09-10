/**
 * BlockCollection block resides inside a scene or timeline
 * @class BlockCollection
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block', 'bootstrap-table-editable', 'bootstrap-table-sort-rows'], function ($, Backbone, Block, bootstraptableeditable, bootstraptablesortrows) {

        var BlockCollection = Block.extend({

            /**
             Constructor
             @method initialize
             **/
            constructor: function (options) {
                var self = this;
                self.m_blockType = 4100;
                _.extend(options, {blockType: self.m_blockType});
                Block.prototype.constructor.call(this, options);

                self.m_collectionTable = $(Elements.COLLECTION_TABLE);
                self.m_collectionEventTable = $(Elements.COLLECTION_EVENTS_TABLE);
                self.m_selectRowIndex = -1;
                self._initSubPanel(Elements.BLOCK_COLLECTION_COMMON_PROPERTIES);
                self._listenCollectionRowDragged();
                self._listenCollectionRowDropped();
                self._listenAddResource();
                self._listenRemoveResource();
                self._listenModeChange();
                self._listenCollectionRowChanged();

                self.m_blockProperty._collectionDatatableInit();

                /* can set global mode if we wish */
                //$.fn.editable.defaults.mode = 'inline';

                self.m_actions = {
                    firstPage: 'beginning',
                    nextPage: 'next',
                    prevPage: 'previous',
                    lastPage: 'last',
                    selectPage: 'selected'
                }
            },

            /**
             Listen to changes in volume control
             @method _listenVolumeChange
             **/
            _listenCollectionRowDragged: function () {
                var self = this;
                self.m_collectionRowDraggedHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    self.m_selectRowIndex = e.edata;
                    var domPlayerData = self._getBlockPlayerData();
                    return;
                    var xSnippet = $(domPlayerData).find('YouTube');
                    $(xSnippet).attr('volume', volume);
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                };
                BB.comBroker.listen(BB.EVENTS.COLLECTION_ROW_DRAG, self.m_collectionRowDraggedHandler);
            },

            /**
             Listen to when removing a resource from collection list
             The algorithm will uses our bootstrap-table own inject rowIndex value
             and counts up to match with the order of <Pages/> in msdb collection, once matched against same value
             we delete the proper ordered collection item from msdb and refresh the entire table
             @method _listenRemoveResource
             **/
            _listenCollectionRowChanged: function () {
                var self = this;
                self.m_collectionRowChangedHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    var domPlayerData = self._getBlockPlayerData();
                    var rowIndex = e.edata.rowIndex;
                    var newName = e.edata.name;
                    var newDuration = parseInt(e.edata.duration);
                    if (_.isNaN(newDuration)) {
                        bootbox.alert($(Elements.MSG_BOOTBOX_ENTRY_IS_INVALID).text());
                        self._populateTableCollection(domPlayerData);
                        return;
                    }
                    var item = $(domPlayerData).find('Collection').children().get(rowIndex);
                    $(item).attr('page', newName).attr('duration', newDuration);
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableCollection(domPlayerData);
                };
                BB.comBroker.listen(BB.EVENTS.COLLECTION_ROW_CHANGED, self.m_collectionRowChangedHandler);
            },

            /**
             Listen to changes in volume control
             @method _listenVolumeChange
             **/
            _listenCollectionRowDropped: function () {
                var self = this;
                self.m_collectionRowDroppedHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    var droppedRowIndex = e.edata;
                    var domPlayerData = self._getBlockPlayerData();
                    var target = $(domPlayerData).find('Collection').children().get(parseInt(droppedRowIndex));
                    var source = $(domPlayerData).find('Collection').children().get(self.m_selectRowIndex);
                    droppedRowIndex > self.m_selectRowIndex ? $(target).after(source) : $(target).before(source);
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableCollection(domPlayerData);
                };
                BB.comBroker.listen(BB.EVENTS.COLLECTION_ROW_DROP, self.m_collectionRowDroppedHandler);
            },

            /**
             Load up property values in the common panel
             @method _populate
             @return none
             **/
            _populate: function () {
                var self = this;
                self._setCollectionBlockGlobalValidationOwner(self);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetCollection = $(domPlayerData).find('Collection');
                var mode = $(xSnippetCollection).attr('mode');
                self._populateTableCollection(domPlayerData);
                self._checkKioskMode(mode, domPlayerData);
            },

            /**
             Load event list to the UI
             @method _populateTableCollection
             @param {Object} i_domPlayerData
             **/
            _populateTableCollection: function (i_domPlayerData) {
                var self = this;
                self.m_collectionTable.bootstrapTable('removeAll');
                var data = [], rowIndex = 0;
                $(i_domPlayerData).find('Collection').children().each(function (k, page) {
                    var resource_hResource, scene_hDataSrc;
                    var type = $(page).attr('type');
                    if (type == 'resource') {
                        resource_hResource = $(page).find('Resource').attr('hResource');
                    } else {
                        scene_hDataSrc = $(page).find('Player').attr('hDataSrc');
                    }
                    data.push({
                        rowIndex: rowIndex,
                        checkbox: true,
                        name: $(page).attr('page'),
                        duration: $(page).attr('duration'),
                        type: type,
                        resource_hResource: resource_hResource,
                        scene_hDataSrc: scene_hDataSrc
                    });
                    rowIndex++;
                });
                self.m_collectionTable.bootstrapTable('load', data);
            },

            /**
             Set mode of Kiosk (enable / disabled)
             @method _checkKioskMode
             @param {String} i_mode
             @param {Object} i_domPlayerData
             **/
            _checkKioskMode: function (i_mode, i_domPlayerData) {
                var self = this;
                if (i_mode == "kiosk") {
                    self._populateKioskModeSlider(true);
                    self._populateTableEvents(i_domPlayerData);
                } else {
                    self._populateKioskModeSlider(false);
                    self._populateSlideshowDuration(i_domPlayerData);
                }
            },

            /**
             Listen to mode change between Kiosk and Slideshow modes
             @method _listenModeChange
             **/
            _listenModeChange: function () {
                var self = this;
                self.sliderInput = function () {
                    if (!self.m_selected)
                        return;
                    var mode = $(Elements.COLLECTION_KIOSK_MODE).prop('checked');
                    self._populateKioskModeSlider(mode);
                    var domPlayerData = self._getBlockPlayerData();
                    $(domPlayerData).find('Collection').attr('mode', mode ? 'kiosk' : 'slideshow');
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                };
                $(Elements.COLLECTION_KIOSK_MODE).on('change', self.sliderInput);
            },

            /**
             Render the checkbox slider according to current Kiosk mode for block
             @method _populateKioskModeSlider
             @param {Boolean} i_status
             **/
            _populateKioskModeSlider: function (i_status) {
                var self = this;
                if (i_status) {
                    self.m_collectionEventTable.bootstrapTable('removeAll');
                    $(Elements.COLLECTION_KIOSK_MODE).prop('checked', true);
                    $(Elements.KIOSK_KEVENTS_CONTAINER).show();
                    $(Elements.COLLECTION_SLIDESHOW_DURATION_CONTAINER).hide();
                } else {
                    $(Elements.COLLECTION_KIOSK_MODE).prop('checked', false);
                    $(Elements.KIOSK_KEVENTS_CONTAINER).hide();
                    $(Elements.COLLECTION_SLIDESHOW_DURATION_CONTAINER).show();
                }
            },

            /**
             Load event list to the UI
             @method _populateTableEvents
             @param {Object} i_domPlayerData
             **/
            _populateTableEvents: function (i_domPlayerData) {
                var self = this;
                var data = [];
                $(i_domPlayerData).find('EventCommands').children().each(function (k, eventCommand) {
                    var pageName = '';
                    if ($(eventCommand).attr('command') == 'selectPage')
                        pageName = $(eventCommand).find('Page').attr('name');
                    data.push({
                        checkbox: true,
                        event: $(eventCommand).attr('from'),
                        pageName: pageName,
                        action: self.m_actions[$(eventCommand).attr('command')]
                    })
                });
                self.m_collectionEventTable.bootstrapTable('load', data);
            },

            /**
             Load up the duration for how long to play slide shows (when not in kiosk mode);
             @method _populateSlideshowDuration
             @param {Number} i_domPlayerData
             @return {Number} Unique clientId.
             **/
            _populateSlideshowDuration: function (i_domPlayerData) {
                var self = this;
                var duration = $(i_domPlayerData).find('Collection').attr('duration');
                $(Elements.COLLECTION_SLIDESHOW_DURATION).val(duration);
            },

            /**
             Listen to when AddBlockListView announced that a new resource or scene needs to be added
             and if this collection block is selected, go ahead and create one in Bootstrap-table and msdb
             @method _listenAddResource
             **/
            _listenAddResource: function () {
                var self = this;
                self.m_addNewCollectionListItem = function () {
                    BB.comBroker.stopListenWithNamespace(BB.EVENTS.ADD_NEW_BLOCK_LIST, self);

                    if (!self.m_selected)
                        return;
                    var addBlockView;
                    if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL) {
                        addBlockView = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_VIEW);
                    } else if (self.m_placement = BB.CONSTS.PLACEMENT_SCENE) {
                        addBlockView = BB.comBroker.getService(BB.SERVICES.ADD_SCENE_BLOCK_VIEW);
                    }
                    addBlockView.setPlacement(BB.CONSTS.PLACEMENT_LISTS);
                    addBlockView.selectView();
                    BB.comBroker.listenWithNamespace(BB.EVENTS.ADD_NEW_BLOCK_LIST, self, function (e) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        self._addCollectionNewListItem(e);
                        BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.m_block_id);
                    });
                };
                $(Elements.ADD_RESOURCE_TO_COLLECTION).on('click', self.m_addNewCollectionListItem);
            },

            /**
             Listen to when removing a resource from collection list
             The algorithm will uses our bootstrap-table own inject rowIndex value
             and counts up to match with the order of <Pages/> in msdb collection, once matched against same value
             we delete the proper ordered collection item from msdb and refresh the entire table
             @method _listenRemoveResource
             **/
            _listenRemoveResource: function () {
                var self = this;
                self.m_removeCollectionListItem = function () {
                    if (!self.m_selected)
                        return;
                    if (self.m_collectionTable.bootstrapTable('getSelections').length == 0) {
                        bootbox.alert($(Elements.MSG_BOOTBOX_NO_ITEM_SELECTED).text());
                        return;
                    }
                    var rowIndex = $('input[name=btSelectItem]:checked', Elements.COLLECTION_TABLE).closest('tr').attr('data-index');
                    var domPlayerData = self._getBlockPlayerData();
                    $(domPlayerData).find('Collection').children().get(rowIndex).remove();
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableCollection(domPlayerData);
                };
                $(Elements.REMOVE_RESOURCE_FOR_COLLECTION).on('click', self.m_removeCollectionListItem);
            },

            /**
             Add a new collection item which can include a Scene or a resource (not a component)
             @method _addCollectionNewListItem
             @param {Event} e
             **/
            _addCollectionNewListItem: function (e) {
                var self = this;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetCollection = $(domPlayerData).find('Collection');
                var buff = '';
                // log(e.edata.blockCode, e.edata.resourceID, e.edata.sceneID);
                if (e.edata.blockCode == BB.CONSTS.BLOCKCODE_SCENE) {
                    // add scene to collection

                    // if block resides in scene don't allow cyclic reference to collection scene inside current scene
                    if (self.m_placement == BB.CONSTS.PLACEMENT_SCENE) {
                        var sceneEditView = BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']);
                        if (!_.isUndefined(sceneEditView)) {
                            var selectedSceneID = sceneEditView.getSelectedSceneID();
                            selectedSceneID = pepper.getSceneIdFromPseudoId(selectedSceneID);
                            if (selectedSceneID == e.edata.sceneID) {
                                bootbox.alert($(Elements.MSG_BOOTBOX_SCENE_REFER_ITSELF).text());
                                return;
                            }
                        }
                    }
                    var sceneRecord = pepper.getScenePlayerRecord(e.edata.sceneID);
                    var sceneName = $(sceneRecord.player_data_value).attr('label');
                    var nativeID = sceneRecord['native_id'];
                    buff = '<Page page="' + sceneName + '" type="scene" duration="5">' +
                        '<Player src="' + nativeID + '" hDataSrc="' + e.edata.sceneID + '" />' +
                        '</page>';
                } else {
                    // Add resources to collection
                    var resourceName = pepper.getResourceRecord(e.edata.resourceID).resource_name;
                    buff = '<Page page="' + resourceName + '" type="resource" duration="5">' +
                        '<Player player="' + e.edata.blockCode + '">' +
                        '<Data>' +
                        '<Resource hResource="' + e.edata.resourceID + '" />' +
                        '</Data>' +
                        '</Player>' +
                        '</page>';
                }
                $(xSnippetCollection).append($(buff));
                var x = pepper.xmlToStringIEfix(domPlayerData);
                self._setBlockPlayerData(x, BB.CONSTS.NO_NOTIFICATION, true);
            },

            /**
             Populate the common block properties panel, called from base class if exists
             @method _loadBlockSpecificProps
             @return none
             **/
            _loadBlockSpecificProps: function () {
                var self = this;
                self._populate();
                this._viewSubPanel(Elements.BLOCK_COLLECTION_COMMON_PROPERTIES);
            },

            /**
             re-take ownership for a caller block instance and register global Validators for bootstrap-table to format data
             This function has to run everytime we populate the UI since it is a shared global function
             and we have to override it so 'this' refers to correct BlockCollection instance
             @method _setCollectionBlockGlobalValidationOwner
             **/
            _setCollectionBlockGlobalValidationOwner: function (i_this) {
                // add draggable icons
                BB.lib.collectionDragIcons = function () {
                    return '<div class="dragIconTable"><i class="fa fa-arrows-v"></i></div>';
                };

                // register a global shared function to validate checkbox state
                BB.lib.collectionChecks = function (value, row, index) {
                    return {
                        checked: false,
                        disabled: false
                    }
                };

                // build selection dropdown for even "action", if row.action == name, set it as selected in dropdown
                BB.lib.collectionEventAction = function (value, row, index) {
                    var buffer = '<select class="btn">';
                    _.forEach(i_this.m_actions, function (name, value) {
                        if (row.action == name) {
                            buffer += '<option selected>' + name + '</option>';
                        } else {
                            buffer += '<option>' + name + '</option>';
                        }
                    });
                    return buffer + '</select>';
                };

                // build selection dropdown for event "to item" and if row.action is selected un-hide the dropdown in "to item" events and select the proper <option>
                BB.lib.collectionEventActionGoToItem = function (value, row, index) {
                    var buffer = '';
                    var collectionPageNames = i_this._getCollectionPageNames();
                    var visibilityClass = row.action == 'selected' ? '' : 'hidden';
                    buffer = '<select class="' + visibilityClass + ' btn">';
                    collectionPageNames.forEach(function (k, v) {
                        var selected = row.pageName == k ? 'selected' : '';
                        buffer += '<option ' + selected + '>' + k + '</option>';
                    });
                    return buffer;
                };
            },

            /**
             Get all the collection pages names for current collection block
             this is called against the last block instance that registered the global function of
             setCollectionBlockGlobalValidationOwner
             @method _getCollectionPageNames
             **/
            _getCollectionPageNames: function () {
                var self = this;
                var data = [];
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Collection').children().each(function (k, page) {
                    data.push($(page).attr('page'));
                });
                return data;
            },

            /**
             Delete this block
             @method deleteBlock
             **/
            deleteBlock: function () {
                var self = this;
                $(Elements.ADD_RESOURCE_TO_COLLECTION).off('click', self.m_addNewCollectionListItem);
                $(Elements.COLLECTION_KIOSK_MODE).off('change', self.sliderInput);
                $(Elements.REMOVE_RESOURCE_FOR_COLLECTION).off('click', self.m_removeCollectionListItem);
                BB.comBroker.stopListen(BB.EVENTS.ADD_NEW_BLOCK_LIST); // removing for everyone which is ok, since gets added in real time
                BB.comBroker.stopListen(BB.EVENTS.COLLECTION_ROW_DROP, self.m_collectionRowDroppedHandler);
                BB.comBroker.stopListen(BB.EVENTS.COLLECTION_ROW_DRAG, self.m_collectionRowDraggedHandler);
                BB.comBroker.stopListen(BB.EVENTS.COLLECTION_ROW_CHANGED, self.m_collectionRowChangedHandler);
                self._deleteBlock();
            }
        });
        return BlockCollection;
    }
);
