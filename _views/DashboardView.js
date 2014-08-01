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
            BB.comBroker.setService(BB.SERVICES['DASHBOARD_VIEW'],self);
            self.calcTotalCloudStorage();

        },

        /**
         Calculate total storage used in cloud
         @method cloudStoragePerc
         **/
        calcTotalCloudStorage: function(){

            $(Elements.CLOUD_STORAGE).highcharts({

                chart: {
                    type: 'solidgauge',
                    backgroundColor: 'transparent'
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

                series: [{
                    data: [25],
                    dataLabels: {
                        format: '<span style="text-align:center;">12%</span>'
                    }
                }]
            });
        }

    });

    return DashboardView;

});



/*
 var url = 'https://' + pepper.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + pepper.getUserData().userName + '&i_password=' + pepper.getUserData().userPass + '&i_stationId=' + 0 + '&i_command=' + 'captureScreen2' + '&i_param1=' + 'tt' + '&i_param2=' + '0' + '&callback=?';
 var sendDate = (new Date()).getTime();
 $.ajax({
 //type: "GET", //with response body
 type: "HEAD", //only headers
 url: url,
 success: function(){

 var receiveDate = (new Date()).getTime();

 var responseTimeMs = receiveDate - sendDate;

 }
 });


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