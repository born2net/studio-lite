/**
 This class manages active list of remote stations (screens) retrieved from the server
 Poll for stations status every n seconds, as well as remote manage each station individually.
 @class StationsListView
 @constructor
 @param {String} i_container element that CompCampaignNavigator inserts itself into
 @return {Object} instantiated StationsListView
 **/
define(['jquery', 'backbone', 'StationsCollection'], function ($, Backbone, StationsCollection) {

    BB.SERVICES.STATIONS_LIST_VIEW = 'StationsListView';

    var StationsListView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            BB.comBroker.setService(BB.SERVICES['STATIONS_LIST_VIEW'], self);

            self.m_snapshotInProgress = undefined;
            self.m_imageReloadCount = 0;
            self.m_imagePath = '';
            self.m_selected_station_id = undefined;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.STATION_PROPERTIES);

            self.m_stationCollection = new StationsCollection();

            //self.ajaxJsonGetter = new AjaxJsonGetter({
            //    key: BB.globs['RC4KEY'],
            //    url: 'https://secure.dynawebs.net/_php/msWSsec-debug.php?' + Date.now()
            //});

            self.listenTo(self.m_stationCollection, 'add', function (i_model) {
                $(Elements.STATION_ALERT).hide();
                self._onAddStation(i_model);
                self._listenStationSelected();
            });

            self.listenTo(self.m_stationCollection, 'change', function (i_model) {
                self._onUpdateStation(i_model);
            });

            self._wireUI();
            self._wireSnapshot();
            self._populateStationCampaignDropDown(-1);

            // BB.comBroker.listen(BB.EVENTS.APP_SIZED, self._reconfigSnapLocation);
            // self._reconfigSnapLocation();
        },

        /**
         Render is called when the StackView is in view which tightly coupled with StationView instance
         so we can update the station list status when this View is visible
         @method render
         **/
        render: function () {
            var self = this;
            self.m_stationCollection.resumeGetRemoteStations();
            self.getTotalActiveStation();
            // log('in view');

        },

        /**
         Unrender method used to notify this View that is it no longer visible so we can stop
         updating remote station status to increase app perfromance
         @method unrender
         **/
        unrender: function () {
            var self = this;
            self.m_stationCollection.pauseGetRemoteStations();
            // log('out of view');
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
                var stationID = $(elem).attr('data-station_id');
                if (stationID !== self.m_selected_station_id)
                    self._stopSnapshot();
                self.m_selected_station_id = stationID;
                var stationModel = self._getStationModel(self.m_selected_station_id);
                $(Elements.CLASS_STATION_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(elem).addClass('activated').find('a').addClass('whiteFont');
                self.m_property.viewPanel(Elements.STATION_PROPERTIES);
                self._updatePropStats(stationModel);
                self._updatePropButtonState(stationModel);
                self._selectCampaignDropDownForStation(self.m_selected_station_id);
                return false;
            });
        },

        /**
         Update properties > button state on station selection
         @method _updatePropButtonState
         @param {Object} i_model
         **/
        _updatePropButtonState: function (i_model) {
            var self = this;
            if (!_.isUndefined(self.m_snapshotInProgress))
                return;
            var disabled = ''
            if (i_model.get('connection') == '0') {
                disabled = 'disabled';
            }
            $(Elements.STATION_CONTROL + ' button').prop('disabled', disabled);
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
         Reconfigure the location (offset) of the screen snapshot UI depending on current property with
         @method _reconfigSnapLocation

        _reconfigSnapLocation: function () {
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
         **/

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
                // log('update data on ' + self.m_selected_station_id);
            }
        },

        /**
         When data is available from the remote server, update the list with current data.
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
         Bind all event listeners on the UI for remote stations commands including commands
         @method _wireUI
         @return none
         **/
        _wireUI: function () {
            var self = this;
            $(Elements.STATION_PLAY_COMMAND + ' , ' + Elements.STATION_STOP_COMMAND).on('click', function (e) {
                var command = BB.lib.unhash(Elements.STATION_PLAY_COMMAND) == e.currentTarget.id ? 'start' : 'stop';
                pepper.sendCommand(command, self.m_selected_station_id, function () {
                    // log('cmd done'+command);
                });
                return false;
            });

            $(Elements.STATION_RELOAD_COMMAND).on('click', function (e) {
                pepper.sendCommand('rebootPlayer', self.m_selected_station_id, function () {
                });
                return false;
            });

            $(Elements.STATION_SELECTION_CAMPAIGN).on('change', function (e) {
                self._onChangedCampaign(e);
                return false;
            });

            $(Elements.STATION_REMOVE).on('click', function () {
                self._removeStation(self);
            });

            $(Elements.STATION_EVENT_SEND_COMMAND).on('click', function () {
                var eventValue = $(Elements.STATION_SEND_EVENT_VALUE).val();
                pepper.sendEvent(eventValue, self.m_selected_station_id, function () {
                });
            });
        },

        /**
         Translate a station id to Backbone.Model
         @method _getStationModel
         @param {Number} i_station_id
         **/
        _getStationModel: function (i_station_id) {
            var self = this;
            return self.m_stationCollection.findWhere({'stationID': i_station_id});
        },

        /**
         Send a remote value (i.e.: remote event / remote touch) to a selected station.
         If events are enabled at the campaign level, the _sendStationEvent method enables users to fire events on a selected
         Station and thus change campaign attributes.
         @method _sendStationEvent
         @param {String} i_eventName
         @param {String} i_eventValue
         @return none
        _sendStationEvent: function (i_eventName, i_eventValue) {
            var self = this;
            model.sendStationEvent(model.getDataByID(self.m_selected_resource_id)['id'], i_eventName, i_eventValue);
            $(Elements.EVENT_SEND_BUTTON).button('disable');
        },
         **/
        _removeStation: function (i_context) {
            var self = i_context;
            if (_.isUndefined(self.m_selected_station_id)) {
                bootbox.dialog({
                    message: $(Elements.MSG_BOOTBOX_NO_STATION_SELECTED).text(),
                    buttons: {
                        danger: {
                            label: $(Elements.MSG_BOOTBOX_OK).text(),
                            className: "btn-danger",
                            callback: function () {
                            }
                        }
                    }
                });
                return false;
            }
            bootbox.confirm($(Elements.MSG_BOOTBOX_STEPS).text(), function (result) {
                if (result == true) {
                    var navigationView = BB.comBroker.getService(BB.SERVICES.NAVIGATION_VIEW);
                    pepper.sendCommand('rebootPlayer', self.m_selected_station_id, function () {
                    });
                    pepper.removeStation(self.m_selected_station_id);
                    navigationView.save(function () {
                    });
                    pepper.sync();
                    self._removeStationFromLI(self.m_selected_station_id);
                    navigationView.resetPropertiesView();
                }
            });
        },

        /**
         Remove a selected station from UI LI
         @method _removeStationFromLI
         @param {Number} i_stationID
         **/
        _removeStationFromLI: function (i_stationID) {
            var self = this;
            $(Elements.STATION_LIST_VIEW).find('[data-station_id="' + i_stationID + '"]').remove();
        },

        /**
         Wire the Snapshot UI button and handle related opeations before and after executing a station snapshot
         @method _wireSnapshot
         **/
        _wireSnapshot: function () {
            var self = this;
            $(Elements.STATION_SNAPSHOT_COMMAND).on('click', function (e) {
                self.m_imagePath = '';
                self.m_imageReloadCount = 0;
                self._listenSnapshotComplete();

                /* Can't use short path due to IE error, gotta go long route via _sendSnapshotCommand
                 self.m_imagePath = pepper.sendSnapshot(Date.now(), '0.2', self.m_selected_station_id, function (e) {});
                 log(self.m_imagePath);
                 */

                self._sendSnapshotCommand(self.m_selected_station_id);
                $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);
                $(Elements.SNAP_SHOT_IMAGE).hide();
                $(Elements.SNAP_SHOT_SPINNER).fadeIn('slow');
                $(Elements.STATION_CONTROL + ' button').prop('disabled', 'disabled');

                self.m_snapshotInProgress = setInterval(function () {
                    self.m_imageReloadCount++;
                    // log('snapshot JS... ' + self.m_imagePath);
                    $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);

                    // snapshot timed out so reset
                    if (self.m_imageReloadCount > 6) {
                        self._stopSnapshot();
                        $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);
                        var stationModel = self._getStationModel(self.m_selected_station_id);
                        self._updatePropButtonState(stationModel);
                    }
                }, 1000);
                return false;
            });
        },

        /**
         Send a remote snapshot command for station id and wait for a call back.
         @method _sendSnapshotCommand
         @param {Number} i_station
         @return none
         **/
        _sendSnapshotCommand: function (i_station) {
            var self = this;
            var d =  new Date().getTime();
            var path = pepper.sendSnapshot(d,0.2,i_station,function(e){});
            setTimeout(function(){
                self.m_imagePath = path;
            },3000);

            /*
            var data = {
                '@functionName': 'f_captureScreen',
                '@stationID': i_station,
                '@quality': 1,
                '@time': Date.now()
            };
            self.ajaxJsonGetter.getData(data, onSnapshotReply);
            function onSnapshotReply(e) {
                if (e.responce['status'] == 'pass') {
                    log('getting image from ' + e.responce['path']);
                    self.m_imagePath = e.responce['path'];
                }
            }
             // self.m_imagePath = 'https://pluto.signage.me/Snapshots/business355181/station12/1397689062944.jpg';
             // return;
            */

        },

        /**
         Stop any ongoing snapshots that are pending and reset all related snapshot UI and values
         @method _stopSnapshot
         **/
        _stopSnapshot: function () {
            var self = this;
            if (self.m_snapshotInProgress)
                clearTimeout(self.m_snapshotInProgress);
            self.m_snapshotInProgress = undefined;
            $(Elements.SNAP_SHOT_SPINNER).hide();
            $(Elements.SNAP_SHOT_IMAGE).attr('src', '');
            $(Elements.SNAP_SHOT_IMAGE).hide();
            $(Elements.SNAP_SHOT_IMAGE).unbind('load');
        },

        /**
         Listen when a new remote snapshot is available on the server for a selected station, so we can display it in the properties panel
         We use the Image.load event to be notified when the Image element has succesfully recived a working image path
         @method _listenSnapshotComplete
         @return none
         **/
        _listenSnapshotComplete: function () {
            var self = this;
            // snapshot success
            $(Elements.SNAP_SHOT_IMAGE).one('load', function (e) {
                $(Elements.SNAP_SHOT_SPINNER).hide();
                $(Elements.SNAP_SHOT_IMAGE).attr('src', self.m_imagePath);
                $(Elements.SNAP_SHOT_IMAGE).fadeIn('slow');
                clearTimeout(self.m_snapshotInProgress);
                self.m_snapshotInProgress = undefined;
                var stationModel = self._getStationModel(self.m_selected_station_id);
                self._updatePropButtonState(stationModel);
            });
        },

        /**
         Select the campaign that is bound to i_stationID and select it in the dropdown UI
         @method _selectCampaignDropDownForStation
         @param {Number} i_stationID
         **/
        _selectCampaignDropDownForStation: function (i_stationID) {
            var self = this;
            var campaignID = pepper.getStationCampaignID(i_stationID);
            self._populateStationCampaignDropDown(campaignID);
        },

        /**
         Populate the selection drop down UI with all available campaigns for station selection
         @method _populateStationCampaignDropDown
         @param  {Number} i_campaignID
         **/
        _populateStationCampaignDropDown: function (i_campaignID) {
            var self = this;
            $(Elements.STATION_SELECTION_CAMPAIGN).empty();
            if (i_campaignID == undefined || i_campaignID == -1)
                $(Elements.STATION_SELECTION_CAMPAIGN).append('<option selected data-campaign_id="-1">Select campaign</option>');
            var campaignIDs = pepper.getCampaignIDs();
            for (var i = 0; i < campaignIDs.length; i++) {
                var campaignID = campaignIDs[i];
                var recCampaign = pepper.getCampaignRecord(campaignID);
                var selected = campaignID == i_campaignID ? 'selected' : '';
                var snippet = '<option ' + selected + ' data-campaign_id="' + campaignID + '">' + recCampaign['campaign_name'] + '</option>';
                $(Elements.STATION_SELECTION_CAMPAIGN).append(snippet);
            }
        },

        /**
         On change campaign action apply changes to local msdb
         @method _onChangedCampaign
         **/
        _onChangedCampaign: function (e) {
            var self = this;
            var campaign_id = $(Elements.STATION_SELECTION_CAMPAIGN + ' option:selected').attr('data-campaign_id');
            if (campaign_id == -1)
                return;
            pepper.setStationCampaignID(self.m_selected_station_id, campaign_id);
        },

        /**
         Get current total active, non red stations
         @method getTotalActiveStation
         @param {Number} i_playerData
         @return {Number} total active / non red stations
         **/
        getTotalActiveStation: function () {
            var self = this;
            var connected = self.m_stationCollection.filter(function (stationsModel) {
                return stationsModel.get('connection') != '0'
            });
            return connected.length;
        },

        /**
         Restart station
         @method restartStation
         **/
        restartStation: function () {
            pepper.sendCommand('rebootPlayer', -1, function () {
            });
            return false;
        }
    });

    return StationsListView;
});
