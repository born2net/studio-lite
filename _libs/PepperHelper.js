/**
 The PepperHelper class is used to manage real time data that is not in the msdb such as
 blocks and related methods that have to do with player_data which is a vital part of each
 channel or scene block (i.e.: player)
 @class PepperHelper
 @constructor
 @return none fasterq appId 12100   playerId 6100
 **/
function PepperHelper() {
    this.self = this;
    this.m_components = {};
    this.m_fontAwesome = {};
    this._initComponents();
};

PepperHelper.prototype = {
    constructor: PepperHelper,

    /**
     The _initComponents initializes data constants for components and used to relieve member data
     such as mapping between component code and the type of resource it holds etc.
     @method _initComponents
     @return none
     **/
    _initComponents: function () {
        var self = this;

        self.m_fontAwesome = {
            'scene': { image: 'fa-pencil-square-o' },
            'qr':  { image: 'fa-qrcode' },
            'youtube':  { image: 'fa-youtube' },
            'collection':  { image: 'fa-stack-exchange' },
            'location':  { image: 'fa-map-marker' },
            'fasterq':  { image: 'fa-male' },
            'twitter':  { image: 'fa-twitter' },
            'twitteritem':  { image: 'fa-twitter' },
            'instagram':  { image: 'fa-instagram' },
            'json':  { image: 'fa-cubes' },
            'jsonitem':  { image: 'fa-cubes' },
            'worldweather':  { image: 'fa-sun-o' },
            'googlesheets':  { image: 'fa-table' },
            'googlecalendar':  { image: 'fa-calendar' },
            'digg':  { image: 'fa-digg' },
            'rss': { image: 'fa-rss' },
            'mrss': { image: 'fa-rss-square' },
            'flv': { image: 'fa-file-video-o' },
            'mp4': { image: 'fa-video-camera' },
            'png': { image: 'fa-picture-o' },
            'swf': { image: 'fa-bolt' },
            'jpg': { image: 'fa-file-image-o' },
            'svg': { image: 'fa-file-image-o' },
            'html5': { image: 'fa-html5' },
            'clock': { image: 'fa-clock-o' },
            'label': { image: 'fa-file-text-o' },
            'extvideo': { image: 'fa-share-square-o' },
            'extimage': { image: 'fa-share-square ' }
        };

        self.m_components = {
            3100: {
                name: 'Video',
                //color: '#D50D36',
                color: '#E5E5E5',
                acronym: 'video',
                description: 'Movie file',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/></g><g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path id="svg_3" d="m36.6875,10l-24.375,0c-4.02187,0 -7.3125,3.17812 -7.3125,7.0625l0,14.125c0,3.88438 3.29063,7.0625 7.3125,7.0625l24.375,0c4.02188,0 7.3125,-3.17812 7.3125,-7.0625l0,-14.125c0,-3.88438 -3.29062,-7.0625 -7.3125,-7.0625zm4.875,21.1875c0,1.24984 -0.50944,2.43002 -1.43409,3.32328c-0.92488,0.89304 -2.14676,1.38506 -3.44091,1.38506l-24.375,0c-1.29408,0 -2.51603,-0.49202 -3.44084,-1.38506c-0.9248,-0.89326 -1.43416,-2.07343 -1.43416,-3.32328l0,-14.125c0,-1.24984 0.50936,-2.43001 1.43416,-3.3232c0.9248,-0.89319 2.14675,-1.38514 3.44084,-1.38514l24.375,0c1.29409,0 2.51603,0.49195 3.44091,1.38514c0.9248,0.89319 1.43409,2.07336 1.43409,3.3232l0,14.125zm-21.9375,2.35417l12.1875,-9.41667l-12.1875,-9.41667l0,18.83334z"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement, i_resourceID) {
                    return  '<Player player="3100" label="Video" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
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
            3130: {
                name: 'Image',
                //color: '#24870D',
                color: '#E5E5E5',
                acronym: 'Image',
                description: 'Bitmap file',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/></g> <g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path id="svg_1" d="m9,7.5625l0,28.4375l36,0l0,-28.4375l-36,0zm33.75,26.25l-31.5,0l0,-24.0625l31.5,0l0,24.0625zm-9,-18.59375c0,1.812195 1.511017,3.28125 3.375,3.28125s3.375,-1.469055 3.375,-3.28125s-1.511017,-3.28125 -3.375,-3.28125s-3.375,1.469055 -3.375,3.28125zm6.75,16.40625l-27,0l6.75,-17.5l9,10.9375l4.5,-3.28125l6.75,9.84375z"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement, i_resourceID) {
                    return  '<Player player="3130" label="" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<Resource hResource="' + i_resourceID + '">' +
                                    '<AspectRatio maintain="0" />' +
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
            3140: {
                name: 'SVG',
                //color: '#24870D',
                color: '#E5E5E5',
                acronym: 'SVG',
                description: 'SVG file',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/></g> <g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path id="svg_1" d="m9,7.5625l0,28.4375l36,0l0,-28.4375l-36,0zm33.75,26.25l-31.5,0l0,-24.0625l31.5,0l0,24.0625zm-9,-18.59375c0,1.812195 1.511017,3.28125 3.375,3.28125s3.375,-1.469055 3.375,-3.28125s-1.511017,-3.28125 -3.375,-3.28125s-3.375,1.469055 -3.375,3.28125zm6.75,16.40625l-27,0l6.75,-17.5l9,10.9375l4.5,-3.28125l6.75,9.84375z"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement, i_resourceID) {
                    return  '<Player player="3140" label="" interactive="0">' +
                        '<Data>' +
                        self.getCommonDefaultXML() +
                        self.getCommonSceneLayout(i_placement) +
                        '<Resource hResource="' + i_resourceID + '">' +
                        '<AspectRatio maintain="0" />' +
                        '<Image />' +
                        '</Resource>' +
                        '</Data>' +
                        '</Player>';
                },
                ext: [
                    0, 'svg'
                ]
            },
            3160: {
                name: 'External image',
                //color: '#B6B5A1',
                color: '#E5E5E5',
                acronym: 'ext image',
                description: 'Download images and Flash swf from external web links',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/> </g> <g><title>Layer 1</title><g id="svg_1"> <g id="svg_2"><path d="m38,14l0,20l-24,0l0,-20l24,0m2,-2l-28,0l0,24l28,0l0,-24l0,0zm-24,18l20,0l-4,-12l-6,8l-4,-4l-6,8zm2,-12c-1.1055,0 -2,0.89456 -2,2s0.89456,2 2,2s2,-0.89456 2,-2s-0.8945,-2 -2,-2zm-10,-10l0,24l2,0l0,-22l26,0l0,-2l-28,0z" id="svg_1"/> </g></g> </g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3160" label="External image Code" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<LINK src=""/>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('extimage')
            },
            3150: {
                name: 'External video',
                //color: '#5BB5E8',
                color: '#E5E5E5',
                acronym: 'ext video',
                description: 'Download video from external web links',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title>  <rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/> </g> <g>  <title>Layer 1</title>  <g id="svg_1">   <g id="svg_2">    <path id="svg_3" d="m36.875,11l-23.75,0c-3.91875,0 -7.125,2.89688 -7.125,6.4375l0,12.875c0,3.54063 3.20625,6.4375 7.125,6.4375l23.75,0c3.91875,0 7.125,-2.89687 7.125,-6.4375l0,-12.875c0,-3.54062 -3.20625,-6.4375 -7.125,-6.4375zm-16.625,21.45834l0,-17.16667l11.875,8.58333l-11.875,8.58334z"/>   </g>  </g> </g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3150" label="External video" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<LINK src=""/>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('extvideo')
            },
            3430: {
                name: 'QR',
                app_id: '10160',
                color: '#E5E5E5',
                acronym: 'qr',
                description: 'QR code for mobile device integration',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/></g><g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path d="M17.16,25.713h1.427v1.426h1.426v1.426h-7.129v-1.426h1.426v-2.852h2.853v1.426H17.16z M35.695,38.543h1.424v-1.426h-1.424V38.543z M18.586,25.713h1.426v-1.426h-1.426V25.713z M38.543,38.543h1.426v-1.426h-1.426V38.543z M21.439,39.969h2.85v-1.426h-2.85V39.969z M34.268,39.969v-1.426h-1.426v1.426H34.268z M28.566,39.969h1.426v-2.852h-1.426V39.969z M17.16,21.436v1.426h4.277v-1.426H17.16z M15.736,22.861v-1.426h-2.853v2.852h1.426v-1.426H15.736z M20.012,20.01h-9.979v-9.979h9.979V20.01z M18.586,11.457h-7.129v7.127h7.129V11.457z M12.883,37.117h4.276V32.84h-4.276V37.117z M27.139,35.691v1.426h1.428v-1.426H27.139z M17.16,12.883h-4.276v4.275h4.276V12.883z M39.969,10.031v9.979H29.99v-9.979H39.969z M38.543,11.457h-7.127v7.127h7.127V11.457z M10.031,29.988h9.98v9.979h-9.98V29.988z M11.458,38.543h7.129v-7.129h-7.129V38.543z M11.458,21.436h-1.427v7.129h1.427V21.436z M29.99,28.564v1.424h1.426v-1.424H29.99z M25.713,34.266V32.84h-1.426v1.426h-2.85v2.853h2.85v1.426h1.426v-2.853h1.426v-1.426H25.713L25.713,34.266z M21.439,15.734h2.85v-1.428h-2.85V15.734z M32.842,27.139h2.854v1.426h1.424v-4.276h-1.424v-2.853h-1.428v4.277h-4.275v1.426h1.426v1.426h1.426v-1.426H32.842z M34.268,31.414h-1.426v-1.426h-1.426v2.852h-4.277v1.426h2.854v2.853h1.426v1.426h1.426v-2.853h5.701v-1.426H34.27v-2.852H34.268z M34.268,31.414h1.428v-2.85h-1.428V31.414z M22.863,31.414v-1.426h1.424v-1.424h1.426v-1.427h1.426v-2.852h4.277v-2.853H29.99v1.426h-1.426v-5.703h-1.426v-2.852h1.426v-4.273h-1.426v2.852h-1.426v-2.852h-4.276v2.852h1.426v-1.426h1.424v2.85h1.426v4.277h1.426v1.426h-1.426v2.852h-1.426V20.01h-1.424v-1.426h-1.426v2.852h1.426v1.426h-1.426v4.277h1.426v-2.852h1.424v2.852h-1.424v1.426h-1.426v4.275h2.85v-1.426H22.863z M38.543,32.84v-1.426h-2.85v1.426H38.543z M37.117,12.883h-4.275v4.275h4.275V12.883z M25.713,31.414h2.854v-1.426h-1.428v-1.424h-1.426V31.414z M28.566,28.564v-1.426h-1.428v1.426H28.566z M37.117,22.861h2.852v-1.426h-2.852V22.861z M38.543,34.266h1.426V32.84h-1.426V34.266z M38.543,25.713h1.426v-1.426h-1.426V25.713z M25.713,18.584h-1.426v1.426h1.426V18.584z"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3430" label="QR Code" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<Text textSource="static"></Text>' +
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('qr')
            },
            4600: {
                name: 'YouTube',
                app_id: '10220',
                color: '#E5E5E5',
                acronym: 'YouTube',
                description: 'YouTube - broadcast yourself',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,0)"><g><path d="M22.767,28.354h1.398v6.377l-1.123-0.002l0.003-0.824c-0.301,0.646-1.507,1.168-2.136,0.714	c-0.337-0.241-0.326-0.666-0.36-1.029c-0.018-0.206-0.003-0.659-0.004-1.269l-0.004-3.967h1.39l0.007,4.03	c0,0.55-0.03,0.87,0.004,0.976c0.198,0.607,0.71,0.279,0.823-0.032c0.038-0.103,0.002-0.392,0.002-0.97V28.354z M28.635,29.604	l0.004,3.334c0,1.615-0.922,2.535-2.391,1.188l-0.104,0.533l-1.149,0.017l0.007-8.55l1.396-0.002l-0.006,2.478	C27.684,27.576,28.634,28.336,28.635,29.604z M27.6,29.438c0-0.275-0.275-0.502-0.611-0.502s-0.611,0.227-0.611,0.502v3.74	c0,0.276,0.275,0.502,0.611,0.502s0.611-0.226,0.611-0.502V29.438z M24.753,21.281c0.341,0,0.619-0.306,0.619-0.681v-3.529	c0-0.375-0.278-0.682-0.619-0.682c-0.34,0-0.619,0.307-0.619,0.682v3.529C24.134,20.976,24.413,21.281,24.753,21.281z	 M20.815,27.237v-1.11l-4.471-0.007v1.093l1.396,0.003v7.52h1.399l-0.002-7.498H20.815z M41,9v32H9V9H41L41,9z M27.475,20.019	c0,0.567,0.01,0.948,0.027,1.141c0.02,0.191,0.062,0.375,0.135,0.554c0.071,0.175,0.184,0.315,0.336,0.425	c0.15,0.105,0.342,0.158,0.572,0.158c0.201,0,0.38-0.056,0.536-0.168c0.155-0.111,0.286-0.277,0.394-0.501l-0.027,0.549h1.559	v-6.628h-1.227v5.158c0,0.279-0.23,0.508-0.512,0.508c-0.279,0-0.512-0.229-0.512-0.508v-5.158h-1.279v4.471H27.475z M23.072,16.478	c-0.105,0.357-0.159,0.854-0.159,1.49v1.754c0,0.582,0.029,1.019,0.087,1.309c0.059,0.289,0.156,0.539,0.293,0.742	c0.136,0.205,0.327,0.358,0.574,0.459c0.247,0.104,0.546,0.151,0.901,0.151c0.318,0,0.6-0.059,0.846-0.178	c0.241-0.117,0.444-0.304,0.6-0.551c0.158-0.25,0.261-0.519,0.308-0.806s0.071-0.74,0.071-1.354v-1.675	c0-0.486-0.024-0.848-0.079-1.086c-0.051-0.235-0.146-0.467-0.289-0.69c-0.139-0.224-0.338-0.403-0.598-0.543	c-0.258-0.14-0.567-0.21-0.927-0.21c-0.429,0-0.781,0.109-1.057,0.326C23.369,15.832,23.178,16.119,23.072,16.478z M17.97,12.935	l1.849,4.366l0.001,5.081h1.471l0.001-5.083l1.738-4.354h-1.608l-0.924,3.234l-0.937-3.244H17.97z M35.055,26.845	c0-1.707-1.48-3.104-3.291-3.104H18.236c-1.81,0-3.29,1.396-3.29,3.104v7.116c0,1.707,1.479,3.104,3.29,3.104h13.528	c1.811,0,3.291-1.397,3.291-3.104V26.845z M33.014,32.496c0.479,2.841-3.531,3.308-3.531,0.005v-1.986	c0-0.596,0.058-1.064,0.178-1.408c0.119-0.344,0.32-0.6,0.587-0.789c0.847-0.612,2.522-0.424,2.694,0.771	c0.055,0.377,0.072,1.037,0.072,1.697v0.902h-2.4v0.832v0.644v0.063c0,0.313,0.258,0.568,0.572,0.568h0.205	c0.314,0,0.573-0.256,0.573-0.568v-0.584c0-0.054,0.002-0.101,0.003-0.143L33.014,32.496z M30.63,30.586h1.325l0.016-0.771	c0-0.342-0.281-0.621-0.627-0.621h-0.082c-0.345,0-0.625,0.279-0.625,0.621L30.63,30.586z"/></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4600" label="YouTube" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<YouTube quality="default" listType="most_viewed" listRegion="US" volume="100"/>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('youtube')
            },
            4100: {
                name: 'Collection',
                app_id: '10180',
                color: '#E5E5E5',
                acronym: 'Collection',
                description: 'Collection - just list your content',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g transform="translate(24,24)"><path stroke="null" d="m4.8096,15.92069l19.3238,11.9374c0.13634,0.08587 0.28196,0.12678 0.42783,0.12678s0.29082,-0.04304 0.42784,-0.12678l19.3234,-11.9374c0.40796,-0.25262 0.66934,-0.83582 0.66008,-1.47638c-0.00913,-0.64096 -0.28691,-1.20843 -0.70132,-1.43528l-19.32394,-10.60758c-0.24972,-0.13746 -0.52454,-0.13746 -0.77359,0l-19.32327,10.60739c-0.41439,0.22685 -0.69205,0.79549 -0.70172,1.43528c-0.00913,0.63958 0.25255,1.22491 0.66089,1.47657zm19.75097,-10.37145l16.41912,9.01295l-16.41912,10.14365l-16.41941,-10.14345l16.41941,-9.01315z" id="svg_3"/>    <path stroke="null" d="m4.8096,22.71394l19.75097,12.20183l19.75055,-12.20183c0.55316,-0.34142 0.80893,-1.26466 0.57237,-2.06169c-0.23588,-0.79549 -0.87339,-1.16908 -1.42803,-0.82611l-18.89488,11.67371l-18.89559,-11.67371c-0.55289,-0.34201 -1.19188,0.02966 -1.42842,0.82611c-0.23657,0.79799 0.02029,1.72026 0.57303,2.06169z" id="svg_4"/>    <path stroke="null" d="m4.8096,28.99497l19.75097,12.20222l19.75055,-12.20222c0.55316,-0.3414 0.80893,-1.26369 0.57237,-2.0611c-0.23588,-0.79547 -0.87339,-1.16967 -1.42803,-0.82611l-18.89488,11.67371l-18.89559,-11.67351c-0.55289,-0.34163 -1.19188,0.02946 -1.42842,0.8261c-0.23657,0.79742 0.02029,1.71952 0.57303,2.06092z" id="svg_5"/>    <path stroke="null" d="m4.8096,35.27677l19.75097,12.20224l19.75055,-12.20224c0.55316,-0.3416 0.80893,-1.26388 0.57237,-2.0613c-0.23588,-0.79547 -0.87339,-1.16733 -1.42803,-0.82611l-18.89488,11.67375l-18.89559,-11.67375c-0.55289,-0.3414 -1.19188,0.02969 -1.42842,0.82611c-0.23657,0.79742 0.02029,1.7197 0.57303,2.0613z" id="svg_6"/>          </g>     </g>    </svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4100" label="Collection" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Collection mode="slideshow" duration="10">'+
                                    '</Collection>' +
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('collection')
            },
            4105: {
                name: 'Location',
                app_id: '10185',
                color: '#E5E5E5',
                acronym: 'Location',
                description: 'Location - content by GPS coordinates',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g transform="translate(24,24)"><path stroke="null" id="svg_1" fill="#010002" d="m25,2.8932c-10.44884,0 -18.91998,6.9469 -18.91998,15.51556c0,0.65596 0.06417,1.29528 0.16198,1.92903c1.61666,12.11973 17.52947,26.08818 17.52947,26.08818c0.28355,0.26021 0.55687,0.42072 0.8201,0.53689l0.01355,0.00556l0.52989,0.13837l0.5299,-0.13837l0.01354,-0.00556c0.26323,-0.11626 0.53668,-0.28506 0.82011,-0.53689c0,0 15.68332,-13.9934 17.26279,-26.11577c0.09449,-0.62547 0.15864,-1.25932 0.15864,-1.90417c-0.00344,-8.56593 -8.47114,-15.51283 -18.91998,-15.51283zm0,25.49585c-6.70936,0 -12.16998,-4.47807 -12.16998,-9.9802s5.46061,-9.9802 12.16998,-9.9802s12.16666,4.47807 12.16666,9.9802s-5.45729,9.9802 -12.16666,9.9802z"/>         </g>     </g>    </svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4105" label="Location" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<LocationBased duration="10">' +
                                        '<GPS></GPS>'+
                                        '<Fixed></Fixed>'+
                                    '</LocationBased>' +
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('location')
            },
            6100: {
                name: 'FasterQ',
                app_id: '12100',
                color: '#E5E5E5',
                acronym: 'FasterQ',
                description: 'FasterQ - smart lines',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">     <g transform="translate(0,0)"> <g><path stroke="null" d="m21.25243,26.86432c-4.75631,0 -8.60994,-4.53651 -8.60994,-10.12846c0,-5.59135 3.85363,-9.73586 8.60994,-9.73586c4.75705,0 8.61387,4.14451 8.61387,9.73586c0,5.59195 -3.85696,10.12846 -8.61387,10.12846zm-13.39309,13.69223c0,0 -1.82628,0.11837 -2.63069,-0.97008c-0.43465,-0.588 -0.13188,-1.77959 0.16536,-2.44448l0.72795,-1.62905c0,0 2.01319,-4.4214 4.3049,-6.98353c1.40775,-1.57113 3.08209,-1.21335 4.16503,-0.70238c0.667,0.31437 1.42118,1.2304 1.97231,1.71587c0.75947,0.66889 2.10024,1.42906 4.29222,1.47186l1.34484,0c2.19063,-0.0428 3.5314,-0.80298 4.29025,-1.47186c0.55051,-0.48534 1.28389,-1.42978 1.94485,-1.75456c0.99391,-0.4886 2.5067,-0.78919 3.87764,0.74119c2.29245,2.56226 4.10802,7.06382 4.10802,7.06382l0.74605,1.59749c0.3087,0.66031 0.62489,1.84597 0.2023,2.44183c-0.75406,1.06536 -2.44711,0.92401 -2.44711,0.92401s-27.06395,-0.00012 -27.06395,-0.00012l0.00002,0z" fill="#010002" id="svg_2"/>          </g>     </g>    </svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6100" label="FasterQ" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<Webkit>' +
                                        '<Data bgColor="white" lineID1="" lineID2="" lineID3="" lineID4="" lineID5=""/>'+
                                    '</Webkit>' +
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('fasterq')
            },
            4500: {
                name: 'Twitter',
                app_id: '10210',
                color: '#E5E5E5',
                acronym: 'Twitter',
                description: 'Twitter',
                svg: '',
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4500" label="Twitter" interactive="0">' +
                        '<Data>' +
                            self.getCommonDefaultXML() +
                             self.getCommonSceneLayout(i_placement) +
                                '<Twitter screenName="CNN" slideShow="1" itemInterval="4">' +
                                     '<Player src="" hDataSrc=""/>'+
                                 '</Twitter>' +
                             '</Data>' +
                       '</Player>'
                },
                fontAwesome: self.getFontAwesome('twitter')
            },
            4505: {
                name: 'Twitter Item',
                app_id: '10210',
                color: '#E5E5E5',
                acronym: 'Twitter',
                description: 'Twitter',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g transform="translate(5,5)"><g>  <path stroke="null" id="svg_1" d="m34.24468,3l-29.48936,0c-0.96929,0 -1.75532,0.78603 -1.75532,1.75532l0,29.48936c0,0.96929 0.78603,1.75532 1.75532,1.75532l29.48936,0c0.96929,0 1.75532,-0.78603 1.75532,-1.75532l0,-29.48936c0,-0.96929 -0.78603,-1.75532 -1.75532,-1.75532zm-1.09742,8.18049c-0.74496,1.11533 -1.66825,2.079 -2.74462,2.86608c0.00878,0.21626 0.01299,0.43286 0.01299,0.65122c0,7.83399 -5.96107,15.93689 -15.9369,15.93689c-3.04969,0 -6.01864,-0.87029 -8.58632,-2.51678c-0.05336,-0.03405 -0.07618,-0.1004 -0.05442,-0.16008c0.02142,-0.05933 0.08215,-0.09619 0.14359,-0.08917c0.43146,0.05126 0.87134,0.07688 1.30912,0.07688c2.37249,0 4.6186,-0.73337 6.5182,-2.12499c-2.27735,-0.19203 -4.23453,-1.73355 -4.93877,-3.93191c-0.01439,-0.04564 -0.00386,-0.09514 0.02809,-0.1313c0.0316,-0.03616 0.08039,-0.05161 0.12708,-0.04353c0.63086,0.12041 1.27225,0.12744 1.89118,0.02773c-2.34862,-0.73056 -3.99967,-2.92998 -3.99967,-5.43482l0.0007,-0.07302c0.00105,-0.04774 0.02703,-0.09128 0.06776,-0.11445c0.04143,-0.02387 0.09268,-0.02422 0.13376,-0.00105c0.6119,0.33983 1.29086,0.55854 1.98527,0.64174c-1.34949,-1.07566 -2.14219,-2.70635 -2.14219,-4.45079c0,-1.0065 0.26681,-1.99615 0.77023,-2.86047c0.02247,-0.03827 0.06249,-0.06389 0.10707,-0.0667c0.04459,-0.00456 0.08777,0.01474 0.1155,0.04985c2.76287,3.38812 6.82608,5.47484 11.1712,5.7427c-0.07302,-0.36511 -0.10953,-0.74074 -0.10953,-1.12024c0,-3.13711 2.55259,-5.68899 5.68934,-5.68899c1.54292,0 3.03284,0.63402 4.10078,1.74128c1.2045,-0.24539 2.35107,-0.68808 3.41023,-1.31649c0.0488,-0.02879 0.10989,-0.02422 0.15412,0.01053c0.04388,0.03546 0.06179,0.09408 0.04424,0.1478c-0.35844,1.12305 -1.05916,2.10252 -1.99966,2.80991c0.88573,-0.15412 1.74619,-0.41496 2.56312,-0.77726c0.05547,-0.02528 0.12041,-0.00948 0.15903,0.03651c0.03932,0.04634 0.04353,0.11234 0.00948,0.16289z"/></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4505" label="Twitter" interactive="0">' +
                        '<Data>' +
                            self.getCommonDefaultXML() +
                            self.getCommonSceneLayout(i_placement) +
                            '<XmlItem fieldName="text" fieldType="text">'+
                                '<Font fontSize="12" fontColor="0" fontFamily="Astron Boy Video" fontWeight="normal" fontStyle="normal" textDecoration="underline" textAlign="center"/>' +
                            '</XmlItem>'+
                        '</Data>' +
                    '</Player>'
                },
                fontAwesome: self.getFontAwesome('twitteritem')
            },
            4300: {
                name: 'JS Object player',
                app_id: '10195',
                color: '#E5E5E5',
                acronym: 'JSON',
                description: 'JSON',
                svg: '',
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4300" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="" itemsPath="" slideShow="1" itemInterval="2" playVideoInFull="1" randomOrder="1" url="">'+
                                        '<Player/>'+
                                        '<Data/>'+
                                    '</Json>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('json')
            },
            4310: {
                name: 'JS Object item',
                app_id: '10195',
                color: '#E5E5E5',
                acronym: 'JSON item',
                description: 'JSON item',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">     <g transform="translate(-15,-15)">             <g>               <path stroke="null" id="svg_2" d="m41.94732,72.56479l-0.04744,-23.53474l-18.99409,-11.80735l-18.95979,11.76463l0.0462,23.71895l18.91359,11.71272l19.04152,-11.85422zm-17.11468,5.91254l0.03388,-16.4782l13.20205,-8.2264l0.03388,16.44207l-13.26982,8.26253zm-1.92951,-36.5139l13.26653,8.2483l-13.22156,8.23691l-13.26695,-8.2794l13.22198,-8.20581zm-15.10528,11.77734l13.22711,8.25553l-0.03368,16.50076l-13.1616,-8.1517l-0.03183,-16.60458z"/>   <path stroke="null" id="svg_3" d="m62.43145,37.22401l-18.95918,11.76332l0.04744,23.71895l18.91399,11.71272l19.03927,-11.85422l-0.04744,-23.53475l-18.99408,-11.80603zm-0.00267,4.73941l13.26695,8.2483l-13.22198,8.23691l-13.26715,-8.27962l13.22218,-8.20559zm-15.10507,11.77734l13.22567,8.25553l-0.03368,16.50076l-13.15831,-8.1517l-0.03368,-16.60458zm17.03582,24.73657l0.03265,-16.4782l13.20206,-8.2264l0.03368,16.44207l-13.26839,8.26253z"/>   <path stroke="null" id="svg_4" d="m61.70614,11.80406l-18.9947,-11.80406l-18.95918,11.76135l0.04559,23.72005l18.91359,11.7136l19.03988,-11.85421l-0.04518,-23.53672zm-18.99717,-7.06531l13.26777,8.24633l-13.22156,8.23976l-13.26777,-8.28181l13.22156,-8.20427zm-15.10549,11.77646l13.22711,8.25706l-0.03306,16.50076l-13.16222,-8.15039l-0.03183,-16.60743zm17.03418,24.73789l0.03327,-16.47864l13.20267,-8.22771l0.03368,16.44337l-13.26962,8.26297z"/>          </g>     </g>   </svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="4310" label="Json item" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<XmlItem fieldName="text" fieldType="text" dateFormat="mm/dd/yy" maintainAspectRatio="0">'+
                                        '<Font fontSize="12" fontColor="0" fontFamily="Astron Boy Video" fontWeight="normal" fontStyle="normal" textDecoration="underline" textAlign="center"/>' +
                                    '</XmlItem>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('jsonitem')
            },
            6010: {
                name: 'Weather',
                app_id: '12010',
                color: '#E5E5E5',
                acronym: 'weather',
                description: 'World Weather',
                mimeType: 'Json.weather',
                jsonItemLongDescription: $(Elements.BOOTBOX_JSON_WEATHER_DESC).text(),
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">     <g transform="translate(-10,-10)">             <g>                 <path stroke="null" id="svg_3" d="m31.47559,9.46342c1.03125,0 1.86591,-0.83591 1.86591,-1.86583l0,-3.73167c0,-1.02991 -0.83466,-1.86592 -1.86591,-1.86592c-1.03117,0 -1.86584,0.83592 -1.86584,1.86592l0,3.73167c0,1.03 0.83467,1.86583 1.86584,1.86583zm7.25075,20.73217c2.03992,-1.92683 3.32242,-4.64467 3.32242,-7.67117c0,-5.83767 -4.73434,-10.57317 -10.57317,-10.57317c-3.509,0 -6.61134,1.71658 -8.53442,4.34867c-1.23516,-0.38808 -2.54,-0.617 -3.90458,-0.617c-6.94225,0 -12.60325,5.41967 -13.02116,12.25742c-2.97917,1.55741 -5.01542,4.67091 -5.01542,8.26708c0,5.15341 4.17575,9.32925 9.32925,9.32925l24.87809,0c4.46558,0 8.08525,-3.61983 8.08525,-8.08533c0.00008,-3.20066 -1.86951,-5.94592 -4.56625,-7.25574zm-7.25075,-14.51259c3.77275,0 6.8415,3.06875 6.8415,6.8415c0,1.24508 -0.35075,2.4045 -0.93658,3.4095c-1.46783,-3.02892 -4.52033,-5.14475 -8.08533,-5.26042c-0.82108,-1.04117 -1.80492,-1.94425 -2.89958,-2.69558c1.25134,-1.40067 3.0575,-2.295 5.08,-2.295zm3.73175,26.12193l-24.87809,0c-3.08608,0 -5.59758,-2.51151 -5.59758,-5.59759c0,-2.0885 1.15442,-3.98917 3.01275,-4.9595l1.86708,-0.9765l0.12817,-2.10342c0.301,-4.90842 4.38475,-8.75333 9.29692,-8.75333c2.86967,0 5.53909,1.30108 7.32658,3.56875l1.07475,1.36458l1.7365,0.056c3.03384,0.09825 5.411,2.55116 5.411,5.58383l0,2.48658l2.29625,0.95784c1.627,0.67908 2.67934,2.25642 2.67934,4.01908c-0.00008,2.40075 -1.95292,4.35367 -4.35367,4.35367zm6.2195,-27.36584c0.515,0 0.98142,-0.209 1.3185,-0.54608l2.48783,-2.48783c0.33842,-0.33833 0.54733,-0.80483 0.54733,-1.31975c0,-1.02992 -0.83475,-1.86583 -1.86591,-1.86583c-0.51501,0 -0.98142,0.209 -1.3185,0.54733l-2.48775,2.48775c-0.33842,0.33708 -0.54733,0.80358 -0.54733,1.31858c-0.00008,1.02992 0.83466,1.86583 1.86583,1.86583zm-21.22225,-0.54608c0.33842,0.33708 0.80484,0.54608 1.31975,0.54608c1.03,0 1.86592,-0.83591 1.86592,-1.86583c0,-0.515 -0.209,-0.98141 -0.54733,-1.31975l-2.48783,-2.48783c-0.33708,-0.33708 -0.80359,-0.54608 -1.3185,-0.54608c-1.02991,0 -1.86583,0.83591 -1.86583,1.86583c0,0.515 0.209,0.98141 0.54733,1.31858l2.4865,2.489zm29.9295,6.76558l-3.73167,0c-1.02991,0 -1.86583,0.83592 -1.86583,1.86583s0.83583,1.86592 1.86583,1.86592l3.73167,0c1.02991,0 1.86591,-0.83591 1.86591,-1.86592s-0.83591,-1.86583 -1.86591,-1.86583z"/>          </g>     </g>   </svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6010" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="weather" itemsPath="" slideShow="0" itemInterval="3600" playVideoInFull="0" randomOrder="0">'+
                                        '<Player/>'+
                                        '<Data unit="F" style="2" address="91301" />'+
                                    '</Json>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('worldweather')
            },
            6022: {
                name: 'Sheets',
                app_id: '12032',
                color: '#E5E5E5',
                acronym: 'Sheets',
                description: 'Google Sheets',
                mimeType: 'Json.spreadsheet',
                jsonItemLongDescription: $(Elements.BOOTBOX_JSON_SHEETS_DESC).text(),
                svg: '',
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6022" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="spreadsheet" itemsPath="" slideShow="1" itemInterval="2" playVideoInFull="1" randomOrder="1">'+
                                        '<Player/>'+
                                        '<Data token="" id="" />' +
                                    '</Json>'+
                                '</Data>' +
                             '</Player>'
                },
                fontAwesome: self.getFontAwesome('googlesheets')
            },
            6020: {
                name: 'Calendar',
                app_id: '12030',
                color: '#E5E5E5',
                acronym: 'Calendar',
                description: 'Google Calendar',
                mimeType: 'Json.calendar',
                jsonItemLongDescription: $(Elements.BOOTBOX_JSON_CALENDAR_DESC).text(),
                svg: '',
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6020" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="calendar" itemsPath="" slideShow="1" itemInterval="2" playVideoInFull="1" randomOrder="1">'+
                                        '<Player/>'+
                                        '<Data id="" token="" mode="offset" startDate="" endDate="" before="3" after="6"/>' +
                                    '</Json>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('googlecalendar')
            },
            6230: {
                name: 'Twitter V3',
                app_id: '12230',
                color: '#E5E5E5',
                acronym: 'Twitter V3',
                description: 'Twitter V3',
                mimeType: 'Json.twitter',
                jsonItemLongDescription: $(Elements.BOOTBOX_JSON_TWITTER_DESC).text(),
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g transform="translate(5,5)"><g>  <path stroke="null" id="svg_1" d="m34.24468,3l-29.48936,0c-0.96929,0 -1.75532,0.78603 -1.75532,1.75532l0,29.48936c0,0.96929 0.78603,1.75532 1.75532,1.75532l29.48936,0c0.96929,0 1.75532,-0.78603 1.75532,-1.75532l0,-29.48936c0,-0.96929 -0.78603,-1.75532 -1.75532,-1.75532zm-1.09742,8.18049c-0.74496,1.11533 -1.66825,2.079 -2.74462,2.86608c0.00878,0.21626 0.01299,0.43286 0.01299,0.65122c0,7.83399 -5.96107,15.93689 -15.9369,15.93689c-3.04969,0 -6.01864,-0.87029 -8.58632,-2.51678c-0.05336,-0.03405 -0.07618,-0.1004 -0.05442,-0.16008c0.02142,-0.05933 0.08215,-0.09619 0.14359,-0.08917c0.43146,0.05126 0.87134,0.07688 1.30912,0.07688c2.37249,0 4.6186,-0.73337 6.5182,-2.12499c-2.27735,-0.19203 -4.23453,-1.73355 -4.93877,-3.93191c-0.01439,-0.04564 -0.00386,-0.09514 0.02809,-0.1313c0.0316,-0.03616 0.08039,-0.05161 0.12708,-0.04353c0.63086,0.12041 1.27225,0.12744 1.89118,0.02773c-2.34862,-0.73056 -3.99967,-2.92998 -3.99967,-5.43482l0.0007,-0.07302c0.00105,-0.04774 0.02703,-0.09128 0.06776,-0.11445c0.04143,-0.02387 0.09268,-0.02422 0.13376,-0.00105c0.6119,0.33983 1.29086,0.55854 1.98527,0.64174c-1.34949,-1.07566 -2.14219,-2.70635 -2.14219,-4.45079c0,-1.0065 0.26681,-1.99615 0.77023,-2.86047c0.02247,-0.03827 0.06249,-0.06389 0.10707,-0.0667c0.04459,-0.00456 0.08777,0.01474 0.1155,0.04985c2.76287,3.38812 6.82608,5.47484 11.1712,5.7427c-0.07302,-0.36511 -0.10953,-0.74074 -0.10953,-1.12024c0,-3.13711 2.55259,-5.68899 5.68934,-5.68899c1.54292,0 3.03284,0.63402 4.10078,1.74128c1.2045,-0.24539 2.35107,-0.68808 3.41023,-1.31649c0.0488,-0.02879 0.10989,-0.02422 0.15412,0.01053c0.04388,0.03546 0.06179,0.09408 0.04424,0.1478c-0.35844,1.12305 -1.05916,2.10252 -1.99966,2.80991c0.88573,-0.15412 1.74619,-0.41496 2.56312,-0.77726c0.05547,-0.02528 0.12041,-0.00948 0.15903,0.03651c0.03932,0.04634 0.04353,0.11234 0.00948,0.16289z"/></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6230" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="twitter" itemsPath="" slideShow="1" itemInterval="2" playVideoInFull="1" randomOrder="1">'+
                                        '<Player/>'+
                                        '<Data token="" screenName="" />' +
                                    '</Json>'+
                                '</Data>' +
                                '</Player>'
                },
                fontAwesome: self.getFontAwesome('twitter')
            },
            6050: {
                name: 'Instagram',
                app_id: '12060',
                color: '#E5E5E5',
                acronym: 'Instagram',
                description: 'Instagram',
                mimeType: 'Json.instagram.feed',
                jsonItemLongDescription: $(Elements.BOOTBOX_JSON_INSTAGRAM_DESC).text(),
                svg: new String(''),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6050" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="instagram.feed" itemsPath="" slideShow="1" itemInterval="2" playVideoInFull="1" randomOrder="1">'+
                                        '<Player/>'+
                                        '<Data token="" screenName="" />' +
                                    '</Json>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('instagram')
            },
            6000: {
                name: 'Digg',
                app_id: '12000',
                color: '#E5E5E5',
                acronym: 'Digg',
                description: 'Digg',
                mimeType: 'Json.digg',
                jsonItemLongDescription: $(Elements.BOOTBOX_JSON_DIGG_DESC).text(),
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">  <g transform="translate(-10,-10)">    <g>   <path stroke="null" id="svg_2" d="m11.00993,15.37582l-6.00993,0l0,15.47803l10.01428,0l0,-22.14885l-4.00435,0l0,6.67082zm-0.12917,10.69365l-2.00331,0l0,-6.3598l2.00331,0c0,0 0,6.3598 0,6.3598zm11.84989,4.97622l5.85356,0l0,1.95619l-5.85356,0l0,4.66812l9.86245,0l0,-22.2128l-9.86245,0l0,15.58849zm3.74374,-10.67912l1.99651,0l0,6.3598l-1.99651,0l0,-6.3598zm8.03817,-4.90937l0,15.58267l5.85356,0l0,1.95619l-5.85356,0l0,4.66812l9.86245,0l0,-22.20698l-9.86245,0l0,0zm5.74025,11.26917l-1.99651,0l0,-6.3598l1.99651,0l0,6.3598zm-23.42784,-17.95743l4.00888,0l0,4.34257l-4.00888,0l0,-4.34257zm0,6.66791l4.00888,0l0,15.53617l-4.00888,0l0,-15.53617z"/>          </g>     </g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="6000" label="json" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<EventCommands></EventCommands>' +
                                    '<Json providerType="digg" itemsPath="" slideShow="1" itemInterval="2" playVideoInFull="1" randomOrder="1">'+
                                        '<Player/>'+
                                        '<Data token="" id="" />' +
                                    '</Json>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('digg')
            },
            3340: {
                name: 'Multimedia RSS',
                //color: '#AAE4E0',
                color: '#E5E5E5',
                acronym: 'mrss',
                description: 'multimedia video stream',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/> </g> <g><title>Layer 1</title><g id="svg_1"> <g id="svg_2"><path id="svg_3" d="m40.58189,8.36218c-1.32502,-1.2887 -2.92123,-1.93318 -4.78776,-1.93318l-22.58868,0c-1.86653,0 -3.46274,0.64449 -4.78834,1.93318c-1.32531,1.28898 -1.98811,2.84108 -1.98811,4.65604l0,21.96427c0,1.81496 0.6628,3.36707 1.98811,4.65604c1.3256,1.28898 2.92181,1.93347 4.78834,1.93347l22.58838,0c1.86653,0 3.46274,-0.64449 4.78777,-1.93347c1.3256,-1.28897 1.9884,-2.84108 1.9884,-4.65604l0,-21.96427c0,-1.81496 -0.6628,-3.36735 -1.98811,-4.65604zm-22.98808,26.49451c-0.58858,0.57175 -1.29816,0.85791 -2.12963,0.85791c-0.83117,0 -1.54105,-0.28616 -2.12934,-0.85791c-0.58829,-0.57204 -0.88258,-1.26229 -0.88258,-2.07079c0,-0.80821 0.29429,-1.49847 0.88258,-2.07051c0.58829,-0.57204 1.29817,-0.85791 2.12934,-0.85791c0.83146,0 1.54134,0.28588 2.12963,0.85791c0.588,0.57203 0.88229,1.2623 0.88229,2.07051c0,0.80849 -0.294,1.49875 -0.88229,2.07079zm8.9289,0.62877c-0.15682,0.15248 -0.33732,0.22831 -0.54121,0.22831l-3.01163,0c-0.20389,0 -0.37631,-0.06431 -0.51753,-0.19433c-0.14123,-0.12946 -0.21978,-0.29346 -0.23537,-0.492c-0.17242,-2.34852 -1.12142,-4.36202 -2.84701,-6.04022c-1.72559,-1.67764 -3.79602,-2.60042 -6.21185,-2.76835c-0.20389,-0.01488 -0.37255,-0.09099 -0.50569,-0.22831c-0.13342,-0.13704 -0.20014,-0.30497 -0.20014,-0.50323l0,-2.9287c0,-0.19826 0.07855,-0.37377 0.23537,-0.52626c0.15682,-0.15249 0.34512,-0.22101 0.5649,-0.20584c3.6392,0.19826 6.74498,1.54846 9.31763,4.04975c2.57265,2.50185 3.96092,5.52154 4.16482,9.06047c0.01588,0.21342 -0.05545,0.39624 -0.21227,0.54873zm9.03547,0c-0.15682,0.15248 -0.33703,0.22859 -0.54093,0.22859l-3.01192,0c-0.20389,0 -0.3766,-0.06852 -0.51753,-0.20556c-0.14123,-0.13704 -0.21949,-0.30497 -0.23537,-0.50352c-0.10975,-3.11151 -0.98453,-5.99444 -2.62348,-8.6485c-1.63895,-2.65405 -3.82345,-4.77792 -6.55292,-6.37159c-2.72947,-1.59395 -5.69403,-2.44428 -8.89425,-2.55099c-0.20389,-0.01517 -0.37631,-0.09155 -0.51753,-0.22859c-0.14093,-0.13732 -0.21169,-0.30525 -0.21169,-0.50352l0,-2.9287c0,-0.19826 0.07855,-0.3735 0.23537,-0.52626c0.14122,-0.15249 0.32144,-0.22101 0.54121,-0.20556c2.41554,0.0761 4.74907,0.50295 6.99999,1.28111c2.25093,0.7776 4.29016,1.84163 6.11799,3.19155c1.82754,1.34963 3.4353,2.91326 4.82329,4.6903s2.48254,3.75994 3.28253,5.94867c0.79969,2.18901 1.23925,4.45778 1.31751,6.80658c0.03119,0.21371 -0.03899,0.38894 -0.21227,0.52598z"/> </g></g> </g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3340" label="MRSS / Podcast" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<Rss url="http://podcast.msnbc.com/audio/podcast/MSNBC-YB-NETCAST-M4V.xml" maintainAspectRatio="1" />'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('mrss')
            },
            3235: {
                name: 'HTML Website content',
                //color: '#FD6060',
                color: '#E5E5E5',
                acronym: 'web',
                description: 'HTML5 web integration',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/> </g> <g><title>Layer 1</title><g id="svg_1"><g id="svg_2"> <polygon id="svg_3" points="12.674722671508789,22.193620681762695 13.99514389038086,27.34623908996582 15.938240051269531,27.34623908996582 18.395078659057617,19.33791732788086 16.39751625061035,19.33791732788086 14.940195083618164,24.58469581604004 13.662463188171387,19.33791732788086 11.712006568908691,19.33791732788086 10.39452838897705,24.58469581604004 8.963705062866211,19.33791732788086 7,19.33791732788086 9.417093276977539,27.34623908996582 11.38374137878418,27.34623908996582 "/> <polygon id="svg_4" points="25.116422653198242,19.33791732788086 23.167438507080078,19.33791732788086 21.84848976135254,24.58469581604004 20.41177749633789,19.33791732788086 18.448070526123047,19.33791732788086 20.86958122253418,27.34623908996582 22.83770179748535,27.34623908996582 24.130155563354492,22.193620681762695 25.453519821166992,27.34623908996582 27.393672943115234,27.34623908996582 29.850509643554688,19.33791732788086 27.857364654541016,19.33791732788086 26.392683029174805,24.58469581604004 "/> <polygon id="svg_5" points="39.30543518066406,19.33791732788086 37.84370040893555,24.58469581604004 36.568912506103516,19.33791732788086 34.61551284790039,19.33791732788086 33.29656219482422,24.58469581604004 31.867204666137695,19.33791732788086 29.900558471679688,19.33791732788086 32.32353973388672,27.34623908996582 34.288719177246094,27.34623908996582 35.581172943115234,22.193620681762695 36.90011978149414,27.34623908996582 38.846160888671875,27.34623908996582 41.30299758911133,19.33791732788086 "/> <path id="svg_6" d="m24.15076,8c-5.90731,0 -10.9888,3.66148 -13.3264,8.92832l26.65427,0c-2.34055,-5.26684 -7.42057,-8.92832 -13.32787,-8.92832z"/> <path id="svg_7" d="m24.15076,38.85087c5.90878,0 10.98438,-3.65993 13.3264,-8.92832l-26.64985,0c2.3376,5.26839 7.41615,8.92832 13.32346,8.92832z"/></g></g> </g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3235" label="HTML5" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<HTML src="http://google.com" config="" />' +
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('html5')
            },
            3320: {
                name: 'Clock Date/Time',
                //color: '#8AC697',
                color: '#E5E5E5',
                acronym: 'clock',
                description: 'Set live local date and time',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/></g><g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path d="m24.9995,23.47004l6.76257,6.56696l-1.29171,1.20142l-8.17656,-6.59284l-0.15029,-1.0365l0.584,-9.90738l1.69856,0l0.57343,9.76834zm15.15601,0.05438c0,8.00763 -7.16399,14.5 -16,14.5s-16,-6.49237 -16,-14.5s7.16401,-14.5 16,-14.5s16,6.49238 16,14.5zm-2.66685,0c0,-6.67363 -5.96944,-12.08342 -13.33315,-12.08342s-13.33343,5.40979 -13.33343,12.08342c0,6.67336 5.96971,12.08316 13.33343,12.08316s13.33315,-5.40981 13.33315,-12.08316z" id="svg_1"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3320" label="Clock Date" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<Clock clockFormat="custom" clockMask="EEEE, MMM. D, YYYY at L:NN A">'+
                                        '<Font fontSize="11" fontColor="13158" fontFamily="Arial" fontWeight="bold" fontStyle="italic" textDecoration="none" textAlign="center" />'+
                                     '</Clock>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('clock'),
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
                //color: '#B3F26A',
                color: '#E5E5E5',
                acronym: 'text',
                description: 'Label editor with custom text properties',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/></g><g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path d="m24.9995,23.47004l6.76257,6.56696l-1.29171,1.20142l-8.17656,-6.59284l-0.15029,-1.0365l0.584,-9.90738l1.69856,0l0.57343,9.76834zm15.15601,0.05438c0,8.00763 -7.16399,14.5 -16,14.5s-16,-6.49237 -16,-14.5s7.16401,-14.5 16,-14.5s16,6.49238 16,14.5zm-2.66685,0c0,-6.67363 -5.96944,-12.08342 -13.33315,-12.08342s-13.33343,5.40979 -13.33343,12.08342c0,6.67336 5.96971,12.08316 13.33343,12.08316s13.33315,-5.40981 13.33315,-12.08316z" id="svg_1"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3241" label="Label" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
                                    '<Label>'+
                                        '<Text>some text here!</Text>'+
                                        '<Font fontSize="16" fontColor="65280" fontFamily="Arial" fontWeight="normal" fontStyle="normal" textDecoration="none" textAlign="left" />' +
                                    '</Label>'+
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('label')
            },

            3510: {
                name: 'Scene',
                //color: '#BCDEB1',
                color: '#E5E5E5',
                acronym: 'scene',
                description: 'A Scene editor',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/></g><g><title>Layer 1</title><g id="svg_1"><g id="svg_2"><path d="m24.9995,23.47004l6.76257,6.56696l-1.29171,1.20142l-8.17656,-6.59284l-0.15029,-1.0365l0.584,-9.90738l1.69856,0l0.57343,9.76834zm15.15601,0.05438c0,8.00763 -7.16399,14.5 -16,14.5s-16,-6.49237 -16,-14.5s7.16401,-14.5 16,-14.5s16,6.49238 16,14.5zm-2.66685,0c0,-6.67363 -5.96944,-12.08342 -13.33315,-12.08342s-13.33343,5.40979 -13.33343,12.08342c0,6.67336 5.96971,12.08316 13.33343,12.08316s13.33315,-5.40981 13.33315,-12.08316z" id="svg_1"/></g></g></g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3510" label="My scene" interactive="0">' +
                                '<Data>' +
                                    self.getCommonSceneDefaultXML() +
                                    self.getCommonSceneLayout(i_placement, 600, 400) +
                                    '<Scene defaultDuration="10">' +
                                        '<Layout>' +
                                            '<BasicLayout/>' +
                                        '</Layout>' +
                                        '<Players>' +
                                        '</Players>' +
                                    '</Scene>' +
                                '</Data>' +
                            '</Player>'
                },
                fontAwesome: self.getFontAwesome('scene')
            },
            3345: {
                name: 'Really Simple Syndication',
                //color: '#FDA401',
                color: '#E5E5E5',
                acronym: 'rss',
                description: 'RSS for daily fresh scrolling news feed',
                svg: new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><g><title>background</title><rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/> </g> <g><title>Layer 1</title><g id="svg_1"> <g id="svg_2"><circle id="svg_3" r="3.21217" cy="33.5" cx="14.5"/><path id="svg_4" d="m11,9l0,5.25c12.565,0 22.75,10.185 22.75,22.75l5.25,0c0,-15.46475 -12.53525,-28 -28,-28z"/><path id="svg_5" d="m23.25,37l5.25,0c0,-9.6635 -7.83475,-17.5 -17.5,-17.5l0,5.25c6.7655,0 12.25,5.4845 12.25,12.25z"/> </g></g> </g></svg>'),
                getDefaultPlayerData: function (i_placement) {
                    return  '<Player player="3345" label="RSS news" interactive="0">' +
                                '<Data>' +
                                    self.getCommonDefaultXML() +
                                    self.getCommonSceneLayout(i_placement) +
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
                fontAwesome: self.getFontAwesome('rss')
            }
        };
    },

    /**
     Get the common layout which only applies when block is inside a scene
     @method getCommonSceneLayout
     @param {string} i_placement
     @return {String} common xml
     **/
    getCommonSceneLayout: function(i_placement, w, h){
        var self = this;
        w = w == undefined ? 100 : w;
        h = h == undefined ? 100 : h;
        if (i_placement == BB.CONSTS.PLACEMENT_CHANNEL)
            return '';
        return '<Layout rotation="0" x="0" y="0" width="' + w + '" height="' + h + '" />';
    },

    /**
     Get the common properties XML with all default values
     @method getCommonDefaultXML
     @return {String} common xml
     **/
    getCommonDefaultXML: function(){
        var self = this;
        var common =    '<Appearance alpha="1.0" blendMode="normal" />' +  self.getCommonBackgroundXML() + self.getCommonBorderXML();
        return common;
    },

    /**
     Get the common properties Scene XML with all default values
     @method getCommonSceneDefaultXML
     @return {String} common xml
     **/
    getCommonSceneDefaultXML: function(){
        var self = this;
        var common =    '<Appearance alpha="1.0" blendMode="normal" />' +  self.getCommonBorderXML();
        return common;
    },

    /**
     Get the common border XML with all default values
     @method getCommonBorderXML
     @return {String} common xml
     **/
    getCommonBorderXML: function(){
        return '<Border borderThickness="0" borderColor="65535" cornerRadius="0"/>';
    },

    /**
     Get the common properties XML with all default values
     @method getCommonBackgroundXML
     @return {String} common xml
     **/
    getCommonBackgroundXML: function(){
        var common =    '<Background style="Gradient" gradientType="linear" angle="0" offsetX="0" offsetY="0">'+
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
     Translate a mimeType to a font-awesome icon of generic icons if does not exist
     @method getIconFromMimeType
     @param {Number} i_playerData
     @return {String} foundMimeIcon
     **/
    getIconFromMimeType: function(i_mimeType){
        var self = this;
        var foundMimeIcon = 'fa-star';
        var blocks = self.getBlocks();
        _.forEach(blocks, function (block) {
            if (block.mimeType && block.mimeType == i_mimeType)
                foundMimeIcon = block.fontAwesome;
        });
        return foundMimeIcon
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
     Get the font awesome path
     @method getFontAwesome
     @param {String} i_fontName
     @return {String} url path
     **/
    getFontAwesome: function (i_fontName) {
        var self = this;
        if (_.isUndefined((self.m_fontAwesome[i_fontName])))
            return undefined;
        return self.m_fontAwesome[i_fontName]['image'];
    },

    /**
     Get the  entire font awesome set
     @method getFontsAwesome
     @return {Object} data set
     **/
    getFontsAwesome: function () {
        var self = this;
        return self.m_fontAwesome;
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

