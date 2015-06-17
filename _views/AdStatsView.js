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
            $(Elements.AD_STATS_DATATABLE).DataTable({
                dom: 'T<"clear">lfrtip',
                tableTools: {
                    "sSwfPath": "_common/_js/datatables/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
                }
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

