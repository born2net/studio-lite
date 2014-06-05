/**
 * Block QR block resided inside a Scenes or timeline
 * @class BlockQR
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockQR = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3430;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_QR_COMMON_PROPERTIES);
            self._listenInputChange();
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_inputChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Text');
                $(xSnippet).text(text);
                self._setBlockPlayerData(domPlayerData, true);
                // log(xSnippet[0].outerHTML);
            }, 150);
            $(Elements.QR_TEXT).on("input", self.m_inputChangeHandler);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Text');
            $(Elements.QR_TEXT).val(xSnippet.text());
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_QR_COMMON_PROPERTIES);
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
            var opts = {
                top: 0,
                left: 0,
                width: parseInt(layout.attr('width')),
                height: parseInt(layout.attr('height')),

            };

            var r = new fabric.Rect({
                top: 0,
                left: 0,
                width: parseInt(layout.attr('width')),
                height: parseInt(layout.attr('height')),
                fill: '#ececec',
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

            r.setGradient('fill', {
                x1: 0,
                y1: r.height,
                x2: r.width,
                y2: r.height,
                colorStops: {
                    0: "red",
                    1: "blue"
                }
            });

            //rss
            //var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(5,5)">		<g id="c40_rss">			<path style="fill:#000000;" d="M3.607,17.099C1.618,17.099,0,18.716,0,20.707c0,1.984,1.618,3.604,3.607,3.604		s3.607-1.619,3.607-3.604C7.214,18.716,5.596,17.099,3.607,17.099z"/>			<path style="fill:#000000;" d="M0.375,7.941C0.169,7.941,0,8.11,0,8.318v4.578c0,0.206,0.169,0.374,0.375,0.374		c5.879,0,10.665,4.784,10.665,10.665c0,0.205,0.166,0.375,0.375,0.375h4.581h0.016c0.209,0,0.377-0.17,0.377-0.375l-0.018-0.117		C16.305,15.054,9.152,7.941,0.375,7.941z"/>			<path style="fill:#000000;" d="M24.311,23.818C24.246,10.671,13.531,0,0.375,0C0.169,0,0,0.169,0,0.377v4.711		c0,0.207,0.169,0.375,0.375,0.375c10.186,0,18.472,8.287,18.472,18.473c0,0.205,0.168,0.375,0.373,0.375h4.713h0.02		c0.205,0,0.379-0.17,0.379-0.375L24.311,23.818z"/>		</g>	</g></svg>');
            //web
            // var svg = new String('<svg width="50px" height="50px">	<g transform="translate(-30,-30)">		<path d="M13.024,11.421c0.013,0.129,0.023,0.248,0.033,0.367c0.103,1.153,0.203,2.307,0.307,3.459	c0.132,1.465,0.265,2.932,0.395,4.397c0.11,1.233,0.219,2.467,0.328,3.701c0.124,1.389,0.249,2.776,0.373,4.166	c0.109,1.231,0.218,2.467,0.328,3.7c0.134,1.502,0.27,3.002,0.398,4.504c0.008,0.097,0.039,0.138,0.135,0.164	c3.177,0.896,6.352,1.793,9.525,2.687c0.08,0.022,0.176,0.021,0.256,0c3.188-0.894,6.373-1.789,9.561-2.682	c0.109-0.031,0.142-0.078,0.15-0.185c0.069-0.836,0.146-1.672,0.219-2.508c0.082-0.922,0.166-1.846,0.248-2.77	c0.074-0.826,0.146-1.65,0.221-2.476c0.083-0.924,0.165-1.848,0.247-2.77c0.073-0.826,0.146-1.65,0.221-2.476	c0.082-0.92,0.164-1.84,0.246-2.76c0.074-0.828,0.147-1.656,0.222-2.486c0.082-0.92,0.164-1.84,0.246-2.76	c0.075-0.838,0.15-1.678,0.227-2.516c0.021-0.254,0.043-0.506,0.066-0.764C28.987,11.421,21.015,11.421,13.024,11.421z	 M32.247,19.378c-3.821,0-7.639,0-11.471,0c0.09,1.033,0.179,2.055,0.267,3.082c3.649,0,7.287,0,10.938,0	c-0.027,0.217-0.061,0.422-0.08,0.629c-0.051,0.521-0.1,1.043-0.146,1.563c-0.084,0.943-0.166,1.89-0.248,2.834	c-0.073,0.847-0.146,1.691-0.221,2.539c-0.048,0.535-0.101,1.07-0.146,1.604c-0.007,0.084-0.061,0.086-0.111,0.101	c-1.293,0.356-2.584,0.713-3.877,1.067c-0.709,0.197-1.416,0.396-2.127,0.591c-0.032,0.01-0.076,0.004-0.11-0.007	c-2.006-0.551-4.011-1.104-6.015-1.653c-0.092-0.024-0.094-0.08-0.1-0.146c-0.051-0.644-0.102-1.283-0.15-1.927	c-0.067-0.864-0.135-1.729-0.203-2.594c-0.002-0.022-0.002-0.049-0.004-0.08c0.99,0,1.978,0,2.971,0	c0.025,0.281,0.052,0.562,0.076,0.838c0.044,0.49,0.088,0.979,0.13,1.472c0.004,0.055,0.021,0.078,0.075,0.094	c1.076,0.287,2.15,0.578,3.228,0.867c0.038,0.01,0.084,0.006,0.123-0.004c1.062-0.285,2.123-0.574,3.187-0.857	c0.064-0.018,0.092-0.047,0.098-0.113c0.117-1.254,0.236-2.51,0.357-3.762c0-0.004-0.002-0.008-0.004-0.023	c-3.464,0-6.928,0-10.402,0c-0.271-3.031-0.541-6.051-0.812-9.08c5.025,0,10.029,0,15.058,0	C32.435,17.401,32.341,18.384,32.247,19.378z"/>	</g></svg>');
            //video
            //var svg = new String('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(-10,-10)">	<g>		<path fill="black" id="svg_3" d="m24.5,6c-10.21663,0 -18.5,8.28337 -18.5,18.5s8.28337,18.5 18.5,18.5s18.5,-8.28337 18.5,-18.5s-8.28337,-18.5 -18.5,-18.5zm-6.9375,27.75v-18.5l16.1875,9.25l-16.1875,9.25z"/>	</g>	</g></svg>');
            //ext video
            // var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(0,0)">		<g>			 <path d="m31.25,2l-22.5,0c-3.7125,0 -6.75,3.0375 -6.75,6.75l0,13.5c0,3.7125 3.0375,6.75 6.75,6.75l22.5,0c3.7125,0 6.75,-3.0375 6.75,-6.75l0,-13.5c0,-3.7125 -3.0375,-6.75 -6.75,-6.75zm4.5,20.25c0,1.19454 -0.47025,2.32249 -1.32377,3.17622c-0.85373,0.85354 -1.98162,1.32378 -3.17623,1.32378l-22.5,0c-1.19454,0 -2.32249,-0.47025 -3.17616,-1.32378c-0.85366,-0.85373 -1.32384,-1.98168 -1.32384,-3.17622l0,-13.5c0,-1.19454 0.47018,-2.32249 1.32384,-3.17616c0.85367,-0.85366 1.98162,-1.32384 3.17616,-1.32384l22.5,0c1.19454,0 2.32249,0.47018 3.17623,1.32384c0.85366,0.85367 1.32377,1.98162 1.32377,3.17616l0,13.5zm-20.25,2.25l11.25,-9l-11.25,-9l0,18z" id="svg_1"/>		</g>	</g></svg>');
            //qr
            //var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(0,0)">		<g>			<path d="M17.16,25.713h1.427v1.426h1.426v1.426h-7.129v-1.426h1.426v-2.852h2.853v1.426H17.16z M35.695,38.543h1.424v-1.426h-1.424	V38.543z M18.586,25.713h1.426v-1.426h-1.426V25.713z M38.543,38.543h1.426v-1.426h-1.426V38.543z M21.439,39.969h2.85v-1.426h-2.85	V39.969z M34.268,39.969v-1.426h-1.426v1.426H34.268z M28.566,39.969h1.426v-2.852h-1.426V39.969z M17.16,21.436v1.426h4.277v-1.426	H17.16z M15.736,22.861v-1.426h-2.853v2.852h1.426v-1.426H15.736z M20.012,20.01h-9.979v-9.979h9.979V20.01z M18.586,11.457h-7.129	v7.127h7.129V11.457z M12.883,37.117h4.276V32.84h-4.276V37.117z M27.139,35.691v1.426h1.428v-1.426H27.139z M17.16,12.883h-4.276	v4.275h4.276V12.883z M39.969,10.031v9.979H29.99v-9.979H39.969z M38.543,11.457h-7.127v7.127h7.127V11.457z M10.031,29.988h9.98	v9.979h-9.98V29.988z M11.458,38.543h7.129v-7.129h-7.129V38.543z M11.458,21.436h-1.427v7.129h1.427V21.436z M29.99,28.564v1.424	h1.426v-1.424H29.99z M25.713,34.266V32.84h-1.426v1.426h-2.85v2.853h2.85v1.426h1.426v-2.853h1.426v-1.426H25.713L25.713,34.266z	 M21.439,15.734h2.85v-1.428h-2.85V15.734z M32.842,27.139h2.854v1.426h1.424v-4.276h-1.424v-2.853h-1.428v4.277h-4.275v1.426h1.426	v1.426h1.426v-1.426H32.842z M34.268,31.414h-1.426v-1.426h-1.426v2.852h-4.277v1.426h2.854v2.853h1.426v1.426h1.426v-2.853h5.701	v-1.426H34.27v-2.852H34.268z M34.268,31.414h1.428v-2.85h-1.428V31.414z M22.863,31.414v-1.426h1.424v-1.424h1.426v-1.427h1.426	v-2.852h4.277v-2.853H29.99v1.426h-1.426v-5.703h-1.426v-2.852h1.426v-4.273h-1.426v2.852h-1.426v-2.852h-4.276v2.852h1.426v-1.426	h1.424v2.85h1.426v4.277h1.426v1.426h-1.426v2.852h-1.426V20.01h-1.424v-1.426h-1.426v2.852h1.426v1.426h-1.426v4.277h1.426v-2.852	h1.424v2.852h-1.424v1.426h-1.426v4.275h2.85v-1.426H22.863z M38.543,32.84v-1.426h-2.85v1.426H38.543z M37.117,12.883h-4.275v4.275	h4.275V12.883z M25.713,31.414h2.854v-1.426h-1.428v-1.424h-1.426V31.414z M28.566,28.564v-1.426h-1.428v1.426H28.566z	 M37.117,22.861h2.852v-1.426h-2.852V22.861z M38.543,34.266h1.426V32.84h-1.426V34.266z M38.543,25.713h1.426v-1.426h-1.426V25.713	z M25.713,18.584h-1.426v1.426h1.426V18.584z"/>		</g>	</g></svg>');
            //svg = svg.replace(/XXX/,x);
            //svg = svg.replace(/YYY/,y);
            //log(svg);
            //clock
            //var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(-20,-20)">			 <g>			 <path id="svg_1" d="m16.159374,13.453124l5.283258,5.661162l-1.009151,1.035711l-6.387946,-5.68348l-0.11741,-0.893526l0.45625,-8.540849l1.327008,0l0.44799,8.420981zm11.840626,0.046876c0,6.903126 -5.596874,12.5 -12.5,12.5s-12.5,-5.596874 -12.5,-12.5s5.596875,-12.5 12.5,-12.5s12.5,5.596875 12.5,12.5zm-2.083483,0c0,-5.753125 -4.663614,-10.416741 -10.416517,-10.416741s-10.416741,4.663616 -10.416741,10.416741c0,5.752903 4.663839,10.416517 10.416741,10.416517s10.416517,-4.663614 10.416517,-10.416517z"/>		</g>	</g>	</svg>');
            //picture
            //var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(-25,-25)">			<path id="svg_1" d="m9,7.5625l0,28.4375l36,0l0,-28.4375l-36,0zm33.75,26.25l-31.5,0l0,-24.0625l31.5,0l0,24.0625zm-9,-18.59375c0,1.812195 1.511017,3.28125 3.375,3.28125s3.375,-1.469055 3.375,-3.28125s-1.511017,-3.28125 -3.375,-3.28125s-3.375,1.469055 -3.375,3.28125zm6.75,16.40625l-27,0l6.75,-17.5l9,10.9375l4.5,-3.28125l6.75,9.84375z"/>	</g>	</svg>');
            //exp  picture
            //var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">	<g transform="translate(-20,-20)">			 <g>			 <path id="svg_1" d="m32,9l0,20l-24,0l0,-20l24,0m2,-2l-28,0l0,24l28,0l0,-24l0,0zm-24,18l20,0l-4,-12l-6,8l-4,-4l-6,8zm2,-12c-1.1055,0 -2,0.894562 -2,2s0.894563,2 2,2s2,-0.894562 2,-2s-0.8945,-2 -2,-2zm-10,-10l0,24l2,0l0,-22l26,0l0,-2l-28,0z"/>		</g>	</g>	</svg>');
            //mrss
            var svg = new String('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"> <g>  <title>background</title>  <rect x="-1" y="-1" width="52" height="52" id="canvas_background" fill="none"/> </g> <g>  <title>Layer 1</title>  <g id="svg_1">   <g id="svg_2">    <path id="svg_3" d="m40.58189,8.36218c-1.32502,-1.2887 -2.92123,-1.93318 -4.78776,-1.93318l-22.58868,0c-1.86653,0 -3.46274,0.64449 -4.78834,1.93318c-1.32531,1.28898 -1.98811,2.84108 -1.98811,4.65604l0,21.96427c0,1.81496 0.6628,3.36707 1.98811,4.65604c1.3256,1.28898 2.92181,1.93347 4.78834,1.93347l22.58838,0c1.86653,0 3.46274,-0.64449 4.78777,-1.93347c1.3256,-1.28897 1.9884,-2.84108 1.9884,-4.65604l0,-21.96427c0,-1.81496 -0.6628,-3.36735 -1.98811,-4.65604zm-22.98808,26.49451c-0.58858,0.57175 -1.29816,0.85791 -2.12963,0.85791c-0.83117,0 -1.54105,-0.28616 -2.12934,-0.85791c-0.58829,-0.57204 -0.88258,-1.26229 -0.88258,-2.07079c0,-0.80821 0.29429,-1.49847 0.88258,-2.07051c0.58829,-0.57204 1.29817,-0.85791 2.12934,-0.85791c0.83146,0 1.54134,0.28588 2.12963,0.85791c0.588,0.57203 0.88229,1.2623 0.88229,2.07051c0,0.80849 -0.294,1.49875 -0.88229,2.07079zm8.9289,0.62877c-0.15682,0.15248 -0.33732,0.22831 -0.54121,0.22831l-3.01163,0c-0.20389,0 -0.37631,-0.06431 -0.51753,-0.19433c-0.14123,-0.12946 -0.21978,-0.29346 -0.23537,-0.492c-0.17242,-2.34852 -1.12142,-4.36202 -2.84701,-6.04022c-1.72559,-1.67764 -3.79602,-2.60042 -6.21185,-2.76835c-0.20389,-0.01488 -0.37255,-0.09099 -0.50569,-0.22831c-0.13342,-0.13704 -0.20014,-0.30497 -0.20014,-0.50323l0,-2.9287c0,-0.19826 0.07855,-0.37377 0.23537,-0.52626c0.15682,-0.15249 0.34512,-0.22101 0.5649,-0.20584c3.6392,0.19826 6.74498,1.54846 9.31763,4.04975c2.57265,2.50185 3.96092,5.52154 4.16482,9.06047c0.01588,0.21342 -0.05545,0.39624 -0.21227,0.54873zm9.03547,0c-0.15682,0.15248 -0.33703,0.22859 -0.54093,0.22859l-3.01192,0c-0.20389,0 -0.3766,-0.06852 -0.51753,-0.20556c-0.14123,-0.13704 -0.21949,-0.30497 -0.23537,-0.50352c-0.10975,-3.11151 -0.98453,-5.99444 -2.62348,-8.6485c-1.63895,-2.65405 -3.82345,-4.77792 -6.55292,-6.37159c-2.72947,-1.59395 -5.69403,-2.44428 -8.89425,-2.55099c-0.20389,-0.01517 -0.37631,-0.09155 -0.51753,-0.22859c-0.14093,-0.13732 -0.21169,-0.30525 -0.21169,-0.50352l0,-2.9287c0,-0.19826 0.07855,-0.3735 0.23537,-0.52626c0.14122,-0.15249 0.32144,-0.22101 0.54121,-0.20556c2.41554,0.0761 4.74907,0.50295 6.99999,1.28111c2.25093,0.7776 4.29016,1.84163 6.11799,3.19155c1.82754,1.34963 3.4353,2.91326 4.82329,4.6903s2.48254,3.75994 3.28253,5.94867c0.79969,2.18901 1.23925,4.45778 1.31751,6.80658c0.03119,0.21371 -0.03899,0.38894 -0.21227,0.52598z"/>   </g>  </g> </g></svg>');







            fabric.loadSVGFromString(svg, function (objects, options) {
                var qrCode = fabric.util.groupSVGElements(objects, options);
                //_.extend(qrCode, opts);

                var group = new fabric.Group([r, qrCode], {
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

                _.extend(self, group);
                self['canvasScale'] = i_canvasScale;
                i_callback();
            });
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.QR_TEXT).off("input", self.m_inputChangeHandler);
            self._deleteBlock();
        }
    });

    return BlockQR;
});