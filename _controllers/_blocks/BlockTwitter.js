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
            self._listenSceneDropdownChange();
            self._listenIntervalChange();
        },

        /**
         Populate the LI with all available scenes from msdb
         @method _populateSceneDropdowb
         **/
        _populateSceneDropdowb: function () {
            var self = this;
            $(Elements.TWITTER_DROPDOWN).empty();
            var scenenames = BB.Pepper.getSceneNames();
            if (_.size(scenenames) == 0)
                return;
            _.forEach(scenenames, function (i_name, i_id) {
                // var pseudoID = pepper.getPseudoIdFromSceneId(i_id);
                var snippet = '<li><a name="resource" data-localize="profileImage" role="menuitem" tabindex="-1" href="#" data-scene_id="' + i_id + '">' + i_name.label + '</a></li>';
                $(Elements.TWITTER_DROPDOWN).append($(snippet));
            });
        },

        /**
         Populate the UI of the scene label selector
         @method _populateSceneLabel
         @param {Number} i_sceneName
         **/
        _populateSceneLabel: function(i_sceneName){
            var self = this;
            $(Elements.TWITTER_SCENE_LIST).text(i_sceneName);
        },

        /**
         Populate the UI of the scene interval selector
         @method _populateInterval
         @param {Number} i_interval
         **/
        _populateInterval: function(i_interval){
            var self = this;
            var interval = Number(i_interval);
            $('.spinner', Elements.BLOCK_TWITTER_COMMON_PROPERTIES).spinner('value', interval);
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
            var xSnippetPlayer = $(xSnippet).find('Player');
            var sceneID = $(xSnippetPlayer).attr('hDataSrc');
            var interval = $(xSnippet).attr('itemInterval');

            if (_.isEmpty(sceneID)){
                self._populateSceneLabel($(Elements.BOOTBOX_SELECT_SCENE).text());
            } else {
                var scenenames = BB.Pepper.getSceneNames();
                _.forEach(scenenames, function (i_name, i_id) {
                    if (i_id == sceneID)
                        self._populateSceneLabel(i_name.label);
                });
            }
            $(Elements.TWITTER_SCREEN_INPUT).val(screenName);
            self._populateSceneDropdowb();
            self._populateSceneLabel();
            self._populateInterval(interval);
        },

        /**
         Listen to changes in the scene interval control
         @method _listenIntervalChange
         **/
        _listenIntervalChange: function(){
            var self = this;
            $('.spinner', Elements.BLOCK_TWITTER_COMMON_PROPERTIES).spinner({value: 4, min: 1, max: 9999, step: 1});
            $(Elements.TWITTER_INTERVAL_INPUT).prop('disabled', true).css({backgroundColor: 'transparent'});
            self.m_intervalInput = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if ($(e.target).prop("tagName") == 'INPUT')
                    return;
                var interval = $(Elements.TWITTER_INTERVAL_INPUT).val();
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Twitter');
                $(xSnippet).attr('itemInterval', interval);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            }, 250, false);
            //$(Elements.TWITTER_SCREEN_INPUT).on("input", self.m_screenNameChange);
            $('.spinner', Elements.BLOCK_TWITTER_COMMON_PROPERTIES).on('mouseup', self.m_intervalInput);
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

        /**
         Listen to the global scene list changes event so we can update the list of available scenes
         @method _listenSceneListChange
         **/
        _listenSceneListChange: function(){
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED,self, function(e){
                if (!self.m_selected)
                    return;
                self._populateSceneDropdowb();
            })
        },

        /**
         Listen to playlist changes dropdown
         @method _listenSceneDropdownChange
         **/
        _listenSceneDropdownChange: function () {
            var self = this;
            self.m_bindScene = function (e) {
                if (!self.m_selected)
                    return;
                var listType = $(e.target).attr('name');
                if (_.isUndefined(listType))
                    return;
                var sceneName = $(e.target).text();
                var sceneID = $(e.target).attr('data-scene_id');
                self._populateSceneLabel(sceneName);
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Twitter');
                var xSnippetPlayer = $(xSnippet).find('Player');
                $(xSnippetPlayer).attr('hDataSrc', sceneID);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);

            };
            $(Elements.TWITTER_DROPDOWN).on('click', self.m_bindScene);
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
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            $('.spinner', Elements.BLOCK_TWITTER_COMMON_PROPERTIES).off('mouseup', self.m_intervalInput);
            $(Elements.TWITTER_DROPDOWN).off('click', self.m_bindScene);
            $(Elements.TWITTER_SCREEN_INPUT).off("input", self.m_screenNameChange);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_LIST_UPDATED,self);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockTwitter;
});