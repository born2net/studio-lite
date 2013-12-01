/**
 StudioLiteModel.servicename service name for commBroker
 @property StudioLiteModel.servicename
 @static
 @final
 @type String
 */
StudioLiteModel.servicename = 'StudioLiteModel';

/**
 StudioLiteModel.filter_Station filter of connected stations for parsing
 @property StudioLiteModel.filter_Station
 @static
 @final
 @type String
 */
StudioLiteModel.filter_Station = 'STATIONS';

/**
 StudioLiteModel.stationList fires with a list of all stations
 @event StudioLiteModel.stationList
 @param {this} this caller object
 @param {this} self caller object
 @param {object} list of all of the campaign's stations
 **/

StudioLiteModel.stationList = 'STATION_LIST';

/**
 StudioLiteModel.stationCaptured event for screen snapshot on station
 @event StudioLiteModel.stationCaptured
 @param {this} this caller object
 @param {this} self caller object
 @param {object} data all of the station's relevant data
 **/

StudioLiteModel.stationCaptured = 'STATION_CAPTURED';

/**
 StudioLiteModel.stationPlayedStopped event fired when station changes state
 @event StudioLiteModel.stationPlayedStopped
 @param {this} this caller object
 @param {this} self caller object
 @param {object} data all of the station's relevant data
 **/

StudioLiteModel.stationPlayedStopped = 'STATION_PLAYED_STOPPED';

/**
 StudioLiteModel.stationEventRx fires when station data received
 @event StudioLiteModel.stationEventRx
 @param {this} this caller object
 @param {this} self caller object
 @param {object} data all of the station's relevant data
 **/

StudioLiteModel.stationEventRx = 'STATION_EVENT_RX';


/**
 Internal hash for storing and managing data such as Live station status and list of
 available components that are supported.
 @class StudioLiteModel
 @constructor
 @return none
 **/
function StudioLiteModel() {

    this.self = this;
    this.m_ajax = commBroker.getService(AjaxRPC.serviceName);
    this.m_data = {};
    this.m_components = {};
    this.m_icons = {};

    this._initComponents();
};

StudioLiteModel.prototype = {
    constructor: StudioLiteModel,

    setData: function (i_values, i_dataFilter) {
        var dbmid = getUnique();
        this.m_data[dbmid] = i_values;
        this.m_data[dbmid]['dataFilter'] = i_dataFilter
        return dbmid;
    },

    updData: function (i_dbmid, i_values) {
        this.m_data[i_dbmid] = i_values;
    },

    getData: function () {
        return this.m_data;
    },

    getDataByID: function (i_dbmid) {
        return this.m_data[i_dbmid];
    },

    getDataByFilter: function (i_dataFilter) {
        var data = {};
        for (var i in this.m_data) {
            if (this.m_data[i]['dataFilter'] == i_dataFilter) {
                data[i] = this.m_data[i];
            }
        }
        return data;
    },

    destroyByDataFilter: function (i_dataFilter) {
        for (var i in this.m_data) {
            if (this.m_data[i]['dataFilter'] == i_dataFilter) {
                delete this.m_data[i];
            }
        }
    },

    /////////////////////////////////////////////////////////
    //
    // Components
    //
    /////////////////////////////////////////////////////////

    _initComponents: function () {
        var self = this;

        // Grid/Chart 3400
        // QR Code 3430
        // Catalog player 3280
        // Custom Rss player 3346
        // External swf/image 3160
        // External video 3150
        // Grid/Chart 3400
        // Stock player 3338
        // Facebook Player 4400
        // Rss news 3345
        // QR Code 3430
        // Clock 3320
        // Weather player 3310
        // Html 3235
        // Advertising 3420
        // WebCam 3350
        // Media Rss/Podcast 3340
        // Collection 4100
        // Label 3241
        // Rich Text 3240
        // ExtApp/Capture 3410
        // XmlPlayer 4200


        self.m_icons = {
            'qr': { image: 'https://secure.dynawebs.net/_msportal/_images/qr.png' },
            'rss': { image: 'https://secure.dynawebs.net/_msportal/_images/rss.png' },
            'flv': { image: 'https://secure.dynawebs.net/_msportal/_images/flv.png' },
            'mp4': { image: 'https://secure.dynawebs.net/_msportal/_images/mp4.png' },
            'png': { image: 'https://secure.dynawebs.net/_msportal/_images/png.png' },
            'jpg': { image: 'https://secure.dynawebs.net/_msportal/_images/jpg.png' },
            'swf': { image: 'https://secure.dynawebs.net/_msportal/_images/swf.png' }
        }

        self.m_components = {
            3130: {
                name: 'Image',
                description: 'Bimap file'
            },
            3100: {
                name: 'Video',
                description: 'Movie file'
            },
            3430: {
                name: 'QR Component',
                description: 'QR code for mobile device integration',
                icon: self.getIcon('qr')
            },
            3345: {
                name: 'Really Simple Syndication',
                description: 'RSS for daily fresh scrolling news feed',
                icon: self.getIcon('rss')
            }
        };
    },

    getComponent: function (i_componentID) {
        var self = this;
        return self.m_components[i_componentID];
    },

    getComponents: function () {
        var self = this;
        return self.m_components;
    },

    getIcon: function (i_resourceType) {
        var self = this;
        return self.m_icons[i_resourceType]['image'];
    },

    getIcons: function () {
        var self = this;
        return self.m_icons;
    },

    /////////////////////////////////////////////////////////
    //
    // Stations
    //
    /////////////////////////////////////////////////////////

    sendStationEvent: function (i_stationID, i_eventName, i_eventValue) {
        var data = {
            '@functionName': 'f_sendStationEvent',
            '@stationID': i_stationID,
            '@eventName': i_eventName,
            '@eventValue': i_eventValue
        }
        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php' : 'https://secure.dynawebs.net/_php/msWSsec.php');
        ajaxWrapper.getData(data, onServerReply);
        function onServerReply(data) {
            commBroker.fire(StudioLiteModel.stationEventRx, this, self, data)
        }
    },

    sendStationCapture: function (i_station) {
        var data = {
            '@functionName': 'f_captureScreen',
            '@stationID': i_station,
            '@quality': 1,
            '@time': getEpochTime()
        };

        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php?' + getEpochTime() : 'https://secure.dynawebs.net/_php/msWSsec.php?' + getEpochTime());
        ajaxWrapper.getData(data, onSnapshotReply);
        function onSnapshotReply(data) {
            commBroker.fire(StudioLiteModel.stationCaptured, this, self, data)
        }
    },

    sendStationPlayStop: function (i_station, i_command) {
        var self = this;
        var data = {
            '@functionName': 'f_sendPlayAndStop',
            '@stationID': i_station,
            '@command': i_command
        }
        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php?' + getEpochTime() : 'https://secure.dynawebs.net/_php/msWSsec.php?' + getEpochTime());
        ajaxWrapper.getData(data, onSnapshotReply);
        function onSnapshotReply(data) {
            commBroker.fire(StudioLiteModel.stationPlayedStopped, this, self, data)
        }
    },

    setStation: function (i_station) {
        var self = this
        return self.setData(i_station, StudioLiteModel.filter_Station)
    },

    getStation: function (i_dbmid) {
        var self = this
        return self.m_data[i_dbmid];
    },

    updStations: function (i_dbmid, i_stations) {
        var self = this;
        var newStatus = i_stations['status'];
        var oldStatus = self.m_data[i_dbmid]['status'];
        self.m_data[i_dbmid] = i_stations;
        self.m_data[i_dbmid]['dataFilter'] = StudioLiteModel.filter_Station;
        self.m_data[i_dbmid]['statusChanged'] = newStatus == oldStatus ? false : true;
    },

    abortServerCalls: function () {
        var self = this;
        self.m_ajax.abortAll();
        self.m_ajax.resumeAll();
    },

    requestStationsList: function (i_caller) {
        var self = this;
        var newSrvData = {};
        var srvCmd = { '@functionName': 'f_getStationList' };

        log('getting stations...');

        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php' : 'https://secure.dynawebs.net/_php/msWSsec.php');
        ajaxWrapper.getData(srvCmd, onServerReply);

        function onServerReply(data) {
            var counter = 0;
            var stationsArray = data.responce['Stations']['Station'];

            // Build JSON data model from server reply

            for (var i = 0; i < stationsArray.length; i++) {
                o = stationsArray[i];
                switch (o['@attributes'].connection) {
                    case    '2':
                    {
                        var color = 'yellow';
                        break;
                    }
                    case    '1':
                    {
                        var color = 'green';
                        break;
                    }
                    default:
                    {
                        var color = 'red';
                        break;
                    }
                }

                var id = o['@attributes'].id;
                var station = {
                    id: o['@attributes'].id,
                    name: o['@attributes'].name,
                    status: o['@attributes'].status.length < 2 ? 'not connected' : o['@attributes'].status,
                    lastUpdate: o['@attributes'].lastUpdate,
                    os: o['@attributes'].os,
                    totalMemory: o['@attributes'].totalMemory,
                    peakMemory: o['@attributes'].peakMemory,
                    appVersion: o['@attributes'].appVersion,
                    runningTime: o['@attributes'].runningTime,
                    airVersion: o['@attributes'].airVersion,
                    watchDogConnection: o['@attributes'].watchDogConnection,
                    color: color
                };

                newSrvData[id] = station;
            }

            // Update server data, if id already exists in model

            for (var dbmid in self.m_data) {
                if (self.m_data[dbmid]['dataFilter'] == StudioLiteModel.filter_Station) {
                    var id = self.m_data[dbmid]['id'];
                    if (newSrvData[id] != undefined) {
                        self.updStations(dbmid, newSrvData[id]);
                        delete newSrvData[id];
                    }
                }
            }

            // Add new server data and add field of statusChanged since it's first time data appeared

            for (var i in newSrvData) {
                newSrvData[i]['statusChanged'] = false;
                self.setStation(newSrvData[i]);
            }

            // Build temp JSON data to send fire with event

            var stations = {};
            for (var i in self.m_data) {
                if (self.m_data[i]['dataFilter'] == StudioLiteModel.filter_Station) {
                    stations[i] = self.m_data[i];
                }
            }
            commBroker.fire(StudioLiteModel.stationList, this, i_caller, stations);
        }
    },

    getScreenCollection: function () {
        return screenCollection;
    }
}