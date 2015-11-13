///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 BlockJson is a Player block that is used as the base class for all JSON based components
 it allows for parsing of JSON data and is supported with the JSON Item inside scenes
 @class BlockJson
 @constructor
 @return {Object} instantiated BlockJson
 * @example
 * path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
 * json player: children[0].children
 * json item: text
 **/
define(['jquery', 'Block'], function ($, Block) {
    TSLiteModules.Block = Block;
    var BlockJson = (function (_super) {
        __extends(BlockJson, _super);
        function BlockJson(options) {
            this.m_options = options;
            _super.call(this);
        }
        BlockJson.prototype.initialize = function () {
            var self = this;
            this.m_blockType = 4300;
            _.extend(self.m_options, { blockType: this.m_blockType });
            _super.prototype.initialize.call(this, self.m_options);
            self._initSubPanel(Elements.BLOCK_JSON_COMMON_PROPERTIES);
            self._listenSceneListChange();
            self._listenUrlChange();
            self._listenVideoPlayToCompletion();
            self._listenRandomPlayback();
            self._listenObjectPathChange();
            self._listenSceneDropdownChange();
            self._listenIntervalChange();
            self._listenSlideShowMode();
            self._listenAddEvent();
            self._listenRemoveEvent();
            self.m_jsonEventTable = $(Elements.JSON_EVENTS_TABLE);
            self._listenJsonRowEventChanged();
            self.m_blockProperty.jsonEventDatatableInit();
            self.m_actions = {
                firstPage: 'beginning',
                nextPage: 'next',
                prevPage: 'previous',
                lastPage: 'last',
                loadUrl: 'loadURL'
            };
        };
        /**
         Listen to when json row was edited
         @method _listenJsonRowEventChanged
         **/
        BlockJson.prototype._listenJsonRowEventChanged = function () {
            var self = this;
            self.m_jsonRowEventChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var rowIndex = e.edata.rowIndex;
                var event = e.edata.event;
                var action = e.edata.action;
                var item = $(domPlayerData).find('EventCommands').children().get(rowIndex);
                $(item).attr('from', event);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            BB.comBroker.listen(BB.EVENTS.JSON_EVENT_ROW_CHANGED, self.m_jsonRowEventChangedHandler);
        };
        /**
         Listen to when user wants to add new events
         @method _listenAddEvent
         **/
        BlockJson.prototype._listenAddEvent = function () {
            var self = this;
            this.m_addNewEvent = function () {
                if (!self.m_selected)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var buff = '<EventCommand from="event" condition="" command="firstPage" />';
                $(domPlayerData).find('EventCommands').append($(buff));
                self._setBlockPlayerData(BB.Pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                self._populateTableEvents();
            };
            $(Elements.ADD_JSON_EVENTS).on('click', self.m_addNewEvent);
        };
        /**
         Listen to when removing a resource from list
         The algorithm will uses our bootstrap-table own inject rowIndex value
         and counts up to match with the order of <EventCommand/> in msdb json, once matched against same value
         we delete the proper ordered json item from msdb and refresh the entire table
         @method _listenRemoveResource
         **/
        BlockJson.prototype._listenRemoveEvent = function () {
            var self = this;
            self.m_removeEvent = function () {
                if (!self.m_selected)
                    return;
                if (self.m_jsonEventTable.bootstrapTable('getSelections').length == 0) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_NO_ITEM_SELECTED).text());
                    return;
                }
                var rowIndex = $('input[name=btSelectItem]:checked', Elements.JSON_EVENTS_TABLE).closest('tr').attr('data-index');
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('EventCommands').children().eq(rowIndex).remove();
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._populateTableEvents();
            };
            $(Elements.REMOVE_JSON_EVENTS).on('click', self.m_removeEvent);
        };
        /**
         Load event list to block props UI
         @method _populateTableEvents
         **/
        BlockJson.prototype._populateTableEvents = function () {
            var self = this;
            var data = [], rowIndex = 0;
            var domPlayerData = self._getBlockPlayerData();
            self.m_jsonEventTable.bootstrapTable('removeAll');
            $(domPlayerData).find('EventCommands').children().each(function (k, eventCommand) {
                var url = '';
                if ($(eventCommand).attr('command') == 'loadUrl')
                    url = $(eventCommand).find('Url').attr('name');
                if (_.isUndefined(url))
                    url = '';
                data.push({
                    rowIndex: rowIndex,
                    checkbox: true,
                    event: $(eventCommand).attr('from'),
                    url: url,
                    action: self.m_actions[$(eventCommand).attr('command')]
                });
                rowIndex++;
            });
            self.m_jsonEventTable.bootstrapTable('load', data);
            self._listenDropdownEvenActionSelection();
            self._listenActionURLChange();
            // disable drag cursor due to bug in bootstrap-table lib (can't disable dragging, yach...)
            setTimeout(function () {
                $('tr', Elements.JSON_EVENTS_CONTAINER).css({
                    cursor: 'pointer'
                });
            }, 500);
        };
        /**
         re-take ownership for a caller block instance and register global Validators for bootstrap-table to format data
         This function has to run everytime we populate the UI since it is a shared global function
         and we have to override it so 'this' refers to correct BlockJson instance
         @method _setJsonBlockGlobalValidationOwner
         **/
        BlockJson.prototype._setJsonBlockGlobalValidationOwner = function (i_this) {
            // add draggable icons
            //BB.lib.collectionDragIcons = function () {
            //    return '<div class="dragIconTable"><i class="fa fa-arrows-v"></i></div>';
            //};
            // register a global shared function to validate checkbox state
            //BB.lib.collectionChecks = function (value, row, index) {
            //    return {
            //        checked: false,
            //        disabled: false
            //    }
            //};
            BB.lib.jsonEventAction = function (value, row, index) {
                var buffer = '<select class="' + BB.lib.unclass(Elements.CLASS_JSON_EVENT_ACTION) + ' btn">';
                _.forEach(i_this.m_actions, function (name, value) {
                    if (row.action == name) {
                        buffer += '<option selected>' + name + '</option>';
                    }
                    else {
                        buffer += '<option>' + name + '</option>';
                    }
                });
                return buffer + '</select>';
            };
            BB.lib.jsonEventActionGoToItem = function (value, row, index) {
                var visibilityClass = row.action == 'loadURL' ? '' : 'hidden';
                var buffer = '<input class="' + visibilityClass + ' ' + BB.lib.unclass(Elements.CLASS_JSON_EVENT_ACTION_GOTO) + ' " value="' + row.url + '" >';
                return buffer;
            };
        };
        /**
         Listen in Event Action go to dropdown selections
         @method _listenActionURLChange
         **/
        BlockJson.prototype._listenActionURLChange = function () {
            var self = this;
            if (self.m_onDropDownEventActionGoToHandler)
                $(Elements.CLASS_JSON_EVENT_ACTION_GOTO).off('change', self.m_onDropDownEventActionGoToHandler);
            self.m_onDropDownEventActionGoToHandler = function (e) {
                if (!self.m_selected)
                    return;
                var url = $(this).val();
                var index = $(this).closest('[data-index]').attr('data-index');
                var domPlayerData = self._getBlockPlayerData();
                var target = $(domPlayerData).find('EventCommands').children().get(parseInt(index));
                $(target).find('Params').remove();
                $(target).append('<Params> <Url name="' + url + '" /></Params>');
                self._setBlockPlayerData(BB.Pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                self._populateTableEvents();
            };
            $(Elements.CLASS_JSON_EVENT_ACTION_GOTO).on('change', self.m_onDropDownEventActionGoToHandler);
        };
        /**
         Listen in Event Action dropdown selections
         @method _listenDropdownEvenActionSelection
         **/
        BlockJson.prototype._listenDropdownEvenActionSelection = function () {
            var self = this;
            if (self.m_onDropDownEventActionHandler)
                $(Elements.CLASS_JSON_EVENT_ACTION).off('change', self.m_onDropDownEventActionHandler);
            self.m_onDropDownEventActionHandler = function (e) {
                if (!self.m_selected)
                    return;
                var selected = $("option:selected", this).val();
                var actions = _.invert(self.m_actions);
                var action = actions[selected];
                var index = $(this).closest('[data-index]').attr('data-index');
                var domPlayerData = self._getBlockPlayerData();
                var target = $(domPlayerData).find('EventCommands').children().get(parseInt(index));
                $(target).attr('command', action);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._populateTableEvents();
            };
            $(Elements.CLASS_JSON_EVENT_ACTION).on('change', self.m_onDropDownEventActionHandler);
        };
        /**
         Populate the LI with all available scenes from msdb
         @method _populateSceneDropdown
         **/
        BlockJson.prototype._populateSceneDropdown = function () {
            var self = this;
            $(Elements.JSON_DROPDOWN).empty();
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (i_name, i_id) {
                // var pseudoID = pepper.getPseudoIdFromSceneId(i_id);
                var snippet = '<li><a name="resource" data-localize="profileImage" role="menuitem" tabindex="-1" href="#" data-scene_id="' + i_id + '">' + i_name + '</a></li>';
                $(Elements.JSON_DROPDOWN).append($(snippet));
            });
        };
        /**
         Populate the UI of the scene label selector
         @method _populateSceneLabel
         @param {Number} i_sceneName
         **/
        BlockJson.prototype._populateSceneLabel = function (i_sceneName) {
            var self = this;
            $(Elements.JSON_SCENE_LIST).text(i_sceneName);
        };
        /**
         Populate the UI of the scene interval selector
         @method _populateInterval
         @param {Number} i_interval
         **/
        BlockJson.prototype._populateInterval = function (i_interval) {
            var self = this;
            var interval = Number(i_interval);
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).spinner('value', interval);
        };
        /**
         Populate Url input field
         @method _populateUrlInput
         @param {String} i_url
         **/
        BlockJson.prototype._populateUrlInput = function (i_url) {
            var self = this;
            $(Elements.JSON_URL_INPUT).val(i_url);
        };
        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        BlockJson.prototype._populate = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Json');
            var url = $(xSnippet).attr('url');
            var xSnippetPlayer = $(xSnippet).find('Player');
            var sceneID = $(xSnippetPlayer).attr('hDataSrc');
            var interval = $(xSnippet).attr('itemInterval');
            var itemsPath = $(xSnippet).attr('itemsPath');
            var playVideoInFull = $(xSnippet).attr('playVideoInFull');
            var randomOrder = $(xSnippet).attr('randomOrder');
            var slideShow = $(xSnippet).attr('slideShow');
            if (_.isEmpty(sceneID)) {
                self._populateSceneLabel($(Elements.BOOTBOX_SELECT_SCENE).text());
            }
            else {
                var scenenames = BB.Pepper.getSceneNames();
                _.forEach(scenenames, function (i_name, i_id) {
                    if (i_id == sceneID)
                        self._populateSceneLabel(i_name);
                });
            }
            self._populateEventVisibility(slideShow);
            self._populateSceneDropdown();
            self._populateSceneLabel();
            self._populateUrlInput(url);
            self._populateInterval(interval);
            self._populateObjectPlayToCompletion(playVideoInFull);
            self._populateSlideShow(slideShow);
            self._populateRandomPlayback(randomOrder);
            self._populateObjectPath(itemsPath);
            self._setJsonBlockGlobalValidationOwner(self);
            self._populateTableEvents();
        };
        /**
         Show or hide the events UI depending on slideshow mode
         @method _populateEventVisibility
         @param {Number} i_slideShow
         **/
        BlockJson.prototype._populateEventVisibility = function (i_slideShow) {
            if (i_slideShow == "1") {
                $(Elements.JSON_EVENTS_CONTAINER).hide();
            }
            else {
                $(Elements.JSON_EVENTS_CONTAINER).show();
            }
        };
        /**
         Populate Object json path using dot notation
         @method _populateObjectPath
         @params {String} i_objectPath
         **/
        BlockJson.prototype._populateObjectPath = function (i_objectPath) {
            var self = this;
            $(Elements.JSON_PATH_INPUT).val(i_objectPath);
        };
        /**
         Populate json object play to completion if we are pulling videos from the json path
         @method _populateObjectPlayToCompletion
         @params {Boolean} i_playToCompletion
         **/
        BlockJson.prototype._populateObjectPlayToCompletion = function (i_playToCompletion) {
            var self = this;
            if (i_playToCompletion == '1') {
                $(Elements.JSON_PLAY_VIDEO_COMPLETION).prop('checked', true);
            }
            else {
                $(Elements.JSON_PLAY_VIDEO_COMPLETION).prop('checked', false);
            }
        };
        /**
         Populate json slideshow mode
         @method _populateSlideShow
         @params {Boolean} i_slideshow
         **/
        BlockJson.prototype._populateSlideShow = function (i_slideshow) {
            var self = this;
            if (i_slideshow == '1') {
                $(Elements.JSON_SLIDESHOW).prop('checked', true);
            }
            else {
                $(Elements.JSON_SLIDESHOW).prop('checked', false);
            }
        };
        /**
         Populate json object random playback
         @method _populateRandomPlayback
         @params {Boolean} i_randomPlayback
         **/
        BlockJson.prototype._populateRandomPlayback = function (i_randomPlayback) {
            var self = this;
            if (i_randomPlayback == '1') {
                $(Elements.JSON_RANDOM_PLAYBACK).prop('checked', true);
            }
            else {
                $(Elements.JSON_RANDOM_PLAYBACK).prop('checked', false);
            }
        };
        /**
         Listen to changes in the scene interval control
         @method _listenIntervalChange
         **/
        BlockJson.prototype._listenIntervalChange = function () {
            var self = this;
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).spinner({ value: 4, min: 1, max: 9999, step: 1 });
            $(Elements.JSON_INTERVAL_INPUT).prop('disabled', true).css({ backgroundColor: 'transparent' });
            self.m_intervalInput = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if ($(e.target).prop("tagName") == 'INPUT')
                    return;
                var interval = $(Elements.JSON_INTERVAL_INPUT).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                $(xSnippet).attr('itemInterval', interval);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 250, false);
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).on('mouseup', self.m_intervalInput);
        };
        /**
         Wire changing of campaign name through scene properties
         @method _listenObjectPathChange
         @return none
         **/
        BlockJson.prototype._listenObjectPathChange = function () {
            var self = this;
            self.m_pathChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var itemsPath = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                $(xSnippet).attr('itemsPath', itemsPath);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 333, false);
            $(Elements.JSON_PATH_INPUT).on("input", self.m_pathChange);
        };
        /**
         Listen to Video Play to completion change mode
         @method _listenVideoPlayToCompletion
         @return none
         **/
        BlockJson.prototype._listenVideoPlayToCompletion = function () {
            var self = this;
            self.m_playVideoCompletion = function (e) {
                if (!self.m_selected)
                    return;
                var mode = $(e.target).prop('checked') == true ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                $(xSnippet).attr('playVideoInFull', mode);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.JSON_PLAY_VIDEO_COMPLETION).on("change", self.m_playVideoCompletion);
        };
        /**
         Listen to Video Play to completion change mode
         @method _listenVideoPlayToCompletion
         @return none
         **/
        BlockJson.prototype._listenRandomPlayback = function () {
            var self = this;
            self.m_randomPlayback = function (e) {
                if (!self.m_selected)
                    return;
                var mode = $(e.target).prop('checked') == true ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                $(xSnippet).attr('randomOrder', mode);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.JSON_RANDOM_PLAYBACK).on("change", self.m_randomPlayback);
        };
        /**
         Listen to slideshow change mode
         @method _listenSlideShowMode
         @return none
         **/
        BlockJson.prototype._listenSlideShowMode = function () {
            var self = this;
            self.m_slideShow = function (e) {
                if (!self.m_selected)
                    return;
                var mode = $(e.target).prop('checked') == true ? 1 : 0;
                self._populateEventVisibility(mode);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                $(xSnippet).attr('slideShow', mode);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.JSON_SLIDESHOW).on("change", self.m_slideShow);
        };
        /**
         Wire changing of campaign name through scene properties
         @method _listenUrlChange
         @return none
         **/
        BlockJson.prototype._listenUrlChange = function () {
            var self = this;
            self.m_urlChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var url = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                $(xSnippet).attr('url', url);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 333, false);
            $(Elements.JSON_URL_INPUT).on("input", self.m_urlChange);
        };
        /**
         Listen to the global scene list changes event so we can update the list of available scenes
         @method _listenSceneListChange
         **/
        BlockJson.prototype._listenSceneListChange = function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED, self, function (e) {
                if (!self.m_selected)
                    return;
                self._populateSceneDropdown();
            });
        };
        /**
         Listen to playlist changes dropdown
         @method _listenSceneDropdownChange
         **/
        BlockJson.prototype._listenSceneDropdownChange = function () {
            var self = this;
            self.m_bindScene = function (e) {
                if (!self.m_selected)
                    return;
                var listType = $(e.target).attr('name');
                if (_.isUndefined(listType))
                    return;
                var sceneName = $(e.target).text();
                var sceneID = $(e.target).attr('data-scene_id');
                self._populateSceneLabel(sceneName);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                var xSnippetPlayer = $(xSnippet).find('Player');
                $(xSnippetPlayer).attr('hDataSrc', sceneID);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.JSON_DROPDOWN).on('click', self.m_bindScene);
        };
        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        BlockJson.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_COMMON_PROPERTIES);
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockJson.prototype.deleteBlock = function (i_memoryOnly) {
            var self = this;
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).off('mouseup', self.m_intervalInput);
            $(Elements.CLASS_JSON_EVENT_ACTION).off('change', self.m_onDropDownEventActionHandler);
            $(Elements.CLASS_JSON_EVENT_ACTION_GOTO).off('change', self.m_onDropDownEventActionGoToHandler);
            $(Elements.ADD_JSON_EVENTS).off('click', self.m_addNewEvent);
            $(Elements.REMOVE_JSON_EVENTS).off('click', self.m_removeEvent);
            $(Elements.JSON_DROPDOWN).off('click', self.m_bindScene);
            $(Elements.JSON_URL_INPUT).off("input", self.m_urlChange);
            $(Elements.JSON_PATH_INPUT).off("input", self.m_pathChange);
            $(Elements.JSON_PLAY_VIDEO_COMPLETION).off("change", self.m_playVideoCompletion);
            $(Elements.JSON_RANDOM_PLAYBACK).off("change", self.m_randomPlayback);
            $(Elements.JSON_SLIDESHOW).off("change", self.m_slideShow);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED, self);
            BB.comBroker.stopListen(BB.EVENTS.JSON_EVENT_ROW_CHANGED, self.m_jsonRowEventChangedHandler);
            self._deleteBlock(i_memoryOnly);
        };
        return BlockJson;
    })(TSLiteModules.Block);
    return BlockJson;
});
//# sourceMappingURL=BlockJson.js.map