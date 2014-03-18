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
            self.m_blockName = jalapeno.getResourceRecord(self.m_resourceID).resource_name;
            self.m_blockDescription = jalapeno.getResourceName(self.m_resourceID);
            var fileFormat = jalapeno.getResourceType(self.m_resourceID);
            self.m_blockIcon = BB.JalapenoHelper.getIcon(fileFormat);
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
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_inputChangeHandler = function () {
                if (!self.m_selected)
                    return;
                var aspectRatio = $(Elements.VIDEO_ASPECT_RATIO + ' option:selected').val() == "on" ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('AspectRatio');
                $(xSnippet).attr('maintain', aspectRatio);
                self._setBlockPlayerData(domPlayerData);
                // log(xSnippet[0].parentElement.parentElement.parentElement.outerHTML);
            };
            $(Elements.VIDEO_ASPECT_RATIO).on('change', self.m_inputChangeHandler);
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
            $(Elements.VIDEO_ASPECT_RATIO + ' option[value="' + aspectRatio + '"]').attr("selected", "selected");
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
            $(Elements.VIDEO_ASPECT_RATIO).off('change', self.m_inputChangeHandler);
            self._deleteBlock();
        }
    });

    return BlockVideo;
});