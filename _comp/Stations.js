/**
 Station list is full with stations retrieved from remote server
 @property CompStations.stationListFull
 @type String
 */
CompStations.stationListFull = 'stationListFull';

/**
 Station list is empty with no stations listed
 @property CompStations.stationListEmpty
 @type String
 */
CompStations.stationListEmpty = 'stationListEmpty';

/**
 The component is responsible for loading station list from the remote server
 and poll for stations status every n seconds, as well as remote manage each station individually.
 @class CompStations
 @constructor
 @return {Object} instantiated AddBlockWizard
 **/
function CompStations(i_container) {

    this.self = this;
    this.m_container = i_container;
    this.m_imagePath = '';
    this.m_selected_resource_id = undefined;
    this.m_refreshTimer = 60000;
    this.m_refreshHandle = undefined;
    this.m_imageReloadCount = 0;
    this.m_stationDataMode = CompStations.stationListEmpty;
    this.m_property = commBroker.getService('CompProperty');


    this._init();
};

CompStations.prototype = {
    CompStations: CompStations,

    /**
     When the stations component is loaded into view, begin polling for stations status from remote server.
     @method _init
     @return none
     **/
    _init: function () {
        var self = this;

        self.m_property.initPanel(Elements.STATION_PROPERTIES, true);
        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab3' && commBroker.getService('mainViewStack') === e.caller) {
                // log('entering stations');
                setTimeout(function () {
                    model.requestStationsList(self);
                }, 500);
                self.m_refreshHandle = setInterval(function () {
                    model.requestStationsList(self);
                }, self.m_refreshTimer);
            }
        });

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') != 'tab3' && Elements.MAIN_CONTENT === e.caller.m_contentID) {
                // log('exiting stations')
                clearInterval(self.m_refreshHandle);
            }
        });
        self._wireUI();
        commBroker.listen(JalapenoModel.stationList, self._onStationUpdate);
    },

    /**
     When new data is available from the remote server, update the list with current data.
     @method _onStationUpdate
     @param {Event} e remote server data call back from Ajax call
     @return none
     **/
    _onStationUpdate: function (e) {

        var self = e.caller;
        var serverData = e.edata;
        var i = 0;

        for (var dbmid in serverData) {
            i++;
            switch (self.m_stationDataMode) {
                case CompStations.stationListEmpty:
                {
                    var station = model.getStation(dbmid);
                    var stationHTML = '<li data-dbmid="' + dbmid + '" data-icon="gear"  class="station">' +
                        '<span style="display: inline" id="stationIcon' + i + '"></span>' +
                        '<a class="lastStatus" style="display: inline; position: relative; top: -18px" ">' + station['name'] + '</a>' +
                        '</div><a data-theme="a" data-icon="gear" class="fixPropOpenLiButtonPosition station stationOpenProps"></a>' +
                        '</li>';


                    $(Elements.STATION_LIST).append(stationHTML)
                    var color = serverData[dbmid]['color'];
                    setTimeout(function (x, color) {
                        $(Elements.STATION_ICON + x).append($('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><circle stroke="black" id="svg_1" fill="' + color + '" stroke-width="2" r="16" cy="20" cx="20"/></g></svg>'));
                        refreshSize();
                        $(Elements.STATION_PANEL).trigger('updatelayout');
                        $(Elements.STATION_LIST).listview('refresh');
                    }, 300, i, color);
                    self._listenStationSelected();
                    break;
                };

                case CompStations.stationListFull:
                {
                    $(Elements.CLASS_STATION).each(function () {
                        var dbmid = $(this).data('dbmid');
                        var station = model.getStation(dbmid);
                        // if station was not deleted and updated apply status
                        if (station != undefined && station['statusChanged'] == false) {
                            var elem = $(this).find('circle')
                            elem.attr('fill', station['color']);
                        }
                    });
                    break;
                }
            }
        }
        $(Elements.STATION_LIST).listview('refresh');
        self.m_stationDataMode = $(Elements.STATION_LIST).children().size() > 0 ? CompStations.stationListFull : CompStations.stationListEmpty;


    },

    /**
     Listen for user selection on particular station so we can populate the properties panel.
     @method _listenStationSelected
     @return none
     **/
    _listenStationSelected: function () {
        var self = this;

        $(Elements.CLASS_STATION).tap(function (e) {

            var openProps = $(e.target).closest('a').hasClass('stationOpenProps') ? true : false;
            var stationElem = $(e.target).closest('li');
            var stationProp = $(stationElem).find(Elements.CLASS_STATION_OPEN_PROPS);
            var dbmid = $(stationElem).data('dbmid');

            model.abortServerCalls();

            $(Elements.SNAPSHOT_IMAGE).attr('src', '');
            $(Elements.SNAPSHOT_SPINNER).hide();
            $(Elements.SNAPSHOT_IMAGE).hide();

            self.m_property.viewPanel(Elements.STATION_PROPERTIES);
            self.m_selected_resource_id = dbmid;
            self._loadProperties(dbmid);

            $(Elements.CLASS_STATION).removeClass('currentSelectedStation');
            $(stationElem).addClass('currentSelectedStation');
            $(stationProp).addClass('currentSelectedStation');
            $(Elements.STATION_LIST).listview('refresh');

            if (openProps)
                commBroker.getService('CompProperty').openPanel(e);

            e.stopImmediatePropagation();
            return false;
        });
    },

    /**
     Populate the properties panel for a selected station.
     @method _loadProperties
     @return none
     **/
    _loadProperties: function (i_dbmid) {
        var info = model.getDataByID(i_dbmid);

        $(Elements.STATION_NAME).text(info.name);
        $(Elements.SEL_NAME).text(info.name);
        $(Elements.SEL_OS).text(info.os);
        $(Elements.SEL_AIR_VER).text(info.airVersion);
        $(Elements.SEL_PLAYERVER).text(info.appVersion);
        $(Elements.SEL_PEAK_MEM).text(info.peakMemory);
        $(Elements.SEL_TOT_MEM).text(info.totalMemory);
        $(Elements.SEL_RUNNING).text(info.runningTime);
        $(Elements.SEL_WD).text(info.watchDogConnection == 1 ? 'On' : 'Off');
        $(Elements.SEL_LAST_UPD).text(info.lastUpdate);
    },

    /**
     Bind all event listeners on the UI for remote stations commands including commands
     @method _wireUI
     @return none
     **/
    _wireUI: function () {
        var self = this;
        $(Elements.SNAPSHOT_SPINNER).fadeOut();
        $(Elements.SNAPSHOT_IMAGE).fadeOut();

        // fail load image
        $(Elements.SNAPSHOT_IMAGE).error(function (e) {
            self.m_imageReloadCount++;

            if (self.m_imageReloadCount > 6) {
                $(Elements.SNAPSHOT_SPINNER).fadeOut('slow');
                self.m_imageReloadCount = 0;
                self._buttonEnable(Elements.CAPTURE_COMMAND, true)
                return;
            }
            setTimeout(function () {
                $(Elements.SNAPSHOT_IMAGE).attr('src', self.m_imagePath);
            }, 1500)
        });

        $(Elements.RELOAD_COMMAND).tap(function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            if (!self._buttonIsEnabled(Elements.RELOAD_COMMAND))
                return false;
            self._buttonEnable(Elements.RELOAD_COMMAND, false);
            self._sendStationEvent('restart', '');
        });

        $(Elements.PLAY_COMMAND + ' ' + Elements.STOP_COMMAND).tap(function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            var command = 'playCommand' == e.currentTarget.id ? 'play' : 'end';

            switch (command) {
                case 'play':
                {
                    if (!self._buttonIsEnabled(Elements.PLAY_COMMAND))
                        return false;
                    self._buttonEnable(Elements.PLAY_COMMAND, false);
                    break;
                }
                case 'end':
                {
                    if (!self._buttonIsEnabled(Elements.STOP_COMMAND))
                        return false;
                    self._buttonEnable(Elements.STOP_COMMAND, false);
                    break;
                }
            }

            commBroker.listen(JalapenoModel.stationPlayedStopped, function (e) {
                self._buttonEnable(Elements.PLAY_COMMAND, true);
                self._buttonEnable(Elements.STOP_COMMAND, true);
                if (e.edata.responce['status'] == 'pass') {
                }
            });

            model.sendStationPlayStop(model.getDataByID(self.m_selected_resource_id)['id'], command);

            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        $(Elements.UP_TOTOP).on('click', function () {
            $('body').animate({scrollTop: '0px'}, 500, function () {
                $('body').clearQueue();
            });
        });

        $(Elements.EVENT_SEND_BUTTON).tap(function () {
            self._sendStationEvent('event', $(Elements.SEND_EVENT_ID).val());
        });

        $(Elements.CAPTURE_COMMAND).on('tap', function (e) {

            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            if (!self._buttonIsEnabled(this))
                return false;
            self._buttonEnable(Elements.CAPTURE_COMMAND, false);

            self.m_imagePath = '';
            $(Elements.SNAPSHOT_IMAGE).attr('src', self.m_imagePath);
            self._buttonEnable(Elements.CAPTURE_COMMAND, false);
            $(Elements.SNAPSHOT_IMAGE).hide();
            $(Elements.SNAPSHOT_SPINNER).fadeIn('slow');

            commBroker.listen(JalapenoModel.stationCaptured, function (e) {
                if (e.edata.responce['status'] == 'pass') {
                    self.m_imagePath = e.edata.responce['path'];
                    self._listenToImageLoad();
                    setTimeout(function () {  // IE Bug, needs timer
                        $(Elements.SNAPSHOT_IMAGE).attr('src', self.m_imagePath);
                    }, 1000);
                    log('got path: ' + self.m_imagePath);
                }
            });
            model.sendStationCapture(model.getDataByID(self.m_selected_resource_id)['id']);
            return false;
        });
    },

    /**
     Listen when a new remote snapshot is available on the server for a selected station, so we can display it in the properties panel.
     @method _listenToImageLoad
     @return none
     **/
    _listenToImageLoad: function () {
        var self = this;
        $(Elements.SNAPSHOT_IMAGE).one('load', function (e) {
            $(Elements.SNAPSHOT_SPINNER).hide();
            $(Elements.SNAPSHOT_IMAGE).attr('src', self.m_imagePath);
            $(Elements.SNAPSHOT_IMAGE).fadeIn('slow');
            self._buttonEnable(Elements.CAPTURE_COMMAND, true);
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
        commBroker.listen(JalapenoModel.stationEventRx, function (e) {
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
    },

    /**
     Enable or disable a UI button.
     @method _buttonEnable
     @param {String} i_elem
     @param {Boolean} true / false
     @return none
     **/
    _buttonEnable: function (i_elem, i_state) {
        var self = this;
        switch (i_state) {
            case true:
            {
                $(i_elem).css({opacity: 1})
                break;
            }
            case false:
            {
                $(i_elem).css({opacity: 0.5})
                break;
            }
        }
    },

    /**
     Get the state of a Button
     @method _buttonIsEnabled
     @param {String} i_elem
     @return {Boolean}
     **/
    _buttonIsEnabled: function (i_elem) {
        var self = this;
        if ($(i_elem).css('opacity') == 1) {
            return true;
        }
        return false;
    }
}