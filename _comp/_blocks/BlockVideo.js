/**
 * BlockVideo block resided inside a Scenes or timeline
 *
 * @class BlockVideo
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {object} Block instance
 */
function BlockVideo(i_placement, i_campaign_timeline_chanel_player_id) {

    var self = this;

    self.m_blockType = 3100;
    self.m_blockName = model.getComponent(self.m_blockType).name;
    self.m_blockDescription = model.getComponent(self.m_blockType).description;
    self.m_playerData = undefined;
    self.m_nativeResourceID = undefined;

    Block.call(this, i_placement, i_campaign_timeline_chanel_player_id);
    self.m_property.initSubPanel(Elements.BLOCK_VIDEO_COMMON_PROPERTIES);
    self._wireUI();
}

BlockVideo.prototype = new Block(null);

/**
 Bind listener events to related UI elements
 @method _wireUI
 @return none
 **/
BlockVideo.prototype._wireUI = function () {
    var self = this;

    $(Elements.VIDEO_ASPECT_RATIO).change(function (e) {
        if (!self.m_selected)
            return;
        self._onChange(e);
    });
};

/**
 Populate the image's common properties panel
 @method _loadCommonProperties
 @return none
 **/
BlockVideo.prototype._loadCommonProperties = function () {
    var self = this;

    self._populate();
    this.m_property.viewSubPanel(Elements.BLOCK_VIDEO_COMMON_PROPERTIES);
};

/**
 Load up property values in the common panel
 @method _populate
 @return none
 **/
BlockVideo.prototype._populate = function () {
    var self = this;

    var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xml = recBlock['player_data'];
    var x2js = commBroker.getService('compX2JS');
    var jPlayerData = x2js.xml_str2json(xml);


    // update checkbox for respect content length
    if ((jPlayerData)["Player"]["Data"]["Resource"]["AspectRatio"]) {
        var state = jPlayerData["Player"]["Data"]["Resource"]["AspectRatio"]["_maintain"] == '1' ? 'on' : 'off';
        $(Elements.VIDEO_ASPECT_RATIO + ' option[value="'+state+'"]').attr("selected", "selected");
    } else {
        $(Elements.VIDEO_ASPECT_RATIO + ' option[value="off"]').attr("selected", "selected");
    }
    $(Elements.VIDEO_ASPECT_RATIO).slider('refresh');
}

/**
 Set the icon (image) by the file type (i.e.: mp4/flv/m4v)
 @method _setIcon
 @param {string} i_fileFormat format of the file
 @return none
 **/
BlockVideo.prototype._setIcon = function (i_fileFormat) {
    var self = this;
    self.m_blockIcon = model.getIcon(i_fileFormat);
};

/**
 Update the video's properties title
 @method override _updateTitle
 @return none
 **/
BlockVideo.prototype._updateTitle = function () {
    var self = this;
    $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text(self.m_blockDescription);
}

/**
 When user changes aspect ratio checkbox we update msdb
 @method _onChange
 @param {event} e event from target input element
 @return none
 **/
BlockVideo.prototype._onChange = function (e) {
    var self = this;
    var state = $(Elements.VIDEO_ASPECT_RATIO + ' option:selected').val() == "on" ? 1 : 0;
    var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xPlayerData = recBlock['player_data'];
    var xmlDoc = $.parseXML(xPlayerData);
    var xml = $(xmlDoc);
    var aspectRatio = xml.find('AspectRatio');

    // this is a new component so we need to add a boilerplate xml
    if (aspectRatio.length == 0) {
        // xPlayerData = self._getDefaultPlayerVideoData();
        xPlayerData = model.getComponent(self.m_blockType).getDefaultPlayerData(self.m_nativeResourceID);
        xmlDoc = $.parseXML(xPlayerData);
        xml = $(xmlDoc);
        aspectRatio = xml.find('AspectRatio');
        aspectRatio.attr('url', state);
    } else {
        aspectRatio.attr('maintain', state);
    }

    var xmlString = (new XMLSerializer()).serializeToString(xml[0]);
    jalapeno.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xmlString);
}


/**
 Get block data in json object literal
 @method getBlockData override
 @return {object} object literal
 entire block's data members
 **/
BlockVideo.prototype.getBlockData = function () {
    var self = this;
    var data = {
        blockID: self.m_block_id,
        blockType: self.m_blockType,
        blockName: self.m_blockDescription,
        blockDescription: self.m_blockName,
        blockIcon: self.m_blockIcon
    }
    return data;
}

/**
 Set the instance player_data from msdb which includes native_resource_id (handle of a resource)
 as well as the description of the resource and icon. This function is called upon instantiation
 and it is a special method which applies only to image/swf/video blocks as they hold a reference
 to an external resource (i.e.: a native_id).
 @method setPlayerData
 @param {string} i_playerData
 @return {String} Unique clientId.
 **/
BlockVideo.prototype.setPlayerData = function (i_playerData) {
    var self = this;

    self.m_playerData = i_playerData;

    self.m_nativeResourceID = parseInt(self.m_playerData["Player"]["Data"]["Resource"]["_resource"])
    self.m_blockDescription = jalapeno.getResourceName(self.m_nativeResourceID);
    var fileFormat = jalapeno.getResourceType(self.m_nativeResourceID);
    self._setIcon(fileFormat);
};