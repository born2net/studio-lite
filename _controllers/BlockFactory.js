/**
 factory to create blocks and block property
 @class BlockFactory
 @constructor
 @return {Object} instantiated BlockFactory
 **/
define(['jquery', 'backbone', 'X2JS'], function ($, Backbone, X2JS) {

    /**
     All blocks and related property modules loaded by require.js
     @event BLOCKS_LOADED
     @param {This} caller
     @static
     @final
     **/
    BB.EVENTS.BLOCKS_LOADED = 'BLOCKS_LOADED';

    /**
     block.PLACEMENT_SCENE indicates the insertion is inside a Scene
     @property Block.PLACEMENT_SCENE
     @static
     @final
     @type String
     */
    BB.CONSTS.PLACEMENT_SCENE = 'PLACEMENT_SCENE';

    /**
     block.PLACEMENT_CHANNEL indicates the insertion is on the timeline_channel
     @property Block.PLACEMENT_CHANNEL
     @static
     @final
     @type String
     */
    BB.CONSTS.PLACEMENT_CHANNEL = 'PLACEMENT_CHANNEL';

    BB.SERVICES.BLOCK_FACTORY = 'BlockFactory';

    var BlockFactory = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         @return {} Unique clientId.
         **/
        initialize: function () {
            var self = this;
            BB.comBroker.setService(BB.SERVICES['BLOCK_FACTORY'], self);
            self.x2js = new X2JS({escapeMode: true, attributePrefix: "_", arrayAccessForm: "none", emptyNodeForm: "text", enableToStringFunc: true, arrayAccessFormPaths: [], skipEmptyTextNodesForObj: true});
            BB.comBroker.setService('compX2JS', this.x2js);
        },

        /**
         Load all block modules via require js and fire event to subscribers when all loaded
         @method loadBlockModules
         **/
        loadBlockModules: function () {
            var self = this;
            require(['BlockProperties', 'Block', 'BlockRSS', 'BlockQR', 'BlockVideo', 'BlockImage'], function (BlockProperties, Block, BlockRSS, BlockQR, BlockVideo, BlockImage) {
                if (!self.m_blockProperties)
                    self.m_blockProperties = new BlockProperties({el: Elements.BLOCK_PROPERTIES});

                self.m_block = Block;
                self.m_blockRSS = BlockRSS;
                self.m_blockQR = BlockQR;
                self.m_blockVideo = BlockVideo;
                self.m_blockImage = BlockImage;

                BB.comBroker.fire(BB.EVENTS.BLOCKS_LOADED);
            });
        },

        /**
         This is factory method produces block instances which will reside on the timeline and referenced within this
         channel instance. The factory will parse the blockCode and create the appropriate block type.
         @method createBlock
         @param {Number} i_campaign_timeline_chanel_player_id
         @param {XML} i_playerData
         @return {Object} reference to the block instance
         **/
        createBlock: function (i_campaign_timeline_chanel_player_id, i_player_data, i_placement) {
            var self = this;
            var block = undefined;
            var playerData = this.x2js.xml_str2json(i_player_data);
            var blockCode = playerData['Player']['_player'];

            switch (parseInt(blockCode)) {
                case 3345:
                {
                    block = new self.m_blockRSS({
                        i_placement: i_placement,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
                case 3430:
                {
                    block = new self.m_blockQR({
                        i_placement: i_placement,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
                case 3100:
                {
                    block = new self.m_blockVideo({
                        i_placement: i_placement,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
                case 3130:
                {
                    block = new self.m_blockImage({
                        i_placement: i_placement,
                        i_block_id: i_campaign_timeline_chanel_player_id
                    });
                    break;
                }
            }
            return block;
        }
    });

    return BlockFactory;
});


