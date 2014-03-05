/**
 * BlockQR block resided inside a Scenes or timeline
 * @class BlockQR
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    var BlockQR = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            Block.prototype.constructor.call(this, options);
            var self = this;

            self.m_blockType = 3430;
            self.m_blockName = model.getComponent(self.m_blockType).name;
            self.m_blockDescription = model.getComponent(self.m_blockType).description;
            self.m_blockIcon = model.getComponent(self.m_blockType).icon;
            self.m_qrText = '';
            self.m_property.initSubPanel(Elements.BLOCK_QR_COMMON_PROPERTIES);
            self._listenInputChange();
        },

        /**
         When user changes QR text update msdb, we use xSavePlayerData
         as a json boilerplate that we append values to and save it in msdb as player_data
         @method _listenInputChange
         @return none
         **/
        _listenInputChange: function () {
            var self = this;
            var onChange = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();


                if ( BB.JalapenoHelper.isBlockPlayerDataEmpty(self.m_block_id) ) {
                    var xml = BB.JalapenoHelper.getPlayerDataBoilerplate(self.m_blockType);
                }




                var xsnipp = $(xml).find('Text').text(text);
                log(xsnipp[0].outerHTML);

                var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
                var xml = recBlock['player_data'];
                jalapeno.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xData);

                return;

                var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
                var xml = recBlock['player_data'];
                var x2js = BB.comBroker.getService('compX2JS');
                var jPlayerData = x2js.xml_str2json(xml);


                // Example of how to build player_data as json object and serialize back to XML for save
                var xSavePlayerData = {
                    Player: {
                        _player: 3430,
                        Data: {
                            Text: {
                                _textSource: 'static',
                                __text: text
                            }
                        },
                        _label: 'QR Code',
                        _interactive: '0'
                    }
                };
                var xData = x2js.json2xml_str(xSavePlayerData);
                jalapeno.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', xData);
            }, 150);

            self.m_inputChangeHandler = $(Elements.QR_TEXT).on("input", onChange);
        },

        /**
         Populate the QR block common properties panel
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this.m_property.viewSubPanel(Elements.BLOCK_QR_COMMON_PROPERTIES);
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;

            var recBlock = jalapeno.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
            var xml = recBlock['player_data'];
            var x2js = BB.comBroker.getService('compX2JS');
            var jPlayerData = x2js.xml_str2json(xml);

            if (jPlayerData["Player"]["Data"]["Text"]) {
                $(Elements.QR_TEXT).val(jPlayerData["Player"]["Data"]["Text"]["__text"]);
            } else {
                $(Elements.QR_TEXT).val(self.m_qrText);
            }
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            $(Elements.QR_TEXT).off('change', self.m_inputChangeHandler);
            self._deleteBlock();
        }

    });

    return BlockQR;
});