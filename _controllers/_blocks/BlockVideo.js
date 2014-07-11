/**
 * BlockVideo block resided inside a Scenes or timeline
 * @class BlockVideo
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockVideo = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3100;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_VIDEO_COMMON_PROPERTIES);
            self._listenAspectChange();
            self._listenRewind();
            self._listenVolumeChange();
            self._initResourcesData();
        },


        /**
         Listen to changes in volume control
         @method _listenVolumeChange
         **/
        _listenVolumeChange: function(){
            var self = this;
            self.m_inputVolumeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var volume = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Video');
                $(xSnippet).attr('volume', volume);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            BB.comBroker.listen(BB.EVENTS.VIDEO_VOLUME_CHANGED, self.m_inputVolumeHandler);
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
            self.m_blockName = pepper.getResourceRecord(self.m_resourceID).resource_name;
            self.m_blockDescription = pepper.getResourceName(self.m_resourceID);
            var fileFormat = pepper.getResourceType(self.m_resourceID);
            self.m_blockFontAwesome = BB.PepperHelper.getFontAwesome(fileFormat);
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_VIDEO_COMMON_PROPERTIES);
        },

        /**
         Update the video's properties title
         @method override _updateTitle
         @return none
         **/
        _updateTitle: function () {
            var self = this;
            $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text(self.m_blockDescription);
        },

        /**
         When user changes aspect ratio checkbox
         @method _listenAspectChange
         @return none
         **/
        _listenAspectChange: function () {
            var self = this;
            self.m_inputAspectHandler = function (e) {
                if (!self.m_selected)
                    return;
                var v = $(e.target).prop('checked') == true ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('AspectRatio');
                $(xSnippet).attr('maintain', v);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.VIDEO_ASPECT_RATIO).on('change', self.m_inputAspectHandler);
        },

        /**
         When user changes rewind checkbox
         @method _listenRewind
         @return none
         **/
        _listenRewind: function () {
            var self = this;
            self.m_inputRewind = function (e) {
                if (!self.m_selected)
                    return;
                var v = $(e.target).prop('checked') == true ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Video');
                $(xSnippet).attr('autoRewind', v);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.VIDEO_AUTO_REWIND).on('change', self.m_inputRewind);
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
            var xSnippetVideo = $(domPlayerData).find('Video');
            var aspectRatio = xSnippet.attr('maintain') == '1' ? true : false;
            var autoRewind = xSnippetVideo.attr('autoRewind') == '1' ? true : false;
            var volume = parseFloat(xSnippetVideo.attr('volume')) * 100;
            $(Elements.VIDEO_AUTO_REWIND).prop('checked', autoRewind);
            $(Elements.VIDEO_ASPECT_RATIO).prop('checked', aspectRatio);
            $(Elements.VIDEO_VOLUME_WRAP_SLIDER).val(volume);
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
            $(Elements.VIDEO_AUTO_REWIND).off('change', self.m_inputRewind);
            $(Elements.VIDEO_ASPECT_RATIO).off('change', self.m_inputAspectHandler);
            BB.comBroker.stopListen(BB.EVENTS.VIDEO_VOLUME_CHANGED, self.m_inputVolumeHandler);
            self._deleteBlock();
        }
    });

    return BlockVideo;
});