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
    self.m_property.initSubPanel('#blockVideoCommonProperties');
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

    $('#videoAspectRatio').change(function (e) {
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
    this.m_property.viewSubPanel('#blockVideoCommonProperties');
};

/**
 Load up property values in the common panel
 @method _populate
 @return none
 **/
BlockVideo.prototype._populate = function () {
    var self = this;

    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xml = recBlock['player_data'];
    var x2js = commBroker.getService('compX2JS');
    var jPlayerData = x2js.xml_str2json(xml);


    // update checkbox for respect content length
    if ((jPlayerData)["Player"]["Data"]["Resource"]["AspectRatio"]) {
        var state = jPlayerData["Player"]["Data"]["Resource"]["AspectRatio"]["_maintain"] == '1' ? 'on' : 'off';
        $('#videoAspectRatio option[value="'+state+'"]').attr("selected", "selected");
    } else {
        $('#videoAspectRatio option[value="off"]').attr("selected", "selected");
    }
    $('#videoAspectRatio').slider('refresh');
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
    $('#selectedChannelResourceName').text(self.m_blockDescription);
}

/**
 Build a boilerplate XML that's used as the default player_data for the new video component
 @method _getDefaultPlayerVideoData
 @return {xml} xml data
 **/
BlockVideo.prototype._getDefaultPlayerVideoData = function () {
    var self = this;

    var xml = '<Player player="' + self.m_blockType + '" label="" interactive="0">' +
        '<Data>' +
        '<Resource resource="' + self.m_nativeResourceID + '">' +
        '<AspectRatio maintain="1" />' +
        '<Video autoRewind="1" volume="1" backgroundAlpha="1" />' +
        '</Resource>' +
        '</Data>' +
        '</Player>';
    return xml;
};

/**
 When user changes aspect ratio checkbox we update msdb
 @method _onChange
 @param {event} e event from target input element
 @return none
 **/
BlockVideo.prototype._onChange = function (e) {
    var self = this;
    var state = $('#videoAspectRatio option:selected').val() == "on" ? 1 : 0;
    var recBlock = self.m_helperSDK.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
    var xPlayerData = recBlock['player_data'];
    var xmlDoc = $.parseXML(xPlayerData);
    var xml = $(xmlDoc);
    var aspectRatio = xml.find('AspectRatio');

    // this is a new component so we need to add a boilerplate xml
    if (aspectRatio.length == 0) {
        xPlayerData = self._getDefaultPlayerVideoData();
        xmlDoc = $.parseXML(xPlayerData);
        xml = $(xmlDoc);
        aspectRatio = xml.find('AspectRatio');
        aspectRatio.attr('url', state);
    } else {
        aspectRatio.attr('maintain', state);
    }

    var xmlString = (new XMLSerializer()).serializeToString(xml[0]);
    self.m_helperSDK.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xmlString);
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
    self.m_blockDescription = self.m_helperSDK.getResourceName(self.m_nativeResourceID);
    var fileFormat = self.m_helperSDK.getResourceType(self.m_nativeResourceID);
    self._setIcon(fileFormat);
};