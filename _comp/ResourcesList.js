/*/////////////////////////////////////////////

 CompResourcesList component

 /////////////////////////////////////////////*/

function CompResourcesList(i_container) {

    var self = this;
    self.m_msdb = undefined;
    self.m_helperSDK = undefined;
    self.m_container = i_container;
    self.m_property = commBroker.getService('CompProperty');
    self.m_selected_resource_id = undefined;
    self.m_helperSDK = commBroker.getService('HelperSDK');

    self._wireUI();
    self._initPanel();

};

CompResourcesList.prototype = {
    constructor: CompResourcesList,

    _initPanel: function () {
        var self = this;
        self.m_property.initPanel('#resourceProperties', true);

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab2' && commBroker.getService('mainViewStack') === e.caller) {
                log('entering resources');
                self._loadResourcelList();
                self._listenOpenProps();
            }
        });

        $('#fileSelection').change(function(e){
            self._onFileSelecetd(e);
        });

        $('#fileRemove').tap(function (e) {
            self._onFileRemove(e);
        });
    },

    _wireUI: function(){
        var self = this;

        var resourceSelName;
        $("#selectedLibResourceName").on("input", function (e) {
            window.clearTimeout(resourceSelName);
            resourceSelName = window.setTimeout(function () {
                self._onChange(e);
            }, 200);
        });
    },

    _onChange: function(e) {
        var self = this;
        var text = $(e.target).val();
        self.m_helperSDK.setResourceRecord(self.m_selected_resource_id, 'resource_name', text);
    },

    addSubPanel: function () {
        var self = this;
        self.m_property.initPanel('#resourceProperties', true);

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab2' && commBroker.getService('mainViewStack') === e.caller) {
                log('entering resources');
                self._loadResourcelList();
                self._listenOpenProps();
            }
        });

        $('#fileSelection').change(function(e){
            self._onFileSelecetd(e);
        });

        $('#fileRemove').tap(function (e) {
            self._onFileRemove(e);
        });
    },
    
    _loadResourcelList: function () {

        var self = this;
        self.m_msdb = commBroker.getValue(CompMSDB.msdb)
        self.m_helperSDK = commBroker.getService('HelperSDK');
        var recResources = self.m_helperSDK.getResources();

        $(recResources).each(function (i) {
            // dont process deleted resources
            if (recResources[i]['change_type'] == 3)
                return;

            var size = (parseInt(recResources[i]['resource_bytes_total']) / 1000).toFixed(2);
            var resourceDescription = 'size: ' + size + 'K dimenstion: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];

            var snippet = '<li data-resource_id="' + recResources[i]['resource_id'] + '"data-icon="gear" class="selectedLibResource" data-theme="b"><a href="#">' +
                '<img src="' + model.getIcon(recResources[i]['resource_type']) + '">' +
                '<h2>' + recResources[i]['resource_name'] + '</h2>' +
                '<p>' + resourceDescription + '</p></a>' +
                '<a data-theme="b" class="fixPropOpenLiButtonPosition selectedLibResource resourceLibOpenProps"></a>' +
                '</li>';

            $(self.m_container).append($(snippet));

        });

        $(self.m_container).listview('refresh');
    },

    _listenOpenProps: function () {
        var self = this;

        $('.selectedLibResource').tap(function (e) {

            var openProps = $(e.target).closest('a').hasClass('resourceLibOpenProps') ? true : false;
            var resourceElem = $(e.target).closest('li');
            var resourceProp = $(resourceElem).find('.resourceLibOpenProps');
            self.m_selected_resource_id = $(resourceElem).data('resource_id');

            self.m_property.viewPanel('#resourceProperties');

            $('.selectedLibResource').removeClass('liSelectedItem');
            $(resourceElem).addClass('liSelectedItem');

            // $('.selectedLibResource').css('background-image', 'linear-gradient(#fff , #f1f1f1)');
            // $(resourceElem).css('background-image', 'linear-gradient(#bebebe , #bebebe)');
            // $(resourceProp).css('background-image', 'linear-gradient(#bebebe , #bebebe)');

            var recResource = self.m_helperSDK.getResourceRecord(self.m_selected_resource_id);

            $('#selectedLibResourceName').val(recResource['resource_name']);

            $(self.m_container).listview('refresh');

            if (openProps)
                commBroker.getService('CompProperty').openPanel(e);

            e.stopImmediatePropagation();
            return false;
        });
    },

    _onFileRemove: function (e) {
        var self = this;
    },

    _onFileSelecetd: function (e) {
        var self = this;
        var resources = self.m_msdb.table_resources();
        var resourceList = self.m_helperSDK.uploadResources('fileSelection');
        //todo error on upload file upload ???
        // XMLHttpRequest cannot load http://jupiter.signage.me/WebService/JsUpload.ashx. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'https://secure.dynawebs.net' is therefore not allowed access.	https://secure.dynawebs.net/_php/studioLite-debug.php#studioLite:0

        /*
        for (var iResource = 0; iResource < resourceList.length; iResource++) {
            var hResource = resourceList[iResource];

            var timelinePlayers = self.m_msdb.table_campaign_timeline_chanel_players();
            var timelinePlayer1 = timelinePlayers.createRecord();
            timelinePlayer1.player_data = '<Player player="3130"><Data><Resource hResource="' + hResource + '" /></Data></Player>';
            timelinePlayer1.campaign_timeline_chanel_id = this.hCampaignTimelineChanel;
            timelinePlayer1.player_duration = 10;
            timelinePlayer1.player_offset_time = offset;
            timelinePlayers.addRecord(timelinePlayer1);

            offset += 10;
        }
        */
    }

}