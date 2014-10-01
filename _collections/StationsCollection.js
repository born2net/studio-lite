/**
 This class...
 @class StationsCollection
 @constructor
 @return {Object} instantiated StationsCollection
 **/
define(['jquery', 'backbone', 'StationModel', 'simplestorage'], function ($, Backbone, StationModel, simpleStorage) {

    /**
     Custom event fired when station name changed
     @event STATION_NAME_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event} rss link
     @static
     @final
     **/
    BB.EVENTS.STATION_NAME_CHANGED = 'STATION_NAME_CHANGED';

    var StationsCollection = Backbone.Collection.extend({

        model: StationModel,

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            self.m_simpleStorage = simpleStorage;
            // self.m_blankNameStations = {};
            self.m_pollTimer = self.m_simpleStorage.get('pollStationsTime');
            if (_.isUndefined(self.m_pollTimer)) {
                self.m_pollTimer = 120;
                self.m_simpleStorage.set('pollStationsTime', self.m_pollTimer);
            }
            self.m_refreshHandle = undefined;
            self.resumeGetRemoteStations();
            // _.bind(self._onStationPollTimeChanged,self);
            // _.bindAll(self,'_onStationPollTimeChanged','_populateCollection');
            BB.comBroker.listen(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'], $.proxy(self._onStationPollTimeChanged, self));
            BB.comBroker.listen(BB.EVENTS['STATIONS_POLL_TIME_CHANGED'], self._onStationPollTimeChanged);
        },

        /**
         Set how often to poll remote mediaSERVER for station updates, set by global settings component
         @method _onStationPollTimeChanged
         @param {Event} e
         **/
        _onStationPollTimeChanged: function (e) {
            var self = this;
            self.m_pollTimer = e.edata;
        },

        /**
         Create the stations collection with data received from remote mediaSERVER, create corresponding Backbone.models
         @method _populateCollection
         @param {Object} i_xmlStations
         **/
        _populateCollection: function (i_xmlStations) {
            var self = this;
            var addedNewStations = false;
            $(i_xmlStations).find('Station').each(function (key, value) {
                var stationID = $(value).attr('id');
                var stationData = {
                    stationID: stationID,
                    stationName: $(value).attr('name'),
                    watchDogConnection: $(value).attr('watchDogConnection') == 1 ? 'on' : 'off',
                    status: $(value).attr('status'),
                    startTime: $(value).attr('startTime'),
                    runningTime: $(value).attr('runningTime'),
                    caching: $(value).attr('caching'),
                    totalMemory: $(value).attr('totalMemory'),
                    peakMemory: $(value).attr('peakMemory'),
                    appVersion: $(value).attr('appVersion'),
                    airVersion: $(value).attr('airVersion'),
                    stationOS: $(value).attr('os'),
                    socket: $(value).attr('socket'),
                    connection: $(value).attr('connection'),
                    connectionStatusChanged: false,
                    lastUpdate: $(value).attr('lastUpdate'),
                    stationColor: self._getStationIconColor($(value).attr('connection'))
                };

                if (_.isEmpty(stationData.stationName))
                    self._getUpdatedStationName(stationData.stationID);

                var stationModel = self.findWhere({'stationID': stationID});
                if (_.isUndefined(stationModel)) {
                    // new station added
                    stationModel = new StationModel(stationData);
                    self.add(stationModel);
                    addedNewStations = true;
                } else {
                    // update existing station
                    if (stationModel.get('connection') != stationData.connection)
                        stationData.connectionStatusChanged = true;
                    stationModel.set(stationData);
                }
            });
            if (addedNewStations)
                pepper.sync(function(){});
        },

        /**
         Name is empty, so we pepper.sync to get updated station name
         @method setPlayerData
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _getUpdatedStationName: function (i_stationID) {
            var self = this;
            pepper.getStationNameAsync(i_stationID, function(i_stationName){
                BB.comBroker.fire(BB.EVENTS.STATION_NAME_CHANGED, this, self,
                    {
                        stationID: i_stationID,
                        stationName: i_stationName
                    });
            });
        },

        /**
         Return a color string corresponding to the color code received from remote mediaSERVER
         @method _getStationIconColor
         @param {Number} i_connection
         **/
        _getStationIconColor: function (i_connection) {
            switch (i_connection) {
                case '2':
                {
                    return 'yellow';
                    break;
                }
                case '1':
                {
                    return 'green';
                    break;
                }
                default:
                {
                    return 'red';
                    break;
                }
            }
        },

        /**
         Pause retrieval of remote mediaSERVER station list and stats
         @method pauseGetRemoteStations
         **/
        pauseGetRemoteStations: function () {
            var self = this;
            clearInterval(self.m_refreshHandle);
        },

        /**
         Resume retrieval of remote mediaSERVER station list and stats
         @method resumeGetRemoteStations
         **/
        resumeGetRemoteStations: function () {
            var self = this;
            self.getRemoteStations();
            self.m_pollTimer = parseInt(self.m_pollTimer);
            log('polling on ' + self.m_pollTimer);
            if (_.isNaN(self.m_pollTimer) || _.isUndefined(self.m_pollTimer))
                self.m_pollTimer = 120;
            self.m_refreshHandle = setInterval(function () {
                self.getRemoteStations();
                log('getting station ' + Date.now() + ' ' + self.m_pollTimer);
            }, self.m_pollTimer * 1000);
        },

        /**
         Retrieve remote station list and status from remote mediaSERVER
         @method getRemoteStations
         **/
        getRemoteStations: function () {
            var self = this;
            var userData = pepper.getUserData();
            var url = window.g_protocol + userData.domain + '/WebService/getStatus.ashx?user=' + userData.userName + '&password=' + userData.userPass + '&callback=?';
            $.getJSON(url,
                function (data) {
                    var s64 = data['ret'];
                    var str = $.base64.decode(s64);
                    var xml = $.parseXML(str);
                    self._populateCollection(xml);
                }
            );
        }
    });

    return StationsCollection;

});