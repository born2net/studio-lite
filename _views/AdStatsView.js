/**
 Settings Backbone > View
 @class AdStatsView
 @constructor
 @return {Object} instantiated AdStatsView
 **/
define(['jquery', 'backbone', 'datatables', 'datatablestools', 'moment'], function ($, Backbone, datatables, datatablestools, moment) {

    var AdStatsView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;

            var now = moment();
            self.m_month = now.format('MM');
            self.m_year = now.format('YYYY');
            var thisMonth = now.format('MM/YYYY');
            var lastMonth = now.subtract(1, 'months').format('MM/YYYY');
            var beforeLastMonth = now.subtract(1, 'months').format('MM/YYYY');

            self._initDatatable();
            self._populateDateSelection(thisMonth, lastMonth, beforeLastMonth);
            self._listenDateSelection();
            self._loadReport(self.m_month, self.m_year);
        },

        /**
         Init the dt widget
         @method _initDatatable
         **/
        _initDatatable: function () {
            var self = this;
            self.m_dt = $(Elements.AD_STATS_DATATABLE).dataTable({
                dom: 'T<"clear">lfrtip',
                tableTools: {
                    "sSwfPath": "_common/_js/datatables/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
                }
            });
        },

        /**
         Load ad stats report
         @method _loadReport
         @param {Number} i_year
         @param {Number} i_month
         **/
        _loadReport: function (i_month, i_year) {
            var self = this;
            self.m_dt.fnClearTable();
            BB.Pepper.getProofOfPlayStats(i_year, i_month, function (report) {
                var ads = $(report).find('LocalStat');
                var data = [];
                if (ads.length < 2)
                    return;
                _.each(ads, function (k, v) {
                    if (v != 0) {
                        var stats = $(k).text().split(',');
                        var stationID = stats[0];
                        var stationName = BB.Pepper.getStationNameSync(stationID);
                        if (stationName.indexOf('Raj') > -1) {
                            console.log('found  ' + stats);
                        }
                        console.log(stationName);
                        var adNames = BB.Pepper.getAdPackContNames(stats[1]);
                        data.push([
                            stationName,
                            adNames.contentName,
                            adNames.packageName,
                            self.m_month + '/' + stats[2] + '/' + self.m_year,
                            stats[3],
                            stats[4],
                            stats[5],
                            stats[6],
                            stats[7]
                        ]);
                    }
                });
                self.m_dt.fnAddData(data);
            });
        },

        /**
         Populate the date range selection for Ad report
         @method populateDateSelection
         **/
        _populateDateSelection: function (i_thisMonth, i_lastMonth, i_beforeLastMonth) {
            var self = this;
            $(Elements.SELECT_AD_REPORT_MONTH).append('<option>' + i_thisMonth + '</option>');
            $(Elements.SELECT_AD_REPORT_MONTH).append('<option>' + i_lastMonth + '</option>');
            $(Elements.SELECT_AD_REPORT_MONTH).append('<option>' + i_beforeLastMonth + '</option>');
        },

        /**
         Listen to change in date selection to run report
         @method _listenDateSelection
         **/
        _listenDateSelection: function () {
            var self = this;
            $(Elements.SELECT_AD_REPORT_MONTH).on('change', function (e) {
                var date = $(Elements.SELECT_AD_REPORT_MONTH + ' option:selected').val();
                self.m_month = date.split('/')[0];
                self.m_year = date.split('/')[1];
                self._loadReport(self.m_month, self.m_year);
            });
        }
    });

    return AdStatsView;
});
