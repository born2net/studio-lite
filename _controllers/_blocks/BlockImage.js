/**
 * Image block resided inside a Scenes or timeline
 * @class BlockImage
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockImage = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3130;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_IMAGE_COMMON_PROPERTIES);
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
            self.m_blockName = pepper.getResourceRecord(self.m_resourceID).resource_name;
            self.m_blockDescription = pepper.getResourceName(self.m_resourceID);
            self.m_fileFormat = pepper.getResourceType(self.m_resourceID);
            self.m_blockIcon = BB.PepperHelper.getIcon(self.m_fileFormat);
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_IMAGE_COMMON_PROPERTIES);
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
                self._setBlockPlayerData(domPlayerData, true);
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

        /**
         Convert the block into a fabric js compatible object
         @Override
         @method fabricateBlock
         **/
        fabricateBlock: function(i_canvasScale, i_callback){
            var self = this;

            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');

            // var resource = $(domPlayerData).find('Resource');
            // var hResource = $(resource).attr('hResource');
            // var resourceName = pepper.getResourceName(hResource);
            var businessID = pepper.getUserData().businessID;
            var elemID = _.uniqueId('imgElemrand')
            var imgPath = 'https://s3-us-west-2.amazonaws.com/oregon-signage-resources/business' + businessID + '/resources/' + self.m_nativeID + '.' + self.m_fileFormat;
            //var imgPath = 'https://s3-us-west-2.amazonaws.com/oregon-signage-resources/business1000/resources/333.png';
            // var imgElement;
            // var a = $('<img style="display: none" id="' + elemID + '" src="' + imgPath + '"/>');
            // $('body').append(a);
            // imgElement = $('#'+elemID)[0];

            $('<img src="'+ imgPath +'" style="display: none" >').load(function() {
                $(this).width(1000).height(800).appendTo('body');

                var img = new fabric.Image(this, {
                    left: parseInt(layout.attr('x')),
                    top: parseInt(layout.attr('y')),
                    width: parseInt(layout.attr('width')),
                    height: parseInt(layout.attr('height')),
                    angle: parseInt(layout.attr('rotation')),
                    hasRotatingPoint: false,
                    borderColor: '#5d5d5d',
                    stroke: 'black',
                    strokeWidth: 1,
                    lineWidth: 1,
                    cornerColor: 'black',
                    cornerSize: 5,
                    lockRotation: true,
                    transparentCorners: false
                });
                _.extend(self, img);
                self._fabricAlpha(domPlayerData);
                self['canvasScale'] = i_canvasScale;
                i_callback();
            })


        },

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
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.IMAGE_ASPECT_RATIO).off('change', self.m_inputChangeHandler);
            self._deleteBlock();
        }
    });

    return BlockImage;
});