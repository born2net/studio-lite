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
                self._initSubPanel(Elements.BLOCK_COLLECTION_COMMON_PROPERTIES);
                self._initDatatable();

                // can set global mode if we wish
                //$.fn.editable.defaults.mode = 'inline';
            },

            /**
             Init the dt widget
             @method _initDatatable
             **/
            _initDatatable: function () {
                var self = this;

                // add draggable icons
                $(Elements.CLASS_COLLECTION_TABLE_FORMATTER).attr('data-formatter', function () {
                    return '<div class="dragIconTable"><i class="fa fa-arrows-v"></i></div>';
                    //return '<select class="btn btn-mini"><option>Select</option><option>Option 1</option><option>Option 2</option></select>'
                });

                // register a global shared function to validate checkbox state
                BB.lib.validateCollectionBlockCheckBox = function (value, row, index) {
                    return {
                        checked: false,
                        disabled: false
                    }
                };

                var data = [{
                    "checkbox": "true",
                    "name": "ev1",
                    "duration": "10"
                }, {
                    "checkbox": "true",
                    "name": "event is 3",
                    "duration": "4"
                }, {
                    "checkbox": "true",
                    "name": "YYevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "event is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Zevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Zevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Zevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Zevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Zevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Zevent is 4",
                    "duration": "324"
                }, {
                    "checkbox": "true",
                    "name": "Xevent is 5",
                    "duration": "41"
                }];

                $(Elements.COLLECTION_TABLE).bootstrapTable({
                    data: data,
                    editable: true,
                    type: 'select',
                    title: 'Select status',
                    placement: 'left',
                    onEditableInit: function (response, newValue) {
                        console.log(newValue);
                    },
                    onReorderRowsDrag: function (a) {
                        console.log(a);
                    },
                    onReorderRowsDrop: function (a) {
                        console.log(a);
                    },
                    onEditableShown: function (response, newValue) {
                        console.log(newValue);
                    },
                    onEditableHidden: function (response, newValue) {
                        console.log(newValue);
                        //console.log('getSelections: ' + JSON.stringify($table.bootstrapTable('getSelections')));
                        //$table.bootstrapTable('refresh');
                    },
                    onEditableSave: function (response, newValue) {
                        console.log('saving');
                    },
                    success: function (response, newValue) {
                        if (response.status == 'error') {
                            return response.msg;
                        } //msg will be shown in editable form
                    }
                });

                $(Elements.COLLECTION_EVENTS_TABLE).bootstrapTable({
                    data: data,
                    editable: true,
                    type: 'select',
                    title: 'Select status',
                    placement: 'left',
                    onEditableInit: function (response, newValue) {
                        console.log(newValue);
                    },
                    onReorderRowsDrag: function (a) {
                        console.log(a);
                    },
                    onReorderRowsDrop: function (a) {
                        console.log(a);
                    },
                    onEditableShown: function (response, newValue) {
                        console.log(newValue);
                    },
                    onEditableHidden: function (response, newValue) {
                        console.log(newValue);
                        //console.log('getSelections: ' + JSON.stringify($table.bootstrapTable('getSelections')));
                        //$table.bootstrapTable('refresh');
                    },
                    onEditableSave: function (response, newValue) {
                        console.log('saving');
                    },
                    success: function (response, newValue) {
                        if (response.status == 'error') {
                            return response.msg;
                        } //msg will be shown in editable form
                    }
                });

            },

            /**
             Load up property values in the common panel
             @method _populate
             @return none
             **/
            _populate: function () {
                var self = this;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetYouTube = $(domPlayerData).find('Collection');
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
             Delete this block
             @method deleteBlock
             @return none
             **/
            deleteBlock: function () {
                var self = this;
                return;
                $(Elements.CLASS_YOUTUBE_VIDEO_ID).off("input", self.m_inputVideoIdChangeHandler);
                $(Elements.YOUTUBE_LIST_DROPDOWN).off('click', self.m_playlistChange);
                $(Elements.YOUTUBE_COUNTRY_LIST_DROPDOWN).off('click', self.m_countryListChange);
                $(Elements.YOUTUBE_LIST_ADD).off('click', self.m_addVideoID);
                $(Elements.CLASS_YOUTUBE_VIDEO_ID_REMOVE).off('click', self.m_removeVideoID);
                BB.comBroker.stopListenWithNamespace(BB.EVENTS.BAR_METER_CHANGED, self);
                BB.comBroker.stopListen(BB.EVENTS.YOUTUBE_VOLUME_CHANGED, self.m_inputVolumeHandler);
                self._deleteBlock();
            }
        });

        return BlockCollection;
    }
)
;