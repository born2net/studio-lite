/**
 This class...
 @class StationsCollection
 @constructor
 @return {Object} instantiated StationsCollection
 **/
define(['jquery', 'backbone', 'StationModel'], function ($, Backbone, StationModel) {

    var StationsCollection = Backbone.Collection.extend({

        model: StationModel,

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_refreshHandle = undefined;
            self.resumeGetRemoteStations();
        },

        /**
         Create the stations collection with data received from remote mediaSERVER, create corresponding Backbone.models
         @method _populateCollection
         @param {Object} i_xmlStations
         **/
        _populateCollection: function (i_xmlStations) {
            var self = this;
            // log('got stations...');
            $(i_xmlStations).find('Station').each(function (key, value) {

                var stationData = {
                    stationID: $(value).attr('id'),
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

                var stationModel = self.findWhere({'stationID': value.id});
                if (_.isUndefined(stationModel)) {
                    // new station added
                    stationModel = new StationModel(stationData);
                    self.add(stationModel);
                } else {
                    // update existing station
                    if (stationModel.get('connection') != stationData.connection)
                        stationData.connectionStatusChanged = true;
                    stationModel.set(stationData);
                }
            });
        },

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

        _getRemoteStations: function () {
            var self = this;
            var userData = jalapeno.getUserData();
            var url = 'https://' + userData.domain + '/WebService/getStatus.ashx?user=' + userData.userName + '&password=' + userData.userPass + '&callback=?';
            // url = 'https://moon.signage.me/WebService/getStatus.ashx?user=moon1@ms.com&password=123&callback=?';
            $.getJSON(url,
                function (data) {
                    var s64 = data['ret'];
                    var str = $.base64.decode(s64);
                    var xml = $.parseXML(str);
                    self._populateCollection(xml);
                }
            );
        },

        pauseGetRemoteStations: function(){
            var self = this;
            clearInterval(self.m_refreshHandle);
        },

        resumeGetRemoteStations: function(){
            var self = this;
            self._getRemoteStations();
            self.m_refreshHandle = setInterval(function () {
                self._getRemoteStations();
            }, 100000);
        }
    });

    return StationsCollection;

});