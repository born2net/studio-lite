/**
 Custom event fired when resource is removing from resources
 @event CompResourcesList.REMOVING_RESOURCE
 @param {This} caller
 @param {Self} context caller
 @param {Event} the removed resource_id
 @static
 @final
 **/
CompResourcesList.REMOVING_RESOURCE = 'REMOVING_RESOURCE';

/**
 Custom event fired after a resource has been removed from resources
 @event CompResourcesList.REMOVED_RESOURCE
 @param {This} caller
 @param {Self} context caller
 @param {Event} the removed resource_id
 @static
 @final
 **/
CompResourcesList.REMOVED_RESOURCE = 'REMOVED_RESOURCE';

/**
 Resource list component is responsible for managing the UI of selecting, adding and deleting resources (i.e.: video, images and swfs)
 as well as property management for resources, such as renaming a resource.
 @class CompResourcesList
 @constructor
 @return {Object} instantiated CompResourcesList
 **/
function CompResourcesList(i_container) {

    var self = this;
    self.m_container = i_container;
    self.m_property = commBroker.getService('CompProperty');
    self.m_selected_resource_id = undefined;

    self._wireUI();
    self._init();

};

CompResourcesList.prototype = {
    constructor: CompResourcesList,

    /**
     Init the component and init properties panel for this instance.
     Also listen for viewstack events, and if targeted for this instance, populate UI resource list.
     @method _initPanel
     @return none
     **/
    _init: function () {
        var self = this;
        self.m_property.initPanel(Elements.RESOURCE_PROPERTIES, true);

        commBroker.listen(Viewstacks.VIEW_CHANGED, function (e) {
            if ($(e.context).data('viewstackname') == 'tab2' && commBroker.getService('mainViewStack') === e.caller) {
                self._loadResourceList();
                self._listenOpenProps();
                self._listenRemoveResource();
            }
        });

        $(Elements.FILE_SELECTION).change(function (e) {
            self._onFileSelected(e);
        });


    },

    /**
     Listen for resource name change
     @method _wireUI
     @return none
     **/
    _wireUI: function () {
        var self = this;

        var resourceSelName;
        $(Elements.SELECTED_LIB_RESOURCE_NAME).on("input", function (e) {
            window.clearTimeout(resourceSelName);
            resourceSelName = window.setTimeout(function () {
                self._onChange(e);
            }, 200);
        });
    },

    /**
     On name change update msdb
     @method _onChange
     @param {Event} e
     @return none
     **/
    _onChange: function (e) {
        var self = this;
        var text = $(e.target).val();
        jalapeno.setResourceRecord(self.m_selected_resource_id, 'resource_name', text);
    },

    /**
     Populate the UI with all resources for the account (i.e.: videos, images, swfs).
     @method _loadResourceList
     @return none
     **/
    _loadResourceList: function () {

        var self = this;
        var recResources = jalapeno.getResources();
        $(self.m_container).empty();
        $(recResources).each(function (i) {
            // dont process deleted resources
            if (recResources[i]['change_type'] == 3)
                return;

            var size = (parseInt(recResources[i]['resource_bytes_total']) / 1000).toFixed(2);
            var resourceDescription = 'size: ' + size + 'K dimenstion: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];

            var snippet = '<li data-resource_id="' + recResources[i]['resource_id'] + '"data-icon="gear" class="selectedLibResource" data-theme="a"><a href="#">' +
                '<img src="' + model.getIcon(recResources[i]['resource_type']) + '">' +
                '<h2>' + recResources[i]['resource_name'] + '</h2>' +
                '<p>' + resourceDescription + '</p></a>' +
                '<a data-theme="a" class="' + Elements.CLASS_FIX_PROP_OPEN_LI_BUTTON_POSITION + ' ' + Elements.CLASS_SELECTED_LIB_RESOURCE2 + ' ' + Elements.CLASS_RESOURCE_LIB_OPEN_PROPS2 + '"></a>' +
                '</li>';

            $(self.m_container).append($(snippet));

        });

        $(self.m_container).listview('refresh');
    },

    /**
     Listen to remove resource event
     @method _listenRemoveResource
     @return none
     **/
    _listenRemoveResource: function () {
        var self = this;
        $(Elements.FILE_REMOVE).tap(function (e) {
            if (self.m_selected_resource_id == undefined)
                return;

            // remove a resource from resources, notify before so channel instances
            // can remove corresponding blocks and after so channelList can refresh UI
            commBroker.fire(CompResourcesList.REMOVING_RESOURCE,this,null,self.m_selected_resource_id);
            jalapeno.removeResource(self.m_selected_resource_id);
            jalapeno.removeBlocksWithResourceID(self.m_selected_resource_id);
            self._loadResourceList();
            self._listenOpenProps();
            commBroker.fire(CompResourcesList.REMOVED_RESOURCE,this,null,self.m_selected_resource_id);
        });
    },

    /**
     Listen to resource selection, populate the properties panel and open it if needed.
     @method _listenOpenProps
     @return none
     **/
    _listenOpenProps: function () {
        var self = this;

        $(Elements.CLASS_SELECTED_LIB_RESOURCE).tap(function (e) {

            var openProps = $(e.target).closest('a').hasClass(Elements.CLASS_RESOURCE_LIB_OPEN_PROPS2) ? true : false;
            var resourceElem = $(e.target).closest('li');
            var resourceProp = $(resourceElem).find(Elements.CLASS_RESOURCE_LIB_OPEN_PROPS);
            self.m_selected_resource_id = $(resourceElem).data('resource_id');

            self.m_property.viewPanel(Elements.RESOURCE_PROPERTIES);

            $(Elements.CLASS_SELECTED_LIB_RESOURCE).removeClass('liSelectedItem');
            $(resourceElem).addClass('liSelectedItem');

            // $('.selectedLibResource').css('background-image', 'linear-gradient(#fff , #f1f1f1)');
            // $(resourceElem).css('background-image', 'linear-gradient(#bebebe , #bebebe)');
            // $(resourceProp).css('background-image', 'linear-gradient(#bebebe , #bebebe)');

            var recResource = jalapeno.getResourceRecord(self.m_selected_resource_id);

            $(Elements.SELECTED_LIB_RESOURCE_NAME).val(recResource['resource_name']);

            $(self.m_container).listview('refresh');

            if (openProps)
                commBroker.getService('CompProperty').openPanel(e);

            e.stopImmediatePropagation();
            return false;
        });
    },

    /**
     On selecting new resources through multi-upload from local machine.
     @method _onFileSelected
     @return none
     **/
    _onFileSelected: function (e) {
        var self = this;
        var resources = jalapeno.m_msdb.table_resources();
        var resourceList = jalapeno.uploadResources('file');
        // XMLHttpRequest cannot load http://jupiter.signage.me/WebService/JsUpload.ashx. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'https://secure.dynawebs.net' is therefore not allowed access.	https://secure.dynawebs.net/_php/studioLite-debug.php#studioLite:0

        /*
         for (var iResource = 0; iResource < resourceList.length; iResource++) {
         var hResource = resourceList[iResource];

         var timelinePlayers = jalapeno.table_campaign_timeline_chanel_players();
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