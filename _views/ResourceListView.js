/**
 ResourceListView is responsible for managing the UI of selecting, adding and deleting resources (i.e.: video, images and swfs)
 as well as property management for resources, such as renaming a resource.
 @class CompResourcesList
 @constructor
 @return {Object} instantiated CompResourcesList
 **/
define(['jquery', 'backbone', 'bootstrapfileinput', 'video'], function ($, Backbone, bootstrapfileinput, videojs) {

    var ResourceListView = BB.View.extend({

        /**
         Init the ChannelList component and enable sortable channels UI via drag and drop operations.
         @method _init
         @return none
         **/
        initialize: function () {
            var self = this;
            self.m_property = BB.comBroker.getService(BB.SERVICES['PROPERTIES_VIEW']);
            self.m_property.initPanel(Elements.RESOURCE_LIST_PROPERTIES);
            self.m_videoPlayer = undefined;
            self._listenInputChange();
            self._initVideo();
            $('input[type=file]').bootstrapFileInput();
            self._listenRemoveResource();
            $(Elements.FILE_SELECTION).change(function (e) {
                self._onFileSelected(e);
            });
            self.render();
        },

        /**
         When user changes text update msdb, we use xSavePlayerData
         as a json boilerplate that we append values to and save it in msdb as player_data
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                var text = $(e.target).val();
                pepper.setResourceRecord(self.m_selected_resource_id, 'resource_name', text);
                var elem = self.$el.find('[data-resource_id="' + self.m_selected_resource_id + '"]');
                elem.find('span').text(text);
            }, 333);
            $(Elements.SELECTED_LIB_RESOURCE_NAME).on("input", onChange);
        },

        /**
         Listen to remove resource event
         @method _listenRemoveResource
         @return none
         **/
        _listenRemoveResource: function () {
            var self = this;
            $(Elements.FILE_REMOVE).on('click', function (e) {
                if (self.m_selected_resource_id == undefined)
                    return;
                // notify before so channel instances can remove blocks & after so channelList refresh UI
                BB.comBroker.fire(BB.EVENTS.REMOVING_RESOURCE, this, null, self.m_selected_resource_id);
                pepper.removeResource(self.m_selected_resource_id);
                pepper.removeBlocksWithResourceID(self.m_selected_resource_id);
                self.render();
                self._listenResourceSelected();
                BB.comBroker.fire(BB.EVENTS.REMOVED_RESOURCE, this, null, self.m_selected_resource_id);
            });
        },

        /**
         Listen to resource selection, populate the properties panel and open it if needed.
         @method _listenResourceSelected
         **/
        _listenResourceSelected: function () {
            var self = this;

            $(Elements.CLASS_RESOURCES_LIST_ITEMS).off('click');
            $(Elements.CLASS_RESOURCES_LIST_ITEMS).on('click', function (e) {
                var resourceElem = $(e.target).closest('li');
                self.m_selected_resource_id = $(resourceElem).data('resource_id');
                $(Elements.CLASS_RESOURCES_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(resourceElem).addClass('activated').find('a').addClass('whiteFont');
                var recResource = pepper.getResourceRecord(self.m_selected_resource_id);
                $(Elements.SELECTED_LIB_RESOURCE_NAME).val(recResource['resource_name']);
                self.m_property.viewPanel(Elements.RESOURCE_LIST_PROPERTIES);
                self._populateResourcePreview(recResource);
                return false;
            });
        },

        /**
         Populate the resource preview with loaded resource file
         @method _populateResourcePreview
         @param {Object} i_recResource
         **/
        _populateResourcePreview: function (i_recResource) {
            var self = this;

            if (self.m_videoPlayer){
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            }

            switch (i_recResource['resource_type']){
                case 'png': {
                    var path = 'https://s3-us-west-2.amazonaws.com/oregon-signage-resources/business' + pepper.getUserData().businessID + '/resources/' + pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + 'png';
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).fadeIn();
                    var $img = $(Elements.RESOURCE_PREVIEW_IMAGE).find('img');
                    $img.attr('src',path);
                }
                case 'jpg': {
                    break
                }
                case 'mp4': {
                    var ext = 'mp4';
                }
                case 'flv': {
                    if (!ext)
                        ext = 'flv';
                    $(Elements.RESOURCE_PREVIEW_IMAGE).hide();
                    $(Elements.RESOURCE_PREVIEW_VIDEO).fadeIn();
                    var path = 'https://s3-us-west-2.amazonaws.com/oregon-signage-resources/business' + pepper.getUserData().businessID + '/resources/' + pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                    $(Elements.VIDEO_PREVIEW).find('video:nth-child(1)').attr("src",path);
                    break
                }
                case 'swf': {
                    break
                }

            }
        },

        /**
         init HTML5 video.js component
         @method _listenAutoPopup
         **/
        _initVideo: function(){
            var self = this;
            videojs(BB.lib.unhash(Elements.VIDEO_PREVIEW)).ready(function () {
                self.m_videoPlayer = this;
            });
        },

        /**
         On selecting new resources through multi-upload from local machine.
         @method _onFileSelected
         @return none
         **/
        _onFileSelected: function (e) {
            var self = this;
            pepper.uploadResources('file');
            self.render();
            self._listenResourceSelected();
            self._listenRemoveResource();
        },


        /**
         Populate the UI with all resources for the account (i.e.: videos, images, swfs).
         @method render
         @return none
         **/
        render: function () {
            var self = this;
            $(Elements.RESOURCE_LIB_LIST).empty();

            var recResources = pepper.getResources();
            $(recResources).each(function (i) {
                // dont process deleted resources
                if (recResources[i]['change_type'] == 3)
                    return;
                var size = (parseInt(recResources[i]['resource_bytes_total']) / 1000).toFixed(2);
                var resourceDescription = 'size: ' + size + 'K dimenstion: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];
                var resourceFontAwesome = BB.PepperHelper.getFontAwesome(recResources[i]['resource_type'])
                if (_.isUndefined(resourceFontAwesome)){
                    bootbox.alert($(Elements.MSG_BOOTBOX_FILE_FORMAT_INVALID).text());
                } else {
                    var snippet = '<li class="' + BB.lib.unclass(Elements.CLASS_RESOURCES_LIST_ITEMS) + ' list-group-item" data-resource_id="' + recResources[i]['resource_id'] + '">' +
                        '<a href="#">' +
                        '<i class="fa ' + resourceFontAwesome + '"></i>'+
                        '<span>' + recResources[i]['resource_name'] + '</span>' +
                        '<p>' + '' + '</p></a>' +
                        '</a>' +
                        '</li>';

                    $(Elements.RESOURCE_LIB_LIST).append($(snippet));
                }
            });
            self._listenResourceSelected();
        },

        /**
         Unrender, future support
         @method unrender
         **/
        unrender: function(){
            var self = this;
        }
    });

    return ResourceListView;

});