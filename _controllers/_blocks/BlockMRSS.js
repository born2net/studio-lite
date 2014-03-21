/**
 * BlockMRSS block resided inside a Scenes or timeline
 * @class BlockMRSS
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockMRSS = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3340;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);

            self.m_mrssLinkSelector = self.m_blockProperty.getMRssLinkSelector();
            self._initSubPanel(Elements.BLOCK_MRSS_COMMON_PROPERTIES);
            self._listenMRSSLinkChange();
            self._listenAspectRatioChange();

        },

        /**
         Listen to RSS aspect ratio change
         @method _listenAspectRatioChange
         **/
        _listenAspectRatioChange: function () {
            var self = this;
            self.m_aspectChange = function (e) {
                if (!self.m_selected)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                var v = $(e.target).prop('checked') == true ? 1 : 0;
                $(xSnippet).attr('maintainAspectRatio', v);
                self._setBlockPlayerData(domPlayerData);
            };
            $(Elements.MRSS_ASPECT_RATIO).on('change', self.m_aspectChange);
        },

        /**
         Listen to RSS link changes
         @method _listenRSSLinkChange
         **/
        _listenMRSSLinkChange: function () {
            var self = this
            BB.comBroker.listenWithNamespace(BB.EVENTS.RSSLINK_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_mrssLinkSelector)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('url', e.edata);
                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         Load up property values in the RSS panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Rss');
            var url = xSnippet.attr('url');
            var maintainAspectRatio = xSnippet.attr('maintainAspectRatio');
            self.m_mrssLinkSelector.setMRssLink(url);
            $(Elements.MRSS_ASPECT_RATIO).prop('checked', maintainAspectRatio == "1" ? true : false);
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_MRSS_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.RSSLINK_CHANGED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self);
            $(Elements.MRSS_ASPECT_RATIO).off('change', self.m_aspectChange);
            self._deleteBlock();
        }
    });

    return BlockMRSS;
});