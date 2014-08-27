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
        },

        /**
         Listen to changes in volume control
         @method _listenVolumeChange
         **/
        _listenVolumeChange: function(){
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

                switch(value){
                    case 1: {
                        value = 'small';
                        break;
                    }
                    case 2: {
                        value = 'medium';
                        break;
                    }
                    case 3: {
                        value = 'default';
                        break;
                    }
                    case 4: {
                        value = 'large';
                        break;
                    }
                    case 5: {
                        value = 'hd720';
                        break;
                    }
                }
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('YouTube').attr('quality',value);
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
            var volume = parseFloat(xSnippetYouTube.attr('volume')) * 100;
            $(Elements.YOUTUBE_VOLUME_WRAP_SLIDER).val(volume);
            var value = $(domPlayerData).find('YouTube').attr('quality');
            switch(value){
                case 'small': {
                    value = 1;
                    break;
                }
                case 'medium': {
                    value = 2;
                    break;
                }
                case 'default': {
                    value = 3;
                    break;
                }
                case 'large': {
                    value = 4;
                    break;
                }
                case 'hd720': {
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
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BAR_METER_CHANGED, self);
            BB.comBroker.stopListen(BB.EVENTS.YOUTUBE_VOLUME_CHANGED, self.m_inputVolumeHandler);
            self._deleteBlock();
        }
    });

    return BlockYouTube;
});