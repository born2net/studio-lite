/**
 Dashboard view
 @class DashboardView
 @constructor
 @return {Object} instantiated DashboardView
 **/
define(['jquery', 'backbone', 'highcharts'], function ($, Backbone) {

    BB.SERVICES['DASHBOARD_VIEW'] = 'DashboardView';

    var DashboardView = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method initialize
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['DASHBOARD_VIEW'], self);
            self.m_bgColor = '#F4F4F4';
            self._listenResourcesChanged();
            self._listenRefresh();
            self._refreshData();
            self._listenSave();
            self._listenThemeChange();
        },

        /**
         Listen theme changed
         @method _listenThemeChange
         @param {Number} i_playerData
         **/
        _listenThemeChange: function(){
            var self = this;
            BB.comBroker.listen(BB.EVENTS.THEME_CHANGED, function(){
                self._refreshData();
            });
        },

        /**
         Listen to save
         @method _listenSave
         **/
        _listenSave: function () {
            var self = this;
            pepper.listen(Pepper.SAVE_TO_SERVER, function () {
                self.m_xdate = BB.comBroker.getService('XDATE');
                $(Elements.LAST_SAVE).text('SAVED ON ' + self.m_xdate.setTime(new Date()).toString('HH:mm'));
            });
        },

        /**
         Listen to user refresh of dashboard
         @method _listenRefresh
         **/
        _listenRefresh: function () {
            var self = this;
            $(Elements.DASHBOARD_REFRESH).on('click', function (e) {
                self._refreshData();
            });
        },

        /**
         Refresh dashboard data
         @method _refreshData
         **/
        _refreshData: function () {
            var self = this;
            if (BB.CONSTS['THEME'] != 'light')
                self.m_bgColor = '#535353';
            self._renderTotalCloudStorage();
            self._getRemoteStations();
            self._getServerResponseTime();
        },

        /**
         Get server response time
         @method _getServerResponseTime
         **/
        _getServerResponseTime: function () {
            var self = this;

            var url = 'https://' + pepper.getUserData().domain + '/WebService/sendCommand.ashx?';
            var sendDate = (new Date()).getTime();
            $.ajax({
                //type: "GET", //with response body
                type: "HEAD", //only headers
                url: url,
                success: function () {
                    var receiveDate = (new Date()).getTime();
                    var responseTimeMs = receiveDate - sendDate;
                    var resColor = 'green';
                    var rest = 2000;
                    if (responseTimeMs > 2000)
                        responseTimeMs = rest;
                    if (responseTimeMs > 600)
                        resColor = 'yellow';
                    if (responseTimeMs > 1000)
                        resColor = 'orange';
                    if (responseTimeMs > 1600)
                        resColor = 'red';
                    rest = rest - responseTimeMs;

                    $(Elements.SERVER_RESPONSETIME).highcharts({
                        chart: {
                            type: 'bar',
                            plotBackgroundColor: self.m_bgColor,
                            renderTo: 'container',
                            margin: [0, 0, 0, 0],
                            spacingTop: 0,
                            spacingBottom: 0,
                            spacingLeft: 0,
                            spacingRight: 0
                        },
                        colors: ['#BABABA', resColor],
                        credits: {
                            enabled: false
                        },
                        tooltip: {
                            enabled: false
                        },
                        title: {
                            text: '',
                            style: {
                                display: 'none'
                            }
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: ''
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            column: {
                                colorByPoint: true
                            },
                            series: {
                                stacking: 'normal'
                            }
                        },
                        series: [
                            {
                                data: [rest],
                                pointWidth: 20
                            },
                            {
                                data: [responseTimeMs],
                                pointWidth: 20
                            }
                        ]
                    });

                }
            });


        },

        /**
         Retrieve remote station list and status from remote mediaSERVER
         @method _getRemoteStations
         **/
        _getRemoteStations: function () {
            var self = this;
            var userData = pepper.getUserData();
            var url = 'https://' + userData.domain + '/WebService/getStatus.ashx?user=' + userData.userName + '&password=' + userData.userPass + '&callback=?';
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

            // fresh account
            if (_.isNull(i_xmlStations) || $(i_xmlStations).find('Station').length == 0) {
                $(Elements.DASHBOARD_TOTAL_STATION, self.$el).text('00');
                self._renderStationsDonut(0, 1);
                return;
            }
            var totalStation = 0;
            var totalStationOnline = 0;
            var totalStationOffline = 0;
            $(i_xmlStations).find('Station').each(function (key, value) {
                totalStation++;
                var stationID = $(value).attr('id');
                var stationData = {
                    status: $(value).attr('status'),
                    socket: $(value).attr('socket'),
                    connection: $(value).attr('connection')
                };
                if (stationData.connection == '0') {
                    totalStationOffline++;
                } else {
                    totalStationOnline++;
                }
                if (totalStation < 10)
                    totalStation = '0' + '' + totalStation;
                $(Elements.DASHBOARD_TOTAL_STATION, self.$el).text(totalStation);
                self._renderStationsDonut(totalStationOnline, totalStationOffline);
            });
        },

        /**
         Listen to resource removed or added
         @method _listenResourcesChanged
         **/
        _listenResourcesChanged: function () {
            var self = this;
            BB.comBroker.listen(BB.EVENTS.REMOVED_RESOURCE, function (e) {
                self._renderTotalCloudStorage();
            });

            BB.comBroker.listen(BB.EVENTS.ADDED_RESOURCE, function (e) {
                self._renderTotalCloudStorage();
            });
        },

        /**
         Render the station donut chart
         @method _renderStationsDonut
         **/
        _renderStationsDonut: function (i_totalStationOnline, i_totalStationOffline) {
            var self = this;

            $(Elements.DONUT_STATIONS).highcharts({
                chart: {
                    plotBackgroundColor: self.m_bgColor,
                    renderTo: 'container',
                    type: 'pie',
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: '',
                    style: {
                        display: 'none'
                    }
                },
                subtitle: {
                    text: '',
                    style: {
                        display: 'none'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        colors: ['green', 'red'],
                        size: '50%'
                    }
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.point.name;
                    }
                },
                series: [
                    {
                        name: 'Browsers',
                        data: [
                            ["ONLINE", i_totalStationOnline],
                            ["OFFLINE", i_totalStationOffline]
                        ],
                        size: '60%',
                        innerSize: '50%',
                        showInLegend: false,
                        dataLabels: {
                            enabled: false
                        }
                    }
                ]
            });

        },

        /**
         Render the total storage used in cloud
         @method _renderTotalCloudStorage
         **/
        _renderTotalCloudStorage: function () {
            var self = this;
            var bytesTotal = 0;
            var totalCapacity = pepper.getUserData().resellerID == 1 ? 1000 : 10000;
            $(Elements.CLOUD_STORAGE_CAPACITY).text(totalCapacity / 1000 + 'GB');
            var recResources = pepper.getResources();
            $(recResources).each(function (i) {
                if (recResources[i]['change_type'] != 3)
                    bytesTotal = bytesTotal + parseInt(recResources[i]['resource_bytes_total']);
            });
            log(bytesTotal);
            var mbTotalPercent = BB.lib.parseToFloatDouble((Math.ceil(bytesTotal / 1000000) / totalCapacity) * 100);
            var mbTotalPercentRounded = Math.round(mbTotalPercent);
            if (String(mbTotalPercentRounded).length == 1)
                mbTotalPercentRounded = '0' + mbTotalPercentRounded;
            $(Elements.CLOUD_STORAGE_PERC).text(mbTotalPercentRounded + '%');

            $(Elements.CLOUD_STORAGE).highcharts({
                chart: {
                    type: 'solidgauge',
                    backgroundColor: 'transparent',
                    margin: [0, 0, 0, 0],
                    spacingTop: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    spacingRight: 0
                },
                title: null,
                pane: {
                    center: ['50%', '70%'],
                    size: '130%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        backgroundColor: '#BBBBBB',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc',
                        borderColor: 'transparent'
                    }
                },
                tooltip: {
                    enabled: false
                },
                // the value axis
                yAxis: {
                    min: 0,
                    max: 100,
                    stops: [
                        [0.1, '#2ecc71'],
                        [0.5, '#f1c40f'],
                        [0.9, '#e74c3c']
                    ],
                    minorTickInterval: null,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    gridLineWidth: 0,
                    gridLineColor: 'transparent',
                    labels: {
                        enabled: false,
                        y: 16
                    },
                    title: {
                        enabled: true,
                        y: 16
                    }
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                },
                series: [
                    {
                        data: [mbTotalPercent],
                        dataLabels: {
                            format: '<span style="text-align:center;">12%</span>'
                        }
                    }
                ]
            });
        }
    });

    return DashboardView;

});


/*



 $('#subscribersPie').highcharts({
 chart: {
 plotBackgroundColor: '#F4F4F4',
 renderTo: 'container',
 type: 'pie',
 margin: [0, 0, 0, 0],
 spacingTop: 0,
 spacingBottom: 0,
 spacingLeft: 0,
 spacingRight: 0
 },
 credits: {
 enabled: false
 },
 title: {
 text: '',
 style: {
 display: 'none'
 }
 },
 subtitle: {
 text: '',
 style: {
 display: 'none'
 }
 },
 yAxis: {
 title: {
 text: 'Total percent market share'
 }
 },
 plotOptions: {
 pie: {
 shadow: false,
 colors: ['green','red'],
 size: '50%'
 }
 },
 tooltip: {
 formatter: function() {
 return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
 }
 },
 series: [{
 name: 'Browsers',
 data: [["RUNNING",2],["OFF",4]],
 size: '60%',
 innerSize: '50%',
 showInLegend:false,
 dataLabels: {
 enabled: false
 }
 }]
 });
 */