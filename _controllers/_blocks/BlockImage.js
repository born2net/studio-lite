/**
 * Image block resided inside a Scenes or timeline
 *
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
            Block.prototype.constructor.call(this, options);
            var self = this;

            self.m_blockType = 3130;
            self.m_blockName = model.getComponent(self.m_blockType).name;
            self.m_blockDescription = undefined;
            self.m_playerData = undefined;
            self.m_blockIcon = undefined;
            self.m_resourceID = undefined;

            self.m_property.initSubPanel(Elements.BLOCK_IMAGE_COMMON_PROPERTIES);
            self._wireUI();
        },


        /**
         Set the icon (image) by the file type (i.e.: png/jpg/swf)
         @method _setIcon
         @param {string} i_fileFormat format of the file
         @return none
         **/
        _setIcon: function (i_fileFormat) {
            var self = this;
            self.m_blockIcon = model.getIcon(i_fileFormat);
        },

        /**
         Populate the image's common properties panel
         @method _loadCommonProperties
         @return none
         **/
        _loadCommonProperties: function () {
            var self = this;

            self._populate();
            this.m_property.viewSubPanel(Elements.BLOCK_IMAGE_COMMON_PROPERTIES);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;

            var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
            var xml = recBlock['player_data'];
            var x2js = BB.comBroker.getService('compX2JS');
            var jPlayerData = x2js.xml_str2json(xml);


            // update checkbox for respect content length
            if ((jPlayerData)["Player"]["Data"]["Resource"]["AspectRatio"]) {
                var state = jPlayerData["Player"]["Data"]["Resource"]["AspectRatio"]["_maintain"] == '1' ? 'on' : 'off';
                $(Elements.IMAGE_ASPECT_RATIO + ' option[value="' + state + '"]').attr("selected", "selected");
            } else {
                $(Elements.IMAGE_ASPECT_RATIO + ' option[value="off"]').attr("selected", "selected");
            }
        },

        /**
         Bind listener events to related UI elements
         @method _wireUI
         @return none
         **/
        _wireUI: function () {
            var self = this;

            $(Elements.IMAGE_ASPECT_RATIO).change(function (e) {
                if (!self.m_selected)
                    return;
                self._onChange(e);
            });
        },

        /**
         When user changes aspect ratio checkbox we update msdb
         @method _onChange
         @param {event} e event from target input element
         @return none
         **/
        _onChange: function (e) {
            var self = this;

            var state = $(Elements.IMAGE_ASPECT_RATIO + ' option:selected').val() == "on" ? 1 : 0;
            var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
            var xPlayerData = recBlock['player_data'];
            var xmlDoc = $.parseXML(xPlayerData);
            var xml = $(xmlDoc);
            var aspectRatio = xml.find('AspectRatio');

            // this is a new component so we need to add a boilerplate XML
            if (aspectRatio.length == 0) {
                // xPlayerData = self._getDefaultPlayerImageData();
                xPlayerData = model.getComponent(self.m_blockType).getDefaultPlayerData(self.m_resourceID);
                xmlDoc = $.parseXML(xPlayerData);
                xml = $(xmlDoc);
                aspectRatio = xml.find('AspectRatio');
                aspectRatio.attr('url', state);
            } else {
                aspectRatio.attr('maintain', state);
            }

            var xmlString = (new XMLSerializer()).serializeToString(xml[0]);
            jalapeno.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xmlString);
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

        /*
         Get a default Image XML player_data boilerplate which we use to add a new Image component into msdb
         @method _getDefaultPlayerImageData
         @return {xml} xml data
         BlockImage.prototype._getDefaultPlayerImageData = function () {
         var self = this;

         var xml = '<Player player="' + self.m_blockType + '" label="" interactive="0">' +
         '<Data>' +
         '<Resource resource="' + self.m_resourceID + '">' +
         '<AspectRatio maintain="1" />' +
         '<Image autoRewind="1" volume="1" backgroundAlpha="1" />' +
         '</Resource>' +
         '</Data>' +
         '</Player>';
         return xml;
         };
         */

        /**
         Get block data in json object literal
         @method getBlockData override
         @return {object} object literal
         entire block's data members
         **/
        getBlockData: function () {
            var self = this;
            var data = {
                blockID: self.m_block_id,
                blockType: self.m_blockType,
                blockName: self.m_blockDescription,
                blockDescription: self.m_blockName,
                blockIcon: self.m_blockIcon
            }
            return data;
        },

        /**
         Set the instance player_data from msdb which includes resource_id
         as well as the description of the resource and icon. This function is called upon instantiation
         and it is a special method which applies only to image/swf/video blocks as they hold a reference
         to an external resource
         @method setPlayerData
         @param {string} i_playerData
         @return {String} Unique clientId.
         **/
        setPlayerData: function (i_playerData) {
            var self = this;

            self.m_playerData = i_playerData;
            self.m_resourceID = parseInt(self.m_playerData["Player"]["Data"]["Resource"]["_hResource"])
            self.m_blockDescription = jalapeno.getResourceName(self.m_resourceID);
            var fileFormat = jalapeno.getResourceType(self.m_resourceID);
            self._setIcon(fileFormat);
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
            self._deleteBlock();
        }
    });

    return BlockImage;
});