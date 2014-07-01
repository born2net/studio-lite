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

    /**
     block.PLACEMENT_IS_SCENE indicates the insertion is itself a Scene
     @property Block.PLACEMENT_IS_SCENE
     @static
     @final
     @type String
     */
    BB.CONSTS.PLACEMENT_IS_SCENE = 'PLACEMENT_IS_SCENE';


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
            require(['BlockProperties', 'Block', 'BlockScene', 'BlockRSS', 'BlockQR', 'BlockVideo', 'BlockImage', 'BlockExtImage', 'BlockExtVideo', 'BlockMRSS', 'BlockHTML', 'BlockLabel', 'BlockClock'  ], function (BlockProperties, Block, BlockScene, BlockRSS, BlockQR, BlockVideo, BlockImage, BlockExtImage, BlockExtVideo, BlockMRSS, BlockHTML, BlockLabel, BlockClock) {
                if (!self.m_blockProperties)
                    self.m_blockProperties = new BlockProperties({el: Elements.BLOCK_PROPERTIES});

                self.m_block = Block;
                self.m_blockScene = BlockScene;
                self.m_blockRSS = BlockRSS;
                self.m_blockQR = BlockQR;
                self.m_blockVideo = BlockVideo;
                self.m_blockImage = BlockImage;
                self.m_blockExtImage = BlockExtImage;
                self.m_blockExtVideo = BlockExtVideo;
                self.m_blockMRSS = BlockMRSS;
                self.m_blockHTML = BlockHTML;
                self.m_blockLabel = BlockLabel;
                self.m_blockClock = BlockClock;

                BB.comBroker.fire(BB.EVENTS.BLOCKS_LOADED);
            });
        },

        /**
         This is factory method produces block instances which will reside on the timeline and referenced within this
         channel instance. The factory will parse the blockCode and create the appropriate block type.
         @method createBlock
         @param {Number} block_id
         @param {String} i_playerData
         @param {String} i_placement where does the block reside, scene or channel
         @param {Number} i_scene_id
         @return {Object} reference to the block instance
         **/
        createBlock: function (block_id, i_player_data, i_placement, i_scene_id) {
            var self = this;
            var block = undefined;
            var playerData = this.x2js.xml_str2json(i_player_data);
            var blockCode;
            if (playerData['Player']['_player']) {
                // Standard block
                blockCode = playerData['Player']['_player'];
            } else {
                // Scene
                blockCode = 3510;
                if (_.isUndefined(i_scene_id)){
                    var domPlayerData = $.parseXML(i_player_data);
                    i_scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
                }
            }


            switch (parseInt(blockCode)) {
                case 3510:
                {
                    block = new self.m_blockScene({
                        i_placement: i_placement,
                        i_block_id: block_id
                    });
                    break;
                }
                case 3345:
                {
                    block = new self.m_blockRSS({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3430:
                {
                    block = new self.m_blockQR({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3100:
                {
                    block = new self.m_blockVideo({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3130:
                {
                    block = new self.m_blockImage({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3160:
                {
                    block = new self.m_blockExtImage({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3150:
                {
                    block = new self.m_blockExtVideo({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3320:
                {
                    block = new self.m_blockClock({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3235:
                {
                    block = new self.m_blockHTML({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3241:
                {
                    block = new self.m_blockLabel({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
                case 3340:
                {
                    block = new self.m_blockMRSS({
                        i_placement: i_placement,
                        i_block_id: block_id,
                        i_scene_player_data_id: i_scene_id
                    });
                    break;
                }
            }
            return block;
        },

        /**
         Get the status of modules, i.e.: loaded yet?
         @method blocksLoaded
         **/
        blocksLoaded: function(){
            var self = this;
            if (self.m_block)
                return true;
            return false;
        }
    });

    return BlockFactory;
});


