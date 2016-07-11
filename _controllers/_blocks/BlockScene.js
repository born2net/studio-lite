/**
 * BlockScene represents the Scene which resided inside a channel
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
            self.m_gridMagneticMode = 0;
        },

        /**
         Override Update the title of the scene block inside the assigned element.
         @override _updateTitle
         @return none
         **/
        _updateTitle: function () {
            var self = this;
            var sceneMime = BB.Pepper.getSceneMime(self.m_block_id);
            if (_.isUndefined(sceneMime) || sceneMime == '') {
                $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text(self.m_blockName);
                return;
            }
            $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text('Scene type: ' + sceneMime.split('.')[1]);
        },


        /**
         set player data for a scene
         @Override
         @method getPlayerData
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
            self.m_blockProperty.setBgScenePropColorPicker(color);
        },

        /**
         Listen to changes in scene background color selection
         @method _listenBgColorChanges
         **/
        _listenBgColorChanges: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.SCENE_BG_COLOR_CHANGED, self, function (e) {
                if (!self.m_selected)
                    return;
                var color = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xPoints = self._findGradientPoints(domPlayerData);
                $(xPoints).find('Point').attr('color', BB.lib.hexToDecimal(color));
                self._setBlockPlayerData(domPlayerData);

                if (self.m_placement == BB.CONSTS.PLACEMENT_IS_SCENE)
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
                text = BB.lib.cleanProbCharacters(text, 1);
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).find('Player').eq(0).attr('label', text);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                BB.comBroker.fire(BB.EVENTS.SCENE_LIST_UPDATED, this);
            }, 200);
            $(Elements.SCENE_NAME_INPUT).on("input", self.m_inputNameChangeHandler);

            self.m_inputChangeHandler = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                var w1 = parseFloat($(Elements.SCENE_WIDTH_INPUT).val());
                var h1 = parseFloat($(Elements.SCENE_HEIGHT_INPUT).val());
                var w2 = parseFloat($(domPlayerData).find('Layout').eq(0).attr('width'));
                var h2 = parseFloat($(domPlayerData).find('Layout').eq(0).attr('height'));
                if (w1 < 100 || h1 < 100 || _.isNaN(w1) || _.isNaN(h1))
                    return;
                if (w1 == w2 && h1 == h2)
                    return;
                $(domPlayerData).find('Layout').eq(0).attr('width', w1);
                $(domPlayerData).find('Layout').eq(0).attr('height', h1);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_DIMENSIONS_CHANGE'], self, null, self.m_block_id);
            }, 333);
            $(Elements.DIMENSION_APPLY_SCENE).on('click', self.m_inputChangeHandler);
        },

        /**
         Update the msdb for the block with new values inside its player_data
         @method _setBlockPlayerData
         @param {Object} i_xmlDoc
         **/
        _setBlockPlayerData: function (i_xmlDoc, i_noNotify) {
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
                    //if (!i_noNotify)
                    //    self._announceBlockChanged();
                    break;
                }
            }
        },

        /**
         Override the base method so we never announce any changes on Scene block
         @method _announceBlockChanged
         **/
        _announceBlockChanged: function () {
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
                    $(Elements.DIMENSION_APPLY_SCENE).hide();
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
                    $(Elements.DIMENSION_APPLY_SCENE).show();
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
         Add the checkers background to a scene
         @method _applySceneBgImage
         @param {String} i_image
         **/
        _applySceneBgImage: function (i_image) {
            var self = this;
            self.m_canvas.setBackgroundColor('', self.m_canvas.renderAll.bind(self.m_canvas));
            $(Elements.SCENE_CANVAS_CONTAINER).find('.canvas-container').removeClass('checkers').removeClass('grid25').removeClass('grid50').addClass(i_image);
            self.m_canvas.renderAll();
        },

        /**
         Set a scene's background color or image
         @method _populateSceneBg
         **/
        _populateSceneBg: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var colorPoints = self._findGradientPoints(domPlayerData)
            var color = $(colorPoints).find('Point').attr('color');

            switch (self.m_gridMagneticMode) {
                case 0:
                {
                    if (_.isUndefined(color)) {
                        self._applySceneBgImage('checkers');
                        return;
                    }
                    color = '#' + BB.lib.decimalToHex(color);
                    if (self.m_canvas.backgroundColor == color)
                        return;
                    self.m_canvas.setBackgroundColor(color, function () {
                    });
                    self.m_canvas.renderAll();
                    break;
                }
                case 1:
                {
                    self._applySceneBgImage('grid25');
                    break;
                }
                case 2:
                {
                    self._applySceneBgImage('grid50');
                    break;
                }
            }
        },

        /**
         Toggle block background on UI checkbox selection
         @Override
         @method _toggleBackgroundColorHandler
         @param {event} e
         **/
        _toggleBackgroundColorHandler: function (e) {
            var self = this;
            $(Elements.SCENE_CANVAS_CONTAINER).find('.canvas-container').removeClass('checkers');
            Block.prototype._toggleBackgroundColorHandler.call(this, e);
            if (self.m_placement == BB.CONSTS.PLACEMENT_IS_SCENE)
                self._populateSceneBg();
        },

        /**
         Set reference to managed canvas
         @method setCanvas
         @param  {Object} i_canvas
         @param  {Number} i_magneticGridMode
         **/
        setCanvas: function (i_canvas, i_magneticGridMode) {
            var self = this;
            self.m_canvas = i_canvas;
            self.m_gridMagneticMode = i_magneticGridMode;
            self._populateSceneBg();
        },

        /**
         Get the scene id that's associated with this block given that it resides in a timeline > channel
         @method getChannelBlockSceneID
         @return {Number} scene_id;
         **/
        getChannelBlockSceneID: function () {
            var self = this;
            var recBlock = pepper.getCampaignTimelineChannelPlayerRecord(self.m_block_id);
            var domPlayerData = $.parseXML(recBlock['player_data']);
            var scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
            return scene_id;
        },

        /**
         Delete this block
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         **/
        deleteBlock: function (i_memoryOnly) {
            var self = this;
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_BG_COLOR_CHANGED, self);
            $(Elements.SCENE_NAME_INPUT).off("input", self.m_inputNameChangeHandler);
            $(Elements.SCENE_WIDTH_INPUT).off("input", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_WIDTH_INPUT).off("blur", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_HEIGHT_INPUT).off("blur", self.m_inputWidthChangeHandler);
            $(Elements.SCENE_HEIGHT_INPUT).off("input", self.m_inputHeightChangeHandler);
            self._deleteBlock(i_memoryOnly);
        }
    });

    return BlockScene;
});