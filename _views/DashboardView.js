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

            // Create the chart
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
        }
    });

    return DashboardView;

});