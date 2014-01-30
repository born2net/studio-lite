var console = {}
console.log = function (){};

/**
 A constant service name for the JalapenoModel service
 @property JalapenoModel.servicename
 @static
 @final
 @type String
 */
JalapenoModel.servicename = 'JalapenoData';

/**
 JalapenoModel.filter_Station filters of connected stations
 @property JalapenoModel.filter_Station
 @static
 @final
 @type String
 */
JalapenoModel.filter_Station = 'STATIONS';

/**
 JalapenoModel.stationList fires with a list of all stations connected
 @event JalapenoModel.stationList
 @param {this} this caller object
 @param {this} self caller object
 @param {Object} list of all of the campaign's stations
 **/
JalapenoModel.stationList = 'STATION_LIST';

/**
 JalapenoModel.stationCaptured event for screen snapshot per selected station
 @event JalapenoModel.stationCaptured
 @param {this} this caller object
 @param {this} self caller object
 @param {object} data all of the station's relevant data
 **/
JalapenoModel.stationCaptured = 'STATION_CAPTURED';

/**
 JalapenoModel.stationPlayedStopped event fired when station changes state play/stop
 @event JalapenoModel.stationPlayedStopped
 @param {this} this caller object
 @param {this} self caller object
 @param {object} data all of the station's relevant data
 **/
JalapenoModel.stationPlayedStopped = 'STATION_PLAYED_STOPPED';

/**
 JalapenoModel.stationEventRx fires when station data received
 @event JalapenoModel.stationEventRx
 @param {this} this caller object
 @param {this} self caller object
 @param {object} data all of the station's relevant data
 **/
JalapenoModel.stationEventRx = 'STATION_EVENT_RX';

/**
 The JalapenoModel is used to manage real time data that's not in the msdb such as
 station connections as well as data constants such as component codes and component xml boilerplates.
 @class JalapenoModel
 @constructor
 @return none
 **/
function JalapenoModel() {

    this.self = this;
    //todo: fix ajax lib
    // this.m_ajax = Backbone.commBroker.getService(AjaxRPC.serviceName);
    this.m_data = {};
    this.m_components = {};
    this.m_icons = {};

    this._initComponents();
};

JalapenoModel.prototype = {
    constructor: JalapenoModel,

    /**
     The _initComponents initializes data constants for components and used to relieve member data
     such as mapping between component code and the type of resource it holds, path for default icon etc.
     @method _initComponents
     @return none
     **/
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
                description: 'Bimap file',
                getDefaultPlayerData: function (i_resourceID) {
                    var xml = '<Player player="3130" label="" interactive="0">' +
                        '<Data>' +
                        '<Resource hResource="' + i_resourceID + '">' +
                        '<AspectRatio maintain="1" />' +
                        '<Image />' +
                        '</Resource>' +
                        '</Data>' +
                        '</Player>';
                    return xml;
                },
                ext: [
                    0, 'png',
                    1, 'jpg',
                    2, 'swf'
                ]
            },
            3100: {
                name: 'Video',
                description: 'Movie file',
                getDefaultPlayerData: function (i_resourceID) {
                    var xml = '<Player player="3100" label="" interactive="0">' +
                        '<Data>' +
                        '<Resource hResource="' + i_resourceID + '">' +
                        '<AspectRatio maintain="1" />' +
                        '<Image autoRewind="1" volume="1" backgroundAlpha="1" />' +
                        '</Resource>' +
                        '</Data>' +
                        '</Player>';
                    return xml;
                },
                ext: [
                    0, 'flv',
                    1, 'mp4'
                ]
            },
            3430: {
                name: 'QR Component',
                description: 'QR code for mobile device integration',
                getDefaultPlayerData: function () {
                    return '<Player player="3430" label="QR Code"><Data/></Player>';
                },
                icon: self.getIcon('qr')
            },
            3345: {
                name: 'Really Simple Syndication',
                description: 'RSS for daily fresh scrolling news feed',
                getDefaultPlayerData: function () {
                    return '<Player player="3345" label="Rss news"><Data/></Player>';
                },
                icon: self.getIcon('rss')
            }
        };
    },

    /**
     The setData is a generic method of storing general data as well as categorizing that data with
     a simple hash filter into a self contained data structure.
     The data is placed into the hash and in return we receive a handle that's used to retrieve members.
     @method setData
     @param {Object} i_values
     @param {String} i_dataFilter a way to filter data members by category
     @return {Number} unique handle
     **/
    setData: function (i_values, i_dataFilter) {
        var dbmid = getUnique();
        this.m_data[dbmid] = i_values;
        this.m_data[dbmid]['dataFilter'] = i_dataFilter
        return dbmid;
    },


    /**
     Update a specific data member using its handle.
     @method updData
     @param {Number} i_dbmid handle
     @param {Object} i_values
     @return {Number} Unique clientId.
     **/
    updData: function (i_dbmid, i_values) {
        this.m_data[i_dbmid] = i_values;
    },

    /**
     Get the entire data structure back to the caller.
     @method getData
     @return {Object} entire data structure
     **/
    getData: function () {
        return this.m_data;
    },

    /**
     Returns a specific data member using its handle id.
     @method getDataByID
     @param {Number} i_dbmid
     @return {Object} return data member
     **/
    getDataByID: function (i_dbmid) {
        return this.m_data[i_dbmid];
    },

    /**
     Returns an entire set of data members matching the category filter.
     @method getDataByFilter
     @param {String} i_dataFilter filter value
     @return {Object} return matched data members
     **/
    getDataByFilter: function (i_dataFilter) {
        var data = {};
        for (var i in this.m_data) {
            if (this.m_data[i]['dataFilter'] == i_dataFilter) {
                data[i] = this.m_data[i];
            }
        }
        return data;
    },

    /**
     Delete an entire set of data members matching the category filter.
     @method destroyByDataFilter
     @param {String} i_dataFilter filter value
     @return none
     **/
    destroyByDataFilter: function (i_dataFilter) {
        for (var i in this.m_data) {
            if (this.m_data[i]['dataFilter'] == i_dataFilter) {
                delete this.m_data[i];
            }
        }
    },

    /**
     Retrieve a component code from a file extension type (i.e.: flv > 3100).
     @method getBlockCodeFromFileExt
     @param {String} i_fileExtension
     @return {Number} return component code
     **/
    getBlockCodeFromFileExt: function (i_fileExtension) {
        var self = this;
        for (var code in self.m_components) {
            if (self.m_components[code]['ext'] != undefined) {
                for (var i = 0; i < self.m_components[code]['ext'].length; i++) {
                    if (self.m_components[code]['ext'][i] == i_fileExtension) {
                        return code;
                    }
                }
            }
        }
        return -1;
    },

    /**
     Get a component data structure and properties for a particular component id.
     @method getComponent
     @param {Number} i_componentID
     @return {Object} return the data structure of a specific component
     **/
    getComponent: function (i_componentID) {
        var self = this;
        return self.m_components[i_componentID];
    },

    /**
     Get the entire set data structure for all components.
     @method getComponents
     @return {Object} return all data structure
     **/
    getComponents: function () {
        var self = this;
        return self.m_components;
    },

    /**
     Get the icon / image path for a resource type.
     @method getIcon
     @param {String} i_resourceType
     @return {String} url path
     **/
    getIcon: function (i_resourceType) {
        var self = this;
        return self.m_icons[i_resourceType]['image'];
    },

    /**
     Get the  entire icon set data structure for all images.
     @method getIcons
     @return {Object} data set
     **/
    getIcons: function () {
        var self = this;
        return self.m_icons;
    },

    /**
     Send a remote command / event to a specified station id and wait for a call back.
     This feature is based on Campaign events and remote touch.
     @method sendStationEvent
     @param {Number} i_stationID
     @param {String} i_eventName
     @param {String} i_eventValue
     @return none
     **/
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
            Backbone.comBroker.fire(JalapenoModel.stationEventRx, this, self, data)
        }
    },

    /**
     Send a remote snapshot command to a specified station id and wait for a call back.
     @method sendStationCapture
     @param {Number} i_station
     @return none
     **/
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
            Backbone.comBroker.fire(JalapenoModel.stationCaptured, this, self, data)
        }
    },

    /**
     Send a remote command of play or stop to a specified station id and wait for a call back.
     @method sendStationPlayStop
     @param {Number} i_station
     @param {Number} i_command
     @return none
     **/
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
            Backbone.comBroker.fire(JalapenoModel.stationPlayedStopped, this, self, data)
        }
    },

    /**
     Add a station to internal data structure.
     @method setStation
     @param {Number} i_station
     @return {Number} unique handle
     **/
    setStation: function (i_station) {
        var self = this
        return self.setData(i_station, JalapenoModel.filter_Station)
    },

    /**
     Get a station's data from the internal data structure.
     @method getStation
     @param {Number} i_dbmid unique handle
     @return {Object} station data
     **/
    getStation: function (i_dbmid) {
        var self = this
        return self.m_data[i_dbmid];
    },

    /**
     Update an entire set of stations in the internal data structure.
     @method updStations
     @param {Number} i_dbmid
     @param {Object} i_stations
     @return none
     **/
    updStations: function (i_dbmid, i_stations) {
        var self = this;
        var newStatus = i_stations['status'];
        var oldStatus = self.m_data[i_dbmid]['status'];
        self.m_data[i_dbmid] = i_stations;
        self.m_data[i_dbmid]['dataFilter'] = JalapenoModel.filter_Station;
        self.m_data[i_dbmid]['statusChanged'] = newStatus == oldStatus ? false : true;
    },

    /**
     Stop all queued server calls.
     @method abortServerCalls
     @return none
     **/
    abortServerCalls: function () {
        var self = this;
        self.m_ajax.abortAll();
        self.m_ajax.resumeAll();
    },

    /**
     Request from remote server a list of all stations and their status and wait for callback.
     @method requestStationsList
     @param {Object} i_caller notify caller on callback
     @return none
     **/
    requestStationsList: function (i_caller) {
        var self = this;
        var newSrvData = {};
        var srvCmd = { '@functionName': 'f_getStationList' };
        var stationsArray = [];

        // log('getting stations...');

        var ajaxWrapper = new AjaxJsonGetter(globs['debug'] ? 'https://secure.dynawebs.net/_php/msWSsec-debug.php' : 'https://secure.dynawebs.net/_php/msWSsec.php');
        ajaxWrapper.getData(srvCmd, onServerReply);

        function onServerReply(data) {
            // no stations
            if (data.responce['Stations']['Station'] == undefined)
                return;

            // single station
            if (data.responce['Stations']['Station'].length == undefined) {
                stationsArray.push(data.responce['Stations']['Station'])
                // multiple station
            } else {
                stationsArray = data.responce['Stations']['Station'];
            }

            for (var i = 0; i < stationsArray.length; i++) {
                var o = stationsArray[i];
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
                if (self.m_data[dbmid]['dataFilter'] == JalapenoModel.filter_Station) {
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
                if (self.m_data[i]['dataFilter'] == JalapenoModel.filter_Station) {
                    stations[i] = self.m_data[i];
                }
            }
            Backbone.comBroker.fire(JalapenoModel.stationList, this, i_caller, stations);
        }
    },

    /**
     Get dictionary of pre-set screen division configurations.
     @method getScreenCollection
     @return {Object} data template.
     **/
    getScreenCollection: function () {
        return JalapenoTemplate;
    }
}