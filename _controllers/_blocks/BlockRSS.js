/**
 * BlockRSS block resided inside a Scenes or timeline
 * @class BlockRSS
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockRSS = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3345;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);

            self.m_rssFontSelector = self.m_blockProperty.getRssFontSelector();
            self.m_rssLinkSelector = self.m_blockProperty.getRssLinkSelector();
            self._initSubPanel(Elements.BLOCK_RSS_COMMON_PROPERTIES);

            self._listenRSSLinkChange();
            self._listenFontSelectionChange();
            self._listenMinRefreshTime();
            self._listenScrollDirection();
            self._listenScrollSpeed();
        },

        /**
         Listen to RSS link changes
         @method _listenRSSLinkChange
         **/
        _listenRSSLinkChange: function () {
            var self = this
            self.rssLinkChanged = function (e) {
                if (!self.m_selected || e.caller !== self.m_rssLinkSelector)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('url', e.edata);
                self._setBlockPlayerData(domPlayerData);
                // log(xSnippet[0].outerHTML);
            };
            BB.comBroker.listen(BB.EVENTS.RSSLINK_CHANGED, self.rssLinkChanged);
        },

        /**
         Listen to RSS Poll time value changes
         @method _listenMinRefreshTime
         **/
        _listenMinRefreshTime: function () {
            var self = this;
            self.m_rssPollSpinner = function (e) {
                if (!self.m_selected)
                    return;
                var minRefreshTime = $('input', e.target).val();
                if (_.isEmpty(minRefreshTime))
                    minRefreshTime = 30;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('minRefreshTime', minRefreshTime);
                self._setBlockPlayerData(domPlayerData);
            }
            $(Elements.RSS_POLL_SPINNER).on('change', self.m_rssPollSpinner);
        },


        /**
         Listen to RSS scroll direction changes
         @method _listenMinRefreshTime
         **/
        _listenScrollDirection: function () {
            var self = this;
            self.m_rssModeSelect = function (e) {
                if (!self.m_selected)
                    return;
                var modeSelect = $(e.target).val();
                modeSelect = modeSelect == 'Vertical mode' ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('vertical', modeSelect);
                self._setBlockPlayerData(domPlayerData);
            };
            $(Elements.RSS_MODE_SELECT).on('change', self.m_rssModeSelect);
        },

        /**
         Listen to RSS scroll speed changes
         @method _listenMinRefreshTime
         **/
        _listenScrollSpeed: function () {
            var self = this;
            self.m_rssScrollSpeed = function (e) {
                if (!self.m_selected)
                    return;
                var scrollSpeed = $(e.target).val();
                if (scrollSpeed=='Slow')
                    scrollSpeed = 10;
                if (scrollSpeed=='Medium')
                    scrollSpeed = 20;
                if (scrollSpeed=='Fast')
                    scrollSpeed = 30;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('speed', scrollSpeed);
                self._setBlockPlayerData(domPlayerData);
            };
            $(Elements.RSS_SCROLL_SPEED).on('change', self.m_rssScrollSpeed);

        },

        /**
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenFontSelectionChange: function () {
            var self = this;
            self.fontSelectionChanged = function (e) {
                if (!self.m_selected || e.caller !== self.m_rssFontSelector)
                    return;
                log('do something');
            };
            BB.comBroker.listen(BB.EVENTS.FONT_SELECTION_CHANGED, self.fontSelectionChanged);

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
            self.m_rssLinkSelector.setRssLink(url);

            var minRefreshTime = xSnippet.attr('minRefreshTime');
            $(Elements.RSS_MIN_REFRESH_TIME).val(minRefreshTime);

            var scrollDirection = parseInt(xSnippet.attr('vertical'));
            $(Elements.RSS_MODE_SELECT + ' option').eq(scrollDirection).attr('selected', 'selected');

            var scrollSpeed = parseInt(xSnippet.attr('speed'));
            if (scrollSpeed=='10')
                scrollSpeed = 0;
            if (scrollSpeed=='20')
                scrollSpeed = 1;
            if (scrollSpeed=='30')
                scrollSpeed = 2;
            $(Elements.RSS_SCROLL_SPEED + ' option').eq(scrollSpeed).attr('selected', 'selected');
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_RSS_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            BB.comBroker.stopListen(BB.EVENTS.RSSLINK_CHANGED, self.rssLinkChanged);
            BB.comBroker.stopListen(BB.EVENTS.FONT_SELECTION_CHANGED, self.fontSelectionChanged);
            $(Elements.RSS_POLL_SPINNER).off('change', self.m_rssPollSpinner);
            $(Elements.RSS_MODE_SELECT).off('change', self.m_rssModeSelect);
            $(Elements.RSS_SCROLL_SPEED).off('change', self.m_rssScrollSpeed);


            self._deleteBlock();
        }
    });

    return BlockRSS;
});