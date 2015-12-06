///<reference path="../../typings/lite/app_references.d.ts" />

/**
 BlockJsonBase is a Player block that is used as the base class for all JSON based components
 it allows for parsing of JSON data and is supported with the JSON Item inside scenes
 @class BlockJsonBase
 @constructor
 @return {Object} instantiated BlockJsonBase
 @example
 path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
 json player: children[0].children
 json item: text
 **/
//GULP_ABSTRACT_EXTEND extends Block
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockJsonBase extends Block {
        protected m_actions:{firstPage: string; nextPage: string; prevPage: string; lastPage: string; loadUrl: string; };
        protected m_options;
        protected m_blockAcronym:string;
        protected m_jsonEventTable:any;
        protected m_jsonRowEventChangedHandler:Function;
        protected m_addNewEvent:Function;
        protected m_pathChange:Function;
        protected m_randomPlayback:Function;
        protected m_slideShow:Function;
        protected m_urlChange:Function;
        protected m_bindScene:Function;
        protected m_intervalInput:Function;
        protected m_playVideoCompletion:Function;
        protected m_removeEvent:Function;
        protected m_onDropDownEventActionGoToHandler:Function;
        protected m_onDropDownEventActionHandler:Function;
        protected m_selected:any;
        protected m_mimeType:any;
        protected _listenJsonRowEventChanged():void ;
        protected _listenAddEvent():void ;
        protected _listenRemoveEvent():void ;
        protected _populateTableEvents() ;
        protected _updateTitleTab() ;
        protected _setJsonBlockGlobalValidationOwner(i_this) ;
        protected _listenActionURLChange() ;
        protected _listenDropdownEvenActionSelection() ;
        protected _populateSceneDropdown() ;
        protected _populateInterval(i_interval) ;
        protected _populateUrlInput(i_url) ;
        protected _populate() ;
        protected _updateJsonPaths() ;
        protected _populateEventVisibility(i_slideShow) ;
        protected _populateObjectPath(i_objectPath) ;
        protected _populateObjectPlayToCompletion(i_playToCompletion) ;
        protected _populateSlideShow(i_slideshow) ;
        protected _populateRandomPlayback(i_randomPlayback) ;
        protected _listenIntervalChange() ;
        protected _listenObjectPathChange() ;
        protected _listenVideoPlayToCompletion() ;
        protected _listenRandomPlayback() ;
        protected _listenSlideShowMode() ;
        protected _listenUrlChange() ;
        protected _listenSceneListChange() ;
        protected _listenSceneDropdownChange() ;
        protected _loadBlockSpecificProps() ;
        public deleteBlock(i_memoryOnly) ;
   }
}
//GULP_ABSTRACT_END

define(['jquery', 'Block'], function ($, Block) {
    TSLiteModules.Block = Block;

    class BlockJsonBase extends TSLiteModules.Block {

        protected m_actions:{firstPage: string; nextPage: string; prevPage: string; lastPage: string; loadUrl: string; };
        protected m_options;
        protected m_blockAcronym:string;
        protected m_jsonEventTable:any;
        protected m_jsonRowEventChangedHandler:Function;
        protected m_addNewEvent:Function;
        protected m_pathChange:Function;
        protected m_randomPlayback:Function;
        protected m_slideShow:Function;
        protected m_urlChange:Function;
        protected m_bindScene:Function;
        protected m_intervalInput:Function;
        protected m_playVideoCompletion:Function;
        protected m_removeEvent:Function;
        protected m_onDropDownEventActionGoToHandler:Function;
        protected m_onDropDownEventActionHandler:Function;
        protected m_selected:any;
        protected m_mimeType:any;

        constructor(options?:any) {
            //BB.lib.log('c base');
            if (options)
                this.m_options = options;
            super();
        }

        initialize() {
            //BB.lib.log('i base');
            var self = this;

            super.initialize(self.m_options);
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
            self.m_mimeType = '';
            self.m_actions = {
                firstPage: 'beginning',
                nextPage: 'next',
                prevPage: 'previous',
                lastPage: 'last',
                loadUrl: 'loadURL'
            };
        }

        /**
         Listen to when json row was edited
         @method _listenJsonRowEventChanged
         **/
        protected _listenJsonRowEventChanged():void {
            var self = this;
            self.m_jsonRowEventChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var domPlayerData:XMLDocument = self._getBlockPlayerData();
                var rowIndex = e.edata.rowIndex;
                var event = e.edata.event;
                var action = e.edata.action;
                var item = $(domPlayerData).find('EventCommands').children().get(rowIndex);
                $(item).attr('from', event);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            BB.comBroker.listen(BB.EVENTS.JSON_EVENT_ROW_CHANGED, self.m_jsonRowEventChangedHandler);
        }

        /**
         Listen to when user wants to add new events
         @method _listenAddEvent
         **/
        protected _listenAddEvent():void {
            var self = this;
            this.m_addNewEvent = () => {
                if (!self.m_selected)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var buff = '<EventCommand from="event" condition="" command="firstPage" />';
                $(domPlayerData).find('EventCommands').append($(buff));
                self._setBlockPlayerData(BB.Pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
                self._populateTableEvents();
            };
            $(Elements.ADD_JSON_EVENTS).on('click', self.m_addNewEvent);
        }

        /**
         Listen to when removing a resource from list
         The algorithm will uses our bootstrap-table own inject rowIndex value
         and counts up to match with the order of <EventCommand/> in msdb json, once matched against same value
         we delete the proper ordered json item from msdb and refresh the entire table
         @method _listenRemoveResource
         **/
        protected _listenRemoveEvent():void {
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
        }

        /**
         Load event list to block props UI
         @method _populateTableEvents
         **/
        protected _populateTableEvents() {
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
        }

        /**
         Update the title of the selected tab properties element and also show the sub tab
         for Settings of Json sub components (world weather, Calendar etc...)
         @override
         @method _updateTitleTab
         */
        protected _updateTitleTab() {
            var self = this;
            //super._updateTitleTab();
            $(Elements.BLOCK_COMMON_SETTINGS_TAB).show();
            $(Elements.BLOCK_SUBPROPERTIES_TITLE).text(self.m_blockAcronym);
        }

        /**
         re-take ownership for a caller block instance and register global Validators for bootstrap-table to format data
         This function has to run everytime we populate the UI since it is a shared global function
         and we have to override it so 'this' refers to correct BlockJsonBase instance
         @method _setJsonBlockGlobalValidationOwner
         **/
        protected _setJsonBlockGlobalValidationOwner(i_this) {
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
                    } else {
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
        }

        /**
         Listen in Event Action go to dropdown selections
         @method _listenActionURLChange
         **/
        protected _listenActionURLChange() {
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
        }

        /**
         Listen in Event Action dropdown selections
         @method _listenDropdownEvenActionSelection
         **/
        protected _listenDropdownEvenActionSelection() {
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
        }

        /**
         Populate the LI with all available scenes from msdb
         if the mimetype is empty (used for this class) we show all scenes in dropdown, but if mimetype exists
         (used by subclasses of this class) we filter dropdown list by matching mimetypes
         @method _populateSceneDropdown
         **/
        protected _populateSceneDropdown() {
            var self = this;
            var selected = '';
            var snippet = ['<option selected">Select scene to use'];

            $(Elements.JSON_DROPDOWN).empty();
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Json');
            var xSnippetPlayer = $(xSnippet).find('Player');
            var selectedSceneID = $(xSnippetPlayer).attr('hDataSrc');

            for (var sceneID in scenenames) {
                var mimeType = scenenames[sceneID].mimeType;
                var label = scenenames[sceneID].label;
                if (self.m_mimeType != '' && self.m_mimeType != mimeType)
                    continue;
                if (sceneID == selectedSceneID) {
                    selected = 'selected';
                    snippet.shift();
                } else {
                    selected = '';
                }
                snippet.push(`<option ${selected} data-scene_id="${sceneID}">${label}</option>`);
            }
            $(Elements.JSON_DROPDOWN).append($(snippet.join(' ')));
        }

        /**
         Populate the UI of the scene interval selector
         @method _populateInterval
         @param {Number} i_interval
         **/
        protected _populateInterval(i_interval) {
            var self = this;
            var interval = Number(i_interval);
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).spinner('value', interval);
        }

        /**
         Populate Url input field
         @method _populateUrlInput
         @param {String} i_url
         **/
        protected _populateUrlInput(i_url) {
            var self = this;
            $(Elements.JSON_URL_INPUT).val(i_url);
        }

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        protected _populate() {
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

            self._populateEventVisibility(slideShow);
            self._populateSceneDropdown();
            self._populateUrlInput(url);
            self._populateInterval(interval);
            self._populateObjectPlayToCompletion(playVideoInFull);
            self._populateSlideShow(slideShow);
            self._populateRandomPlayback(randomOrder);
            self._populateObjectPath(itemsPath);
            self._setJsonBlockGlobalValidationOwner(self);
            self._populateTableEvents();
            self._updateJsonPaths();
        }

        /**
         By default hide the  JSON URL and JSON Object paths inputs
         @method _showJsonPaths
         **/
        protected _updateJsonPaths() {
            $(Elements.JSON_PATHS_CONTAINER).slideUp();
        }

        /**
         Show or hide the events UI depending on slideshow mode
         @method _populateEventVisibility
         @param {Number} i_slideShow
         **/
        protected _populateEventVisibility(i_slideShow) {
            if (i_slideShow == "1") {
                $(Elements.JSON_EVENTS_CONTAINER).hide();
            } else {
                $(Elements.JSON_EVENTS_CONTAINER).show();
            }
        }

        /**
         Populate Object json path using dot notation
         @method _populateObjectPath
         @params {String} i_objectPath
         **/
        protected _populateObjectPath(i_objectPath) {
            var self = this;
            $(Elements.JSON_PATH_INPUT).val(i_objectPath);
        }

        /**
         Populate json object play to completion if we are pulling videos from the json path
         @method _populateObjectPlayToCompletion
         @params {Boolean} i_playToCompletion
         **/
        protected _populateObjectPlayToCompletion(i_playToCompletion) {
            var self = this;
            if (i_playToCompletion == '1') {
                $(Elements.JSON_PLAY_VIDEO_COMPLETION).prop('checked', true);
            } else {
                $(Elements.JSON_PLAY_VIDEO_COMPLETION).prop('checked', false);
            }
        }

        /**
         Populate json slideshow mode
         @method _populateSlideShow
         @params {Boolean} i_slideshow
         **/
        protected _populateSlideShow(i_slideshow) {
            var self = this;
            if (i_slideshow == '1') {
                $(Elements.JSON_SLIDESHOW).prop('checked', true);
            } else {
                $(Elements.JSON_SLIDESHOW).prop('checked', false);
            }
        }

        /**
         Populate json object random playback
         @method _populateRandomPlayback
         @params {Boolean} i_randomPlayback
         **/
        protected _populateRandomPlayback(i_randomPlayback) {
            var self = this;
            if (i_randomPlayback == '1') {
                $(Elements.JSON_RANDOM_PLAYBACK).prop('checked', true);
            } else {
                $(Elements.JSON_RANDOM_PLAYBACK).prop('checked', false);
            }
        }

        /**
         Listen to changes in the scene interval control
         @method _listenIntervalChange
         **/
        protected _listenIntervalChange() {
            var self = this;
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).spinner({value: 4, min: 1, max: 9999, step: 1});
            $(Elements.JSON_INTERVAL_INPUT).prop('disabled', true).css({backgroundColor: 'transparent'});
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
        }

        /**
         Wire changing of campaign name through scene properties
         @method _listenObjectPathChange
         @return none
         **/
        protected _listenObjectPathChange() {
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
        }

        /**
         Listen to Video Play to completion change mode
         @method _listenVideoPlayToCompletion
         @return none
         **/
        protected _listenVideoPlayToCompletion() {
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
        }

        /**
         Listen to Video Play to completion change mode
         @method _listenVideoPlayToCompletion
         @return none
         **/
        protected _listenRandomPlayback() {
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
        }

        /**
         Listen to slideshow change mode
         @method _listenSlideShowMode
         @return none
         **/
        protected _listenSlideShowMode() {
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
        }

        /**
         Wire changing of campaign name through scene properties
         @method _listenUrlChange
         @return none
         **/
        protected _listenUrlChange() {
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
        }

        /**
         Listen to the global scene list changes event so we can update the list of available scenes
         @method _listenSceneListChange
         **/
        protected _listenSceneListChange() {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED, self, function (e) {
                if (!self.m_selected)
                    return;
                self._populateSceneDropdown();
            })
        }

        /**
         Listen to playlist changes dropdown
         @method _listenSceneDropdownChange
         **/
        protected _listenSceneDropdownChange() {
            var self = this;
            self.m_bindScene = function (e) {
                if (!self.m_selected)
                    return;
                //var listType = $(e.target).attr('name');
                //if (_.isUndefined(listType))
                //    return;
                var $selected = $(e.target).find(':selected');
                //var sceneName = $(e.target).text();
                var sceneID = $selected.attr('data-scene_id');
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json');
                var xSnippetPlayer = $(xSnippet).find('Player');
                $(xSnippetPlayer).attr('hDataSrc', sceneID);
                BB.lib.log('assigning to scene ' + sceneID);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.JSON_DROPDOWN).on('change', self.m_bindScene);
        }

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        protected _loadBlockSpecificProps() {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_COMMON_PROPERTIES);
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        public deleteBlock(i_memoryOnly) {
            var self = this;
            $('.spinner', Elements.BLOCK_JSON_COMMON_PROPERTIES).off('mouseup', self.m_intervalInput);
            $(Elements.CLASS_JSON_EVENT_ACTION).off('change', self.m_onDropDownEventActionHandler);
            $(Elements.CLASS_JSON_EVENT_ACTION_GOTO).off('change', self.m_onDropDownEventActionGoToHandler);
            $(Elements.ADD_JSON_EVENTS).off('click', self.m_addNewEvent);
            $(Elements.REMOVE_JSON_EVENTS).off('click', self.m_removeEvent);
            $(Elements.JSON_DROPDOWN).off('change', self.m_bindScene);
            $(Elements.JSON_URL_INPUT).off("input", self.m_urlChange);
            $(Elements.JSON_PATH_INPUT).off("input", self.m_pathChange);
            $(Elements.JSON_PLAY_VIDEO_COMPLETION).off("change", self.m_playVideoCompletion);
            $(Elements.JSON_RANDOM_PLAYBACK).off("change", self.m_randomPlayback);
            $(Elements.JSON_SLIDESHOW).off("change", self.m_slideShow);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED, self);
            BB.comBroker.stopListen(BB.EVENTS.JSON_EVENT_ROW_CHANGED, self.m_jsonRowEventChangedHandler);
            self._deleteBlock(i_memoryOnly);
        }
    }
    return BlockJsonBase;

});