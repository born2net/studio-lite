/**
 * BlockScene block resided inside a Scenes or Channel
 * @class BlockScene
 * @extends Block
 * @constructor
 * @param {string} i_placement location where objects resides which can be scene or timeline
 * @param {string} i_campaign_timeline_chanel_player_id required and set as block id when block is inserted onto timeline_channel
 * @return {Object} Block instance
 */
define(['jquery', 'backbone', 'Block'], function ($, Backbone, Block) {

    /**
     Custom event fired when a new scene background color changed
     @event SCENE_BG_COLOR_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event} color
     @static
     @final
     **/
    BB.EVENTS.SCENE_BG_COLOR_CHANGED = 'SCENE_BG_COLOR_CHANGED';
    /**
     event fires when scene the scene width or height modified by user
     @event Block.SCENE_BLOCK_DIMENSIONS_CHANGE
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.SCENE_BLOCK_DIMENSIONS_CHANGE = 'SCENE_BLOCK_DIMENSIONS_CHANGE';

    var BlockScene = Block.extend({

        /**
         Constructor
         @method initialize
         **/
        constructor: function (options) {
            var self = this;
            self.m_blockType = 3510;
            _.extend(options, {blockType: self.m_blockType})
            Block.prototype.constructor.call(this, options);
            self._initSubPanel(Elements.BLOCK_SCENE_COMMON_PROPERTIES);
            self._listenInputChanges();
            self._listenBgColorChanges();
            self.m_canvas = undefined;
        },

        /**
         set player data for a scene
         @Override
         @method setPlayerData
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        getBlockData: function () {
            var self = this;
            var data = Block.prototype.getBlockData.call(this);
            var domPlayerData = self._getBlockPlayerData();
            data.blockName = $(domPlayerData).find('Player').eq(0).attr('label');
            return data;
        },

        /**
         Enable gradient background UI
         @method _enableBgSelection
         **/
        _enableBgSelection: function () {
            var self = this;
            $(Elements.SHOW_BACKGROUND).prop('checked', true);
            $(Elements.BG_COLOR_SOLID_SELECTOR).show();
            $(Elements.BG_COLOR_GRADIENT_SELECTOR).hide();
            self._populateSceneBgPropColorPicker();
        },

        /**
         Set the color picker color of scene background
         @method setbgSceneSetPropColorPicker
         @param {Number} i_color
         **/
        _populateSceneBgPropColorPicker: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xPoints = self._findGradientPoints(domPlayerData);
            var color = $(xPoints).find('Point').attr('color');
            if (_.isUndefined(color))
                color = '16777215';
            color = '#' + BB.lib.decimalToHex(color);
            log(color);
            self.m_blockProperty.setBgScenePropColorPicker(color);
        },

        /**
         Listen to changes in scene background color selection
         @method _listenBgColorChanges
         **/
        _listenBgColorChanges: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.SCENE_BG_COLOR_CHANGED, self, function (e) {
                var color = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xPoints = self._findGradientPoints(domPlayerData);
                $(xPoints).find('Point').attr('color', BB.lib.hexToDecimal(color));
                self._setBlockPlayerData(domPlayerData);

                if ( self.m_placement == BB.CONSTS.PLACEMENT_IS_SCENE )
                    self._populateSceneBg();
            });
        },

        /**
         When user changes a URL link for the feed, update the msdb
         @method _listenInputChange
         @return none
         **/
        _listenInputChanges: function () {
            var self = this;

            // Scene name
            self.m_inputNameChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var text = $(e.target).val();
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Player').eq(0).attr('label', text);
                self._setBlockPlayerData(domPlayerData, true);
                if (BB.EVENTS['SCENE_LIST_UPDATED'])
                    BB.comBroker.fire(BB.EVENTS['SCENE_LIST_UPDATED'], this);
            }, 200);
            $(Elements.SCENE_NAME_INPUT).on("input", self.m_inputNameChangeHandler);

            // Scene width
            self.m_inputWidthChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if (parseFloat($(e.target).val()) < 100)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Layout').eq(0).attr('width', $(e.target).val());
                self._setBlockPlayerData(domPlayerData, true);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_DIMENSIONS_CHANGE'], self, null, self.m_block_id);
            }, 200);
            $(Elements.SCENE_WIDTH_INPUT).on("blur", self.m_inputWidthChangeHandler);

            // Scene height
            self.m_inputHeightChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                if (parseFloat($(e.target).val()) < 100)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Layout').eq(0).attr('height', $(e.target).val());
                self._setBlockPlayerData(domPlayerData, true);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_DIMENSIONS_CHANGE'], self, null, self.m_block_id);
            }, 200);
            $(Elements.SCENE_HEIGHT_INPUT).on("blur", self.m_inputHeightChangeHandler);
        },

        /**
         Update the msdb for the block with new values inside its player_data
         @method _setBlockPlayerData
         @param {Object} i_xmlDoc
         **/
        _setBlockPlayerData: function (i_xmlDoc, i_quiet) {
            var self = this;
            var player_data = (new XMLSerializer()).serializeToString(i_xmlDoc);
            switch (self.m_placement) {
                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    var recBlock = pepper.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
                    var domPlayerData = $.parseXML(recBlock['player_data']);
                    var scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
                    var player_data = (new XMLSerializer()).serializeToString(i_xmlDoc);
                    pepper.setScenePlayerData(scene_id, player_data);
                    break;
                }

                case BB.CONSTS.PLACEMENT_IS_SCENE:
                {
                    pepper.setScenePlayerData(self.m_block_id, player_data);
                    if (!i_quiet)
                        BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, self.m_block_id);
                    break;
                }
            }
        },

        /**
         Get the XML player data of a block, depending where its placed
         @Override
         @method _getBlockPlayerData
         @return {Object} player data of block (aka player) parsed as DOM
         **/
        _getBlockPlayerData: function () {
            var self = this;
            var recBlock = undefined;

            switch (self.m_placement) {

                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    recBlock = pepper.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
                    var domPlayerData = $.parseXML(recBlock['player_data']);
                    var sceneHandle = $(domPlayerData).find('Player').attr('hDataSrc');
                    return pepper.getScenePlayerdataDom(sceneHandle);
                    break;
                }

                case BB.CONSTS.PLACEMENT_IS_SCENE:
                {
                    var blockID = pepper.getSceneIdFromPseudoId(self.m_block_id);
                    var recPlayerData = BB.Pepper.getScenePlayerRecord(blockID);
                    var xPlayerdata = recPlayerData['player_data_value'];
                    return $.parseXML(xPlayerdata);
                    break;
                }
            }
        },

        /**
         Find the border section in player_data for selected block
         @method
         @method _findBorder
         @param  {object} i_domPlayerData
         @return {Xml} xSnippet
         **/
        _findBorder: function (i_domPlayerData) {
            var self = this;
            var xSnippet = $(i_domPlayerData).find('Layout').eq(0).siblings().filter('Border');
            return xSnippet;
        },

        /**
         Find the background section in player_data for selected block
         @Override
         @method _findBackground
         @param  {object} i_domPlayerData
         @return {Xml} xSnippet
         **/
        _findBackground: function (i_domPlayerData) {
            var self = this;
            var xSnippet = $(i_domPlayerData).find('Layout').eq(0).siblings().filter('Background');
            return xSnippet;
        },

        /**
         Find the gradient blocks in player_data for selected scene block
         @Override
         @method _findGradientPoints
         @param  {object} i_domPlayerData
         @return {Xml} xSnippet
         **/
        _findGradientPoints: function (i_domPlayerData) {
            var self = this;
            var xBackground = $(i_domPlayerData).find('Layout').eq(0).siblings().filter('Background');
            var xSnippet = $(xBackground).find('GradientPoints').eq(0);
            return xSnippet;
        },

        /**
         Load up property values in the common panel
         @method _populate
         @return none
         **/
        _populate: function () {
            var self = this;

            switch (self.m_placement) {
                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    $(Elements.SCENE_WIDTH_INPUT).hide();
                    $(Elements.SCENE_HEIGHT_INPUT).hide();
                    var domPlayerData = self._getBlockPlayerData();
                    var domPlayer = $(domPlayerData).find('Player').eq(0);
                    var domPlayerLayout = $(domPlayerData).find('Player').eq(0).find('Layout');
                    $(Elements.SCENE_NAME_INPUT).val($(domPlayer).attr('label'));
                    break;
                }

                case BB.CONSTS.PLACEMENT_IS_SCENE:
                {
                    $(Elements.SCENE_WIDTH_INPUT).show();
                    $(Elements.SCENE_HEIGHT_INPUT).show();
                    $(Elements.SCENE_WIDTH_INPUT).val($(domPlayerLayout).attr('width'));
                    $(Elements.SCENE_HEIGHT_INPUT).val($(domPlayerLayout).attr('height'));
                    var domPlayerData = self._getBlockPlayerData();
                    var domPlayer = $(domPlayerData).find('Player').eq(0);
                    var domPlayerLayout = $(domPlayerData).find('Player').eq(0).find('Layout');
                    $(Elements.SCENE_NAME_INPUT).val($(domPlayer).attr('label'));
                    $(Elements.SCENE_WIDTH_INPUT).val($(domPlayerLayout).attr('width'));
                    $(Elements.SCENE_HEIGHT_INPUT).val($(domPlayerLayout).attr('height'));
                    self._populateSceneBg();
                    break;
                }
            }
        },

        /**
         Populate the common block properties panel, called from base class if exists
         @method _loadBlockSpecificProps
         @return none
         **/
        _loadBlockSpecificProps: function () {
            var self = this;
            self._populate();
            this._viewSubPanel(Elements.BLOCK_SCENE_COMMON_PROPERTIES);
        },

        /**
         Set a scene's background solid color
         @method _populateSceneBg
         **/
        _populateSceneBg: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var colorPoints = self._findGradientPoints(domPlayerData)
            var color = $(colorPoints).find('Point').attr('color');
            if (_.isUndefined(color))
                color = '16777215';
            color = '#' + BB.lib.decimalToHex(color);
            if (self.m_canvas.backgroundColor == color)
                return;
            self.m_canvas.setBackgroundColor(color, function(){});
            self.m_canvas.renderAll();
        },

        _toggleBackgroundColorHandler: function (e) {
            var self = this;
            Block.prototype._toggleBackgroundColorHandler.call(this, e);
            if (self.m_placement == BB.CONSTS.PLACEMENT_IS_SCENE)
                self._populateSceneBg();
        },

        /**
         Set reference to managed canvas
         @method setCanvas
         @param  {object} i_canvas
         **/
        setCanvas: function (i_canvas) {
            var self = this;
            self.m_canvas = i_canvas;
            self._populateSceneBg();
        },

        /**
         Delete this block
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            var self = this;
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_BG_COLOR_CHANGED, self);
            $(Elements.SCENE_NAME_INPUT).off("input", self.m_inputNameChangeHandler);
            $(Elements.SCENE_WIDTH_INPUT).off("input", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_WIDTH_INPUT).off("blur", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_HEIGHT_INPUT).off("blur", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_HEIGHT_INPUT).off("input", self.m_inputHeightChangeHandler);
            self._deleteBlock();
        }
    });

    return BlockScene;
});