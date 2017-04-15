import {BlockFabric} from "./block-fabric";
import * as _ from 'lodash';
import {Lib} from "../../Lib";
import {BlockLabels} from "../../interfaces/Consts";

const blockType = BlockLabels.BLOCKCODE_SCENE;

export class BlockFabricScene extends BlockFabric {

    m_canvas;
    m_gridMagneticMode = 0;

    constructor(options, i_blockService, i_pepper) {
        super(options, i_blockService, i_pepper, blockType)
        this.m_blockService = i_blockService;
        this.m_pepper = i_pepper;
        this.m_blockType = blockType;
        _.extend(options, {blockType: this.m_blockType})
    }

    /**
     get player data for a scene
     @Override
     **/
    getBlockData() {
        var data = BlockFabric.prototype.getBlockData.call(this);
        var domPlayerData = this._getBlockPlayerData();
        data.blockName = $(domPlayerData).find('Player').eq(0).attr('label');
        return data;
    }

    /**
     Update the msdb for the block with new values inside its player_data
     @Override
     **/
    _setBlockPlayerData(i_xmlDoc, i_noNotify) {
        // var player_data = (new XMLSerializer()).serializeToString(i_xmlDoc);
        // switch (this.m_placement) {
        //     case BB.CONSTS.PLACEMENT_CHANNEL: {
        //         var recBlock = pepper.getCampaignTimelineChannelPlayerRecord(this.m_block_id);
        //         var domPlayerData = $.parseXML(recBlock['player_data']);
        //         var scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
        //         var player_data = (new XMLSerializer()).serializeToString(i_xmlDoc);
        //         pepper.setScenePlayerData(scene_id, player_data);
        //         break;
        //     }
        //
        //     case BB.CONSTS.PLACEMENT_IS_SCENE: {
        //         pepper.setScenePlayerData(this.m_block_id, player_data);
        //         //if (!i_noNotify)
        //         //    this._announceBlockChanged();
        //         break;
        //     }
        // }
    }

    /**
     Get the XML player data of a block, depending where its placed
     @Override
     **/
    _getBlockPlayerData(): any {
        var blockID = this.m_pepper.getSceneIdFromPseudoId(this.m_block_id);
        var recPlayerData = this.m_pepper.getScenePlayerRecord(blockID);
        var xPlayerdata = recPlayerData['player_data_value'];
        return $.parseXML(xPlayerdata);
        // var recBlock = undefined;
        //
        // switch (this.m_placement) {
        //
        //     case BB.CONSTS.PLACEMENT_CHANNEL: {
        //         recBlock = pepper.getCampaignTimelineChannelPlayerRecord(this.m_block_id);
        //         var domPlayerData = $.parseXML(recBlock['player_data']);
        //         var sceneHandle = $(domPlayerData).find('Player').attr('hDataSrc');
        //         return pepper.getScenePlayerdataDom(sceneHandle);
        //         break;
        //     }
        //
        //     case BB.CONSTS.PLACEMENT_IS_SCENE: {
        //         var blockID = pepper.getSceneIdFromPseudoId(this.m_block_id);
        //         var recPlayerData = BB.Pepper.getScenePlayerRecord(blockID);
        //         var xPlayerdata = recPlayerData['player_data_value'];
        //         return $.parseXML(xPlayerdata);
        //         break;
        //     }
        // }
    }

    /**
     Find the border section in player_data for selected block
     **/
    // _findBorder(i_domPlayerData) {
    //     var xSnippet = $(i_domPlayerData).find('Layout').eq(0).siblings().filter('Border');
    //     return xSnippet;
    // }

    /**
     Find the background section in player_data for selected block
     **/
    // _findBackground(i_domPlayerData) {
    //     var xSnippet = $(i_domPlayerData).find('Layout').eq(0).siblings().filter('Background');
    //     return xSnippet;
    // }

    /**
     Find the gradient blocks in player_data for selected scene block
     **/
    _findGradientPoints(i_domPlayerData) {
        var xBackground = $(i_domPlayerData).find('Layout').eq(0).siblings().filter('Background');
        var xSnippet = $(xBackground).find('GradientPoints').eq(0);
        return xSnippet;
    }

    /**
     Add the checkers background to a scene
     **/
    _fabricApplySceneBgImage(i_image) {
        this.m_canvas.setBackgroundColor('', this.m_canvas.renderAll.bind(this.m_canvas));
        $('#sceneCanvasContainer').find('.canvas-container').removeClass('checkers').removeClass('grid25').removeClass('grid50').addClass(i_image);
        this.m_canvas.renderAll();
    }

    /**
     Set a scene's background color or image
     @method fabricSceneBg
     **/
    fabricSceneBg() {
        var domPlayerData = this._getBlockPlayerData();
        var colorPoints = this._findGradientPoints(domPlayerData)
        var color = $(colorPoints).find('Point').attr('color');

        switch (this.m_gridMagneticMode) {
            case 0: {
                if (_.isUndefined(color)) {
                    this._fabricApplySceneBgImage('checkers');
                    return;
                }
                color = '#' + Lib.DecimalToHex(color);
                if (this.m_canvas.backgroundColor == color)
                    return;
                this.m_canvas.setBackgroundColor(color, function () {
                });
                this.m_canvas.renderAll();
                break;
            }
            case 1: {
                this._fabricApplySceneBgImage('grid25');
                break;
            }
            case 2: {
                this._fabricApplySceneBgImage('grid50');
                break;
            }
        }
    }

    /**
     Set reference to managed canvas
     **/
    setCanvas(i_canvas, i_magneticGridMode) {
        this.m_canvas = i_canvas;
        this.m_gridMagneticMode = i_magneticGridMode;
        this.fabricSceneBg();
    }

    /**
     Get the scene id that's associated with this block given that it resides in a timeline > channel
     **/
    // getChannelBlockSceneID() {
    // var recBlock = pepper.getCampaignTimelineChannelPlayerRecord(this.m_block_id);
    // var domPlayerData = $.parseXML(recBlock['player_data']);
    // var scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
    // return scene_id;
    // }

    /**
     Delete this block
     @method deleteBlock
     @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
     **/
    deleteBlock(i_memoryOnly) {
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.SCENE_BG_COLOR_CHANGED, this);
        // $(Elements.SCENE_NAME_INPUT).off("input", this.m_inputNameChangeHandler);
        // $(Elements.SCENE_WIDTH_INPUT).off("input", this.m_inputWidthChangeHandler);
        // $(Elements.SCENE_WIDTH_INPUT).off("blur", this.m_inputWidthChangeHandler);
        // $(Elements.SCENE_HEIGHT_INPUT).off("blur", this.m_inputWidthChangeHandler);
        // $(Elements.SCENE_HEIGHT_INPUT).off("input", this.m_inputHeightChangeHandler);
        // this._deleteBlock(i_memoryOnly);
    }
}
