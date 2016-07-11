/**
 The timeline instance is created for each timeline in a campaign. It creates its UI, listens to timeline
 event selections, and holds a reference to its own timeline_id.
 The timeline instance also creates channel instances for all the channels it hosts and hold references to these
 channels via m_channels member.
 @class Timeline
 @constructor
 @return {Object} instantiated Timeline
 **/
define(['jquery', 'backbone', 'Channel', 'ScreenTemplateFactory', 'datepicker', 'XDate'], function ($, Backbone, Channel, ScreenTemplateFactory, datepicker, Xdate) {

    /**
     Custom event fired when a timeline is selected. If a timeline is not of the one selected,
     it ignores the event.
     @event Timeline.CAMPAIGN_TIMELINE_SELECTED
     @param {This} caller
     @param {Self} context caller
     @param {Event} timelineID of the timeline selected
     @static
     @final
     **/
    BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED = 'CAMPAIGN_TIMELINE_SELECTED';

    var Timeline = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_ONCE = '0';
            self.m_DAILY = '1';
            self.m_WEEKLY = '2';
            self.m_PRIORITY_LOW = 2;
            self.m_PRIORITY_MEDIUM = 1;
            self.m_PRIORITY_HIGH = 0;
            self.m_WEEKDAYS = [1, 2, 4, 8, 16, 32, 64];
            self.m_channels = {}; // hold references to all created channel instances
            self.m_screenTemplate = undefined;
            self.m_campaign_timeline_id = self.options.campaignTimelineID;
            self.m_timing = 'sequencer';
            self.m_stackViewID = undefined;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_sequences = BB.comBroker.getService(BB.SERVICES['SEQUENCER_VIEW']);
            self.m_selected = false;
            self._populateChannels();
            self.populateTimeline();
            self._listenInputChange();
            self._listenReset();
            self._listenViewerRemoved();
            self._onTimelineSelected();
            pepper.listenWithNamespace(Pepper.TEMPLATE_VIEWER_EDITED, self, $.proxy(self._templateViewerEdited, self));
            pepper.listenWithNamespace(Pepper.NEW_CHANNEL_ADDED, self, $.proxy(self._channelAdded, self));

            var campaignPlayMode = pepper.getCampaignPlayModeFromTimeline(self.m_campaign_timeline_id);
            if (campaignPlayMode == BB.CONSTS.SCHEDULER_MODE) {
                self._listenSchedDurationChange();
                self._listenSchedPriorityChange();
                self._listenSchedStartTimeChange();
                self._listenSchedRepeatChange();
                self._listenDatePicker();
                self._listenWeekdayChange();
            }
        },

        /**
         Listen to reset of when switching to different campaign so we forget current state
         @method _listenReset
         **/
        _listenReset: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.CAMPAIGN_RESET, self, function () {
                self._reset();
            });
        },

        /**
         Listen to timeline selection events and populate the properties panel accordingly.
         @method _onTimelineSelected
         @return none
         **/
        _onTimelineSelected: function () {
            var self = this;
            self.m_campaignTimelineSelectedHandler = function (e) {
                var timelineID = e.edata;
                if (self.m_campaign_timeline_id != timelineID) {
                    self.m_selected = false;
                    return;
                }
                self.m_selected = true;
                self._propLoadTimeline();
                // log('timeline selected ' + self.m_campaign_timeline_id);
            };
            BB.comBroker.listenWithNamespace(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, self, self.m_campaignTimelineSelectedHandler);
        },

        /**
         Update msdb when the timeline title has changed.
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_inputChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(Elements.TIME_LINE_PROP_TITLE_ID).val();
                if (BB.lib.isEmpty(text))
                    return;
                text = BB.lib.cleanProbCharacters(text, 1);
                pepper.setCampaignTimelineRecord(self.m_campaign_timeline_id, 'timeline_name', text);
            }, 150, false);
            $(Elements.TIME_LINE_PROP_TITLE_ID).on("input", self.m_inputChangeHandler);
        },


        /**
         Listen to changes in timeline duration changes with respect to the scheduler
         @method _listenDatePicker
         @return none
         **/
        _listenDatePicker: function () {
            var self = this;
            self.m_listenDatePickerHandler = function (e) {
                if (!self.m_selected)
                    return;
                if (_.isUndefined(e.date))
                    return;
                var field = $(e.target).attr('name');
                var xd = new XDate(e.date);
                var date = xd.toString('MM/dd/yyyy');
                pepper.setCampaignsSchedule(self.m_campaign_timeline_id, field, date);
            };
            $(Elements.CLASS_TIME_PICKER_SCHEDULER).datepicker().on("hide", self.m_listenDatePickerHandler);

        },

        /**
         Listen weekdays change in scheduler
         @method _listenWeekdayChange
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _listenWeekdayChange: function () {
            var self = this;
            self.m_schedWeekdayHandler = function (e) {
                if (!self.m_selected)
                    return;
                var weekBits = 0;
                // bitwize operator
                $(Elements.SCHEDUALED_DAYS).find('input').each(function (i, el) {
                    if ($(el).prop('checked'))
                        weekBits = weekBits + self.m_WEEKDAYS[i];
                });
                pepper.setCampaignsSchedule(self.m_campaign_timeline_id, 'week_days', weekBits);
            };
            $(Elements.CLASS_SCEDULE_DAY).on("change", self.m_schedWeekdayHandler);
        },

        /**
         Listen to changes in timeline duration changes with respect to the scheduler
         @method _listenSchedDurationChange
         @return none
         **/
        _listenSchedDurationChange: function () {
            var self = this;
            self.m_schedChangeDurationHandler = function (e) {
                if (!self.m_selected)
                    return;
                var totalSeconds = pepper.formatObjectToSeconds({
                    hours: e.time.hours,
                    minutes: e.time.minutes,
                    seconds: e.time.seconds
                });
                pepper.setCampaignsSchedule(self.m_campaign_timeline_id, 'duration', totalSeconds);
            };
            $(Elements.TIME_PICKER_DURATION_INPUT).on("hide.timepicker", self.m_schedChangeDurationHandler);
        },

        /**
         Listen to when sched repeat on the carousel changed
         @method _listenSchedRepeatChange
         **/
        _listenSchedRepeatChange: function(){
            var self = this;
            self.m_schedChangeRepeatHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var carouselIndex = $(Elements.SCHEDULER_REPEAT_MODE + ' .active').index(Elements.SCHEDULER_REPEAT_MODE + ' .item');
                pepper.setCampaignsSchedule(self.m_campaign_timeline_id, 'repeat_type', carouselIndex);
            },500, false);
            $(Elements.SCHEDULER_REPEAT_MODE).on('slid.bs.carousel', self.m_schedChangeRepeatHandler);
        },

        /**
         Listen to changes in scheduler start time playback values
         @method _listenSchedStartTimeChange
         **/
        _listenSchedStartTimeChange: function () {
            var self = this;
            self.m_schedChangeStartTimeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var totalSeconds = pepper.formatObjectToSeconds({
                    hours: e.time.hours,
                    minutes: e.time.minutes,
                    seconds: e.time.seconds
                });
                pepper.setCampaignsSchedule(self.m_campaign_timeline_id, 'start_time', totalSeconds);
            };
            $(Elements.TIME_PICKER_TIME_INPUT).on('hide.timepicker', self.m_schedChangeStartTimeHandler);
        },

        /**
         Listen to changes in scheduler priority values
         @method _listenSchedPriorityChange
         **/
        _listenSchedPriorityChange: function () {
            var self = this;
            self.m_schedChangePriorityHandler = function (e) {
                if (!self.m_selected)
                    return;
                var priority = $(e.target).attr('name');
                pepper.setCampaignsSchedule(self.m_campaign_timeline_id, 'priorty', priority);
                if (Number(priority) == self.m_PRIORITY_LOW) {
                    $(Elements.SCHEDULE_PRIORITY).find('img').eq(1).fadeTo('fast', 0.5).end().eq(2).fadeTo('fast', 0.5);
                } else if (Number(priority) == self.m_PRIORITY_MEDIUM) {
                    $(Elements.SCHEDULE_PRIORITY).find('img').eq(1).fadeTo('fast', 1).end().eq(2).fadeTo('fast', 0.5);
                } else {
                    $(Elements.SCHEDULE_PRIORITY).find('img').eq(1).fadeTo('fast', 1).end().eq(2).fadeTo('fast', 1);
                }
            };
            $(Elements.CLASS_SCHEDULE_PRIORITIES).on('click', self.m_schedChangePriorityHandler);
        },

        /**
         When a campaign_timeline_board_template is edited, modify its related UI (inside sequencer)
         @method campaign_timeline_board_template_id
         @param {event} e template viewer ids
         **/
        _templateViewerEdited: function (e) {
            var self = this;
            if (!self.m_selected)
                return;
            var campaign_timeline_board_template_id = e.edata;
            self._populateBoardTemplate(campaign_timeline_board_template_id);
        },

        /**
         New channel was added to an existing timeline (most likely through the addition of a viewer (screen division) template editor)
         @method _channelAdded
         @param {event} e
         **/
        _channelAdded: function (e) {
            var self = this;
            if (!self.m_selected)
                return;
            self.m_channels[e.edata.chanel] = new Channel({campaignTimelineChanelID: e.edata.chanel});
        },

        /**
         Populate the timeline property
         @method _listenInputChange
         **/
        _propLoadTimeline: function () {
            var self = this;
            self.m_property.viewPanel(Elements.TIMELINE_PROPERTIES);
            var recTimeline = pepper.getCampaignTimelineRecord(self.m_campaign_timeline_id);
            $(Elements.TIME_LINE_PROP_TITLE_ID).val(recTimeline['timeline_name']);
            self._populateTimelineLength();
            self._populateTimelinePlayMode();
        },

        /**
         Populate the Scheduler UI
         @method _populateScheduler
         @params {Number} i_timeline_id
         **/
        _populateScheduler: function () {
            var self = this;
            if ($(Elements.TIME_PICKER_DURATION_INPUT).timepicker == undefined)
                return;
            var recSchedule = pepper.getCampaignsSchedule(self.m_campaign_timeline_id);
            $(Elements.SCHEDULER_REPEAT_MODE).carousel(Number(recSchedule.repeat_type));
            var duration = pepper.formatSecondsToObject(recSchedule.duration);
            var startTime = pepper.formatSecondsToObject(recSchedule.start_time);
            $(Elements.TIME_PICKER_DURATION_INPUT).timepicker('setTime', duration.hours + ':' + duration.minutes + ':' + duration.seconds);
            $(Elements.TIME_PICKER_TIME_INPUT).timepicker('setTime', startTime.hours + ':' + startTime.minutes + ':' + startTime.seconds);

            if (recSchedule.priorty == self.m_PRIORITY_LOW) {
                $(Elements.SCHEDULE_PRIORITY).find('img').eq(1).fadeTo('fast', 0.5).end().eq(2).fadeTo('fast', 0.5);
            } else if (recSchedule.priorty == self.m_PRIORITY_MEDIUM) {
                $(Elements.SCHEDULE_PRIORITY).find('img').eq(1).fadeTo('fast', 1).end().eq(2).fadeTo('fast', 0.5);
            } else {
                $(Elements.SCHEDULE_PRIORITY).find('img').eq(1).fadeTo('fast', 1).end().eq(2).fadeTo('fast', 1);
            }

            $(Elements.SCHEDULE_PRIORITY)
            switch (String(recSchedule.repeat_type)) {
                case self.m_ONCE:
                {
                    var date = recSchedule.start_date.split(' ')[0];
                    $(Elements.DATE_PICKER_SCHEDULER_ONCE).datepicker('setDate', date);
                    break;
                }
                case self.m_DAILY:
                {
                    var startDate = recSchedule.start_date.split(' ')[0];
                    var endDate = recSchedule.end_date.split(' ')[0];
                    $(Elements.DATE_PICKER_SCHEDULER_DAILY_START).datepicker('setDate', startDate);
                    $(Elements.DATE_PICKER_SCHEDULER_DAILY_END).datepicker('setDate', endDate);
                    break;
                }
                case self.m_WEEKLY:
                {
                    var startDate = recSchedule.start_date.split(' ')[0];
                    var endDate = recSchedule.end_date.split(' ')[0];
                    var weekDays = recSchedule.week_days;
                    var elDays = $(Elements.SCHEDUALED_DAYS);
                    // use bitwise (bitwize) operator << >> to compute days selected
                    self.m_WEEKDAYS.forEach(function (v, i) {
                        var n = weekDays & v;
                        if (n == v) {
                            $(elDays).find('input').eq(i).prop('checked', true);
                        } else {
                            $(elDays).find('input').eq(i).prop('checked', false);
                        }
                    });
                    $(Elements.DATE_PICKER_SCHEDULER_WEEK_START).datepicker('setDate', startDate);
                    $(Elements.DATE_PICKER_SCHEDULER_WEEK_END).datepicker('setDate', endDate);
                    break;
                }
            }
        },

        /**
         Populate the timeline depending if running with sequencer or scheduler
         @method _populateTimelinePlayMode
         **/
        _populateTimelinePlayMode: function () {
            var self = this;
            var campaignMode = pepper.getCampaignPlayModeFromTimeline(self.m_campaign_timeline_id);
            switch (campaignMode) {
                case BB.CONSTS.SEQUENCER_MODE:
                {
                    $(Elements.TIMELINE_WRAP).show();
                    $(Elements.TIMELINE_PLAYMODE_LABEL).find('aside').eq(0).show().end().eq(1).hide();
                    $(Elements.CLASS_SCHEDULER_CLASS).hide();
                    $(Elements.CLASS_SEQUENCE_CLASS).show();
                    break;
                }
                case BB.CONSTS.SCHEDULER_MODE:
                {
                    $(Elements.TIMELINE_WRAP).hide();
                    $(Elements.TIMELINE_PLAYMODE_LABEL).find('aside').eq(1).show().end().eq(0).hide();
                    $(Elements.CLASS_SCHEDULER_CLASS).show();
                    $(Elements.CLASS_SEQUENCE_CLASS).hide();
                    self._populateScheduler();
                    break;
                }
            }
        },

        /**
         Populate the timeline length in its properties box
         @method _populateTimelineLength
         **/
        _populateTimelineLength: function () {
            var self = this;
            self.m_xdate = BB.comBroker.getService('XDATE');
            var totalDuration = parseInt(pepper.getTimelineTotalDuration(self.m_campaign_timeline_id));
            totalDuration = self.m_xdate.clearTime().addSeconds(totalDuration).toString('HH:mm:ss');
            $(Elements.TIMELINE_LENGTH).text(totalDuration);
        },

        /**
         Create a channel instance for every channel this timeline hosts
         @method _populateChannels
         @return none
         **/
        _populateChannels: function () {
            var self = this;
            var channelIDs = pepper.getChannelsOfTimeline(self.m_campaign_timeline_id);
            for (var i = 0; i < channelIDs.length; i++) {
                self.m_channels[channelIDs[i]] = new Channel({campaignTimelineChanelID: channelIDs[i]});
            }
        },

        /**
         Load up the board template (screen divisions) for this timeline instance.
         In case sequencer is used, we push it to the sequencer, thus creating the thumbnail template
         inside the sequencer so this timeline can be selected.
         Scheduler future support.
         @method _populateBoardTemplate
         @param {Number} i_campaign_timeline_board_template_id
         @return none
         **/
        _populateBoardTemplate: function (i_campaign_timeline_board_template_id) {
            var self = this;
            var recBoard = pepper.getGlobalBoardRecFromTemplate(i_campaign_timeline_board_template_id);
            var width = parseInt(recBoard['board_pixel_width']);
            var height = parseInt(recBoard['board_pixel_height']);

            BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).setResolution(width + 'x' + height);
            if (width > height) {
                BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).setOrientation(BB.CONSTS.HORIZONTAL);
            } else {
                BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).setOrientation(BB.CONSTS.VERTICAL);
            }
            var screenProps = pepper.getTemplateViewersScreenProps(self.m_campaign_timeline_id, i_campaign_timeline_board_template_id)
            self.m_sequences.createTimelineThumbnailUI(screenProps);
        },

        /**
         Listen when a screen division / viewer inside a screen layout was deleted and if the channel
         is equal to my channel, dispose of self
         @method _listenViewerRemoved
         **/
        _listenViewerRemoved: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.VIEWER_REMOVED, self, function (e) {
                for (var channel in self.m_channels) {
                    if (e.edata.campaign_timeline_chanel_id == channel) {
                        self.m_channels[channel].deleteChannel();
                        delete self.m_channels[channel];
                        break;
                    }
                }
            });
        },

        /**
         Create the actual UI for this timeline instance. We use the ScreenTemplateFactory for SVG creation
         and insert the snippet onto timelineViewStack so the timeline UI can be presented when selected.
         @method _createTimelineUI
         @param {Object} i_screenProps template properties object
         @return none
         _createTimelineUI: function (i_screenProps) {
            var self = this;

            var screenTemplateData = {
                orientation: BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).getOrientation(),
                resolution: BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).getResolution(),
                screenProps: i_screenProps,
                scale: '7'
            };

            var screenTemplate = new ScreenTemplateFactory({
                i_screenTemplateData: screenTemplateData,
                i_type: ScreenTemplateFactory.VIEWER_SELECTABLE,
                i_owner: this});

            var snippet = screenTemplate.create();
            // var elemID = $(snippet).attr('id');
            var divID1 = 'selectableScreenCollections' + _.uniqueId();
            var divID2 = 'selectableScreenCollections' + _.uniqueId();

            var snippetWrapper = '<div id="' + divID1 + '" style="display: none">' +
                '<div align="center" >' +
                '<div id="' + divID2 + '" align="center">' +
                '</div>' +
                '</div>' +
                '</div>';

            $(Elements.SELECTED_TIMELINE).append(snippetWrapper);

            var timelineViewStack = BB.comBroker.getService(BB.SERVICES.CAMPAIGN_VIEW).getTimelineViewStack();
            $('#' + divID2).append($(snippet));
            screenTemplate.selectablelDivision();
            var view = new BB.View({el: '#' + divID1});

            // if we are updating layout from ScreenLayoutEditorView (but actually creating a new Template layout)
            // we remove the previous Template Layout from DOM as well as its matching ScreenTemplateFactory instance
            if (self.m_stackViewID) {
                $('#' + self.m_stackViewID).remove();
                self.m_screenTemplate.destroy();
            }
            ;

            self.m_screenTemplate = screenTemplate;
            self.m_stackViewID = timelineViewStack.addView(view);
            screenTemplate.activate();
        },
         **/

        /**
         Return the view stack index this timeline occupies in the timelineViewStack manager.
         @method getStackViewID
         @return {Number} m_stackViewID
         getStackViewID: function () {
            var self = this;
            return self.m_stackViewID;
        },
         **/

        /**
         Reset current state
         @method _reset
         **/
        _reset: function () {
            var self = this;
            pepper.stopListenWithNamespace(Pepper.TEMPLATE_VIEWER_EDITED, self);
            pepper.stopListenWithNamespace(Pepper.NEW_CHANNEL_ADDED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.CAMPAIGN_RESET, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.CAMPAIGN_TIMELINE_SELECTED, self);
            $(Elements.TIME_LINE_PROP_TITLE_ID).off("input", self.m_inputChangeHandler);
            $(Elements.TIME_PICKER_DURATION_INPUT).off("hide.timepicker", self.m_schedChangeDurationHandler);
            $(Elements.TIME_PICKER_TIME_INPUT).off('hide.timepicker', self.m_schedChangeStartTimeHandler);
            $(Elements.CLASS_SCHEDULE_PRIORITIES).off('click', self.m_schedChangePriorityHandler);
            $(Elements.CLASS_SCEDULE_DAY).off("change", self.m_schedWeekdayHandler);
            $(Elements.SCHEDULER_REPEAT_MODE).off('slid.bs.carousel', self.m_schedChangeRepeatHandler);
            $(Elements.CLASS_TIME_PICKER_SCHEDULER).datepicker().off("hide", self.m_listenDatePickerHandler);

            $.each(self, function (k) {
                self[k] = undefined;
            });
        },

        /**
         Create the timeline and load up its template (screen divisions) UI
         @method populateTimeline
         @return none
         **/
        populateTimeline: function () {
            var self = this;
            var boardTemplateIDs = pepper.getTemplatesOfTimeline(self.m_campaign_timeline_id);
            for (var i = 0; i < boardTemplateIDs.length; i++) {
                self._populateBoardTemplate(boardTemplateIDs[i]);
            }
        },

        /**
         The timeline hold references to all of the channels it creates that exist within it.
         The getChannelInstance returns a specific channel instance for a channel_id.
         @method getChannelInstance
         @param {Number} i_campaign_timeline_chanel_id
         @return {Object} Channel
         **/
        getChannelInstance: function (i_campaign_timeline_chanel_id) {
            var self = this;
            return self.m_channels[i_campaign_timeline_chanel_id];
        },

        /**
         Delete this timeline thus also need to delete all of its related channels
         @method deleteTimeline
         @return none
         **/
        deleteTimeline: function () {
            var self = this;
            var boardTemplateID = pepper.getGlobalTemplateIdOfTimeline(self.m_campaign_timeline_id);
            pepper.removeTimelineFromCampaign(self.m_campaign_timeline_id);
            pepper.removeSchedulerFromTime(self.m_campaign_timeline_id);
            var campaignTimelineBoardTemplateID = pepper.removeBoardTemplateFromTimeline(self.m_campaign_timeline_id);
            pepper.removeBoardTemplate(boardTemplateID);
            pepper.removeTimelineBoardViewerChannels(campaignTimelineBoardTemplateID);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.VIEWER_REMOVED, self);
            pepper.removeBoardTemplateViewers(boardTemplateID);
            for (var channel in self.m_channels) {
                self.m_channels[channel].deleteChannel();
                delete self.m_channels[channel];
            }
            self._reset();
        }
    });

    return Timeline;
});