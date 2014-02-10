/**
 This class...
 @class StationsCollection
 @constructor
 @return {Object} instantiated StationsCollection
 **/
define(['jquery', 'backbone', 'StationModel'], function ($, Backbone, StationModel) {

    /**
     Custom event fired when a all stations received data from mediaSERVER processed
     @event STATIONS_UPDATED
     @static
     @final
     **/
    BB.EVENTS.STATIONS_UPDATED = 'STATIONS_UPDATED';

    var StationsCollection = Backbone.Collection.extend({

        model: StationModel,

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._getRemoteStations();
            setTimeout(function () {
                self._getRemoteStations();
            }, 10000);

        },

        _getRemoteStations: function () {
            var self = this;
            var userData = jalapeno.getUserData();
            var url = 'https://' + userData.domain + '/WebService/getStatus.ashx?user=' + userData.userName + '&password=' + userData.userPass + '&callback=?';
            url = 'https://moon.signage.me/WebService/getStatus.ashx?user=moon1@ms.com&password=123&callback=?';
            $.getJSON(url,
                function (data) {
                    var s64 = data['ret'];
                    var str = $.base64.decode(s64);
                    var xml = $.parseXML(str);
                    self._populateCollection(xml);
                }
            );
        },

        /**
         Create the stations collection with data received from remote mediaSERVER, create corresponding Backbone.models
         @method _populateCollection
         @param {Object} i_xmlStations
         **/
        _populateCollection: function (i_xmlStations) {
            var self = this;

            $(i_xmlStations).find('Station').each(function (key, value) {
                var model;
                if (_.isUndefined(self.get('stationID', parseInt(value.id)))) {
                    model = new StationModel({stationID: parseInt(value.id)});
                    self.add(model);
                } else {
                    model = self.get('stationID', parseInt(value.id));
                }
                model.set({
                    stationID: parseInt(value.id),
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
                    lastUpdate: $(value).attr('lastUpdate'),
                    stationColor: self._getStationIconColor($(value).attr('connection'))
                });
            });

            self.trigger(BB.EVENTS.STATIONS_UPDATED);
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

        zzz_populateCollection: function (i_xmlStations) {
            var i = 0;
            $(i_xmlStations).find('Station').each(function (key, value) {
                i++;
                log(key + '' + value.id + ' ' + $(value).attr('lastUpdate'));


                var snippet = '<li data-stationid="' + value.id + '" class="station">' +
                    '<span style="display: inline" id="stationIcon' + i + '"></span>' +
                    '<a class="lastStatus" style="display: inline; position: relative; top: -18px" ">' + station['name'] + '</a>' +
                    '</div><a class="fixPropOpenLiButtonPosition station stationOpenProps"></a>' +
                    '</li>';

                $(Elements.STATION_LIST_VIEW).append(snippet)
                var color = serverData[dbmid]['color'];
                setTimeout(function (x, color) {
                    $(Elements.STATION_ICON + x).append($('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><circle stroke="black" id="svg_1" fill="' + color + '" stroke-width="2" r="16" cy="20" cx="20"/></g></svg>'));
                    refreshSize();
                    $(Elements.STATION_PANEL).trigger('updatelayout');
                    $(Elements.STATION_LIST).listview('refresh');
                }, 300, i, color);
                self._listenStationSelected();

            });
        }
    })

    return StationsCollection;

});