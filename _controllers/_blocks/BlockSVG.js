/**
 * Image block resides inside a scene or timeline
 * @class BlockSVG
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockSVG = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3140;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_SVG_COMMON_PROPERTIES);
            self._listenInputChange();
            self._initResourcesData();
        },

        /**
         Set the instance resource data from msdb which includes resource_id (handle of a resource)
         as well as the description of the resource and icon.
         @method _initResourcesData
         **/
        _initResourcesData: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Resource');
            self.m_resourceID = $(xSnippet).attr('hResource');
            self.m_nativeID = pepper.getResourceNativeID(self.m_resourceID);
            if (_.isNull(self.m_nativeID)){
                self._selfDestruct();
                return;
            }
            self.m_blockName = pepper.getResourceRecord(self.m_resourceID).resource_name;
            self.m_blockDescription = pepper.getResourceName(self.m_resourceID);
            self.m_fileFormat = pepper.getResourceType(self.m_resourceID);
            self.m_blockFontAwesome = BB.PepperHelper.getFontAwesome(self.m_fileFormat);
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_SVG_COMMON_PROPERTIES);
        },

        /**
         Update common property title element
         @method _updateTitle override
         @return none
         **/
        _updateTitle: function () {
            var self = this;
            $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text(self.m_blockDescription);
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_inputChangeHandler = function () {
                if (!self.m_selected)
                    return;
                var aspectRatio = $(Elements.IMAGE_ASPECT_RATIO + ' option:selected').val() == "on" ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('AspectRatio');
                $(xSnippet).attr('maintain', aspectRatio);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.IMAGE_ASPECT_RATIO).on('change', self.m_inputChangeHandler);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('AspectRatio');
            var aspectRatio = xSnippet.attr('maintain') == '1' ? 'on' : 'off';
            $(Elements.IMAGE_ASPECT_RATIO + ' option[value="' + aspectRatio + '"]').prop("selected", "selected");
        },

        // /var/www/sites/dynasite/htdocs/_msportal/_js/_node/public/assets/14.svg
        /**
         Convert the block into a fabric js compatible object, called externally on creation of block
         @Override
         @method fabricateBlock
         **/
        fabricateBlock: function (i_canvasScale, i_callback) {
            var self = this;

            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');

            var w = parseInt(layout.attr('width'));
            var h = parseInt(layout.attr('height'));
            var rec = self._fabricRect(w, h, domPlayerData);

            var svgPath = window.g_protocol + pepper.getUserData().domain + '/Resources/business' +  pepper.getUserData().businessID + '/resources/' + self.m_nativeID + '.' + self.m_fileFormat;
            var urlPath = $.base64.encode(svgPath);
            var srvPath = 'https://secure.digitalsignage.com/proxyRequest/' + urlPath;

            //svgPath = 'https://secure.digitalsignage.com/_public/assets/15.svg';
            //svgPath = 'https://ida.signage.me/Test/14.svg';
            //svgPath = 'https://ida.signage.me/code/14.svg';
            //svgPath = "https://s3-us-west-2.amazonaws.com/oregon-signage-resources/business372844/resources/14.svg";
            //svgPath = 'https://ida2.signage.me/14.svg';

            $.get(srvPath, function(svg){
                var hh,ww,svgHeight,svgWidth,re;

                // set new height in SVG per current selection box height
                hh = layout.attr('height');
                svgHeight = svg.match(/(height=")([^\"]*)/)[2];
                re = new RegExp('height="' + svgHeight + '"', "ig");
                svg = svg.replace(re, 'height="' + hh + '"');

                // set new width in SVG per current selection box width
                ww = layout.attr('width');
                svgWidth = svg.match(/(width=")([^\"]*)/)[2];
                re = new RegExp('width="' + svgWidth + '"', "ig");
                svg = svg.replace(re, 'width="' + ww + '"');

                fabric.loadSVGFromString(svg, function (objects, options) {
                    objects[0].heightAttr = hh;
                    objects[0].widthAttr = ww;
                    objects[0].height = hh;
                    objects[0].width = ww;

                    var groupSvg = fabric.util.groupSVGElements(objects, options);

                    rec.originX = 'center';
                    rec.originY = 'center';
                    groupSvg.originX = 'center';
                    groupSvg.originY = 'center';
                    var o = {
                        left: parseInt(layout.attr('x')),
                        top: parseInt(layout.attr('y')),
                        width: parseInt(layout.attr('width')),
                        height: parseInt(layout.attr('height')),
                        angle: parseInt(layout.attr('rotation')),
                        hasRotatingPoint: false,
                        stroke: 'transparent',
                        cornerColor: 'black',
                        cornerSize: 5,
                        lockRotation: true,
                        transparentCorners: false
                    };
                    _.extend(self, o);
                    self.add(rec);
                    self.add(groupSvg);
                    self._fabricAlpha(domPlayerData);
                    self._fabricLock();
                    self['canvasScale'] = i_canvasScale;
                    i_callback();
                });

            }, 'text');



        },


        /**
         Convert the block into a fabric js compatible object
         @Override
         @method fabricateBlock

        fabricateBlock: function (i_canvasScale, i_callback) {
            var self = this;

            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');
            var businessID = pepper.getUserData().businessID;
            var elemID = _.uniqueId('imgElemrand')
            var imgPath;

            if (self.m_fileFormat == 'swf' || self.m_fileFormat == 'ssvg') {
                imgPath = './_assets/flash.png';
            } else {
                imgPath = window.g_protocol + pepper.getUserData().domain + '/Resources/business' +  pepper.getUserData().businessID + '/resources/' + self.m_nativeID + '.' + self.m_fileFormat;
            }

            $('<img src="' + imgPath + '" style="display: none" >').load(function () {
                $(this).width(1000).height(800).appendTo('body');
                var options = self._fabricateOptions(parseInt(layout.attr('y')), parseInt(layout.attr('x')), parseInt(layout.attr('width')), parseInt(layout.attr('height')), parseInt(layout.attr('rotation')));
                var img = new fabric.Image(this, options);
                _.extend(self, img);
                self._fabricAlpha(domPlayerData);
                self._fabricLock();
                self['canvasScale'] = i_canvasScale;
                i_callback();
            })
        },
         **/
        /**
         Get the resource id of the embedded resource
         @method getResourceID
         @return {Number} resource_id;
         **/
        getResourceID: function () {
            var self = this;
            return self.m_resourceID;
        },

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            $(Elements.IMAGE_ASPECT_RATIO).off('change', self.m_inputChangeHandler);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockSVG;
});