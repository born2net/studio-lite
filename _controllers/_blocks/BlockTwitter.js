/**
 * BlockTwitter block resides inside a scene or timeline
 * @class BlockTwitter
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockTwitter = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 4500;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_TWITTER_COMMON_PROPERTIES);
            self._listenSceneListChange();
            self._listenScreenNameChange();
        },

        /**
         Populate the LI with all available scenes from msdb
         @method _render
         **/
        _render: function () {
            var self = this;
            $(Elements.TWITTER_DROPDOWN).empty();
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (i_name, i_id) {
                // var pseudoID = pepper.getPseudoIdFromSceneId(i_id);
                var snippet = '<li><a name="resource" data-localize="profileImage" role="menuitem" tabindex="-1" href="#" data-scene_id="' + i_id + '">' + i_name + '</a></li>';
                $(Elements.TWITTER_DROPDOWN).append($(snippet));
            });
        },

        /**
         Wire changing of campaign name through scene properties
         @method _listenScreenNameChange
         @return none
         **/
        _listenScreenNameChange: function () {
            var self = this;
            self.m_screenNameChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var screenName = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Twitter');
                $(xSnippet).attr('screenName', screenName);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 333, false);
            $(Elements.TWITTER_SCREEN_INPUT).on("input", self.m_screenNameChange);
        },

        _listenSceneListChange: function(){
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED,self, function(e){
                if (!self.m_selected)
                    return;
                self._render();
            })
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
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Twitter');
            var screenName = $(xSnippet).attr('screenName');
            $(Elements.TWITTER_SCREEN_INPUT).val(screenName);
            self._render();
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_TWITTER_COMMON_PROPERTIES);
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.TWITTER_SCREEN_INPUT).off("input", self.m_screenNameChange);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED,self);
            self._deleteBlock();
        }
    });

    return BlockTwitter;
});