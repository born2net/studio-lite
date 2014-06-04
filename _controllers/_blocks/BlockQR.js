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

            var svg = new String('<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 width="250px" height="250px" viewBox="0 0 250px 250px" enable-background="new 0 0 250 250" preserveAspectRatio="none" xml:space="preserve"><path d="M17.16,25.713h1.427v1.426h1.426v1.426h-7.129v-1.426h1.426v-2.852h2.853v1.426H17.16z M35.695,38.543h1.424v-1.426h-1.424	V38.543z M18.586,25.713h1.426v-1.426h-1.426V25.713z M38.543,38.543h1.426v-1.426h-1.426V38.543z M21.439,39.969h2.85v-1.426h-2.85	V39.969z M34.268,39.969v-1.426h-1.426v1.426H34.268z M28.566,39.969h1.426v-2.852h-1.426V39.969z M17.16,21.436v1.426h4.277v-1.426	H17.16z M15.736,22.861v-1.426h-2.853v2.852h1.426v-1.426H15.736z M20.012,20.01h-9.979v-9.979h9.979V20.01z M18.586,11.457h-7.129	v7.127h7.129V11.457z M12.883,37.117h4.276V32.84h-4.276V37.117z M27.139,35.691v1.426h1.428v-1.426H27.139z M17.16,12.883h-4.276	v4.275h4.276V12.883z M39.969,10.031v9.979H29.99v-9.979H39.969z M38.543,11.457h-7.127v7.127h7.127V11.457z M10.031,29.988h9.98	v9.979h-9.98V29.988z M11.458,38.543h7.129v-7.129h-7.129V38.543z M11.458,21.436h-1.427v7.129h1.427V21.436z M29.99,28.564v1.424	h1.426v-1.424H29.99z M25.713,34.266V32.84h-1.426v1.426h-2.85v2.853h2.85v1.426h1.426v-2.853h1.426v-1.426H25.713L25.713,34.266z	 M21.439,15.734h2.85v-1.428h-2.85V15.734z M32.842,27.139h2.854v1.426h1.424v-4.276h-1.424v-2.853h-1.428v4.277h-4.275v1.426h1.426	v1.426h1.426v-1.426H32.842z M34.268,31.414h-1.426v-1.426h-1.426v2.852h-4.277v1.426h2.854v2.853h1.426v1.426h1.426v-2.853h5.701	v-1.426H34.27v-2.852H34.268z M34.268,31.414h1.428v-2.85h-1.428V31.414z M22.863,31.414v-1.426h1.424v-1.424h1.426v-1.427h1.426	v-2.852h4.277v-2.853H29.99v1.426h-1.426v-5.703h-1.426v-2.852h1.426v-4.273h-1.426v2.852h-1.426v-2.852h-4.276v2.852h1.426v-1.426	h1.424v2.85h1.426v4.277h1.426v1.426h-1.426v2.852h-1.426V20.01h-1.424v-1.426h-1.426v2.852h1.426v1.426h-1.426v4.277h1.426v-2.852	h1.424v2.852h-1.424v1.426h-1.426v4.275h2.85v-1.426H22.863z M38.543,32.84v-1.426h-2.85v1.426H38.543z M37.117,12.883h-4.275v4.275	h4.275V12.883z M25.713,31.414h2.854v-1.426h-1.428v-1.424h-1.426V31.414z M28.566,28.564v-1.426h-1.428v1.426H28.566z	 M37.117,22.861h2.852v-1.426h-2.852V22.861z M38.543,34.266h1.426V32.84h-1.426V34.266z M38.543,25.713h1.426v-1.426h-1.426V25.713	z M25.713,18.584h-1.426v1.426h1.426V18.584z"/></svg>');

            fabric.loadSVGFromString(svg, function (objects, options) {
                var qrCode = fabric.util.groupSVGElements(objects, options);
                _.extend(qrCode, opts);

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