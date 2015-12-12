///<reference path="../../typings/lite/app_references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//GULP_ABSTRACT_END
define(['jquery', 'BlockJsonBase', 'moment'], function ($, BlockJsonBase, moment) {
    TSLiteModules.BlockJsonBase = BlockJsonBase;
    /**
     BlockGoogleCalendar is based on JSON base class component
     @class BlockGoogleCalendar
     @constructor
     @return {Object} instantiated BlockGoogleCalendar
     6e2919a1-47f0-4a4f-bd94-de7ecfbe604d
     **/
    var BlockGoogleCalendar = (function (_super) {
        __extends(BlockGoogleCalendar, _super);
        function BlockGoogleCalendar(options) {
            this.m_options = options;
            this.m_blockType = BB.CONSTS.BLOCKCODE_CALENDAR;
            _.extend(this.m_options, { blockType: this.m_blockType });
            _super.call(this);
        }
        /**
         Init sub class and super on base
         @method initialize
         **/
        BlockGoogleCalendar.prototype.initialize = function () {
            var self = this;
            self.m_minTokenLength = 15;
            _super.prototype.initialize.call(this, this.m_options);
            self.m_mimeType = 'Json.calendar';
            self.m_moment = moment;
            self._initSettingsPanel();
            self._listenCalChanged();
            self._listenTokenChanged();
            self._listenRefreshSheetList();
            self._listenRelativeFixedMode();
            self._loadSheetList();
            self._listenDaysOffsetChange();
            self._listenSchedStartTimeChange();
            self._listenSchedEndTimeChange();
        };
        /**
         Listen to changes in start date selection for calendar
         @method _listenSchedEndTimeChange
         **/
        BlockGoogleCalendar.prototype._listenSchedStartTimeChange = function () {
            var self = this;
            self.m_schedChangeStartTimeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var startDate = Date.parse(e.date) / 1000;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json').find('Data');
                $(xSnippet).attr('startDate', startDate);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_CALENDAR_START).on('hide.timepicker', self.m_schedChangeStartTimeHandler);
        };
        /**
         Listen to changes in end date selection for calendar
         @method _listenSchedEndTimeChange
         **/
        BlockGoogleCalendar.prototype._listenSchedEndTimeChange = function () {
            var self = this;
            self.m_schedChangeEndTimeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var endDate = Date.parse(e.date) / 1000;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json').find('Data');
                $(xSnippet).attr('endDate', endDate);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_CALENDAR_END).on('hide.timepicker', self.m_schedChangeEndTimeHandler);
        };
        /**
         Populate the fixed / offset mode in switch slider
         @method _populateMode
         **/
        BlockGoogleCalendar.prototype._populateMode = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            var mode = $(item).attr('mode');
            var daysAfter = $(item).attr('after');
            var daysBefore = $(item).attr('before');
            self._populateModeDateSelection(mode);
            self._populateDaysAfter(daysAfter);
            self._populateDaysBefore(daysBefore);
            mode = (mode == 'fixed') ? false : true;
            $(Elements.GOOGLE_CALENDAR_MODE).prop('checked', mode);
        };
        /**
         Populate the start and end dates for Google calendar date range selection
         If first time date component is used, set startDate and endDate where
         startDate is relative to today and endDate for a week from now
         @method _populateStartEndDates
         **/
        BlockGoogleCalendar.prototype._populateStartEndDates = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            // if first time date component used, set startDate relative to today
            var startDate = $(item).attr('startDate');
            if (startDate == '') {
                var date = new Date();
                var startDateUnix = self.m_moment(date).unix();
                var startDate = self.m_moment(date).format("MM/DD/YYYY");
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json').find('Data');
                $(xSnippet).attr('startDate', startDateUnix);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }
            else {
                startDate = self.m_moment.unix(startDate).format("MM/DD/YYYY");
            }
            $(Elements.GOOGLE_CALENDAR_START).datepicker('setDate', startDate);
            // if first time date component used, set endDate relative a week from now
            var endDate = $(item).attr('endDate');
            if (endDate == '') {
                var inWeek = date.setDate(new Date().getDate() + 7);
                var endDateUnix = self.m_moment(inWeek).unix();
                var endDate = self.m_moment(inWeek).format("MM/DD/YYYY");
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json').find('Data');
                $(xSnippet).attr('endDate', endDateUnix);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }
            else {
                endDate = self.m_moment.unix(endDate).format("MM/DD/YYYY");
            }
            $(Elements.GOOGLE_CALENDAR_END).datepicker('setDate', endDate);
        };
        /**
         Populate the fixed / offset mode in the UX date controls
         @method _populateModeDateSelection
         @param {String} i_mode
         **/
        BlockGoogleCalendar.prototype._populateModeDateSelection = function (i_mode) {
            var self = this;
            if (i_mode == 'offset') {
                $(Elements.CALENDAR_OFFSET_MODE).slideDown();
                $(Elements.CALENDAR_FIXED_MODE).slideUp();
            }
            else {
                $(Elements.CALENDAR_OFFSET_MODE).slideUp();
                $(Elements.CALENDAR_FIXED_MODE).slideDown();
            }
        };
        /**
         Listen to relative or fixed mode states for the component
         @method _listenRelativeFixedMode
         @param {Number} _listenRelativeFixedMode
         **/
        BlockGoogleCalendar.prototype._listenRelativeFixedMode = function () {
            var self = this;
            self.m_relativeFixedModeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var mode = $(e.target).prop('checked') == true ? 'offset' : 'fixed';
                self._populateModeDateSelection(mode);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json').find('Data');
                $(xSnippet).attr('mode', mode);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_CALENDAR_MODE).on("change", self.m_relativeFixedModeHandler);
        };
        /**
         Get current token from msdb
         @method _getToken
         @return {string} token
         **/
        BlockGoogleCalendar.prototype._getToken = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('token');
        };
        /**
         Listen days offset change as in days before and days after respectively
         @method _listenDaysOffsetChange
         **/
        BlockGoogleCalendar.prototype._listenDaysOffsetChange = function () {
            var self = this;
            $('.spinner', Elements.DAYS_BEFORE_TODAY_INPUT).spinner({ value: 4, min: 1, max: 9999, step: 1 });
            $('.spinner', Elements.DAYS_AFTER_TODAY_INPUT).spinner({ value: 4, min: 1, max: 9999, step: 1 });
            $(Elements.DAYS_BEFORE_TODAY_INPUT).prop('disabled', true).css({ backgroundColor: 'transparent' });
            $(Elements.DAYS_AFTER_TODAY_INPUT).prop('disabled', true).css({ backgroundColor: 'transparent' });
            self.m_daysHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if ($(e.target).prop("tagName") == 'INPUT')
                    return;
                var value = $(e.target).closest('.spinner').spinner('value');
                var name = $(e.target).closest('.spinner').attr('name');
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Json').find('Data');
                $(xSnippet).attr(name, value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 250, false);
            $('.spinner', Elements.CALENDAR_OFFSET_MODE).on('mouseup', self.m_daysHandler);
        };
        /**
         Populate the UI of the days after
         @method _populateDaysAfter
         @param {Number} i_interval
         **/
        BlockGoogleCalendar.prototype._populateDaysAfter = function (i_value) {
            var self = this;
            $('.spinner', Elements.CALENDAR_OFFSET_MODE).filter(function (v, el) {
                return $(el).attr('name') == 'after';
            }).spinner('value', Number(i_value));
        };
        /**
         Populate the UI of the days before
         @method _populateDaysBefore
         @param {Number} i_interval
         **/
        BlockGoogleCalendar.prototype._populateDaysBefore = function (i_value) {
            var self = this;
            $('.spinner', Elements.CALENDAR_OFFSET_MODE).filter(function (v, el) {
                return $(el).attr('name') == 'before';
            }).spinner('value', Number(i_value));
        };
        /**
         Get current fileID from msdb
         @method _getFileId
         @return {string} id
         **/
        BlockGoogleCalendar.prototype._getFileId = function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var item = $(domPlayerData).find('Json').find('Data');
            return $(item).attr('id');
        };
        /**
         Load list of latest data from server
         @method _listenRefreshSheetList
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        BlockGoogleCalendar.prototype._listenRefreshSheetList = function () {
            var self = this;
            self.m_RefreshHandler = function (e) {
                if (!self.m_selected)
                    return;
                var token = self._getToken();
                if (token.length < self.m_minTokenLength) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_TOKEN_TOO_SHORT).text());
                    return;
                }
                self._loadSheetList();
            };
            $(Elements.GOOGLE_CALENDAR_REFRESH).on('click', self.m_RefreshHandler);
        };
        /**
         Listen dropdown selected / changed
         @method _listenCalChanged
         **/
        BlockGoogleCalendar.prototype._listenCalChanged = function () {
            var self = this;
            self.m_inputChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_CALENDAR + ' option:selected').val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('id', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.GOOGLE_CALENDAR).on('change', self.m_inputChangedHandler);
        };
        /**
         Listen token updated
         @method _listenTokenChanged
         **/
        BlockGoogleCalendar.prototype._listenTokenChanged = function () {
            var self = this;
            self.m_tokenChangedHandler = function (e) {
                if (!self.m_selected)
                    return;
                var value = $(Elements.GOOGLE_CALENDAR_TOKEN).val();
                var domPlayerData = self._getBlockPlayerData();
                var item = $(domPlayerData).find('Json').find('Data');
                $(item).attr('token', value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._loadSheetList();
            };
            $(Elements.GOOGLE_CALENDAR_TOKEN).on('change', self.m_tokenChangedHandler);
        };
        /**
         Clear the list of docs
         @method _clearList
         **/
        BlockGoogleCalendar.prototype._clearList = function () {
            var self = this;
            $(Elements.GOOGLE_CALENDAR).empty();
            $(Elements.GOOGLE_CALENDAR).selectpicker('refresh');
        };
        /**
         Load latest docs from Google services
         @method _loadSheetList
         **/
        BlockGoogleCalendar.prototype._loadSheetList = function () {
            var self = this;
            self._clearList();
            var token = self._getToken();
            if (token.length < self.m_minTokenLength)
                return;
            try {
                $.ajax({
                    url: "https://secure.digitalsignage.com:442/GoogleCalendarList/" + token + "/100",
                    dataType: "json",
                    type: "post",
                    complete: function (response, status) {
                        if (!self.m_selected)
                            return;
                        self._clearList();
                        if (_.isUndefined(response.responseText) || response.responseText.length == 0)
                            return;
                        var jData = JSON.parse(response.responseText);
                        var snippet = "<option value=\"\">Nothing selected</option>";
                        _.forEach(jData, function (k) {
                            snippet += "<option value=\"" + k.id + "\">" + k.summary + "</option>";
                        });
                        $(Elements.GOOGLE_CALENDAR).append(snippet);
                        var id = self._getFileId();
                        if (id.length > self.m_minTokenLength)
                            $(Elements.GOOGLE_CALENDAR).val(id);
                        $(Elements.GOOGLE_CALENDAR).selectpicker('refresh');
                    },
                    error: function (jqXHR, exception) {
                        BB.lib.log(jqXHR, exception);
                    }
                });
            }
            catch (e) {
                BB.lib.log('error on ajax' + e);
            }
        };
        /**
         Init the settings panel that's used by Block common props for JSON based components
         @method _initSettingsPanel
         **/
        BlockGoogleCalendar.prototype._initSettingsPanel = function () {
            var self = this;
            self.m_blockProperty.initSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_CALENDAR);
        };
        /**
         Load block specific properties
         @override
         @method _loadBlockSpecificProps
         **/
        BlockGoogleCalendar.prototype._loadBlockSpecificProps = function () {
            var self = this;
            self.m_blockProperty.viewSettingsPanel(Elements.BLOCK_COMMON_SETTINGS_GOOGLE_CALENDAR);
            _super.prototype._loadBlockSpecificProps.call(this);
        };
        /**
         Populate UI
         @method _populate
         **/
        BlockGoogleCalendar.prototype._populate = function () {
            var self = this;
            _super.prototype._populate.call(this);
            var domPlayerData = self._getBlockPlayerData();
            var $data = $(domPlayerData).find('Json').find('Data');
            var style = $data.attr('id');
            var token = $data.attr('token');
            $(Elements.GOOGLE_CALENDAR).selectpicker('val', style);
            $(Elements.GOOGLE_CALENDAR_TOKEN).val(token);
            self._loadSheetList();
            self._populateMode();
            self._populateStartEndDates();
        };
        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        BlockGoogleCalendar.prototype.deleteBlock = function (i_memoryOnly) {
            var self = this;
            $(Elements.GOOGLE_CALENDAR).off('change', self.m_inputChangedHandler);
            $(Elements.GOOGLE_CALENDAR_TOKEN).off('change', self.m_tokenChangedHandler);
            $(Elements.GOOGLE_CALENDAR_REFRESH).off('click', self.m_RefreshHandler);
            $(Elements.GOOGLE_CALENDAR_MODE).off("change", self.m_relativeFixedModeHandler);
            $(Elements.GOOGLE_CALENDAR_START).off('hide.timepicker', self.m_schedChangeStartTimeHandler);
            $(Elements.GOOGLE_CALENDAR_END).off('hide.timepicker', self.m_schedChangeEndTimeHandler);
            $('.spinner', Elements.CALENDAR_OFFSET_MODE).off('mouseup', self.m_daysHandler);
            _super.prototype.deleteBlock.call(this, i_memoryOnly);
        };
        return BlockGoogleCalendar;
    })(TSLiteModules.BlockJsonBase);
    return BlockGoogleCalendar;
});
//# sourceMappingURL=BlockGoogleCalendar.js.map