
/**
 ResourceListView is responsible for managing the UI of selecting, adding and deleting resources (i.e.: video, images and swfs)
 as well as property management for resources, such as renaming a resource.
 @class CompResourcesList
 @constructor
 @return {Object} instantiated CompResourcesList
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    /**
     Custom event fired when resource is removing from resources
     @event CompResourcesList.REMOVING_RESOURCE
     @param {This} caller
     @param {Self} context caller
     @param {Event} the removed resource_id
     @static
     @final
     **/
    Backbone.EVENTS.REMOVING_RESOURCE = 'REMOVING_RESOURCE';

    /**
     Custom event fired after a resource has been removed from resources
     @event CompResourcesList.REMOVED_RESOURCE
     @param {This} caller
     @param {Self} context caller
     @param {Event} the removed resource_id
     @static
     @final
     **/
    Backbone.EVENTS.REMOVED_RESOURCE = 'REMOVED_RESOURCE';


    var ResourceListView = Backbone.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method _init
         @return none
         **/
        initialize: function () {
            var self = this;
            //todo: fix prop
            // self.m_property.initPanel(Elements.RESOURCE_PROPERTIES, true);
            //todo: fix load resources
            // self._loadResourceList();
            //todo: fix prop
            // self._listenOpenProps();
            self._listenRemoveResource();

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
            $(Elements.FILE_REMOVE).on('click',function (e) {
                if (self.m_selected_resource_id == undefined)
                    return;

                // remove a resource from resources, notify before so channel instances
                // can remove corresponding blocks and after so channelList can refresh UI
                BB.comBroker.fire(CompResourcesList.REMOVING_RESOURCE,this,null,self.m_selected_resource_id);
                jalapeno.removeResource(self.m_selected_resource_id);
                jalapeno.removeBlocksWithResourceID(self.m_selected_resource_id);
                self._loadResourceList();
                self._listenOpenProps();
                BB.comBroker.fire(CompResourcesList.REMOVED_RESOURCE,this,null,self.m_selected_resource_id);
            });
        },

        /**
         Listen to resource selection, populate the properties panel and open it if needed.
         @method _listenOpenProps
         @return none
         **/
        _listenOpenProps: function () {
            var self = this;

            $(Elements.CLASS_SELECTED_LIB_RESOURCE).on('click',function (e) {

                var openProps = $(e.target).closest('a').hasClass(Elements.CLASS_RESOURCE_LIB_OPEN_PROPS2) ? true : false;
                var resourceElem = $(e.target).closest('li');
                var resourceProp = $(resourceElem).find(Elements.CLASS_RESOURCE_LIB_OPEN_PROPS);
                self.m_selected_resource_id = $(resourceElem).data('resource_id');

                self.m_property.viewPanel(Elements.RESOURCE_PROPERTIES);

                $(Elements.CLASS_SELECTED_LIB_RESOURCE).removeClass(Elements.CLASS_CURRENT_SELECTED_RESOUCRE2);
                $(resourceElem).addClass(Elements.CLASS_CURRENT_SELECTED_RESOUCRE2);
                $(resourceProp).addClass(Elements.CLASS_CURRENT_SELECTED_RESOUCRE2);

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
            jalapeno.uploadResources('file');
            self._loadResourceList();
            self._listenOpenProps();
            self._listenRemoveResource();
        }

    });

    return ResourceListView;

});