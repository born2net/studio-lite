/**
 * BlockLocation block resides inside a scene or timeline and manages internal playback of scenes and resources
 * @class BlockLocation
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block', 'bootstrap-table-editable', 'bootstrap-table-sort-rows'], function ($, Backbone, Block, bootstraptableeditable, bootstraptablesortrows) {

        var BlockLocation = Block.extend({

            /**
             Constructor
             @method initialize
             **/
            constructor: function (options) {
                var self = this;
                self.m_blockType = 4105;
                _.extend(options, {blockType: self.m_blockType});
                Block.prototype.constructor.call(this, options);

                self.m_locationTable = $(Elements.LOCATION_TABLE);
                self.m_selectRowIndex = -1;
                self._initSubPanel(Elements.BLOCK_LOCATION_COMMON_PROPERTIES);
                self._listenLocationRowDragged();
                self._listenLocationRowDropped();
                self._listenAddResource();
                self._listenRemoveResource();
                self._listenLocationRowChanged();

                self.m_blockProperty.locationDatatableInit();

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
            _listenLocationRowDragged: function () {
                var self = this;
                self.m_locationRowDraggedHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    self.m_selectRowIndex = e.edata;
                    var domPlayerData = self._getBlockPlayerData();
                };
                BB.comBroker.listen(BB.EVENTS.LOCATION_ROW_DRAG, self.m_locationRowDraggedHandler);
            },

            /**
             Listen to when location row was edited
             @method _listenLocationRowChanged
             **/
            _listenLocationRowChanged: function () {
                var self = this;
                self.m_locationRowChangedHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    var domPlayerData = self._getBlockPlayerData();
                    var rowIndex = e.edata.rowIndex;
                    var newName = e.edata.name;
                    var newDuration = parseInt(e.edata.duration);
                    if (_.isNaN(newDuration)) {
                        bootbox.alert($(Elements.MSG_BOOTBOX_ENTRY_IS_INVALID).text());
                        self._populateTableLocation(domPlayerData);
                        return;
                    }
                    var item = $(domPlayerData).find('Fixed').children().get(rowIndex);
                    $(item).attr('page', newName).attr('duration', newDuration);
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableLocation(domPlayerData);
                };
                BB.comBroker.listen(BB.EVENTS.LOCATION_ROW_CHANGED, self.m_locationRowChangedHandler);
            },

            /**
             Listen to changes in volume control
             @method _listenVolumeChange
             **/
            _listenLocationRowDropped: function () {
                var self = this;
                self.m_locationRowDroppedHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    var droppedRowIndex = e.edata;
                    var domPlayerData = self._getBlockPlayerData();
                    var target = $(domPlayerData).find('Fixed').children().get(parseInt(droppedRowIndex));
                    var source = $(domPlayerData).find('Fixed').children().get(self.m_selectRowIndex);
                    droppedRowIndex > self.m_selectRowIndex ? $(target).after(source) : $(target).before(source);
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableLocation(domPlayerData);
                };
                BB.comBroker.listen(BB.EVENTS.LOCATION_ROW_DROP, self.m_locationRowDroppedHandler);
            },

            /**
             Load up property values in the common panel
             @method _populate
             @return none
             **/
            _populate: function () {
                var self = this;
                self._setLocationBlockGlobalValidationOwner(self);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetLocation = $(domPlayerData).find('Fixed');
                var mode = $(xSnippetLocation).attr('mode');
                self._populateTableLocation(domPlayerData);
            },

            /**
             Load event list to the UI
             @method _populateTableLocation
             @param {Object} i_domPlayerData
             **/
            _populateTableLocation: function (i_domPlayerData) {
                var self = this;
                self.m_locationTable.bootstrapTable('removeAll');
                var data = [], rowIndex = 0;
                $(i_domPlayerData).find('Fixed').children().each(function (k, page) {
                    var resource_hResource, scene_hDataSrc;
                    var type = $(page).attr('type');
                    if (type == 'resource') {
                        resource_hResource = $(page).find('Resource').attr('hResource');
                    } else {
                        scene_hDataSrc = $(page).find('Player').attr('hDataSrc');
                    }
                    log('populating ' + resource_hResource);
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
                self.m_locationTable.bootstrapTable('load', data);
            },

            /**
             Listen to when AddBlockListView announced that a new resource or scene needs to be added
             and if this location block is selected, go ahead and create one in Bootstrap-table and msdb
             @method _listenAddResource
             **/
            _listenAddResource: function () {
                var self = this;

                //addBlockLocationView = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_LOCATION_VIEW);

                self.m_addNewLocationListItem = function () {
                    BB.comBroker.stopListenWithNamespace(BB.EVENTS.ADD_NEW_BLOCK_LIST, self);
                    if (!self.m_selected)
                        return;
                    var addBlockLocationView;
                    if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL) {
                        addBlockLocationView = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_VIEW);
                    } else if (self.m_placement = BB.CONSTS.PLACEMENT_SCENE) {
                        addBlockLocationView = BB.comBroker.getService(BB.SERVICES.ADD_SCENE_BLOCK_VIEW);
                    }
                    addBlockLocationView.setPlacement(BB.CONSTS.PLACEMENT_LISTS);
                    addBlockLocationView.selectView();

                    BB.comBroker.listenWithNamespace(BB.EVENTS.ADD_NEW_BLOCK_LIST, self, function (e) {
                        if (!self.m_selected)
                            return;
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        self._addLocationNewListItem(e);
                        BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.m_block_id);
                    });
                };
                $(Elements.ADD_RESOURCE_TO_LOCATION).on('click', self.m_addNewLocationListItem);
            },

            /**
             Listen to when removing a resource from location list
             The algorithm will uses our bootstrap-table own inject rowIndex value
             and counts up to match with the order of <Pages/> in msdb location, once matched against same value
             we delete the proper ordered location item from msdb and refresh the entire table
             @method _listenRemoveResource
             **/
            _listenRemoveResource: function () {
                var self = this;
                self.m_removeLocationListItem = function () {
                    if (!self.m_selected)
                        return;
                    if (self.m_locationTable.bootstrapTable('getSelections').length == 0) {
                        bootbox.alert($(Elements.MSG_BOOTBOX_NO_ITEM_SELECTED).text());
                        return;
                    }
                    var rowIndex = $('input[name=btSelectItem]:checked', Elements.LOCATION_TABLE).closest('tr').attr('data-index');
                    var domPlayerData = self._getBlockPlayerData();
                    $(domPlayerData).find('Fixed').children().get(rowIndex).remove();
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableLocation(domPlayerData);
                };
                $(Elements.REMOVE_RESOURCE_FOR_LOCATION).on('click', self.m_removeLocationListItem);
            },

            /**
             Add a new location item which can include a Scene or a resource (not a component)
             @method _addLocationNewListItem
             @param {Event} e
             **/
            _addLocationNewListItem: function (e) {
                var self = this;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetLocation = $(domPlayerData).find('Fixed');
                var buff = '';
                // log(e.edata.blockCode, e.edata.resourceID, e.edata.sceneID);
                if (e.edata.blockCode == BB.CONSTS.BLOCKCODE_SCENE) {
                    // add scene to location
                    // if block resides in scene don't allow cyclic reference to location scene inside current scene
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
                    // Add resources to location
                    var resourceName = pepper.getResourceRecord(e.edata.resourceID).resource_name;
                    log('updating hResource ' + e.edata.resourceID);
                    buff = '<Page page="' + resourceName + '" type="resource" duration="5">' +
                        '<Player player="' + e.edata.blockCode + '">' +
                        '<Data>' +
                        '<Resource hResource="' + e.edata.resourceID + '" />' +
                        '</Data>' +
                        '</Player>' +
                        '</page>';
                }
                $(xSnippetLocation).append($(buff));
                domPlayerData = pepper.xmlToStringIEfix(domPlayerData);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION, true);
            },

            /**
             Populate the common block properties panel, called from base class if exists
             @method _loadBlockSpecificProps
             @return none
             **/
            _loadBlockSpecificProps: function () {
                var self = this;
                self._populate();
                this._viewSubPanel(Elements.BLOCK_LOCATION_COMMON_PROPERTIES);
            },

            /**
             re-take ownership for a caller block instance and register global Validators for bootstrap-table to format data
             This function has to run everytime we populate the UI since it is a shared global function
             and we have to override it so 'this' refers to correct BlockLocation instance
             @method _setLocationBlockGlobalValidationOwner
             **/
            _setLocationBlockGlobalValidationOwner: function (i_this) {
                // add draggable icons
                BB.lib.locationDragIcons = function () {
                    return '<div class="dragIconTable"><i class="fa fa-arrows-v"></i></div>';
                };

                // register a global shared function to validate checkbox state
                BB.lib.locationChecks = function (value, row, index) {
                    return {
                        checked: false,
                        disabled: false
                    }
                };
            },

            /**
             Get all the location pages names for current location block
             this is called against the last block instance that registered the global function of
             setLocationBlockGlobalValidationOwner
             @method _getLocationPageNames
             **/
            _getLocationPageNames: function () {
                var self = this;
                var data = [];
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Fixed').children().each(function (k, page) {
                    data.push($(page).attr('page'));
                });
                return data;
            },

            /**
             Delete this block
             @method deleteBlock
             @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
             **/
            deleteBlock: function (i_memoryOnly) {
                var self = this;
                $(Elements.ADD_RESOURCE_TO_LOCATION).off('click', self.m_addNewLocationListItem);
                $(Elements.REMOVE_RESOURCE_FOR_LOCATION).off('click', self.m_removeLocationListItem);
                BB.comBroker.stopListen(BB.EVENTS.ADD_NEW_BLOCK_LIST); // removing for everyone which is ok, since gets added in real time
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_ROW_DROP, self.m_locationRowDroppedHandler);
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_ROW_DRAG, self.m_locationRowDraggedHandler);
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_ROW_CHANGED, self.m_locationRowChangedHandler);
                self._deleteBlock(i_memoryOnly);
            }
        });
        return BlockLocation;
    }
);
