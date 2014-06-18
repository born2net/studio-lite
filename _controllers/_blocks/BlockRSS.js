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
         Listen to changes in font UI selection from Block property and take action on changes
         @method _listenFontSelectionChange
         **/
        _listenFontSelectionChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.FONT_SELECTION_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_rssFontSelector)
                    return;
                var config = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                var xSnippetTitle = $(xSnippet).find('Font').eq(0);
                var xSnippetDescription = $(xSnippet).find('Font').eq(1);

                $.each([xSnippetTitle, xSnippetDescription],function(k,xmlData){
                    config.bold == true ? xmlData.attr('fontWeight', 'bold') : xmlData.attr('fontWeight', 'normal');
                    config.italic == true ? xmlData.attr('fontStyle', 'italic') : xmlData.attr('fontStyle', 'normal');
                    config.underline == true ? xmlData.attr('textDecoration', 'underline') : xmlData.attr('textDecoration', 'none');
                    xmlData.attr('fontColor', BB.lib.colorToDecimal(config.color));
                    xmlData.attr('fontSize', config.size);
                    xmlData.attr('fontFamily', config.font);
                    xmlData.attr('textAlign', config.alignment);

                });
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            });
        },

        /**
         Listen to RSS link changes
         @method _listenRSSLinkChange
         **/
        _listenRSSLinkChange: function () {
            var self = this
            BB.comBroker.listenWithNamespace(BB.EVENTS.RSSLINK_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_rssLinkSelector)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('url', e.edata);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                // log(xSnippet[0].outerHTML);
            });
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
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
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
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
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
                if (scrollSpeed == 'Slow')
                    scrollSpeed = 20;
                if (scrollSpeed == 'Medium')
                    scrollSpeed = 50;
                if (scrollSpeed == 'Fast')
                    scrollSpeed = 100;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Rss');
                $(xSnippet).attr('speed', scrollSpeed);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.RSS_SCROLL_SPEED).on('change', self.m_rssScrollSpeed);
        },

        /**
         Load up property values in the RSS panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;

            switch (self.m_placement) {

                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    var domPlayerData = self._getBlockPlayerData();
                    break;
                }

                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    domPlayerData = pepper.getScenePlayerdataBlock(self.m_sceneID, self.m_block_id);
                    break;
                }
            }

            var xSnippet = $(domPlayerData).find('Rss');
            var xSnippetTitle = $(xSnippet).find('Font').eq(0);
            var url = xSnippet.attr('url');
            self.m_rssLinkSelector.setRssLink(url);

            var minRefreshTime = xSnippet.attr('minRefreshTime');
            $(Elements.RSS_MIN_REFRESH_TIME).closest('div').spinner('value', parseInt(minRefreshTime));

            var scrollDirection = parseInt(xSnippet.attr('vertical'));
            $(Elements.RSS_MODE_SELECT + ' option').eq(scrollDirection).prop('selected', 'selected');

            var scrollSpeed = parseInt(xSnippet.attr('speed'));
            if (scrollSpeed == '20')
                scrollSpeed = 0;
            if (scrollSpeed == '50')
                scrollSpeed = 1;
            if (scrollSpeed == '100')
                scrollSpeed = 2;
            $(Elements.RSS_SCROLL_SPEED + ' option').eq(scrollSpeed).prop('selected', 'selected');

            self.m_rssFontSelector.setConfig({
                bold: xSnippetTitle.attr('fontWeight') == 'bold' ? true : false,
                italic: xSnippetTitle.attr('fontStyle') == 'italic' ? true : false,
                underline: xSnippetTitle.attr('textDecoration') == 'underline' ? true : false,
                alignment: xSnippetTitle.attr('textAlign'),
                font: xSnippetTitle.attr('fontFamily'),
                color: BB.lib.colorToHex(BB.lib.decimalToHex(xSnippetTitle.attr('fontColor'))),
                size: xSnippetTitle.attr('fontSize')
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
            this._viewSubPanel(Elements.BLOCK_RSS_COMMON_PROPERTIES);
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
            $(Elements.RSS_POLL_SPINNER).off('change', self.m_rssPollSpinner);
            $(Elements.RSS_MODE_SELECT).off('change', self.m_rssModeSelect);
            $(Elements.RSS_SCROLL_SPEED).off('change', self.m_rssScrollSpeed);
            self._deleteBlock();
        }
    });

    return BlockRSS;
});