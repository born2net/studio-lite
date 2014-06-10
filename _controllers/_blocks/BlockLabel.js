/**
 * BlockLabel block resided inside a Scenes or timeline
 * @class BlockLabel
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockLabel = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3241;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_LABEL_COMMON_PROPERTIES);
            self.m_labelFontSelector = self.m_blockProperty.getLabelFontSelector();
            self._listenInputChange();
            self._listenFontSelectionChange();
            self._listenMouseEntersSceneCanvas();
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            self.m_inputChangeHandler = function() {
                if (!self.m_selected)
                    return;
                var text = $(Elements.LABEL_TEXT).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Label');
                var xSnippetText = $(xSnippet).find('Text');
                $(xSnippetText).text(text);
                self._setBlockPlayerData(domPlayerData);
            };
            $(Elements.LABEL_TEXT).on("mouseout", self.m_inputChangeHandler);


            self._labelEnterKey = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if ( e.which == 13 )
                    self.m_inputChangeHandler(e);
                e.preventDefault();
            }, 50);
            $(Elements.LABEL_TEXT).on("keydown", self._labelEnterKey);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Label');
            var xSnippetText = $(xSnippet).find('Text');
            var xSnippetFont = $(xSnippet).find('Font');
            $(Elements.LABEL_TEXT).val(xSnippetText.text());

            self.m_labelFontSelector.setConfig({
                bold: xSnippetFont.attr('fontWeight') == 'bold' ? true : false,
                italic: xSnippetFont.attr('fontStyle') == 'italic' ? true : false,
                underline: xSnippetFont.attr('textDecoration') == 'underline' ? true : false,
                alignment: xSnippetFont.attr('textAlign'),
                font: xSnippetFont.attr('fontFamily'),
                color: BB.lib.colorToHex(BB.lib.decimalToHex(xSnippetFont.attr('fontColor'))),
                size: xSnippetFont.attr('fontSize')
            });
        },

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenMouseEntersSceneCanvas: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.MOUSE_ENTERS_CANVAS, self, function (e) {
                if (!self.m_selected)
                    return;
                $(Elements.LABEL_TEXT).blur();
            });
        },

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenFontSelectionChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_labelFontSelector)
                    return;
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Label');
                var xSnippetFont = $(xSnippet).find('Font');

                config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
                config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
                config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'normal');
                xSnippetFont.attr('fontColor', BB.lib.colorToDecimal(config.color));
                xSnippetFont.attr('fontSize', config.size);
                xSnippetFont.attr('fontFamily', config.font);
                xSnippetFont.attr('textAlign', config.alignment);

                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_LABEL_COMMON_PROPERTIES);
        },


        /**
         Convert the block into a fabric js compatible object
         @method fabricateBlock
         **/
        fabricateBlock: function (i_canvasScale, i_callback) {
            var self = this;

            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');
            var label = $(domPlayerData).find('Label');
            var text = $(label).find('Text').text();
            var fontSize = $(label).find('Font').attr('fontSize');

            var t = new fabric.IText(text, {
                fill: 'black',
                fontSize: fontSize,
                fontFamily: 'Jolly Lodger',
                textDecoration: 'none',
                top: 5,
                left: 5
            });

            self.m_minSize.w = t.currentWidth < 50 ? 50 : t.currentWidth * 1.2;
            self.m_minSize.h = t.currentHeight < 50 ? 50 : t.currentHeight * 1.2;
            var w = parseInt(layout.attr('width')) < self.m_minSize.w ? self.m_minSize.w :  parseInt(layout.attr('width'));
            var h = parseInt(layout.attr('height')) < self.m_minSize.h ? self.m_minSize.h :  parseInt(layout.attr('height'));

            var r = new fabric.Rect({
                width: w,
                height: h,
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

            log(w);

            var group = new fabric.Group([ r, t ], {
                left: parseInt(layout.attr('x')),
                top: parseInt(layout.attr('y')),
                width: w,
                height: h,
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
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            // $(Elements.LABEL_TEXT).off("input", self.m_inputChangeHandler);
            $(Elements.LABEL_TEXT).off("blur", self.m_inputChangeHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.MOUSE_ENTERS_CANVAS, self);
            self._deleteBlock();
        }
    });

    return BlockLabel;
});