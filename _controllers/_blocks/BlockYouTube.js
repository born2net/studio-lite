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
            _.extend(options, {blockType: self.m_blockType});
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_YOUTUBE_COMMON_PROPERTIES);
            self.m_youtubeQualityMeter = self.m_blockProperty.getYouTubeQualityMeter();
            self._listenQualityChange();
            self._listenVolumeChange();
            self._listenPlaylistDropDownChange();
            self._listenCountryChange();
            self._listenVideoIdChange();
            self._listenAddVideoId();
        },

        /**
         Listen to when a video id change in input box
         @method _listenVideoIdChange
         **/
        _listenVideoIdChange: function () {
            var self = this;
            // remove previous listeners and create fresh one,
            // have to run before we override self.m_inputVideoIdChangeHandler
            if (self.m_inputVideoIdChangeHandler)
                $(Elements.CLASS_YOUTUBE_VIDEO_ID).off("input", self.m_inputVideoIdChangeHandler);
            self.m_inputVideoIdChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var videoList = [];
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('VideoIdList').remove();
                var xSnippetYouTubeManualList = $(domPlayerData).find('YouTube');
                $(Elements.YOUTTUBE_VIDEOIDS).find('input').each(function (i, elem) {
                    videoList.push($(elem).val());
                });
                videoList = videoList.join(',');
                $(xSnippetYouTubeManualList).append($('<VideoIdList>' + videoList + '</VideoIdList>'));
                self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
            }, 250, false);
            $(Elements.CLASS_YOUTUBE_VIDEO_ID).on("input", self.m_inputVideoIdChangeHandler);
        },

        /**
         Listen to removal of a video id from list
         @method self._listenVideoIdChange();
         **/
        _listenRemoveVideoId: function () {
            var self = this;
            // remove previous listeners and create fresh one,
            // have to run before we override self.m_removeVideoID
            if (self.m_removeVideoID)
                $(Elements.CLASS_YOUTUBE_VIDEO_ID_REMOVE).off('click', self.m_removeVideoID);
            self.m_removeVideoID = function (e) {
                if (!self.m_selected)
                    return;
                var videoID = $(e.target).siblings('input').val();
                $(e.target).siblings('input').remove();
                $(e.target).remove();
                var domPlayerData = self._getBlockPlayerData();
                var xYouTubeSnippet = $(domPlayerData).find('YouTube');
                var xVideoListSnippet = $(domPlayerData).find('VideoIdList');
                var videoIDs = $(xVideoListSnippet).text();
                videoIDs = videoIDs.split(',');
                $(xVideoListSnippet).remove();
                var index = _.indexOf(videoIDs, videoID);
                videoIDs.splice(index, 1);
                videoIDs = videoIDs.join(',');
                $(xYouTubeSnippet).append($('<VideoIdList>' + videoIDs + '</VideoIdList>'));
                self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
            };
            $(Elements.CLASS_YOUTUBE_VIDEO_ID_REMOVE).on('click', self.m_removeVideoID);
        },

        /**
         Listen to addition of video id to list
         @method _listenAddVideoId
         **/
        _listenAddVideoId: function () {
            var self = this;
            self.m_addVideoID = function (e) {
                if (!self.m_selected)
                    return;
                self._appendVideoIdInput('');
                self._listenRemoveVideoId();
                self._listenVideoIdChange();
            };
            $(Elements.YOUTUBE_LIST_ADD).on('click', self.m_addVideoID);
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
                self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
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
                    $(xSnippet).append($('<VideoIdList>9bZkp7q19f0</VideoIdList>'));
                    // have to look for videoislist as lower case due to .append $(x) inject case change
                    var xSnippetYouTubeManualList = $(domPlayerData).find('videoidlist');
                    self._populateManualList(xSnippetYouTubeManualList);
                } else {
                    $(xSnippet).find('VideoIdList').remove();
                }
                self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);

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
                self._setBlockPlayerData(pepper.xmlToStringIEfix(domPlayerData), BB.CONSTS.NO_NOTIFICATION, true);
            };
            BB.comBroker.listen(BB.EVENTS.YOUTUBE_VOLUME_CHANGED, self.m_inputVolumeHandler);
        },

        /**
         Listen to changes in volume control
         @method _listenVolumeChange
         **/
        _listenQualityChange: function () {
            var self = this;
            self.m_inputQualityHandler = function (e) {
                if (!self.m_selected)
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
            };
            BB.comBroker.listen(BB.EVENTS.YOUTUBE_METER_QUALITY_CHANGED, self.m_inputQualityHandler);
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
         @params {String} i_listType
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
                self._appendVideoIdInput(videoID);
            });
            self._listenVideoIdChange();
            self._listenRemoveVideoId();
        },

        /**
         Append a video id to the input list
         @method _appendVideoIdInput
         @param {String} i_videoId
         **/
        _appendVideoIdInput: function (i_videoId) {
            var self = this;
            var snippet = '<span><input class="' + BB.lib.unclass(Elements.CLASS_YOUTUBE_VIDEO_ID) + ' form-control" value="' + i_videoId + '"><i class="' + BB.lib.unclass(Elements.CLASS_YOUTUBE_VIDEO_ID_REMOVE) + ' fa fa-times"/></span>';
            $(Elements.YOUTTUBE_VIDEOIDS).append($(snippet));
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
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            $(Elements.CLASS_YOUTUBE_VIDEO_ID).off("input", self.m_inputVideoIdChangeHandler);
            $(Elements.YOUTUBE_LIST_DROPDOWN).off('click', self.m_playlistChange);
            $(Elements.YOUTUBE_COUNTRY_LIST_DROPDOWN).off('click', self.m_countryListChange);
            $(Elements.YOUTUBE_LIST_ADD).off('click', self.m_addVideoID);
            $(Elements.CLASS_YOUTUBE_VIDEO_ID_REMOVE).off('click', self.m_removeVideoID);
            BB.comBroker.stopListen(BB.EVENTS.YOUTUBE_METER_QUALITY_CHANGED, self.m_inputQualityHandler);
            BB.comBroker.stopListen(BB.EVENTS.YOUTUBE_VOLUME_CHANGED, self.m_inputVolumeHandler);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockYouTube;
});