/**
 This base class for all the Blocks / players which reside on the timeline_channel or inside scenes.
 The base class implements basic timeline and scene interfaces including the management the properties UI.
 @class Block
 @constructor
 @param {string} i_placement indicates if the block is set to exist inside a timeline or inside a scene
 @param {string} i_block_id block / player id, only required if block inserted onto channel_timeline
 @return none
 **/
define(['jquery', 'backbone'], function ($) {

    /**
     Quiet mode, don't announce
     @property BB.CONSTS.NO_NOTIFICATION
     @static
     @final
     @type String
     */
    BB.CONSTS.NO_NOTIFICATION = true;

    /**
     event fires when scene block was changed so scene needs to be re-rendered
     @event Block.SCENE_BLOCK_CHANGE
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.SCENE_BLOCK_CHANGE = 'SCENE_BLOCK_CHANGE';

    /**
     event fires when block border changed so scene needs to be re-rendered
     @event Block.BLOCK_BORDER_CHANGE
     @param {this} caller
     @param {String} selected block_id
     **/
    BB.EVENTS.BLOCK_BORDER_CHANGE = 'BLOCK_BORDER_CHANGE';

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

    /**
     Custom event fired when a block state changes
     @event LOCK_CHANGED
     @param {This} caller
     @param {Self} context caller
     @param {Event}
     @static
     @final
     **/
    BB.EVENTS.LOCK_CHANGED = 'LOCK_CHANGED';

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
            self.m_zIndex = -1;
            self.m_minSize = {w: 50, h: 50};
            self.m_blockName = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).name;
            self.m_blockAcronym = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).acronym;
            self.m_blockDescription = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).description;
            self.m_blockIcon = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).icon;
            self.m_blockFontAwesome = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).fontAwesome;
            self.m_blockSvg = BB.PepperHelper.getBlockBoilerplate(self.m_blockType).svg;
            self.m_resourceID = undefined;
            self.m_blockProperty = BB.comBroker.getService(BB.SERVICES['BLOCK_PROPERTIES']);

            self._listenAlphaChange();
            self._listenToggleLock();
            self._listenGradientChange();
            self._listenGradientColorPickerClosed();
            self._listenBackgroundStateChange();
            self._listenBorderStateChange();
            self._listenBorderColorChange();
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
         On changes in msdb model updated UI common lock properties
         @method _fabricLock
         **/
        _fabricLock: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var locked = $(domPlayerData).attr('locked');
            if (_.isUndefined(locked) || locked == '0') {
                locked = false;
            } else {
                locked = true;
            }
            self.lockMovementX = locked;
            self.lockMovementY = locked;
            //self.lockScalingX = locked; self.lockScalingY = locked; self.lockUniScaling = locked; self.lockRotation = locked;
            if (!self.m_selected)
                return;
            var dimensionProps = BB.comBroker.getService(BB.SERVICES['DIMENSION_PROPS_LAYOUT']);
            if (_.isUndefined(dimensionProps))
                return;
            dimensionProps.setLock(locked);
        },

        /**
         Toggle lock status
         @method _toggleLock
         **/
        _listenToggleLock: function () {
            var self = this;
            self._toggleLock = function (e) {
                if (!self.m_selected)
                    return;
                self.lockMovementX = e.edata;
                self.lockMovementY = e.edata;
                //self.lockScalingX = e.edata; self.lockScalingY = e.edata; self.lockUniScaling = e.edata; self.lockRotation = e.edata;
                var v = e.edata == true ? 1 : 0;
                var domPlayerData = self._getBlockPlayerData();
                $(domPlayerData).attr('locked', v);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            };
            BB.comBroker.listenWithNamespace(BB.EVENTS.LOCK_CHANGED, self, self._toggleLock);
        },


        /**
         Listen to changes in Alpha UI properties selection and update msdb
         @method _listenAlphaChange
         **/
        _listenAlphaChange: function () {
            var self = this;
            self._alphaChanged = _.debounce(function (e) {
                if (!self.m_selected)
                    return;
                var alpha = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var data = $(domPlayerData).find('Data').eq(0);
                var xSnippet = $(data).find('Appearance').eq(0);
                $(xSnippet).attr('alpha', alpha);
                self._setBlockPlayerData(domPlayerData);
            }, 100);
            BB.comBroker.listenWithNamespace(BB.EVENTS.ALPHA_CHANGED, self, self._alphaChanged);
        },

        /**
         On changes in msdb model updated UI common alpha properties
         @method _alphaPopulate
         **/
        _alphaPopulate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var data = $(domPlayerData).find('Data').eq(0);
            var xSnippet = $(data).find('Appearance').eq(0);
            var alpha = $(xSnippet).attr('alpha');
            alpha = parseFloat(alpha) * 100;
            $(Elements.BLOCK_ALPHA_SLIDER).val(alpha);
        },

        /**
         Enable gradient background UI
         @method _enableBgSelection
         **/
        _enableBgSelection: function () {
            var self = this;
            $(Elements.SHOW_BACKGROUND).prop('checked', true);
            $(Elements.BG_COLOR_SOLID_SELECTOR).hide();
            $(Elements.BG_COLOR_GRADIENT_SELECTOR).show();
        },

        /**
         Enable gradient background UI
         @method _enableBgSelection
         **/
        _enableBorderSelection: function () {
            var self = this;
            $(Elements.SHOW_BORDER).prop('checked', true);
            $(Elements.BLOCK_BORDER_WRAP).show();
        },

        /**
         On changes in msdb model updated UI common gradient background properties
         @method _bgPropsPopulate
         **/
        _bgPropsPopulate: function () {
            var self = this;
            var gradient = $(Elements.BG_COLOR_GRADIENT_SELECTOR).data("gradientPicker-sel");
            // gradient.changeFillDirection("top"); /* change direction future support */
            gradient.removeAllPoints();
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = self._findGradientPoints(domPlayerData);
            if (xSnippet.length > 0) {
                self._enableBgSelection();
                var points = $(xSnippet).find('Point');
                $.each(points, function (i, point) {
                    var pointColor = BB.lib.decimalToHex($(point).attr('color'));
                    var pointMidpoint = (parseInt($(point).attr('midpoint')) / 250);
                    gradient.addPoint(pointMidpoint, pointColor, true);
                });
            } else {
                self._bgPropsUnpopulate();
            }
        },

        /**
         On changes in msdb model updated UI common border properties
         @method _borderPropsPopulate
         **/
        _borderPropsPopulate: function () {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var xSnippet = self._findBorder(domPlayerData);
            if (xSnippet.length > 0) {
                self._enableBorderSelection();
                var color = $(xSnippet).attr('borderColor');
                color = '#' + BB.lib.decimalToHex(color);
                self.m_blockProperty.setBorderBlockPropColorPicker(color);
            } else {
                self._borderPropsUnpopulate();
            }
        },

        /**
         Disable the gradient background UI
         @method _bgPropsUnpopulate
         **/
        _bgPropsUnpopulate: function () {
            var self = this;
            $(Elements.SHOW_BACKGROUND).prop('checked', false);
            $(Elements.BG_COLOR_GRADIENT_SELECTOR).hide();
            $(Elements.BG_COLOR_SOLID_SELECTOR).hide();
            var domPlayerData = self._getBlockPlayerData();
            var gradientPoints = self._findGradientPoints(domPlayerData);
            $(gradientPoints).empty();
        },

        /**
         Disable the border UI
         @method _borderPropsUnpopulate
         **/
        _borderPropsUnpopulate: function () {
            var self = this;
            $(Elements.SHOW_BORDER).prop('checked', false);
            $(Elements.BLOCK_BORDER_WRAP).hide();
            var domPlayerData = self._getBlockPlayerData();
            var border = self._findBorder(domPlayerData);
            $(border).empty();
        },

        /**
         Toggle block background on UI checkbox selection
         @method _toggleBackgroundColorHandler
         @param {event} e
         **/
        _toggleBackgroundColorHandler: function (e) {
            var self = this;
            if (!self.m_selected)
                return;

            var xBgSnippet = undefined;
            var domPlayerData = self._getBlockPlayerData();
            var checked = $(e.target).prop('checked') == true ? 1 : 0;
            if (checked) {
                self._enableBgSelection();
                xBgSnippet = BB.PepperHelper.getCommonBackgroundXML();
                var data = $(domPlayerData).find('Data').eq(0);
                var bgData = $(data).find('Background');
                if (bgData.length > 0 && !_.isUndefined(bgData.replace)) { // ie bug workaround
                    bgData.replace($(xBgSnippet));
                } else {
                    $(data).append($(xBgSnippet));
                }
                var player_data = pepper.xmlToStringIEfix(domPlayerData);
                domPlayerData = $.parseXML(player_data);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._bgPropsPopulate();
                //self._announceBlockChanged();
            } else {
                var xSnippet = self._findBackground(domPlayerData);
                $(xSnippet).remove();
                self._bgPropsUnpopulate();
                self._setBlockPlayerData(domPlayerData);
            }
        },

        /**
         Toggle block background on UI checkbox selection
         @method _toggleBackgroundColorHandler
         @param {event} e
         **/
        _toggleBorderHandler: function (e) {
            var self = this;
            if (!self.m_selected)
                return;

            var xBgSnippet = undefined;
            var domPlayerData = self._getBlockPlayerData();
            var checked = $(e.target).prop('checked') == true ? 1 : 0;
            if (checked) {
                self._enableBorderSelection();
                xBgSnippet = BB.PepperHelper.getCommonBorderXML();
                var data = $(domPlayerData).find('Data').eq(0);
                var bgData = self._findBorder(data);
                if (bgData.length > 0 && !_.isUndefined(bgData.replace)) { // ie bug workaround
                    bgData.replace($(xBgSnippet));
                } else {
                    $(data).append($(xBgSnippet));
                }
                var player_data = pepper.xmlToStringIEfix(domPlayerData);
                domPlayerData = $.parseXML(player_data);
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
                self._borderPropsPopulate();
                //self._announceBlockChanged();
            } else {
                var xSnippet = self._findBorder(domPlayerData);
                $(xSnippet).remove();
                self._borderPropsUnpopulate();
                self._setBlockPlayerData(domPlayerData);
            }
        },

        /**
         Listen to change in background enable / disable states
         @method _listenBackgroundStateChange
         **/
        _listenBackgroundStateChange: function () {
            var self = this;
            self.m_proxyToggleBg = $.proxy(self._toggleBackgroundColorHandler, self);
            self.m_proxyToggleBgKey = _.uniqueId('click.');
            $(Elements.SHOW_BACKGROUND).on(self.m_proxyToggleBgKey, self.m_proxyToggleBg);
        },

        /**
         Listen to change in background enable / disable states
         @method _listenBackgroundStateChange
         **/
        _listenBorderStateChange: function () {
            var self = this;
            self.m_proxyToggleBorder = $.proxy(self._toggleBorderHandler, self);
            self.m_proxyToggleBorderKey = _.uniqueId('click.');
            $(Elements.SHOW_BORDER).on(self.m_proxyToggleBorderKey, self.m_proxyToggleBorder);
        },

        /**
         Update a block's player_data with new gradient background
         @method _listenGradientChange
         **/
        _listenGradientChange: function () {
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
                self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
            });
        },

        /**
         Update a block's player_data with new border background
         @method _listenBorderColorChange
         **/
        _listenBorderColorChange: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.BLOCK_BORDER_CHANGE, self, function (e) {
                if (!self.m_selected)
                    return;
                var color = e.edata;
                var domPlayerData = self._getBlockPlayerData();
                var border = self._findBorder(domPlayerData);
                $(border).attr('borderColor', BB.lib.hexToDecimal(color));
                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         Update a block's player_data with new gradient background
         @method _listenGradientChange
         **/
        _listenGradientColorPickerClosed: function () {
            var self = this;
            BB.comBroker.listenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CLOSED, self, function (e) {
                if (!self.m_selected)
                    return;
                var domPlayerData = self._getBlockPlayerData();
                self._setBlockPlayerData(domPlayerData);
            });
        },

        /**
         Find the background section in player_data for selected block
         @method _findBackground
         @param  {object} i_domPlayerData
         @return {Xml} xSnippet
         **/
        _findBackground: function (i_domPlayerData) {
            var self = this;
            var xSnippet = $(i_domPlayerData).find('Background');
            return xSnippet;
        },

        /**
         Find the border section in player_data for selected block
         @method _findBorder
         @param  {object} i_domPlayerData
         @return {Xml} xSnippet
         **/
        _findBorder: function (i_domPlayerData) {
            var self = this;
            return $(i_domPlayerData).find('Border');
        },

        /**
         Find the gradient blocks in player_data for selected block
         @method _findGradientPoints
         @param  {object} i_domPlayerData
         @return {Xml} xSnippet
         **/
        _findGradientPoints: function (i_domPlayerData) {
            var self = this;
            var xSnippet = $(i_domPlayerData).find('GradientPoints');
            return xSnippet;
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

        /**
         When a block is selected, find out where is it placed (scene/ channel) and change props accordingly
         @method _onBlockSelected
         **/
        _onBlockSelected: function () {
            var self = this;
            self.m_selected = true;
            self.m_blockProperty.viewPanel(Elements.BLOCK_PROPERTIES);
            self._updateTitle();
            self._updateTitleTab();
            self._alphaPopulate();
            self._fabricLock();
            self._borderPropsPopulate();
            self._bgPropsPopulate();

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
                    $(Elements.CHANNEL_BLOCK_PROPS).hide();
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
            var isVisible = $(Elements.BLOCK_COMMON_SETTINGS_TAB).is(':visible');
            if (isVisible){
                $(Elements.BLOCK_COMMON_SETTINGS_TAB).hide();
                $(Elements.BLOCK_PROPERTIES_TABBER).find('a').eq(0).trigger('click');
            }
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

            //var cW = self['canvasScale'] == 1 ? self.canvas.getWidth() : self.canvas.getWidth() * (1 / self['canvasScale']);
            //var cH = self['canvasScale'] == 1 ? self.canvas.getHeight() : self.canvas.getHeight() * (1 / self['canvasScale']);

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
                    // log('upd: ' + self.m_block_id + ' ' + hours + ' ' + minutes + ' ' + seconds);
                    if (parseInt(hours) == 0 && parseInt(minutes) == 0 && parseInt(seconds) < 5)
                        return;

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
         Announce that this block has changed
         @method _announceBlockChanged
         @param {Number} i_player_data
         **/
        _announceBlockChanged: function () {
            var self = this;
            BB.comBroker.fire(BB.EVENTS['SCENE_BLOCK_CHANGE'], self, null, [self.m_block_id]);
        },

        /**
         Update the msdb for the block with new values inside its player_data
         @method _setBlockPlayerData
         @param {Object} i_xmlDoc the dom object to save to local msdb
         @param {String} [i_noNotify] if set, fire event announcing data saved
         @param {Boolean} [i_xmlIsString] if set, bypass serializeToString since already in string format
         **/
        _setBlockPlayerData: function (i_xmlDoc, i_noNotify, i_xmlIsString) {
            var self = this;
            var player_data;
            if (i_xmlIsString == true) {
                player_data = i_xmlDoc;
            } else {
                player_data = (new XMLSerializer()).serializeToString(i_xmlDoc);
            }

            switch (self.m_placement) {
                case BB.CONSTS.PLACEMENT_CHANNEL:
                {
                    pepper.setCampaignTimelineChannelPlayerRecord(self.m_block_id, 'player_data', player_data);
                    break;
                }
                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    pepper.setScenePlayerdataBlock(self.m_sceneID, self.m_block_id, player_data);
                    if (!i_noNotify)
                        self._announceBlockChanged();
                    break;
                }
                case BB.CONSTS.PLACEMENT_IS_SCENE:
                {
                    pepper.setScenePlayerData(self.m_block_id, player_data);
                    if (!i_noNotify)
                        self._announceBlockChanged();
                    break;
                }
            }
        },


        /**
         Get the XML player data of a block, depending where its placed
         If you like to view XML raw data, be sure to debug domPlayerData.children[0].outerHTML
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
                    // to view data debug domPlayerData.children[0].outerHTML
                    break;
                }

                case BB.CONSTS.PLACEMENT_SCENE:
                {
                    return pepper.getScenePlayerdataBlock(self.m_sceneID, self.m_block_id);
                    // to view data debug domPlayerData.children[0].outerHTML
                    break;
                }
            }
        },

        /**
         bug fix: backward comparability with player_data that includes deleted resources
         this was already fixed but we live _selfDestruct for backwards compatability
         @method _selfDestruct
         **/
        _selfDestruct: function () {
            var self = this;
            setTimeout(function () {
                var sceneEditView = BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']);
                if (!_.isUndefined(sceneEditView)) {
                    var selectedSceneID = sceneEditView.getSelectedSceneID();
                    pepper.removeScenePlayer(selectedSceneID, self.m_block_id);
                    BB.comBroker.fire(BB.EVENTS.LOAD_SCENE, this, null, selectedSceneID);
                }
            }, 2000);
        },


        /**
         Delete block is a private method that is always called regardless if instance has
         been inherited or not. Used for releasing memory for garbage collector.
         @method _deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         @return none
         **/
        _deleteBlock: function (i_memoryOnly) {
            var self = this;
            if (!i_memoryOnly)
                pepper.removeBlockFromTimelineChannel(self.m_block_id);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_SELECTED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_LENGTH_CHANGING, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CHANGED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CLOSED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_BORDER_CHANGE, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.ALPHA_CHANGED, self);
            BB.comBroker.stopListenWithNamespace(BB.EVENTS.LOCK_CHANGED, self);
            $(Elements.SHOW_BACKGROUND).off(self.m_proxyToggleBgKey, self.m_proxyToggleBg);
            $(Elements.SHOW_BORDER).off(self.m_proxyToggleBorderKey, self.m_proxyToggleBorder);

            if (self.off != undefined)
                self.off('modified');

            if (self.m_sceneSelectedHandler)
                self.m_canvas.off('object:selected', self.m_sceneSelectedHandler);

            $.each(self, function (k) {
                self[k] = undefined;
            });
        },

        /**
         Fabricate alpha to canvas
         @method _fabricAlpha
         @param {Object} i_domPlayerData
         **/
        _fabricAlpha: function (i_domPlayerData) {
            var self = this;
            var appearance = $(i_domPlayerData).find('Appearance');
            var opacity = $(appearance).attr('alpha');
            self.setOpacity(opacity);
        },

        /**
         Fabricate color points to canvas
         @method _fabricColorPoints
         @param {xml} i_domPlayerData
         **/
        _fabricColorPoints: function (i_domPlayerData) {
            var self = this;
            var gradientPoints = $(i_domPlayerData).find('GradientPoints');
            var points = $(gradientPoints).find('Point');
            var colorStops = {}
            _.each(points, function (point) {
                var color = '#' + BB.lib.decimalToHex($(point).attr('color'));
                var offset = $(point).attr('midpoint');
                offset = offset / 250;
                colorStops[offset] = color;
            });
            return colorStops;
        },

        /**
         Config the fabric block border
         @method _fabricateBorder
         @param {i_options} i_options
         @return {object} object literal
         **/
        _fabricateBorder: function (i_options) {
            var self = this;
            var domPlayerData = self._getBlockPlayerData();
            var border = self._findBorder(domPlayerData);
            var color = border.length == 0 ? 'transparent' : '#' + BB.lib.decimalToHex($(border).attr('borderColor'));
            return _.extend({
                // borderColor: '#5d5d5d',
                stroke: color,
                strokeWidth: 1
            }, i_options);
        },

        /**
         Build the options injected into a newly created fabric object
         @method _fabricateOptions
         @param {Number} i_top
         @param {Number} i_left
         @param {Number} i_width
         @param {Number} i_height
         @param {Number} i_angle
         @return {object} object literal
         **/
        _fabricateOptions: function (i_top, i_left, i_width, i_height, i_angle) {
            var self = this;
            var options = {
                top: i_top,
                left: i_left,
                width: i_width,
                height: i_height,
                angle: i_angle,
                fill: '#ececec',
                hasRotatingPoint: false,
                transparentCorners: false,
                cornerColor: 'black',
                cornerSize: 5,
                lockRotation: true,
                lineWidth: 1
            };

            return self._fabricateBorder(options);
        },

        /**
         Fabricate color points to canvas
         @method _fabricRect
         @param {number} i_width
         @param {number} i_height
         @param {xml} i_domPlayerData
         @return {object} r fabric js rectangular
         **/
        _fabricRect: function (i_width, i_height, i_domPlayerData) {
            var self = this;
            var options = self._fabricateOptions(0, 0, i_width, i_height, 0);
            var r = new fabric.Rect(options);
            r.setGradient('fill', {
                x1: 0 - (i_width / 2),
                y1: 0,
                x2: (i_width / 2),
                y2: 0,
                colorStops: self._fabricColorPoints(i_domPlayerData)
            });
            return r;
        },

        /**
         Convert the block into a fabric js compatible object, called externally on creation of block
         @Override
         @method fabricateBlock
         **/
        fabricateBlock: function (i_canvasScale, i_callback) {
            var self = this;

            var domPlayerData = self._getBlockPlayerData();
            var layout = $(domPlayerData).find('Layout');

            var w = parseInt(layout.attr('width'));
            var h = parseInt(layout.attr('height'));
            var rec = self._fabricRect(w, h, domPlayerData);

            fabric.loadSVGFromString(self.m_blockSvg, function (objects, options) {
                var groupSvg = fabric.util.groupSVGElements(objects, options);
                rec.originX = 'center';
                rec.originY = 'center';
                groupSvg.originX = 'center';
                groupSvg.originY = 'center';

                var o = {
                    left: parseInt(layout.attr('x')),
                    top: parseInt(layout.attr('y')),
                    width: parseInt(layout.attr('width')),
                    height: parseInt(layout.attr('height')),
                    angle: parseInt(layout.attr('rotation')),
                    hasRotatingPoint: false,
                    stroke: 'transparent',
                    cornerColor: 'black',
                    cornerSize: 5,
                    lockRotation: true,
                    transparentCorners: false
                };
                _.extend(self, o);
                self.add(rec);
                self.add(groupSvg);
                self._fabricAlpha(domPlayerData);
                self._fabricLock();
                self['canvasScale'] = i_canvasScale;
                i_callback();
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
                blockIcon: self.m_blockIcon,
                blockFontAwesome: self.m_blockFontAwesome,
                blockAcronym: self.m_blockAcronym,
                blockMinWidth: self.m_minSize.w,
                blockMinHeight: self.m_minSize.h,
                blockData: self._getBlockPlayerData()
            };
            return data;
        },

        /**
         Set a block's z-index in case we know it (i.e.: it is going to be a re-render of a previous block that
         was removed from the canvas)
         @method setZindex
         @param {Number} i_index
         **/
        setZindex: function (i_zIndex) {
            var self = this;
            self.m_zIndex = i_zIndex;
        },

        /**
         Get a block's z-index
         @method getZindex
         @param {Number} i_index
         **/
        getZindex: function (i_zIndex) {
            var self = this;
            return self.m_zIndex;
        },

        /**
         Delete block is a public method used as fall back method, if not overridden by inherited instance.
         It is also a semi abstract method, all implementations should go into _deleteBlock();
         @method deleteBlock
         @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
         @return none
         **/
        deleteBlock: function (i_memoryOnly) {
            /* semi-abstract, overridden, do not modify */
            var self = this;
            self._deleteBlock(i_memoryOnly);
        }
    });

    return Block;
});