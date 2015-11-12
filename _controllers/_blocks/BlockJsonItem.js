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
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockJsonItem = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 4310;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
            self._listenInputChange();
            //self._listenItemSelectDropDownChange();
            //self._listenFontSelectionChange();
            //self.m_twitterFontSelector = self.m_blockProperty.getTwitterItemFontSelector();
        },

        _listenInputChange: function(){
            var self = this;
            self.m_inputCpathChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var value = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');
                $(xSnippet).attr('fieldName',value);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 333, false);
            $('#tmpJsonItem').on("input", self.m_inputCpathChange);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('XmlItem');
            var fieldType = $(xSnippet).attr('fieldType');
            var fieldName = $(xSnippet).attr('fieldName');

            $('#tmpJsonItem').val(fieldName);

            //var label = fieldType == 'resource' ? $(Elements.BOOTBOX_PROFILE_IMAGE).text() : $(Elements.BOOTBOX_LABEL_TEXT).text();
            //self._populatePlayItemLabel(label);
            //self._populateToggleItemType(fieldType);
            //self._populateLabel();
        },

        /**
         Listen to selection of twitter item
         @method _listenItemSelectDropDownChange
         _listenItemSelectDropDownChange: function () {
            var self = this;
            self.m_itemTypeSelect = function (e) {
                if (!self.m_selected)
                    return;
                var fieldType = $(e.target).attr('name');
                if (_.isUndefined(fieldType))
                    return;
                var listLabel = $(e.target).text();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('XmlItem');

                switch (fieldType) {
                    case 'text':
                    {
                        $(xSnippet).attr('fieldName', 'text');
                        $(xSnippet).attr('fieldType', 'text');
                        break;
                    }
                    case 'resource':
                    {
                        $(xSnippet).attr('fieldName', 'user.profile_image_url');
                        $(xSnippet).attr('fieldType', 'resource');
                        break;
                    }
                }
                self._populatePlayItemLabel(listLabel);
                self._populateToggleItemType(fieldType);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.TWITTER_ITEM_DROPDOWN).on('click', self.m_itemTypeSelect);
        },
         **/

        /**
         Populate the twitter label (most viewed / custom list)
         @method _populatePlayItemLabel
         @params {String} i_label
         _populatePlayItemLabel: function (i_label) {
            var self = this;
            $(Elements.TWITTER_ITEMTYPE_SELECT).text(i_label);
        },
         **/

        /**
         Toggle the view of proper list selection
         @method _populateToggleItemType
         @params {String} i_fieldType
         _populateToggleItemType: function (i_fieldType) {
            var self = this;
            switch (i_fieldType) {
                case 'text':
                {
                    $(Elements.TWITTER_ITEM_LABEL).show();
                    break;
                }
                case 'resource':
                {
                    $(Elements.TWITTER_ITEM_LABEL).hide();
                    break;
                }
            }
        },
         **/

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         _populateLabel: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippetFont = $(domPlayerData).find('Font');
            self.m_twitterFontSelector.setConfig({
                bold: xSnippetFont.attr('fontWeight') == 'bold' ? true : false,
                italic: xSnippetFont.attr('fontStyle') == 'italic' ? true : false,
                underline: xSnippetFont.attr('textDecoration') == 'underline' ? true : false,
                alignment: xSnippetFont.attr('textAlign'),
                font: xSnippetFont.attr('fontFamily'),
                color: BB.lib.colorToHex(BB.lib.decimalToHex(xSnippetFont.attr('fontColor'))),
                size: xSnippetFont.attr('fontSize')
            });
        },
         **/

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         _listenFontSelectionChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_twitterFontSelector)
                    return;
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippetFont = $(domPlayerData).find('Font');
                config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
                config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
                config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'none');
                xSnippetFont.attr('fontColor', BB.lib.colorToDecimal(config.color));
                xSnippetFont.attr('fontSize', config.size);
                xSnippetFont.attr('fontFamily', config.font);
                xSnippetFont.attr('textAlign', config.alignment);
                self._setBlockPlayerData(domPlayerData);
            });
        },
         **/

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_JSON_ITEM_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            //$(Elements.TWITTER_ITEM_DROPDOWN).off('click', self.m_itemTypeSelect);
            //BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            $('#tmpJsonItem').off("input", self.m_inputCpathChange);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockJsonItem;
});