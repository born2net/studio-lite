/**
 This base class for all Blocks / players which reside on the timeline_channel or inside scenes.
 The base class implements basic timeline and scene interfaces including the management the properties UI.
 @class Block
 @constructor
 @param {string} i_placement indicates if the block is set to exist inside a timeline or inside a scene
 @param {string} i_block_id block / player id, only required if block inserted onto channel_timeline
 @return none
 **/
define(['jquery', 'backbone'], function ($) {

    /**
     event fires when scene block was changed so scene needs to be re-rendered
     @event Block.SCENE_BLOCK_CHANGE
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.SCENE_BLOCK_CHANGE = 'SCENE_BLOCK_CHANGE';

    /**
     event fires when scene blocks freshly re-rendered onto the scene canvas so we need to update the UI of ALL blocks
     normally occurs after a Block.SCENE_BLOCK_CHANGE event
     @event Block.SCENE_BLOCKS_RENDERED
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.SCENE_BLOCKS_RENDERED = 'SCENE_BLOCKS_RENDERED';

    /**
     event fires when block is selected
     @event Block.BLOCK_SELECTED
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.BLOCK_SELECTED = 'BLOCK_SELECTED';

    var Block = BB.Controller.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function (options) {
            var self = this;
            self.m_placement = options.i_placement;
            self.m_block_id = options.i_block_id;
            self.m_sceneID = options.i_scene_player_data_id;
            self.m_blockType = options.blockType;
            self.m_selected = false;
            self.m_blockName = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).name;
            self.m_blockDescription = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).description;
            self.m_blockIcon = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).icon;
            self.m_resourceID = undefined;
            self.m_blockProperty = BB.comBroker.getService(BB.SERVICES['BLOCK_PROPERTIES']);

            self._alphaListenChange();
            self._gradientListenChange();
            self._backgroundStateListenChange();
            self._listenBlockSelected();
            self._onBlockLengthChanged();
        },

        /**
         Init the sub properties panel for a block
         @method _initSubPanel
         @param {String} i_panel
         **/
        _initSubPanel: function (i_panel) {
            var self = this;
            self.m_blockProperty.initSubPanel(i_panel);
        },

        /**
         Bring into view a sub properties panel of this block
         @method _viewSubPanel
         @param {String} i_panel
         **/
        _viewSubPanel: function (i_panel) {
            var self = this;
            self.m_blockProperty.viewSubPanel(i_panel);
        },

        /**
         Listen to changes in Alpha UI properties selection and update msdb
         @method _alphaListenChange
         **/
        _alphaListenChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.ALPHA_CHANGED, self, function (e) {
                if (!self.m_selected)
                    return;
                var alpha = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var xSnippet = $(domPlayerData).find('Appearance');
                $(xSnippet).attr('alpha', alpha);
                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         On changes in msdb model updated UI common alpha properties
         @method _alphaPopulate
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _alphaPopulate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = $(domPlayerData).find('Appearance');
            var alpha = $(xSnippet).attr('alpha');
            alpha = parseFloat(alpha) * 100;
            $(Elements.BLOCK_ALPHA_SLIDER).val(alpha);
        },

        /**
         Enable gradient background UI
         @method _enableGradient
         **/
        _enableGradient: function () {
            var self = this;
            $(Elements.SHOW_BACKGROUND).prop('checked', true);
            $(Elements.BG_COLOR_GRADIENT_SELECTOR).show();
        },

        /**
         Disable gradient background UI
         @method _disableGradient
         **/
        _disableGradient: function () {
            var self = this;
            $(Elements.SHOW_BACKGROUND).prop('checked', false);
            $(Elements.BG_COLOR_GRADIENT_SELECTOR).hide();
        },

        /**
         Listen to change in background enable / disable states
         @method _backgroundStateListenChange
         **/
        _backgroundStateListenChange: function () {
            var self = this;
            var xSnippet = undefined;
            var xBgSnippet = undefined;

            self.m_toggleBackgroundColorHandler = function (e) {
                if (!self.m_selected)
                    return;

                var domPlayerData = self._getBlockPlayerData();
                var v = $(e.target).prop('checked') == true ? 1 : 0;
                if (v) {
                    self._enableGradient();
                    xBgSnippet = BB.PepperHelper.getCommonBackgroundXML();
                    var xmlString = (new XMLSerializer()).serializeToString(domPlayerData);
                    xmlString = xmlString.replace("<Appearance", xBgSnippet + "<Appearance");
                    domPlayerData = $.parseXML(xmlString);
                    self._gradientPopulate();
                    self._setBlockPlayerData(domPlayerData);
                } else {
                    self._disableGradient();
                    xSnippet = $(domPlayerData).find('Background');
                    $(xSnippet).remove();
                    self._setBlockPlayerData(domPlayerData);
                }
            };
            $(Elements.SHOW_BACKGROUND).on('click', self.m_toggleBackgroundColorHandler);
        },

        /**
         Update a block's player_data with new gradient background
         @method _gradientListenChange
         **/
        _gradientListenChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CHANGED, self, function (e) {
                if (!self.m_selected)
                    return;
                var points = e.edata.points;
                var styles = e.edata.styles;
                if (points.length == 0)
                    return;

                var domPlayerData = self._getBlockPlayerData();
                var gradientPoints = self._findGradientPoints(domPlayerData);
                $(gradientPoints).empty();
                var pointsXML = "";
                for (var i = 0; i < points.length; ++i) {
                    var pointMidpoint = (parseInt(points[i].position * 250));
                    var color = BB.lib.colorToDecimal(points[i].color);
                    var xPoint = '<Point color="' + color + '" opacity="1" midpoint="' + pointMidpoint + '" />';
                    // log(xPoint);
                    // $(gradientPoints).append(xPoint);
                    pointsXML += xPoint;
                }
                // $(domPlayerData).find('GradientPoints').html(pointsXML);
                var xmlString = (new XMLSerializer()).serializeToString(domPlayerData);
                xmlString = xmlString.replace(/<GradientPoints[ ]*\/>/, '<GradientPoints>' + pointsXML + '</GradientPoints>');
                domPlayerData = $.parseXML(xmlString);
                // return;
                self._setBlockPlayerData(domPlayerData, true);
            });
        },

        _findGradientPoints: function(i_domPlayerData){
            var self = this;
            var xSnippet = $(i_domPlayerData).find('GradientPoints');
            return xSnippet;
        },

        /**
         On changes in msdb model updated UI common gradient background properties
         @method _gradientPopulate
         @param {Number} i_playerData
         @return {Number} Unique clientId.
         **/
        _gradientPopulate: function () {
            var self = this;

            var gradient = $(Elements.BG_COLOR_GRADIENT_SELECTOR).data("gradientPicker-sel");
            // gradient.changeFillDirection("top"); /* change direction future support */
            gradient.removeAllPoints();
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = self._findGradientPoints(domPlayerData);
            if (xSnippet.length > 0) {
                self._enableGradient();
                var points = $(xSnippet).find('Point');
                $.each(points, function (i, point) {
                    var pointColor = BB.lib.decimalToHex($(point).attr('color'));
                    var pointMidpoint = (parseInt($(point).attr('midpoint')) / 250);
                    gradient.addPoint(pointMidpoint, pointColor, true);
                });
            } else {
                self._disableGradient();
            }
        },

        /**
         Notify this object that it has been selected so it can populate it's own the properties box etc
         The function triggers from the BLOCK_SELECTED event.
         @method _listenBlockSelected
         @return none
         **/
        _listenBlockSelected: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.BLOCK_SELECTED, self, function (e) {
                var blockID = e.edata;
                if (self.m_block_id != blockID) {
                    self.m_selected = false;
                    return;
                }
                self._onBlockSelected();
            });
        },

        _onBlockSelected: function () {
            var self = this;
            self.m_selected = true;
            self.m_blockProperty.viewPanel(Elements.BLOCK_PROPERTIES);
            self._updateTitle();
            self._updateTitleTab();
            self._alphaPopulate();
            self._gradientPopulate();

            log('block selected ' + self.m_block_id);

            switch (self.m_placement) {
                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    $(Elements.CHANNEL_BLOCK_PROPS).show();
                    $(Elements.SCENE_BLOCK_PROPS).hide();
                    self._updateBlockLength();
                    break;
                }

                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    $(Elements.CHANNEL_BLOCK_PROPS).hide();
                    $(Elements.SCENE_BLOCK_PROPS).show();
                    self._updateBlockDimensions();
                    break;
                }

                case BB.CONSTS.PLACEMENT_IS_SCENE:
                {
                    $(Elements.CHANNEL_BLOCK_PROPS).show();
                    $(Elements.SCENE_BLOCK_PROPS).hide();
                    self._updateBlockLength();
                    break;
                }
            }

            if (self._loadBlockSpecificProps)
                self._loadBlockSpecificProps();
        },

        /**
         Update the title of the block inside the assigned element.
         @method _updateTitle
         @return none
         **/
        _updateTitle: function () {
            var self = this;
            $(Elements.SELECTED_CHANNEL_RESOURCE_NAME).text(self.m_blockName);
        },

        /**
         Update the title of the selected tab properties element
         @method m_blockAcronym
         **/
        _updateTitleTab: function () {
            var self = this;
            self.m_blockAcronym = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).acronym;
            $(Elements.BLOCK_SUBPROPERTIES_TITLE).text(self.m_blockAcronym);
        },

        /**
         Update the length properties of the block with respect to position on the timeline_channel
         @method _updateBlockLength
         @return none
         **/
        _updateBlockLength: function () {
            var self = this;
            var lengthData;

            switch (self.m_placement) {
                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    lengthData = pepper.getBlockTimelineChannelBlockLength(self.m_block_id);
                    break;
                }
                case BB.CONSTS.PLACEMENT_IS_SCENE:
                {
                    lengthData = pepper.getSceneDuration(self.m_block_id);
                    break;
                }
            }
            $(Elements.BLOCK_LENGTH_HOURS).val(lengthData.hours).trigger('change');
            $(Elements.BLOCK_LENGTH_MINUTES).val(lengthData.minutes).trigger('change');
            $(Elements.BLOCK_LENGTH_SECONDS).val(lengthData.seconds).trigger('change');
        },

        /**
         Update the position of the block when placed inside a scene
         @method _updateBlockDimensions
         **/
        _updateBlockDimensions: function () {
            var self = this;
            var dimensionProps = BB.comBroker.getService(BB.SERVICES['DIMENSION_PROPS_LAYOUT']);
            var values = {
                y: self['canvasScale'] == 1 ? self.top : self.top * (1 / self['canvasScale']),
                x: self['canvasScale'] == 1 ? self.left : self.left * (1 / self['canvasScale']),
                w: self['canvasScale'] == 1 ? self.width : self.width * (1 / self['canvasScale']),
                h: self['canvasScale'] == 1 ? self.height : self.height * (1 / self['canvasScale']),
                a: self.angle
            };
            dimensionProps.setValues(values);
        },

        /**
         Take action when block length has changed which is triggered by the BLOCK_LENGTH_CHANGING event
         @method _onBlockLengthChanged
         @return none
         **/
        _onBlockLengthChanged: function () {
            var self = this;

            BB.comBroker.listenWithNamespace(BB.EVENTS.BLOCK_LENGTH_CHANGING, this, function (e) {

                if (self.m_selected) {

                    var hours = $(Elements.BLOCK_LENGTH_HOURS).val();
                    var minutes = $(Elements.BLOCK_LENGTH_MINUTES).val();
                    var seconds = $(Elements.BLOCK_LENGTH_SECONDS).val();
                    // log('upd: ' + self.m_block_id + ' ' + hours + ' ' + minutes + ' ' + seconds);

                    switch (e.caller) {
                        case 'blockLengthHours':
                        {
                            hours = e.edata;
                            break;
                        }
                        case 'blockLengthMinutes':
                        {
                            minutes = e.edata;
                            break;
                        }
                        case 'blockLengthSeconds':
                        {
                            seconds = e.edata;
                            break;
                        }
                    }
                    switch (self.m_placement) {
                        case BB.CONSTS.PLACEMENT_CHANNEL:
                        {
                            pepper.setBlockTimelineChannelBlockLength(self.m_block_id, hours, minutes, seconds);
                            break;
                        }
                        case BB.CONSTS.PLACEMENT_IS_SCENE:
                        {
                            log('upd: ' + self.m_block_id + ' ' + hours + ' ' + minutes + ' ' + seconds);
                            pepper.setSceneDuration(self.m_block_id, hours, minutes, seconds);
                            break;
                        }
                    }
                }
            });
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
                    pepper.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', player_data);
                    break;
                }
                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    pepper.setScenePlayerdataBlock(self.m_sceneID, self.m_block_id, player_data);
                    if (!i_quiet)
                        BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, self.m_block_id);
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
                    return $.parseXML(recBlock['player_data']);
                    break;
                }

                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    return pepper.getScenePlayerdataBlock(self.m_sceneID, self.m_block_id);
                    break;
                }
            }
        },

        /**
         Delete block is a private method that is always called regardless if instance has
         been inherited or not. Used for releasing memory for garbage collector.
         @method _deleteBlock
         @return none
         **/
        _deleteBlock: function () {
            var self = this;
            pepper.removeBlockFromTimelineChannel(self.m_block_id);

            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_SELECTED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_LENGTH_CHANGING, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CHANGED, self);
            $(Elements.SHOW_BACKGROUND).off('click', self.m_toggleBackgroundColorHandler);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.ALPHA_CHANGED, self);

            if (self.m_sceneSelectedHandler)
                self.m_canvas.off('object:selected', self.m_sceneSelectedHandler);

            $.each(self, function (k) {
                self[k] = undefined;
            });
        },

        /**
         Get block data as a json formatted object literal and return to caller
         @method getBlockData
         @return {object} data
         The entire block data members which can be made public
         **/
        getBlockData: function () {
            var self = this;
            var data = {
                blockID: self.m_block_id,
                blockType: self.m_blockType,
                blockName: self.m_blockName,
                blockDescription: self.m_blockDescription,
                blockIcon: self.m_blockIcon
            };
            return data;
        },

        /**
         Delete block is a public method used as fall back method, if not overridden by inherited instance.
         It is also a semi abstract method, all implementations should go into _deleteBlock();
         @method deleteBlock
         @return none
         **/
        deleteBlock: function () {
            /* semi-abstract, overridden, do not modify */
            var self = this;
            self._deleteBlock();
        }
    });

    return Block;
});