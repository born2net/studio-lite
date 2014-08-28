/**
 * BlockYouTube block resides inside a scene or timeline
 * @class BlockYouTube
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockYouTube = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 4600;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_YOUTUBE_COMMON_PROPERTIES);
            self.m_youtubeQualityMeter = self.m_blockProperty.getYouTubeQualityMeter();
            self._listenQualityChange();
            self._listenVolumeChange();
            self._listenPlaylistDropDownChange();
            self._listenCountryChange();
            self._listenVideoIdChange();
        },

        /**
         Listen to when a video id change in input box
         @method _listenVideoIdChange
         **/
        _listenVideoIdChange: function(){
            var self = this;
            self.m_inputVideoIdChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var videoList = [];
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('VideoIdList').remove();
                var xSnippetYouTubeManualList = $(domPlayerData).find('YouTube');
                $(Elements.YOUTTUBE_VIDEOIDS).find('input').each(function(i,elem){
                    videoList.push($(elem).val());
                });
                videoList = videoList.join(',');
                $(xSnippetYouTubeManualList).append('<VideoIdList>' + videoList + '</VideoIdList>');
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 250, false);

            // remove any previous listeners to prevent leaks and create fresh ones
            // since this is called every time we we create new dynamic inputs
            $(Elements.CLASS_YOUTUBEVIDEOID).off("input", self.m_inputVideoIdChangeHandler);
            $(Elements.CLASS_YOUTUBEVIDEOID).on("input", self.m_inputVideoIdChangeHandler);
        },

        /**
         Listen to playlist changes dropdown
         @method _listenPlaylistDropDownChange
         **/
        _listenCountryChange: function () {
            var self = this;
            self.m_countryListChange = function (e) {
                if (!self.m_selected)
                    return;
                var listRegion = $(e.target).closest('li').attr('name');
                if (_.isUndefined(listRegion))
                    return;
                self._populatePlaylistCountryFlag(listRegion);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('YouTube');
                $(xSnippet).attr('listRegion', listRegion);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            $(Elements.YOUTUBE_COUNTRY_LIST_DROPDOWN).on('click', self.m_countryListChange);
        },

        /**
         Listen to playlist changes dropdown
         @method _listenPlaylistDropDownChange
         **/
        _listenPlaylistDropDownChange: function () {
            var self = this;
            self.m_playlistChange = function (e) {
                if (!self.m_selected)
                    return;
                var listType = $(e.target).attr('name');
                if (_.isUndefined(listType))
                    return;
                var listLabel = $(e.target).text();
                self._populatePlaylistLabel(listLabel);
                self._populateToggleListType(listType)
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('YouTube');
                $(xSnippet).attr('listType', listType);
                $(xSnippet).find('VideoIdList').remove();
                if (listType == 'manually') {
                    $(xSnippet).append('<VideoIdList>9bZkp7q19f0</VideoIdList>');
                    var xSnippetYouTubeManualList = $(domPlayerData).find('VideoIdList');
                    self._populateManualList(xSnippetYouTubeManualList);
                } else {
                    $(xSnippet).find('VideoIdList').remove();
                }
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);

            };
            $(Elements.YOUTUBE_LIST_DROPDOWN).on('click', self.m_playlistChange);
        },

        /**
         Listen to changes in volume control
         @method _listenVolumeChange
         **/
        _listenVolumeChange: function () {
            var self = this;
            self.m_inputVolumeHandler = function (e) {
                if (!self.m_selected)
                    return;
                var volume = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('YouTube');
                $(xSnippet).attr('volume', volume);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            BB.comBroker.listen(BB.EVENTS.YOUTUBE_VOLUME_CHANGED, self.m_inputVolumeHandler);
        },

        /**
         Listen to changes in youtube quality bar meter module
         @method _listenQualityChange
         **/
        _listenQualityChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.BAR_METER_CHANGED, self, function (e) {
                if (!self.m_selected || e.caller !== self.m_youtubeQualityMeter)
                    return;
                var value = e.edata;

                switch (value) {
                    case 1:
                    {
                        value = 'small';
                        break;
                    }
                    case 2:
                    {
                        value = 'medium';
                        break;
                    }
                    case 3:
                    {
                        value = 'default';
                        break;
                    }
                    case 4:
                    {
                        value = 'large';
                        break;
                    }
                    case 5:
                    {
                        value = 'hd720';
                        break;
                    }
                }
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('YouTube').attr('quality', value);
                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippetYouTube = $(domPlayerData).find('YouTube');
            var xSnippetYouTubeManualList = $(domPlayerData).find('VideoIdList');
            var listType = $(xSnippetYouTube).attr('listType');
            var listRegion = $(xSnippetYouTube).attr('listRegion');
            var label = listType == 'manually' ? $(Elements.BOOTBOX_CUSTOM_LIST).text() : $(Elements.BOOTBOX_MOST_VIEWED).text();
            self._populateQuality(xSnippetYouTube);
            self._populatePlaylistLabel(label);
            self._populateToggleListType(listType);
            self._populatePlaylistCountryFlag(listRegion);
            self._populateManualList(xSnippetYouTubeManualList);
        },

        /**
         Populate the youtube country flag
         @method _populatePlaylistCountryFlag
         @params {String} i_listRegion
         **/
        _populatePlaylistCountryFlag: function (i_listRegion) {
            var self = this;
            $(Elements.CLASS_YOUTUBE_FLAG).removeClass(BB.lib.unclass(Elements.CLASS_SELECTED_YOUTUBE_FLAG));
            $(Elements.CLASS_YOUTUBE_FLAG).each(function (e) {
                if ($(this).attr('name') == i_listRegion)
                    $(this).addClass(BB.lib.unclass(Elements.CLASS_SELECTED_YOUTUBE_FLAG));
            });
        },

        /**
         Populate the youtube playlist label (most viewed / custom list)
         @method _populatePlaylistLabel
         @params {String} i_label
         **/
        _populatePlaylistLabel: function (i_label) {
            var self = this;
            $(Elements.YOUTUBE_MOST_VIEWED).text(i_label);
        },

        /**
         Toggle the view of proper list selection (most viewed / custom list)
         @method _populateToggleListType
         @params {Object} i_xSnippetYouTube
         **/
        _populateToggleListType: function (i_listType) {
            var self = this;
            if (i_listType == 'manually') {
                $(Elements.YOUTUBE_CUSTOM_LIST).show();
                $(Elements.YOUTUBE_MOST_VIEWED_LIST).hide();
                $(Elements.YOUTUBE_LIST_ADD).show();
                $(Elements.YOUTUBE_LIST_REMOVE).show();
            } else {
                $(Elements.YOUTUBE_CUSTOM_LIST).hide();
                $(Elements.YOUTUBE_MOST_VIEWED_LIST).show();
                $(Elements.YOUTUBE_LIST_ADD).hide();
                $(Elements.YOUTUBE_LIST_REMOVE).hide();
            }
        },

        /**
         Update the UI with list of youtube videos inserted by user
         @method _populateManualList
         @params {Object} i_xSnippetYouTube
         **/
        _populateManualList: function (i_xSnippetYouTubeManualList) {
            var self = this;
            $(Elements.YOUTTUBE_VIDEOIDS).empty();
            var videoIDs = $(i_xSnippetYouTubeManualList).text();
            videoIDs = videoIDs.split(',');
            _.each(videoIDs, function (videoID) {
                var snippet = '<input class="' + BB.lib.unclass(Elements.CLASS_YOUTUBEVIDEOID) + ' form-control" value="' + videoID + '">';
                $(Elements.YOUTTUBE_VIDEOIDS).append(snippet);
            });
            self._listenVideoIdChange();
        },

        /**
         Populate the youtube video quality meter
         @method _populateQuality
         @param {Object} i_xSnippetYouTube
         **/
        _populateQuality: function (i_xSnippetYouTube) {
            var self = this;
            var volume = parseFloat(i_xSnippetYouTube.attr('volume')) * 100;
            $(Elements.YOUTUBE_VOLUME_WRAP_SLIDER).val(volume);
            var value = $(i_xSnippetYouTube).attr('quality');
            switch (value) {
                case 'small':
                {
                    value = 1;
                    break;
                }
                case 'medium':
                {
                    value = 2;
                    break;
                }
                case 'default':
                {
                    value = 3;
                    break;
                }
                case 'large':
                {
                    value = 4;
                    break;
                }
                case 'hd720':
                {
                    value = 5;
                    break;
                }
            }
            self.m_youtubeQualityMeter.setMeter(value);
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_YOUTUBE_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.CLASS_YOUTUBEVIDEOID).off("input", self.m_inputVideoIdChangeHandler);
            $(Elements.YOUTUBE_LIST_DROPDOWN).off('click', self.m_playlistChange);
            $(Elements.YOUTUBE_COUNTRY_LIST_DROPDOWN).off('click', self.m_countryListChange);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BAR_METER_CHANGED, self);
            BB.comBroker.stopListen(BB.EVENTS.YOUTUBE_VOLUME_CHANGED, self.m_inputVolumeHandler);
            self._deleteBlock();
        }
    });

    return BlockYouTube;
});