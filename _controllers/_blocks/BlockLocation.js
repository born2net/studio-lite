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
                self.m_currentIndex = 0;
                self.m_pendingAdditionXML = '';
                self._initSubPanel(Elements.BLOCK_LOCATION_COMMON_PROPERTIES);
                self._listenLocationRowDragged();
                self._listenLocationRowDropped();
                self._listenAddResource();
                self._listenRemoveResource();
                self._listenLocationRowChanged();
                self._listenLiveInputs();
                self._listenMenuControls();
                self._listenAddPoint();

                self.m_blockProperty.locationDatatableInit();
                self.m_googleMapsLocationView = BB.comBroker.getService(BB.SERVICES.GOOGLE_MAPS_LOCATION_VIEW);

                /* can set global mode if we wish */
                //$.fn.editable.defaults.mode = 'inline';

            },

            /**
             Listen to adding a new point from google maps, and if we pending for addition, take action
             @method _listenAddPoint
             @param {Number} i_playerData
             @return {Number} Unique clientId.
             **/
            _listenAddPoint: function () {
                var self = this;
                self.m_onNewMapPointHandler = function (e) {
                    if (!self.m_selected)
                        return;
                    var latLng = e.edata;
                    if (!latLng)
                        return;
                    var lat = e.edata.lat;
                    var lng = e.edata.lng;
                    var reLat = new RegExp(":LAT:","ig");
                    var reLng = new RegExp(":LNG:","ig");
                    self.m_pendingAdditionXML = self.m_pendingAdditionXML.replace(reLat,lat);
                    self.m_pendingAdditionXML = self.m_pendingAdditionXML.replace(reLng,lng);
                    var domPlayerData = self._getBlockPlayerData();
                    var xSnippetLocation = $(domPlayerData).find('GPS');
                    $(xSnippetLocation).append($(self.m_pendingAdditionXML));
                    self.m_pendingAdditionXML = '';
                    self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION, false);
                    self._populate();
                    self._jumpToLocation('last');
                };
                BB.comBroker.listen(BB.EVENTS.ADD_LOCATION_POINT, self.m_onNewMapPointHandler);
            },
            /**
             Listen to location controls, add remove, next, add ...
             @method _listenMenuControls
             **/
            _listenMenuControls: function () {
                var self = this;
                self.m_locationControls = function (e) {
                    if (!self.m_selected)
                        return;
                    var buttonType = $(e.target).attr('name') != undefined ? $(e.target).prop('name') : $(e.target).closest('button').attr('name');
                    if (buttonType == 'removeLocation')
                        log(buttonType);
                    if (buttonType == 'previous')
                        self._jumpToLocation('prev');
                    if (buttonType == 'next')
                        self._jumpToLocation('next');
                    if (buttonType == 'openLocation')
                        self._openMap(false);
                };
                $(Elements.LOCATION_CONTROLS + ' button').on('click', self.m_locationControls);
            },

            /**
             Listen to changes in row due to drag
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
             Listen to changes in LiveInputs including resource names, long and lat values
             @method _listenLiveInputs
             **/
            _listenLiveInputs: function () {
                var self = this;

                self.m_liveInputChanged = function (e) {
                    if (!self.m_selected)
                        return;
                    var domPlayerData = self._getBlockPlayerData();
                    switch (e.edata.el) {
                        case Elements.LOCATION_RESOURCE_NAME:
                        {
                            break;
                        }
                        case Elements.LOCATION_RESOURCE_LAT:
                        {
                            break;
                        }
                        case Elements.LOCATION_RESOURCE_LNG:
                        {
                            break;
                        }
                    }

                    //var item = $(domPlayerData).find('GPS').children().last();
                    //$(item).attr('lat', latLng.H).attr('lng', latLng.L);
                    //self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    //self._jumpToLocation(domPlayerData);
                    //self._populateTotalMapLocations(domPlayerData);
                };
                BB.comBroker.listen(BB.EVENTS.LOCATION_LIVE_INPUT_CHANGED, self.m_liveInputChanged);

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
                        self._populateTableDefault(domPlayerData);
                        return;
                    }
                    var item = $(domPlayerData).find('Fixed').children().get(rowIndex);
                    $(item).attr('page', newName).attr('duration', newDuration);
                    self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                    self._populateTableDefault(domPlayerData);
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
                    self._populateTableDefault(domPlayerData);
                };
                BB.comBroker.listen(BB.EVENTS.LOCATION_ROW_DROP, self.m_locationRowDroppedHandler);
            },

            /**
             The main functions which renders and loads up the entire property panel with both default resource list
             as well as map location coordinates list
             @method _populate
             @return none
             **/
            _populate: function () {
                var self = this;
                self._setLocationBlockGlobalValidationOwner(self);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetLocation = $(domPlayerData).find('Fixed');
                var mode = $(xSnippetLocation).attr('mode');
                self._populateTableDefault(domPlayerData);
                self._jumpToLocation('first');
                self._populateTotalMapLocations(domPlayerData);
            },

            /**
             Populate the total map locations set
             @method _populateTotalMapLocations
             @param {Object} domPlayerData
             **/
            _populateTotalMapLocations: function (domPlayerData) {
                var self = this;
                var total = $(domPlayerData).find('GPS').children().length;
                if (total == 0) {
                    $(Elements.LOCATION_SELECTED).hide();
                    self.m_currentIndex = 0;
                } else {
                    $(Elements.LOCATION_SELECTED).show();
                }
                $(Elements.TOTAL_MAP_LOCATIONS).text(total);
            },

            /**
             Select specific location and populate both the UI as well scroll map to coordinates
             @method _jumpToLocation
             @param {String} i_index
             **/
            _jumpToLocation: function (i_index) {
                var self = this;
                var domPlayerData = self._getBlockPlayerData();
                var total = $(domPlayerData).find('GPS').children().length;
                var item;

                // no locations, done!
                if (total == 0) {
                    self._populateTotalMapLocations(domPlayerData);
                    return;
                }

                // load location
                switch (i_index) {
                    case 'first':
                    {
                        self.m_currentIndex = 0;
                        item = $(domPlayerData).find('GPS').children().first();
                        break;
                    }
                    case 'last':
                    {
                        self.m_currentIndex = total - 1;
                        item = $(domPlayerData).find('GPS').children().last();
                        break;
                    }
                    case 'next':
                    {
                        if (self.m_currentIndex == (total - 1)) {
                            item = $(domPlayerData).find('GPS').children().last();
                        } else {
                            self.m_currentIndex++;
                            item = $(domPlayerData).find('GPS').children().get(self.m_currentIndex);
                        }
                        break;
                    }
                    case 'prev':
                    {
                        if (self.m_currentIndex == 0) {
                            item = $(domPlayerData).find('GPS').children().first();
                        } else {
                            self.m_currentIndex--;
                            item = $(domPlayerData).find('GPS').children().get(self.m_currentIndex);
                        }
                        break;
                    }
                }
                self.m_blockProperty.setLocationLiveInput(Elements.LOCATION_RESOURCE_NAME, $(item).attr('page'));
                self.m_blockProperty.setLocationLiveInput(Elements.LOCATION_RESOURCE_LAT, $(item).attr('lat'));
                self.m_blockProperty.setLocationLiveInput(Elements.LOCATION_RESOURCE_LNG, $(item).attr('lng'));
                self.m_googleMapsLocationView.panToPoint($(item).attr('lat'), $(item).attr('lng'));

            },

            /**
             Load list into the UI for default content
             @method _populateTableDefault
             @param {Object} i_domPlayerData
             **/
            _populateTableDefault: function (i_domPlayerData) {
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
             Listen to add new resource and when clicked, wait for announcement from AddBlockListView that
             a new resource or scene needs to be added to either the default play list (aka Fixed) or
             to the Location based play list (aka GPS)
             @method _listenAddResource
             **/
            _listenAddResource: function () {
                var self = this;
                self.m_addNewLocationListItem = function (e) {

                    BB.comBroker.stopListenWithNamespace(BB.EVENTS.ADD_NEW_BLOCK_LIST, self);
                    if (!self.m_selected)
                        return;

                    self.m_listItemType = $(e.target).attr('name') != undefined ? $(e.target).prop('name') : $(e.target).closest('button').attr('name');

                    // open the Add Block Slider
                    var addBlockLocationView;
                    if (self.m_placement == BB.CONSTS.PLACEMENT_CHANNEL) {
                        addBlockLocationView = BB.comBroker.getService(BB.SERVICES.ADD_BLOCK_VIEW);
                    } else if (self.m_placement = BB.CONSTS.PLACEMENT_SCENE) {
                        addBlockLocationView = BB.comBroker.getService(BB.SERVICES.ADD_SCENE_BLOCK_VIEW);
                    }
                    addBlockLocationView.setPlacement(BB.CONSTS.PLACEMENT_LISTS);
                    addBlockLocationView.selectView();

                    // wait for a new resource to be added and once it has, open the Google maps for location insertion
                    BB.comBroker.listenWithNamespace(BB.EVENTS.ADD_NEW_BLOCK_LIST, self, function (e) {
                        if (!self.m_selected)
                            return;
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        self._addLocationItem(e, self.m_listItemType);

                    });
                };
                $(Elements.CLASS_ADD_RESOURCE_LOCATION).on('click', self.m_addNewLocationListItem);
            },

            /**
             Add to our XML a list item item which can be of one of two types
             addDefault: a default resource to play when not within radius of GPS coords
             addLocation: a particular resource to play within specific GPS coords
             @method _addLocationItem
             @param {Event} e
             @param {String} type addDefault or addLocation
             **/
            _addLocationItem: function (e, type) {
                var self = this;
                var domPlayerData = self._getBlockPlayerData();
                var buff = '';
                var locationBuff;
                var xSnippetLocation;

                // log(e.edata.blockCode, e.edata.resourceID, e.edata.sceneID);

                switch (type) {
                    case 'addDefault':
                    {
                        xSnippetLocation = $(domPlayerData).find('Fixed');
                        locationBuff = '>';
                        break;
                    }
                    case 'addLocation':
                    {
                        //locationBuff = 'lat="34.15585218402147" lng="-118.80546569824219" radios="1" priority="0">';
                        locationBuff = 'lat=":LAT:" lng=":LNG:" radios="1" priority="0">';
                        xSnippetLocation = $(domPlayerData).find('GPS');
                        BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.m_block_id);

                        setTimeout(function () {
                            self._openMap(true);
                            self._populate();
                        }, 500);
                        break;
                    }
                }

                // adding a scene and don't allow cyclic reference of scene
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
                    buff = '<Page page="' + sceneName + '" type="scene" duration="5" ' + locationBuff +
                        '       <Player src="' + nativeID + '" hDataSrc="' + e.edata.sceneID + '" />' +
                        '   </page>';
                } else {
                    // Add resources to location
                    var resourceName = pepper.getResourceRecord(e.edata.resourceID).resource_name;
                    log('updating hResource ' + e.edata.resourceID);
                    buff = '<Page page="' + resourceName + '" type="resource" duration="5" ' + locationBuff +
                        '       <Player player="' + e.edata.blockCode + '">' +
                        '           <Data>' +
                        '               <Resource hResource="' + e.edata.resourceID + '" />' +
                        '           </Data>' +
                        '       </Player>' +
                        '   </page>';
                }

                // if default item, just add it. if location item, remember it and only add it once user select
                // a location for it in google the map as we need to wait for the coordinates.
                switch (type) {
                    case 'addDefault':
                    {
                        $(xSnippetLocation).append($(buff));
                        domPlayerData = pepper.xmlToStringIEfix(domPlayerData);
                        self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION, true);
                        BB.comBroker.fire(BB.EVENTS.BLOCK_SELECTED, this, null, self.m_block_id);
                        break;
                    }
                    case 'addLocation':
                    {
                        self.m_pendingAdditionXML = buff;
                    }
                }
            },

            /**
             Open google maps and load it with all current locations
             @method _openMap
             @params {Boolean} i_markerOnClick set to true if we are going to expect user to add a new location
             or false if we just want to open an existing map and not add any new locations
             **/
            _openMap: function (i_markerOnClick) {
                var self = this;
                var map = {
                    points: []
                };
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('GPS').children().each(function (k, v) {
                    var point = {
                        center: {
                            lat: $(v).attr('lat'),
                            lng: $(v).attr('lng')

                        },
                        radius: $(v).attr('radios')
                    };
                    map.points.push(point);

                });
                self.m_googleMapsLocationView.setPlacement(BB.CONSTS.PLACEMENT_LISTS);
                self.m_googleMapsLocationView.selectView(map, i_markerOnClick);
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
                    self._populateTableDefault(domPlayerData);
                };
                $(Elements.REMOVE_RESOURCE_FOR_LOCATION).on('click', self.m_removeLocationListItem);
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
                $(Elements.CLASS_ADD_RESOURCE_LOCATION).off('click', self.m_addNewLocationListItem);
                $(Elements.REMOVE_RESOURCE_FOR_LOCATION).off('click', self.m_removeLocationListItem);
                $(Elements.LOCATION_CONTROLS + ' button').off('click', self.m_locationControls);
                BB.comBroker.stopListen(BB.EVENTS.ADD_NEW_BLOCK_LIST); // removing for everyone which is ok, since gets added in real time
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_ROW_DROP, self.m_locationRowDroppedHandler);
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_ROW_DRAG, self.m_locationRowDraggedHandler);
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_ROW_CHANGED, self.m_locationRowChangedHandler);
                BB.comBroker.stopListen(BB.EVENTS.LOCATION_LIVE_INPUT_CHANGED, self.m_liveInputChanged);
                BB.comBroker.stopListen(BB.EVENTS.ADD_LOCATION_POINT, self.m_onNewMapPointHandler);
                self._deleteBlock(i_memoryOnly);
            }
        });
        return BlockLocation;
    }
);
