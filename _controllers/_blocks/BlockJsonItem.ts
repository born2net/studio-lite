///<reference path="../../typings/lite/app_references.d.ts" />

/**
 * BlockJsonItem block resides inside a scene or timeline
 * @class BlockJsonItem
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 * @example
 * path: http://www.digitalsignage.com/videoTutorials/_data/videos.json
 * json player: children[0].children
 * json item: text
 */
//GULP_ABSTRACT_EXTEND extends Block
//GULP_ABSTRACT_START
declare module TSLiteModules {
   export class BlockJsonItem extends Block {
        protected m_options;
        protected m_selected;
        protected m_inputPathChangeHandler:any;
        protected m_labelFontSelector:any;
        protected m_minSize:any;
        protected m_config:{};
        protected m_sceneMime:string;
        protected _listenInputFieldPathChange() ;
        protected _populate() ;
        protected _loadBlockSpecificProps() ;
        public deleteBlock(i_memoryOnly):void ;
   }
}
//GULP_ABSTRACT_END

define(['jquery', 'Block'], function ($, Block) {
    TSLiteModules.Block = Block;

    class BlockJsonItem extends TSLiteModules.Block {

        protected m_options;
        protected m_selected;
        protected m_inputPathChangeHandler:any;
        protected m_labelFontSelector:any;
        protected m_minSize:any;
        protected m_config:{};
        protected m_sceneMime:string;

        constructor(options?:any) {
            if (options)
                this.m_options = options;
            this.m_blockType = 4310;
            _.extend(this.m_options, {blockType: this.m_blockType});
            super();
        }

        initialize() {
            var self = this;
            super.initialize(self.m_options);
            self._initSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
            self.m_labelFontSelector = self.m_blockProperty.getLabelJsonItemFontSelector();
            self._listenInputFieldPathChange();
            self._listenFontSelectionChange();
            self._listenMouseEntersSceneCanvas();
            self.m_sceneMime = BB.Pepper.getSceneMime(self.m_sceneID);
            self.m_config = {};
        }

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenMouseEntersSceneCanvas() {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.MOUSE_ENTERS_CANVAS, self, function (e) {
                if (!self.m_selected)
                    return;
                $(Elements.LABEL_TEXT).blur();
            });
        }

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenFontSelectionChange() {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_labelFontSelector)
                    return;
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                var xSnippetFont = $(xSnippet).find('Font');

                config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
                config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
                config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'none');
                xSnippetFont.attr('fontColor', BB.lib.colorToDecimal(config.color));
                xSnippetFont.attr('fontSize', config.size);
                xSnippetFont.attr('fontFamily', config.font);
                xSnippetFont.attr('textAlign', config.alignment);
                self._setBlockPlayerData(domPlayerData);
            });
        }

        /**
         Listen json input path change
         @method _listenInputFieldPathChange
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        protected _listenInputFieldPathChange() {
            var self = this;
            self.m_inputPathChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;

                var newText = $(e.target).val();
                newText = BB.lib.cleanProbCharacters(newText, 1);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                var oldText = $(xSnippet).attr('fieldName');
                if (newText == oldText)
                    return;
                $(xSnippet).attr('fieldName', newText);
                self._setBlockPlayerData(domPlayerData);
            }, 333, false);
            $(Elements.JSON_ITEM_FIELD).on("input blur mousemove", self.m_inputPathChangeHandler);
        }

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        protected _populate() {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('XmlItem');
            var xSnippetFont = $(xSnippet).find('Font');
            var fieldType = $(xSnippet).attr('fieldType');
            var fieldName = $(xSnippet).attr('fieldName');
            $(Elements.JSON_ITEM_FIELD).val(fieldName);

            self.m_labelFontSelector.setConfig({
                bold: xSnippetFont.attr('fontWeight') == 'bold' ? true : false,
                italic: xSnippetFont.attr('fontStyle') == 'italic' ? true : false,
                underline: xSnippetFont.attr('textDecoration') == 'underline' ? true : false,
                alignment: xSnippetFont.attr('textAlign'),
                font: xSnippetFont.attr('fontFamily'),
                color: BB.lib.colorToHex(BB.lib.decimalToHex(xSnippetFont.attr('fontColor'))),
                size: xSnippetFont.attr('fontSize')
            });

            self._populateJsonMimeProperties();

        }

        /**
         Configure the properties dialog depending on the scene the block resides in
         @method _populateJsonMimeProperties
         **/
        _populateJsonMimeProperties(){
            var self = this;

            //todo: expand on config of JsonItem depending on mime type of scene
            if (_.isUndefined(self.m_sceneMime)){
                $(Elements.JSON_ITEM_FIELD_CONTAINER).show();
                $(Elements.JSON_ITEM_TEXT_FIELDS_CONTAINER).hide();
            } else {

                $(Elements.JSON_ITEM_FIELD_CONTAINER).hide();
                $(Elements.JSON_ITEM_TEXT_FIELDS_CONTAINER).show();
                BB.lib.log('mime: ' + self.m_sceneMime);
            }
        }

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        protected _loadBlockSpecificProps() {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
        }

        /**
         Convert the block into a fabric js compatible object
         @Override
         @method fabricateBlock
         @param {number} i_canvasScale
         @param {function} i_callback
         **/
        fabricateBlock(i_canvasScale, i_callback) {
            var self:fabric.IRect|TSLiteModules.Block|any = this; //any to fake it

            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');
            var xSnippet = $(domPlayerData).find('XmlItem');
            var text = $(xSnippet).attr('fieldName');
            //var label = $(domPlayerData).find('Label');
            //var text = $(label).find('XmlItem').attr('');
            var font = $(xSnippet).find('Font');

            var url = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';

            //$.getScript(src, function (data) {
            //    console.log(data);
            //});

            var t = new fabric.IText(text, {
                fontSize: $(font).attr('fontSize'),
                //fontFamily: 'Graduate',
                //fontFamily: 'Jolly Lodger',
                //fontFamily: 'Arial',
                fontFamily: $(font).attr('fontFamily'),
                fill: '#' + BB.lib.decimalToHex($(font).attr('fontColor')),
                textDecoration: $(font).attr('textDecoration'),
                fontWeight: $(font).attr('fontWeight'),
                fontStyle: $(font).attr('fontStyle'),
                textAlign: $(font).attr('textAlign'),
                top: 5,
                left: 5
            });

            // calculate block so it can always contain the text it holds and doesn't bleed
            self.m_minSize.w = t.width < 50 ? 50 : t.width * 1.2;
            self.m_minSize.h = t.height < 50 ? 50 : t.height * 1.2;
            var w = parseInt(layout.attr('width')) < self.m_minSize.w ? self.m_minSize.w : parseInt(layout.attr('width'));
            var h = parseInt(layout.attr('height')) < self.m_minSize.h ? self.m_minSize.h : parseInt(layout.attr('height'));

            var rec = self._fabricRect(w, h, domPlayerData);
            var o = self._fabricateOptions(parseInt(layout.attr('y')), parseInt(layout.attr('x')), w, h, parseInt(layout.attr('rotation')));
            //var group = new fabric.Group([ rec, t ], o);
            //_.extend(self, group);

            rec.originX = 'center';
            rec.originY = 'center';
            t.top = 0 - (rec.height / 2);
            t.left = 0 - (rec.width / 2);
            _.extend(self, o);
            self.add(rec);
            self.add(t);
            self._fabricAlpha(domPlayerData);
            self._fabricLock();
            self['canvasScale'] = i_canvasScale;

            $.ajax({
                url: url,
                async: false,
                dataType: "script",
                complete: function (e) {
                    setTimeout(i_callback, 1)
                }
            });
        }

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        public deleteBlock(i_memoryOnly):void {
            var self = this;
            $(Elements.JSON_ITEM_FIELD).off("input blur mousemove", self.m_inputPathChangeHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.MOUSE_ENTERS_CANVAS, self);
            self._deleteBlock(i_memoryOnly);
        }
    }
    return BlockJsonItem;

});