/*/////////////////////////////////////////////

 CompStations

 /////////////////////////////////////////////*/

CompStations.stationListFull = 'FULL';
CompStations.stationListEmpty = 'EMPTY';

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

    _init: function () {
        var self = this;

        self.m_property.initPanel('#stationProperties', true);
        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab3' && commBroker.getService('mainViewStack') === e.caller) {
                log('entering stations');
                setTimeout(function () {
                    model.requestStationsList(self);
                }, 500);
                self.m_refreshHandle = setInterval(function () {
                    model.requestStationsList(self);
                }, self.m_refreshTimer);
                /*if (self.m_stationDataMode==CompStations.stationListEmpty){
                 model.requestStationsList(self);
                 } else {
                 self.m_refreshHandle = setInterval(function(){
                 model.requestStationsList(self);
                 }, self.m_refreshTimer)
                 }*/
            }
        });

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') != 'tab3' && '#mainContent' === e.caller.m_contentID) {
                log('exiting stations')
                clearInterval(self.m_refreshHandle);
            }
        });
        self._wireUI();
        commBroker.listen(StudioLiteModel.stationList, self._onStationUpdate);
    },

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
                    var stationHTML = '<li data-role="list-divider" data-theme="b" >' + station['name'] + '</li>' +
                        '<li data-dbmid="' + dbmid + '" data-icon="gear" data-theme="b" class="station">' +
                        '<span style="float:left; padding-left: 7px" id="stationIcon' + i + '"></span>' +
                        '<a class="lastStatus" style="float: left" data-transition="slide">Last status: ' + station['status'] + '</a>' +
                        '<div style="padding-left: 4em" class="stationDetailsDiv">' +
                        '<br/><span style="margin-left:10px;"></span>' +
                        '</div><a data-theme="b" data-icon="gear" class="station stationOpenProps"></a>' +
                        '</li>';

                    /* var stationHTML =   '<li data-role="list-divider" data-theme="b" >' + station['name'] + '</li>'+
                     '<li data-dbmid="' + dbmid + '" data-icon="gear" data-theme="b" class="station">'+
                     '<span style="float:left; padding-left: 7px" id="stationIcon'+i+'"></span>'+
                     '<a class="lastStatus" style="float: left" data-transition="slide">Last status:'+ station['status'] +'</a>'+
                     '<div style="padding-left: 4em" class="stationDetailsDiv">'+
                     '<span class="lastUpdate" style="margin-left:10px; font-size: 0.8em">'+
                     'Last update: '+ station['lastUpdate'] + ' seconds ago<br/>'+
                     '</span>'+
                     '<span class="lastRunTime" style="margin-left:10px; font-size: 0.5em">Running time: '+ station['runningTime'] +'</span>'+
                     '</div>'+ '<a data-theme="b" data-icon="gear" class="station stationOpenProps"></a>' +
                     '</li>'; */

                    $('#stationList').append(stationHTML)
                    var color = serverData[dbmid]['color'];
                    setTimeout(function (x, color) {
                        $('#stationIcon' + x).append($('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><circle stroke="black" id="svg_1" fill="' + color + '" stroke-width="2" r="16" cy="20" cx="20"/></g></svg>'));
                        refreshSize();
                        $('#stationPanel').trigger('updatelayout');
                        $('#stationList').listview('refresh');
                    }, 300, i, color);
                    self._listenStationSelected();
                    break;
                }
                    ;

                case CompStations.stationListFull:
                {
                    $('.station').each(function () {
                        var dbmid = $(this).data('dbmid');
                        var station = model.getStation(dbmid);
                        // if station was not deleted and updated apply status
                        if (station != undefined && station['statusChanged'] == false) {
                            var elem = $(this).find('circle')
                            elem.attr('fill', station['color']);
                            $(this).find('.lastStatus').html('<a class="lastStatus" style="float: left" data-transition="slide">Last status: ' + station['status'] + '</a>');
                            // var elem = $(this).find('circle').attr('fill', station['color']);
                            // $(this).find('.lastUpdate').html('<span class="lastUpdate" style="margin-left:0px; font-size: 1em">Last update: ' + station['lastUpdate'] + ' seconds ago<br/></span>');
                            // $(this).find('.lastRunTime').html('<span class="lastRunTime" style="margin-left:0px; font-size: 1em">Running time: '+ station['runningTime'] +'</span>');
                            // $(this).trigger('tap',{manual: true});
                        }
                    });
                    break;
                }
                    ;
            }
        }
        $('#stationList').listview('refresh');
        self.m_stationDataMode = $('#stationList').children().size() > 1 ? CompStations.stationListFull : CompStations.stationListEmpty;

    },

    _listenStationSelected: function () {
        var self = this;

        $('.station').tap(function (e) {

            var openProps = $(e.target).closest('a').hasClass('stationOpenProps') ? true : false;
            var stationElem = $(e.target).closest('li');
            var stationProp = $(stationElem).find('.stationOpenProps');
            var dbmid = $(stationElem).data('dbmid');

            model.abortServerCalls();

            $('#snapShotImage').attr('src', '');
            $('#snapShotSpinner').hide();
            $('#snapShotImage').hide();

            self.m_property.viewPanel('#stationProperties');
            self.m_selected_resource_id = dbmid;
            self._loadProperties(dbmid);

            $('.station').removeClass('currentSelectedStation');
            $(stationElem).addClass('currentSelectedStation');
            $(stationProp).addClass('currentSelectedStation');
            $('#stationList').listview('refresh');

            if (openProps)
                commBroker.getService('CompProperty').openPanel(e);

            e.stopImmediatePropagation();
            return false;
        });
    },

    _loadProperties: function (i_dbmid) {
        var info = model.getDataByID(i_dbmid);

        $('#stationName').text(info.name);
        $('#selName').text(info.name);
        $('#selOS').text(info.os);
        $('#selAirVer').text(info.airVersion);
        $('#selPlayerVer').text(info.appVersion);
        $('#selPeakMem').text(info.peakMemory);
        $('#selTotMem').text(info.totalMemory);
        $('#selRunning').text(info.runningTime);
        $('#selWD').text(info.watchDogConnection == 1 ? 'On' : 'Off');
        $('#selLastUpd').text(info.lastUpdate);

    },

    _wireUI: function () {
        var self = this;
        $('#snapShotSpinner').fadeOut();
        $('#snapShotImage').fadeOut();

        // fail load image
        $('#snapShotImage').error(function (e) {
            self.m_imageReloadCount++;

            if (self.m_imageReloadCount > 6) {
                $('#snapShotSpinner').fadeOut('slow');
                self.m_imageReloadCount = 0;
                self._buttonEnable('#captureCommand', true)
                return;
            }
            setTimeout(function () {
                $('#snapShotImage').attr('src', self.m_imagePath);
            }, 1500)
        });

        $('#reloadCommand').tap(function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            if (!self._buttonIsEnabled('#reloadCommand'))
                return false;
            self._buttonEnable('#reloadCommand', false);
            self._sendStationEvent('rebootPlayer', '');
        });

        $('#playCommand,#stopCommand').tap(function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            var command = 'playCommand' == e.currentTarget.id ? 'start' : 'stop';

            switch (command) {
                case 'start':
                {
                    if (!self._buttonIsEnabled('#playCommand'))
                        return false;
                    self._buttonEnable('#playCommand', false);
                    break;
                }
                case 'stop':
                {
                    if (!self._buttonIsEnabled('#stopCommand'))
                        return false;
                    self._buttonEnable('#stopCommand', false);
                    break;
                }
            }

            commBroker.listen(StudioLiteModel.stationPlayedStopped, function (e) {
                self._buttonEnable('#playCommand', true);
                self._buttonEnable('#stopCommand', true);
                if (e.edata.responce['status'] == 'pass') {
                }
            });

            model.sendStationPlayStop(model.getDataByID(self.m_selected_resource_id)['id'], command);

            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        $('#uptotop').on('click', function () {
            $('body').animate({scrollTop: '0px'}, 500, function () {
                $('body').clearQueue();
            });
        });

        $('#eventSendButton').tap(function () {
            self._sendStationEvent('event', $('#sendEventID').val());
        });

        $('#captureCommand').on('tap', function (e) {

            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            if (!self._buttonIsEnabled(this))
                return false;
            self._buttonEnable('#captureCommand', false);

            self.m_imagePath = '';
            $('#snapShotImage').attr('src', self.m_imagePath);
            self._buttonEnable('#captureCommand', false);
            $('#snapShotImage').hide();
            $('#snapShotSpinner').fadeIn('slow');

            commBroker.listen(StudioLiteModel.stationCaptured, function (e) {
                if (e.edata.responce['status'] == 'pass') {
                    self.m_imagePath = e.edata.responce['path'];
                    self._listenToImageLoad();
                    setTimeout(function () {  // IE Bug, needs timer
                        $('#snapShotImage').attr('src', self.m_imagePath);
                    }, 1000);
                    log('got path: ' + self.m_imagePath);
                }
            });
            model.sendStationCapture(model.getDataByID(self.m_selected_resource_id)['id']);
            return false;
        });
    },

    _listenToImageLoad: function () {
        var self = this;
        $('#snapShotImage').one('load', function (e) {
            $('#snapShotSpinner').hide();
            $('#snapShotImage').attr('src', self.m_imagePath);
            $('#snapShotImage').fadeIn('slow');
            self._buttonEnable('#captureCommand', true);
        });
    },

    _sendStationEvent: function (i_eventName, i_eventValue) {
        var self = this;
        commBroker.listen(StudioLiteModel.stationEventRx, function (e) {
            var s = e.edata.responce['eventName'];
            switch (s) {
                case 'rebootPlayer':
                {
                    self._buttonEnable('#reloadCommand', true)
                    break;
                }
                default:
                {
                    $('#eventSendButton').button('enable');
                }
            }
        });

        model.sendStationEvent(model.getDataByID(self.m_selected_resource_id)['id'], i_eventName, i_eventValue);
        $('#eventSendButton').button('disable');
    },

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

    _buttonIsEnabled: function (i_elem) {
        var self = this;
        // log('bbb' + $(i_elem).css('opacity'));
        if ($(i_elem).css('opacity') == 1) {
            // log('ccc' + $(i_elem).css('opacity'));
            return true;
        }
        return false;
    }
}