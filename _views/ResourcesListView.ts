///<reference path="../typings/lite/app_references.d.ts" />

define(['jquery', 'bootstrapfileinput', 'video', 'platform'], function ($, bootstrapfileinput, videojs, platform) {

    class ResourcesListView extends Backbone.View<Backbone.Model> {

        private m_property:any;
        private m_options:any;
        private m_videoPlayer:any;
        private m_selected_resource_id:number;

        constructor(options?:any) {
            this.m_options = options;
            super();
        }

        initialize() {
            var self = this;
            this.id = self.m_options.el;
            this.$el = $(this.id);
            this.el = this.$el.get(0);

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
            self.renderView();
        }

        /**
         When user changes text update msdb, we use xSavePlayerData
         as a json boilerplate that we append values to and save it in msdb as player_data
         @method _listenInputChange
         @return none
         **/
        private _listenInputChange():void {
            var self = this;
            var onChange = _.debounce(function (e) {
                var text = $(e.target).val();
                if (BB.lib.isEmpty(text))
                    return;
                text = BB.lib.cleanProbCharacters(text, 1);
                BB.Pepper.setResourceRecord(self.m_selected_resource_id, 'resource_name', text);
                var elem = self.$el.find('[data-resource_id="' + self.m_selected_resource_id + '"]');
                elem.find('span').text(text);
            }, 333);
            $(Elements.SELECTED_LIB_RESOURCE_NAME).on("input", onChange);
        }

        /**
         Listen to remove resource event
         @method _listenRemoveResource
         @return none
         **/
        private _listenRemoveResource() {
            var self = this;
            $(Elements.FILE_REMOVE).on('click', function (e) {
                if (self.m_selected_resource_id == undefined)
                    return;
                // notify before so channel instances can remove blocks & after so channelList refresh UI
                BB.comBroker.fire(BB.EVENTS.REMOVING_RESOURCE, this, null, self.m_selected_resource_id);
                BB.Pepper.removeResource(self.m_selected_resource_id);
                BB.Pepper.removeBlocksWithResourceID(self.m_selected_resource_id);
                BB.Pepper.removeResourceFromBlockCollectionInScenes(self.m_selected_resource_id);
                BB.Pepper.removeResourceFromBlockCollectionsInChannel(self.m_selected_resource_id);
                self.renderView();
                self._listenResourceSelected();
                BB.comBroker.fire(BB.EVENTS.REMOVED_RESOURCE, this, null, self.m_selected_resource_id);
            });
        }

        /**
         Listen to resource selection, populate the properties panel and open it if needed.
         @method _listenResourceSelected
         **/
        _listenResourceSelected() {
            var self = this;
            $(Elements.CLASS_RESOURCES_LIST_ITEMS).off('click');
            $(Elements.CLASS_RESOURCES_LIST_ITEMS).on('click', function (e) {
                var resourceElem = $(e.target).closest('li');
                self.m_selected_resource_id = $(resourceElem).data('resource_id');
                $(Elements.CLASS_RESOURCES_LIST_ITEMS).removeClass('activated').find('a').removeClass('whiteFont');
                $(resourceElem).addClass('activated').find('a').addClass('whiteFont');
                var recResource = BB.Pepper.getResourceRecord(self.m_selected_resource_id);
                $(Elements.SELECTED_LIB_RESOURCE_NAME).val(recResource['resource_name']);
                self.m_property.viewPanel(Elements.RESOURCE_LIST_PROPERTIES);

                if (platform.name == 'Chrome') {
                    self._populateResourcePreviewCDN(recResource);
                } else {
                    self._populateResourcePreviewLegacy(recResource);
                }
                return false;
            });
        }

        /**
         Populate the resource preview with loaded resource file (none CDN)
         @method _populateResourcePreviewLegacy
         @param {Object} i_recResource
         **/
        _populateResourcePreviewLegacy(i_recResource:Object) {
            var self = this;
            var path;
            if (self.m_videoPlayer) {
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            }

            switch (i_recResource['resource_type']) {
                case 'jpg':
                {
                    var ext = 'jpg';
                }
                case 'png':
                {
                    if (!ext)
                        ext = 'png';
                    path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' + BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).fadeIn();
                    $(Elements.RESOURCE_PREVIEW_SVG).hide();
                    var $img = $(Elements.RESOURCE_PREVIEW_IMAGE).find('img');
                    $img.attr('src', path);
                    break;
                }
                case 'mp4':
                {
                    var ext = 'mp4';
                }
                case 'flv':
                {
                    if (!ext)
                        ext = 'flv';
                    $(Elements.RESOURCE_PREVIEW_IMAGE).hide();
                    $(Elements.RESOURCE_PREVIEW_SVG).hide();
                    $(Elements.RESOURCE_PREVIEW_VIDEO).fadeIn();
                    path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' + BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                    $(Elements.VIDEO_PREVIEW).find('video:nth-child(1)').attr("src", path);
                    break
                }
                case 'swf':
                {
                    path = './_assets/flash.png';
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_SVG).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).fadeIn();
                    var $img = $(Elements.RESOURCE_PREVIEW_IMAGE).find('img');
                    $img.attr('src', path);
                    break
                }
                case 'svg':
                {
                    path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' + BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + 'svg';
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).hide();
                    $(Elements.RESOURCE_PREVIEW_SVG).fadeIn();
                    var $img = $(Elements.RESOURCE_PREVIEW_SVG).find('object');
                    var urlPath = $.base64.encode(path);
                    var srvPath = 'https://secure.digitalsignage.com/proxyRequest/' + urlPath;

                    // load svg and force w/h
                    $.get(srvPath, function (svg) {
                        var svgHeight, svgWidth, re;

                        svgHeight = svg.match(/(height=")([^\"]*)/)[2];
                        re = new RegExp('height="' + svgHeight + '"', "ig");
                        svg = svg.replace(re, 'height="100"');

                        svgWidth = svg.match(/(width=")([^\"]*)/)[2];
                        re = new RegExp('width="' + svgWidth + '"', "ig");
                        svg = svg.replace(re, 'width="100"');

                        $('#resourcePreviewSVG').empty();
                        var s = new String(svg);
                        $('#resourcePreviewSVG').append(svg).wrap('<center>');
                    });
                    break
                }
            }
        }

        /**
         Populate the resource preview with loaded resource file (CDN)
         @method _populateResourcePreviewCDN
         @param {Object} i_recResource
         **/
        _populateResourcePreviewCDN(i_recResource:Object) {
            var self = this;
            if (self.m_videoPlayer) {
                self.m_videoPlayer.pause();
                self.m_videoPlayer.load();
            }
            var path = window['g_protocol'] + 's3.signage.me/business' + BB.Pepper.getUserData().businessID + '/resources/';

            switch (i_recResource['resource_type']) {
                case 'jpg':
                {
                    var ext = 'jpg';
                }
                case 'png':
                {
                    if (!ext)
                        ext = 'png';
                    path += BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).fadeIn();
                    $(Elements.RESOURCE_PREVIEW_SVG).hide();
                    var $img = $(Elements.RESOURCE_PREVIEW_IMAGE).find('img');
                    $img.attr('src', path);
                    break;
                }
                case 'mp4':
                {
                    var ext = 'mp4';
                }
                case 'flv':
                {
                    if (!ext)
                        ext = 'flv';
                    $(Elements.RESOURCE_PREVIEW_IMAGE).hide();
                    $(Elements.RESOURCE_PREVIEW_SVG).hide();
                    $(Elements.RESOURCE_PREVIEW_VIDEO).fadeIn();
                    path += BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                    // path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' +  BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                    $(Elements.VIDEO_PREVIEW).find('video:nth-child(1)').attr("src", path);
                    break
                }
                case 'swf':
                {
                    path = './_assets/flash.png';
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_SVG).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).fadeIn();
                    var $img = $(Elements.RESOURCE_PREVIEW_IMAGE).find('img');
                    $img.attr('src', path);
                    break
                }
                case 'svg':
                {
                    path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' + BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + 'svg';
                    // path += BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + 'svg';
                    $(Elements.RESOURCE_PREVIEW_VIDEO).hide();
                    $(Elements.RESOURCE_PREVIEW_IMAGE).hide();
                    $(Elements.RESOURCE_PREVIEW_SVG).fadeIn();
                    var $img = $(Elements.RESOURCE_PREVIEW_SVG).find('object');
                    var urlPath = $.base64.encode(path);
                    var srvPath = 'https://secure.digitalsignage.com/proxyRequest/' + urlPath;

                    // load svg and force w/h
                    $.get(srvPath, function (svg) {
                        var svgHeight, svgWidth, re;

                        svgHeight = svg.match(/(height=")([^\"]*)/)[2];
                        re = new RegExp('height="' + svgHeight + '"', "ig");
                        svg = svg.replace(re, 'height="100"');

                        svgWidth = svg.match(/(width=")([^\"]*)/)[2];
                        re = new RegExp('width="' + svgWidth + '"', "ig");
                        svg = svg.replace(re, 'width="100"');

                        $('#resourcePreviewSVG').empty();
                        var s = new String(svg);
                        $('#resourcePreviewSVG').append(svg).wrap('<center>');
                    });
                    break
                }
            }
            //log('Loading file from ' + path);
        }

        /**
         init HTML5 video.js component
         @method _listenAutoPopup
         **/
        _initVideo() {
            var self = this;
            videojs(BB.lib.unhash(Elements.VIDEO_PREVIEW)).ready(function () {
                self.m_videoPlayer = this;
            });
        }

        /**
         On selecting new resources through multi-upload from local machine.
         @method _onFileSelected
         @return {number} -1 on fail or 1 on pass
         **/
        _onFileSelected(e) {
            var self = this;
            var status = BB.Pepper.uploadResources('file');
            if (status.length == 0) {
                bootbox.alert($(Elements.BOOTBOX_SUPPORTED_EXTENSIONS).text());
                return -1;
            }

            self.renderView();
            self._listenResourceSelected();
            self._listenRemoveResource();
            var navigationView = BB.comBroker.getService(BB.SERVICES.NAVIGATION_VIEW);
            bootbox.alert($(Elements.MSG_BOOTBOX_WAIT_UPLOAD_RESOURCE).text());
            navigationView.save(function () {
            })
            setTimeout(function () {
                bootbox.hideAll();
            }, 3000);
            return 1;
        }

        /**
         Populate the UI with all resources for the account (i.e.: videos, images, swfs).
         @method renderView
         @return none
         **/
        renderView() {
            var self = this;
            $(Elements.RESOURCE_LIB_LIST).empty();

            var recResources = BB.Pepper.getResources();
            $(recResources).each(function (i) {
                // dont process deleted resources
                if (recResources[i]['change_type'] == 3)
                    return;
                var size = (parseInt(recResources[i]['resource_bytes_total']) / 1000).toFixed(2);
                var resourceDescription = 'size: ' + size + 'K dimenstion: ' + recResources[i]['resource_pixel_width'] + 'x' + recResources[i]['resource_pixel_height'];
                var resourceFontAwesome = BB.PepperHelper.getFontAwesome(recResources[i]['resource_type'])
                if (_.isUndefined(resourceFontAwesome)) {
                    bootbox.alert($(Elements.MSG_BOOTBOX_FILE_FORMAT_INVALID).text());
                } else {
                    var snippet = '<li class="' + BB.lib.unclass(Elements.CLASS_RESOURCES_LIST_ITEMS) + ' list-group-item" data-resource_id="' + recResources[i]['resource_id'] + '">' +
                        '<a href="#">' +
                        '<i class="fa ' + resourceFontAwesome + '"></i>' +
                        '<span>' + recResources[i]['resource_name'] + '</span>' +
                        '<p>' + '' + '</p></a>' +
                        '</a>' +
                        '</li>';

                    $(Elements.RESOURCE_LIB_LIST).append($(snippet));
                }
            });
            self._listenResourceSelected();
        }

        /**
         Unrender, future support
         @method unrenderView
         **/
        unrenderView() {
            var self = this;
        }

    }
    return ResourcesListView;

});