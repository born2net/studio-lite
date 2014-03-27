/**
 The JalapenoHelper class is used to manage real time data that is not in the msdb such as
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
            'qr':  { image: './_assets/qr.png' },
            'rss': { image: './_assets/rss.png' },
            'mrss': { image: './_assets/mrss.png' },
            'flv': { image: './_assets/flv.png' },
            'mp4': { image: './_assets/mp4.png' },
            'png': { image: './_assets/png.png' },
            'jpg': { image: './_assets/jpg.png' },
            'html5': { image: './_assets/html.png' },
            'clock': { image: './_assets/clock.png' },
            'label': { image: './_assets/label.png' },
            'swf': { image: './_assets/swf.png' },
            'extvideo': { image: './_assets/extvideo.png' },
            'extimage': { image: './_assets/extimage.png' }
        };

        self.m_components = {
            3130: {
                name: 'Image',
                acronym: 'Image',
                description: 'Bimap file',
                getDefaultPlayerData: function (i_resourceID) {
                    return  '<Player player="3130" label="" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<Resource hResource="' + i_resourceID + '">' +
                                    '<AspectRatio maintain="1" />' +
                                    '<Image />' +
                                    '</Resource>' +
                                '</Data>' +
                            '</Player>';
                },
                ext: [
                    0, 'png',
                    1, 'jpg',
                    2, 'swf'
                ]
            },
            3160: {
                name: 'External image',
                acronym: 'External image',
                description: 'Download images and Flash swf from external web links',
                getDefaultPlayerData: function () {
                    return  '<Player player="3160" label="External image Code" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<LINK src=""/>'+
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('extimage')
            },
            3150: {
                name: 'External video',
                acronym: 'External video',
                description: 'Download video from external web links',
                getDefaultPlayerData: function () {
                    return  '<Player player="3150" label="External video" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<LINK src=""/>'+
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('extvideo')
            },
            3100: {
                name: 'Video',
                acronym: 'Video',
                description: 'Movie file',
                getDefaultPlayerData: function (i_resourceID) {
                    return '<Player player="3100" label="Video" interactive="0">' +
                                    '<Data>' +
                                        self.getCommonDefaultXML() +
                                        '<Resource hResource="' + i_resourceID + '">' +
                                            '<AspectRatio maintain="1" />' +
                                            '<Video autoRewind="1" volume="1" backgroundAlpha="1" />' +
                                        '</Resource>' +
                                    '</Data>' +
                                '</Player>';
                },
                ext: [
                    0, 'flv',
                    1, 'mp4'
                ]
            },
            3430: {
                name: 'QR',
                acronym: 'QR',
                description: 'QR code for mobile device integration',
                getDefaultPlayerData: function () {
                    return  '<Player player="3430" label="QR Code" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<Text textSource="static"></Text>' +
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('qr')
            },
            3340: {
                name: 'Multimedia RSS',
                acronym: 'MRSS',
                description: 'multimedia video stream',
                getDefaultPlayerData: function () {
                    return  '<Player player="3340" label="MRSS / Podcast" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<Rss url="http://podcast.msnbc.com/audio/podcast/MSNBC-YB-NETCAST-M4V.xml" maintainAspectRatio="1" />'+
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('mrss')
            },
            3235: {
                name: 'HTML Website content',
                acronym: 'HTML5',
                description: 'HTML5 web integration',
                getDefaultPlayerData: function () {
                    return  '<Player player="3235" label="HTML5" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<HTML src="http://m.cnn.com" config=""/>' +
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('html5')
            },
            3320: {
                name: 'Clock Date/Time',
                acronym: 'Clock',
                description: 'Set live local date and time',
                getDefaultPlayerData: function () {
                    return  '<Player player="3320" label="Clock Date" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<Clock clockFormat="custom" clockMask="EEEE, MMM. D, YYYY at L:NN A">'+
                                        '<Font fontSize="11" fontColor="13158" fontFamily="Arial" fontWeight="bold" fontStyle="italic" textDecoration="underline" textAlign="center" />'+
                                     '</Clock>'+
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('clock'),
                getDateTimeMask: function(i_mask){
                    switch (i_mask){
                        case 'longDateAndTime': {
                            return 'EEEE, MMM. D, YYYY at L:NN A';
                            break;
                        }
                        case 'longDate': {
                            return 'EEEE, MMM. D, YYYY';
                            break;
                        }
                        case 'shortDayTime': {
                            return 'EEEE L:NN A';
                            break;
                        }
                        case 'date': {
                            return 'MM/DD/YY';
                            break;
                        }
                        case 'time': {
                            return 'J:NN:SS A';
                            break;
                        }

                    }
                }
            },
            3241: {
                name: 'Label text',
                acronym: 'Label',
                description: 'Label editor with custom text properties',
                getDefaultPlayerData: function () {
                    return  '<Player player="3241" label="Label" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<Label>'+
                                        '<Text>some text here!</Text>'+
                                        '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                                    '</Label>'+
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('label')
            },
            3345: {
                name: 'Really Simple Syndication',
                acronym: 'RSS',
                description: 'RSS for daily fresh scrolling news feed',
                getDefaultPlayerData: function () {
                    return  '<Player player="3345" label="RSS news" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    '<Rss url="http://rss.news.yahoo.com/rss/politics" minRefreshTime="30" speed="10" vertical="0" rtl="0">' +
                                        '<Title>' +
                                            '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                                        '</Title>' +
                                        '<Description>' +
                                            '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                                        '</Description>' +
                                    '</Rss>' +
                                '</Data>' +
                            '</Player>'
                },
                icon: self.getIcon('rss')
            }
        };
    },

    /**
     Get the common properties XML with all default values
     @method getCommonDefaultXML
     @return {String} common xml
     **/
    getCommonDefaultXML: function(){
        var self = this;
        var common =    '<Appearance alpha="1.0" blendMode="normal" />' +  self.getCommonBackgroundXML();
        return common;
    },

    /**
     Get the common properties XML with all default values
     @method getCommonBackgroundXML
     @return {String} common xml
     **/
    getCommonBackgroundXML: function(){
        var common =    '<Background style="Gradient" gradientType="linear" angle="90" offsetX="0" offsetY="0">'+
                            '<GradientPoints>'+
                                '<Point color="4361162" opacity="1" midpoint="125" />'+
                            '</GradientPoints>'+
                        '</Background>'
        return common;
    },

    /**
     Get a component data structure and properties for a particular component id.
     @method getBlockBoilerplate
     @param {Number} i_blockID
     @return {Object} return the data structure of a specific component
     **/
    getBlockBoilerplate: function (i_blockID) {
        var self = this;
        return self.m_components[i_blockID];
    },

    /**
     Get the entire set data structure for all components.
     @method getBlocks
     @return {Object} return all data structure
     **/
    getBlocks: function () {
        var self = this;
        return self.m_components;
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

    /**
    Convert player data to json format
    @method playerDataTojson
    @param {String} i_playerData
    @return {Json} jPlayerData
    **/
    playerDataTojson: function (i_playerData) {
        var x2js = BB.comBroker.getService('compX2JS');
        var jPlayerData = x2js.xml_str2json(i_playerData);
        return jPlayerData;
    },

    /**
     Convert player data to xml format
     @method playerDataToxml
     @param {String} i_playerData
     @return {XML} xml data
     **/
    playerDataToxml: function (i_playerData) {
        var x2js = BB.comBroker.getService('compX2JS');
        var xPlayerData = x2js.json2xml_str(i_playerData);
        return xPlayerData;
    }
}

