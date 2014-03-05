/**
 The JalapenoHelper is used to manage real time data that's not in the msdb such as
 blocks and related methods that have to do with player_data which is a vital part of each
 channel or scene block (i.e.: player)
 @class JalapenoHelper
 @constructor
 @return none
 **/
function JalapenoHelper() {

    this.self = this;
    this.m_components = {};
    this.m_icons = {};

    this._initComponents();
};

JalapenoHelper.prototype = {
    constructor: JalapenoHelper,

    /**
     The _initComponents initializes data constants for components and used to relieve member data
     such as mapping between component code and the type of resource it holds, path for default icon etc.
     @method _initComponents
     @return none
     **/
    _initComponents: function () {
        var self = this;

        // Grid/Chart 3400
        // QR Code 3430
        // Catalog player 3280
        // Custom Rss player 3346
        // External swf/image 3160
        // External video 3150
        // Grid/Chart 3400
        // Stock player 3338
        // Facebook Player 4400
        // Rss news 3345
        // QR Code 3430
        // Clock 3320
        // Weather player 3310
        // Html 3235
        // Advertising 3420
        // WebCam 3350
        // Media Rss/Podcast 3340
        // Collection 4100
        // Label 3241
        // Rich Text 3240
        // ExtApp/Capture 3410
        // XmlPlayer 4200

        self.m_icons = {
            'qr': { image: 'https://secure.dynawebs.net/_msportal/_images/qr.png' },
            'rss': { image: 'https://secure.dynawebs.net/_msportal/_images/rss.png' },
            'flv': { image: 'https://secure.dynawebs.net/_msportal/_images/flv.png' },
            'mp4': { image: 'https://secure.dynawebs.net/_msportal/_images/mp4.png' },
            'png': { image: 'https://secure.dynawebs.net/_msportal/_images/png.png' },
            'jpg': { image: 'https://secure.dynawebs.net/_msportal/_images/jpg.png' },
            'swf': { image: 'https://secure.dynawebs.net/_msportal/_images/swf.png' }
        }

        self.m_components = {
            3130: {
                name: 'Image',
                description: 'Bimap file',
                getDefaultPlayerData: function (i_resourceID) {
                    var xml = '<Player player="3130" label="" interactive="0">' +
                        '<Data>' +
                        '<Resource hResource="' + i_resourceID + '">' +
                        '<AspectRatio maintain="1" />' +
                        '<Image />' +
                        '</Resource>' +
                        '</Data>' +
                        '</Player>';
                    return xml;
                },
                ext: [
                    0, 'png',
                    1, 'jpg',
                    2, 'swf'
                ]
            },
            3100: {
                name: 'Video',
                description: 'Movie file',
                getDefaultPlayerData: function (i_resourceID) {
                    var xml = '<Player player="3100" label="" interactive="0">' +
                        '<Data>' +
                        '<Resource hResource="' + i_resourceID + '">' +
                        '<AspectRatio maintain="1" />' +
                        '<Image autoRewind="1" volume="1" backgroundAlpha="1" />' +
                        '</Resource>' +
                        '</Data>' +
                        '</Player>';
                    return xml;
                },
                ext: [
                    0, 'flv',
                    1, 'mp4'
                ]
            },
            3430: {
                name: 'QR Component',
                description: 'QR code for mobile device integration',
                getDefaultPlayerData: function () {
                    return '<Player player="3430" label="QR Code"><Data/></Player>';
                },
                icon: self.getIcon('qr')
            },
            3345: {
                name: 'Really Simple Syndication',
                description: 'RSS for daily fresh scrolling news feed',
                getDefaultPlayerData: function () {
                    return '<Player player="3345" label="Rss news"><Data/></Player>';
                },
                icon: self.getIcon('rss')
            }
        };
    },

    /**
     Retrieve a component code from a file extension type (i.e.: flv > 3100).
     @method getBlockCodeFromFileExt
     @param {String} i_fileExtension
     @return {Number} return component code
     **/
    getBlockCodeFromFileExt: function (i_fileExtension) {
        var self = this;
        for (var code in self.m_components) {
            if (self.m_components[code]['ext'] != undefined) {
                for (var i = 0; i < self.m_components[code]['ext'].length; i++) {
                    if (self.m_components[code]['ext'][i] == i_fileExtension) {
                        return code;
                    }
                }
            }
        }
        return -1;
    },

    /**
     Get a component data structure and properties for a particular component id.
     @method getComponent
     @param {Number} i_componentID
     @return {Object} return the data structure of a specific component
     **/
    getComponent: function (i_componentID) {
        var self = this;
        return self.m_components[i_componentID];
    },

    /**
     Get the entire set data structure for all components.
     @method getComponents
     @return {Object} return all data structure
     **/
    getComponents: function () {
        var self = this;
        return self.m_components;
    },

    /**
     Get the icon / image path for a resource type.
     @method getIcon
     @param {String} i_resourceType
     @return {String} url path
     **/
    getIcon: function (i_resourceType) {
        var self = this;
        return self.m_icons[i_resourceType]['image'];
    },

    /**
     Get the  entire icon set data structure for all images.
     @method getIcons
     @return {Object} data set
     **/
    getIcons: function () {
        var self = this;
        return self.m_icons;
    },

    playerDataTojson: function (i_playerData) {
        var x2js = BB.comBroker.getService('compX2JS');
        var jPlayerData = x2js.xml_str2json(i_playerData);
        return jPlayerData;
    },

    playerDataToxml: function (i_playerData) {
        var x2js = BB.comBroker.getService('compX2JS');
        var xPlayerData = x2js.json2xml_str(i_playerData);
        return xPlayerData;
    },

    getPlayerDataBoilerplate: function (i_playerCode) {
        var xml = undefined;
        switch (i_playerCode) {

            // QR
            case 3430:
            {
                xml = '<Player player="3430" label="QR Code" interactive="0">' +
                                '<Data>' +
                                    '<Text textSource="static"></Text>' +
                                '</Data>' +
                            '</Player>'
                break;
            }

            // RSS
            case 3345: {
                xml = '<Player player="3345" label="Rss news" interactive="0">' +
                        '<Data>' +
                            '<Rss url="http://rss.news.yahoo.com/rss/politics" minRefreshTime="30" speed="10" vertical="1" rtl="0">' +
                                '<Title>' +
                                    '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                                '</Title>' +
                                '<Description>' +
                                    '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                                '</Description>' +
                            '</Rss>' +
                        '</Data>' +
                    '</Player>'
                break;
            }
        }

        return xml;
    },

    isBlockPlayerDataExist: function(i_playerID, i_tag, i_blockPlacement){

        switch (i_blockPlacement){

            case BB.CONSTS.PLACEMENT_CHANNEL: {
                var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(i_playerID);
                break;
            }

            case BB.CONSTS.PLACEMENT_SCENE: {
                var recBlock = undefined;
                // todo: add scene support
                break;
            }
        }

        var xPlayerData = recBlock['player_data'];
        var xmlDoc = $.parseXML(xPlayerData);
        var xml = $(xmlDoc);
        var tag = xml.find(i_tag);
        if (tag.length == 0){
            return false;
        } else {
            return true;
        }
    },

    updatePlayerData: function(i_block_id, i_xmlDoc, i_blockPlacement){
        var xmlString = (new XMLSerializer()).serializeToString(i_xmlDoc);

        switch (i_blockPlacement){

            case BB.CONSTS.PLACEMENT_CHANNEL: {
                jalapeno.setCampaignTimelineChannelPlayerRecord(i_block_id, 'player_data', xmlString);
                break;
            }

            case BB.CONSTS.PLACEMENT_SCENE: {
                // todo: add scene support
                break;
            }
        }
    }
}

