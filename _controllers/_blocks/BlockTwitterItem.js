/**
 * BlockTwitterItem block resides inside a scene or timeline
 * @class BlockTwitterItem
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockTwitterItem = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 4505;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_TWITTER_ITEM_COMMON_PROPERTIES);
            self._listenItemSelectDropDownChange();
            self.m_twitterFontSelector = self.m_blockProperty.getTwitterItemFontSelector();
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
            var label = fieldType == 'resource' ? $(Elements.BOOTBOX_PROFILE_IMAGE).text() : $(Elements.BOOTBOX_LABEL_TEXT).text();
            self._populatePlayItemLabel(label);
            self._populateToggleItemType(fieldType);
        },

        /**
         Listen to selection of twitter item
         @method _listenItemSelectDropDownChange
         **/
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

        /**
         Populate the youtube playlist label (most viewed / custom list)
         @method _populatePlayItemLabel
         @params {String} i_label
         **/
        _populatePlayItemLabel: function (i_label) {
            var self = this;
            $(Elements.TWITTER_ITEMTYPE_SELECT).text(i_label);
        },

        /**
         Toggle the view of proper list selection
         @method _populateToggleItemType
         @params {String} i_fieldType
         **/
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

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_TWITTER_ITEM_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.TWITTER_ITEM_DROPDOWN).off('click', self.m_itemTypeSelect);
            self._deleteBlock();
        }
    });

    return BlockTwitterItem;
});