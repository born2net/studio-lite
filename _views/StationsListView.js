/**
 This class manages active list of remote stations (screens) retrieved from the server
 Poll for stations status every n seconds, as well as remote manage each station individually.
 @class StationsListView
 @constructor
 @param {String} i_container element that CompCampaignNavigator inserts itself into
 @return {Object} instantiated StationsListView
 **/
define(['jquery', 'backbone', 'StationsCollection'], function ($, Backbone, StationsCollection) {

    var StationsListView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_refreshTimer = 60000;
            self.m_selected_station_id = undefined;
            self.m_imageReloadCount = 0;
            self.m_imagePath = '';
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.STATION_PROPERTIES);
            // self.m_property.selectView(Elements.STATION_PROPERTIES);

            self.m_stationCollection = new StationsCollection();
            self.listenTo(self.m_stationCollection, 'add', function (i_model) {
                self._onAddStation(i_model);
                self._listenStationSelected();
            });
            self.listenTo(self.m_stationCollection, 'change', function (i_model) {
                self._onUpdateStation(i_model);
            });

            self._wireUI();
            self._wireSnapshot();

            BB.comBroker.listen(BB.EVENTS.APP_SIZED, self._reconfigScreeCaptureLocation);
            self._reconfigScreeCaptureLocation();
        },

        /**
         Render is called when the StackView is in view which tightly coupled with StationView instance
         so we can update the station list status when this View is visible
         @method render
         **/
        render: function () {
            var self = this;
            self.m_stationCollection.resumeGetRemoteStations();
            log('in view');
        },

        /**
         Unrender method used to notify this View that is it no longer visible so we can stop
         updating remote station status to increase app perfromance
         @method unrender
         **/
        unrender: function () {
            var self = this;
            self.m_stationCollection.pauseGetRemoteStations();
            log('not in view');
        },

        /**
         Listen to station selection, populate the properties panel
         @method _listenStationSelected
         **/
        _listenStationSelected: function () {
            var self = this;
            $(Elements.CLASS_STATION_LIST_ITEMS).off('click');
            $(Elements.CLASS_STATION_LIST_ITEMS).on('click', function (e) {
                var elem = $(e.target).closest('li');
                self.m_selected_station_id = $(elem).data('station_id');
                var stationModel = self.m_stationCollection.findWhere({'stationID': self.m_selected_station_id});
                $(Elements.CLASS_STATION_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(elem).addClass('activated').find('a').addClass('whiteFont');
                self.m_property.viewPanel(Elements.STATION_PROPERTIES);
                self._updatePropStats(stationModel);
                self._updatePropButtonState(stationModel);
                return false;
            });
        },

        /**
         Update properties > button state on station selection
         @method _updatePropButtonState
         @param {Object} i_model
         **/
        _updatePropButtonState: function (i_model) {
            var disabled = ''
            if (i_model.get('connection') == '0') {
                disabled = 'disabled';
            }
            $('#stationcontrol button').prop('disabled', disabled);
        },

        /**
         Update the properties UI station stats from Backbone collection > model
         @method _updateProperties
         @param {Object} i_model
         **/
        _updatePropStats: function (i_model) {
            $(Elements.STATION_NAME).text(i_model.get('stationName'));
            $(Elements.STATION_WATCHDOG).text(i_model.get('watchDogConnection'));
            $(Elements.STATION_TOTAL_MEMORY).text(i_model.get('totalMemory'));
            $(Elements.STATION_PEAK_MEMORY).text(i_model.get('peakMemory'));
            $(Elements.STATION_LAST_UPDATE).text(i_model.get('lastUpdate'));
            $(Elements.STATION_RUNNING_TIME).text(i_model.get('runningTime'));
            $(Elements.STATION_AIR_VERSION).text(i_model.get('airVersion'));
            $(Elements.STATION_APP_VERSION).text(i_model.get('appVersion'));
            $(Elements.STATION_OS).text(i_model.get('stationOS'));
        },

        /**
         Reconfigure the location (offset) of the screen capture UI depending on current property with
         @method _reconfigScreeCaptureLocation
         **/
        _reconfigScreeCaptureLocation: function () {
            var offset = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']).getPropWidth();
            if (offset < 240)
                offset = 240;
            var box = (offset / 2) - 120;
            $(Elements.SNAP_SHOT_SVG).css({
                left: box + 'px'
            });
            $(Elements.SNAP_SHOT_IMAGE).css({
                left: box + 15 + 'px'
            });
            $(Elements.SNAP_SHOT_SPINNER).css({
                left: (offset / 2) - 20 + 'px'
            });
        },

        /**
         Update existing station in list with data from remote mediaSERVER
         If a station is selected in the list, make sure we also update its open property values
         @method _onUpdateStation
         @param {Object} i_stationModel
         **/
        _onUpdateStation: function (i_stationModel) {
            var self = this;
            if (i_stationModel.get('connectionStatusChanged')) {
                var stationLI = $(Elements.STATION_LIST_VIEW).find('[data-station_id="' + i_stationModel.get('stationID') + '"]');
                $(stationLI).find('circle').attr('fill', i_stationModel.get('stationColor'));
            }
            if (i_stationModel.get('stationID') == self.m_selected_station_id) {
                if (!stationLI)
                    var stationLI = $(Elements.STATION_LIST_VIEW).find('[data-station_id="' + i_stationModel.get('stationID') + '"]');
                stationLI.trigger('click');
                log('update data on ' + self.m_selected_station_id);
            }
        },

        _captureInProgress: function(){
            var self = this;
            self.m_imagePath = '';
            self.m_imageReloadCount = 0;
            $('#stationcontrol button').prop('disabled', 'disabled');
        },

        _captureCompleted: function(){
            var self = this;
            // $('#stationcontrol button').prop('disabled', '');
        },

        /**
         When new data is available from the remote server, update the list with current data.
         @method _onAddStation
         @param {Event} e remote server data call back from Ajax call
         @return none
         **/
        _onAddStation: function (i_stationModel) {
            var self = this;
            var snippet = '<li class="' + BB.lib.unclass(Elements.CLASS_STATION_LIST_ITEMS) + ' list-group-item" data-station_id="' + i_stationModel.get('stationID') + '">' +
                '<a href="#">' +
                '<span id="stationIcon' + i_stationModel.get('id') + '">' +
                '<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><circle stroke="black" id="svg_1" fill="' + i_stationModel.get('stationColor') + '" stroke-width="2" r="16" cy="20" cx="20"/></g></svg>' +
                '</span>' +
                '<span style="font-size: 1.5em; position: relative; top: -23px">' + i_stationModel.get('stationName') + '</span>' +
                '</a>' +
                '</li>';
            $(Elements.STATION_LIST_VIEW).append(snippet)
        },

        /**
         Listen when a new remote snapshot is available on the server for a selected station, so we can display it in the properties panel.
         @method _listenToImageLoad
         @return none
         **/
        _listenToImageLoad: function () {
            var self = this;
            $(Elements.SNAP_SHOT_IMAGE).one('load', function (e) {
                $(Elements.SNAP_SHOT_SPINNER).hide();
                $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);
                $(Elements.SNAP_SHOT_IMAGE).fadeIn('slow');
                self._captureCompleted();
            });
        },

        /**
         Listen when a new remote snapshot is available on the server for a selected station, so we can display it in the properties panel.
         @method _listenToImageLoad
         @return none
         **/
        _listenToImageError: function () {
            var self = this;
            $(Elements.SNAP_SHOT_IMAGE).one('error',function (e) {
                self.m_imageReloadCount++;
                if (self.m_imageReloadCount > 6) {
                    self._captureCompleted();
                    $(Elements.SNAP_SHOT_SPINNER).fadeOut('slow');
                    self.m_imageReloadCount = 0;
                    return;
                }
                setTimeout(function () {
                    $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);
                }, 1500)
            });
        },

        _wireSnapshot: function () {
            var self = this;
            // $(Elements.SNAPSHOT_SPINNER).fadeOut();
            // $(Elements.SNAPSHOT_IMAGE).fadeOut();
            // fail load image
            $(Elements.STATION_CAPTURE_COMMAND).on('click', function (e) {
                self._captureInProgress();
                self._listenToImageLoad();
                self._listenToImageError();
                self.m_imagePath = jalapeno.sendSnapshot(Date.now(), '0.2', self.m_selected_station_id, function (e) {
                });
                $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);
                $(Elements.SNAP_SHOT_IMAGE).hide();
                $(Elements.SNAP_SHOT_SPINNER).fadeIn('slow');
                return false;
            });
        },

        /**
         Bind all event listeners on the UI for remote stations commands including commands
         @method _wireUI
         @return none
         **/
        _wireUI: function () {
            var self = this;
            $(Elements.STATION_PLAY_COMMAND + ' , ' + Elements.STATION_STOP_COMMAND).on('click', function (e) {
                var command = BB.lib.unhash(Elements.STATION_PLAY_COMMAND) == e.currentTarget.id ? 'start' : 'stop';
                jalapeno.sendCommand(command, self.m_selected_station_id, function () {
                    // log('cmd done'+command);
                });
                return false;
            });

            $(Elements.STATION_RELOAD_COMMAND).click(function (e) {
                jalapeno.sendCommand('rebootPlayer', self.m_selected_station_id, function () {
                    log('cmd done restart');
                });
                return false;
            });
        },

        /**
         Send a remote value (i.e.: remote event / remote touch) to a selected station.
         If events are enable at the campaign level, the _sendStationEvent method enables users to fire events on a selected
         Station and thus change campaign attributes.
         @method _sendStationEvent
         @param {String} i_eventName
         @param {String} i_eventValue
         @return none
         **/
        _sendStationEvent: function (i_eventName, i_eventValue) {
            var self = this;
            BB.comBroker.listen(JalapenoHelper.stationEventRx, function (e) {
                var s = e.edata.responce['eventName'];
                switch (s) {
                    case 'restart':
                    {
                        self._buttonEnable(Elements.RELOAD_COMMAND, true)
                        break;
                    }
                    default:
                    {
                        $(Elements.EVENT_SEND_BUTTON).button('enable');
                    }
                }
            });

            model.sendStationEvent(model.getDataByID(self.m_selected_resource_id)['id'], i_eventName, i_eventValue);
            $(Elements.EVENT_SEND_BUTTON).button('disable');
        }
    });
    return StationsListView;
});