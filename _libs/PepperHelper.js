/**
 The PepperHelper class is used to manage real time data that is not in the msdb such as
 blocks and related methods that have to do with player_data which is a vital part of each
 channel or scene block (i.e.: player)
 @class PepperHelper
 @constructor
 @return none
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

        self.m_fontAwesome = {
            'scene': { image: 'fa-pencil-square-o' },
            'qr':  { image: 'fa-qrcode' },
            'rss': { image: 'fa-rss' },
            'mrss': { image: 'fa-rss-square' },
            'flv': { image: 'fa-file-video-o' },
            'mp4': { image: 'fa-video-camera' },
            'png': { image: 'fa-picture-o' },
            'swf': { image: 'fa-bolt' },
            'jpg': { image: 'fa-file-image-o' },
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
                //color: '#659EF1',
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

