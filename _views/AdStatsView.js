/**
 Settings Backbone > View
 @class AdStatsView
 @constructor
 @return {Object} instantiated AdStatsView
 **/
define(['jquery', 'backbone', 'datatables', 'datatablestools'], function ($, Backbone, datatables, datatablestools) {

    var AdStatsView = Backbone.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self._listenNavigation();

            /*
            var data = [
                [
                    "Tiger Nixon",
                    "System Architect",
                    "Edinburgh",
                    "5421",
                    "2011/04/25",
                    "$3,120"
                ],
                [
                    "Garrett Winters",
                    "Director",
                    "Edinburgh",
                    "8422",
                    "2011/07/25",
                    "$5,300"
                ]
            ];
            */

            var dt = $(Elements.AD_STATS_DATATABLE).dataTable({
                dom: 'T<"clear">lfrtip',
                tableTools: {
                    "sSwfPath": "_common/_js/datatables/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
                }
            });

            dt.fnClearTable();
            BB.Pepper.getProofOfPlayStats('2015', '06', function (report) {
                var ads = $(report).find('LocalStat');
                var data = [];
                _.each(ads,function(k,v){
                    if (v!=0){
                        var stats = $(k).text().split(',');
                        data.push([stats[0],stats[1],stats[2],stats[3],stats[4],stats[5],stats[6],stats[7]])
                        console.log([stats[0],stats[1],stats[2],stats[3],stats[4],stats[5],stats[6],stats[7]]);
                    }
                });
                dt.fnAddData(data);
            });

        },

        /**
         Transition into selected fasterQ module
         @method _listenNavigation
         **/
        _listenNavigation: function(){
            var self = this;
            return;
            $(Elements.FASTERQ_MANAGE_NAV_BUTTON).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_MANAGER_CONTAINER);
            });
            $(Elements.FASTERQ_CREATE_NAV_BUTTON).on('click',function(){
                self.options.stackView.selectView(Elements.FASTERQ_CREATOR_CONTAINER);
            });
        }
    });

    return AdStatsView;
});

