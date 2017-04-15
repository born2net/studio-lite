import * as _ from 'lodash';
import {Lib} from "../../Lib";
import {BlockService} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";

export class BlockFabric extends fabric.Group {

    m_block_id;
    m_sceneID;
    m_blockType;
    m_zIndex = -1;
    m_minSize = {w: 50, h: 50};
    m_blockName;
    m_blockAcronym;
    m_blockDescription;
    m_blockIcon;
    m_blockFontAwesome;
    m_blockSvg;
    m_resourceID;
    m_blockProperty;
    m_blockService: BlockService;
    m_pepper: RedPepperService;

    constructor(options, i_blockService, i_pepper, i_blockType) {
        super()
        this.m_blockType = i_blockType
        this.m_blockService = i_blockService;
        this.m_pepper = i_pepper;
        this.m_block_id = options.i_block_id;
        this.m_sceneID = options.i_scene_player_data_id;
        this.m_zIndex = -1;
        this.m_minSize = {w: 50, h: 50};
        this.m_blockName = i_blockService.getBlockBoilerplate(this.m_blockType).name;
        this.m_blockAcronym = i_blockService.getBlockBoilerplate(this.m_blockType).acronym;
        this.m_blockDescription = i_blockService.getBlockBoilerplate(this.m_blockType).description;
        this.m_blockIcon = i_blockService.getBlockBoilerplate(this.m_blockType).icon;
        this.m_blockFontAwesome = i_blockService.getBlockBoilerplate(this.m_blockType).fontAwesome;
        this.m_blockSvg = i_blockService.getBlockBoilerplate(this.m_blockType).svg;
        this.m_resourceID = undefined;
    }

    // _setBlockPlayerData(i_xmlDoc, i_noNotify, i_xmlIsString) {
    //     var player_data;
    //     if (i_xmlIsString == true) {
    //         player_data = i_xmlDoc;
    //     } else {
    //         player_data = (new XMLSerializer()).serializeToString(i_xmlDoc);
    //     }
    //     this.m_pepper.setScenePlayerdataBlock(this.m_sceneID, this.m_block_id, player_data);
    //     this.m_pepper.reduxCommit();
    //     // switch (this.m_placement) {
    //     //     case PLACEMENT_SCENE: {
    //     //         this.m_pepper.setScenePlayerdataBlock(this.m_sceneID, this.m_block_id, player_data);
    //     //         break;
    //     //     }
    //     //     case PLACEMENT_IS_SCENE: {
    //     //         this.m_pepper.setScenePlayerData(this.m_block_id, player_data);
    //     //         break;
    //     //     }
    //     // }
    // }

    /**
     Get the XML player data of a block, depending where its placed
     If you like to view XML raw data, be sure to debug domPlayerData.children[0].outerHTML
     **/
    _getBlockPlayerData(): any {
        return this.m_pepper.getScenePlayerdataBlock(this.m_sceneID, this.m_block_id);
        // to view data debug domPlayerData.children[0].outerHTML
    }

    /**
     Find the border section in player_data for selected block
     **/
    _findBorder(i_domPlayerData) {
        return $(i_domPlayerData).find('Border');
    }

    /**
     Fabricate alpha to canvas
     **/
    _fabricAlpha(i_domPlayerData) {
        var appearance = $(i_domPlayerData).find('Appearance');
        var opacity: any = $(appearance).attr('alpha');
        this.setOpacity(opacity);
    }

    /**
     Fabricate color points to canvas
     **/
    _fabricColorPoints(i_domPlayerData) {
        var gradientPoints = $(i_domPlayerData).find('GradientPoints');
        var points = $(gradientPoints).find('Point');
        var colorStops = {}
        _.each(points, function (point) {
            var color = '#' + Lib.DecimalToHex(($(point).attr('color')));
            var offset: any = $(point).attr('midpoint');
            offset = offset / 250;
            colorStops[offset] = color;
        });
        return colorStops;
    }

    /**
     Config the fabric block border
     **/
    _fabricateBorder(i_options) {
        var domPlayerData = this._getBlockPlayerData()
        var border = this._findBorder(domPlayerData);
        var color = border.length == 0 ? 'transparent' : '#' + Lib.DecimalToHex($(border).attr('borderColor'));
        return _.extend({
            // borderColor: '#5d5d5d',
            stroke: color,
            strokeWidth: 1
        }, i_options);
    }

    /**
     Build the options injected into a newly created fabric object
     **/
    _fabricateOptions(i_top, i_left, i_width, i_height, i_angle) {
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
        return this._fabricateBorder(options);
    }

    /**
     Fabricate color points to canvas
     **/
    _fabricRect(i_width, i_height, i_domPlayerData) {
        var options = this._fabricateOptions(0, 0, i_width, i_height, 0);
        var r = new fabric.Rect(options);
        r.setGradient('fill', {
            x1: 0 - (i_width / 2),
            y1: 0,
            x2: (i_width / 2),
            y2: 0,
            colorStops: this._fabricColorPoints(i_domPlayerData)
        });
        return r;
    }

    /**
     Convert the block into a fabric js compatible object, called externally on creation of block
     @Override
     @method fabricateBlock
     **/
    fabricateBlock(i_canvasScale, i_callback) {
        var domPlayerData = this._getBlockPlayerData();
        var layout = $(domPlayerData).find('Layout');

        var w = parseInt(layout.attr('width'));
        var h = parseInt(layout.attr('height'));
        var rec = this._fabricRect(w, h, domPlayerData);

        fabric.loadSVGFromString(this.m_blockSvg, (objects, options) => {
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
            _.extend(this, o);
            this.add(rec);
            this.add(groupSvg);
            this._fabricAlpha(domPlayerData);
            this._fabricLock();
            this['canvasScale'] = i_canvasScale;
            i_callback();
        });
    }

    /**
     On changes in msdb model updated UI common lock properties
     **/
    _fabricLock() {
        var domPlayerData = this._getBlockPlayerData();
        var locked: any = $(domPlayerData).attr('locked');
        if (_.isUndefined(locked) || locked == '0') {
            locked = false;
        } else {
            locked = true;
        }
        this.lockMovementX = locked;
        this.lockMovementY = locked;
        //self.lockScalingX = locked; self.lockScalingY = locked; self.lockUniScaling = locked; self.lockRotation = locked;
        /////var dimensionProps = BB.comBroker.getService(BB.SERVICES['DIMENSION_PROPS_LAYOUT']);
        /////if (_.isUndefined(dimensionProps))
        //////     return;
        //////dimensionProps.setLock(locked);
    }

    /**
     Get block data as a json formatted object literal and return to caller
     **/
    getBlockData() {
        var data = {
            blockID: this.m_block_id,
            blockType: this.m_blockType,
            blockName: this.m_blockName,
            blockDescription: this.m_blockDescription,
            blockIcon: this.m_blockIcon,
            blockFontAwesome: this.m_blockFontAwesome,
            blockAcronym: this.m_blockAcronym,
            blockMinWidth: this.m_minSize.w,
            blockMinHeight: this.m_minSize.h,
            blockData: this._getBlockPlayerData()
        };
        return data;
    }

    /**
     Set a block's z-index in case we know it (i.e.: it is going to be a re-render of a previous block that
     was removed from the canvas)
     **/
    setZindex(i_zIndex) {
        this.m_zIndex = i_zIndex;
    }

    /**
     Get a block's z-index
     @method getZindex
     @param {Number} i_index
     **/
    getZindex(i_zIndex) {
        return this.m_zIndex;
    }

    /**
     Delete block is a public method used as fall back method, if not overridden by inherited instance.
     It is also a semi abstract method, all implementations should go into _deleteBlock();
     @method deleteBlock
     @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
     @return none
     **/
    deleteBlock(i_memoryOnly) {
        /* semi-abstract, overridden, do not modify */
        this._deleteBlock(i_memoryOnly);
    }

    /**
     bug fix: backward comparability with player_data that includes deleted resources
     this was already fixed but we live _selfDestruct for backwards compatability
     @method _selfDestruct
     **/
    _selfDestruct() {
        setTimeout(() => {
            //todo: ???
            // var sceneEditView = BB.comBroker.getService(BB.SERVICES['SCENE_EDIT_VIEW']);
            // if (!_.isUndefined(sceneEditView)) {
            //     var selectedSceneID = sceneEditView.getSelectedSceneID();
            //     pepper.removeScenePlayer(selectedSceneID, self.m_block_id);
            //     BB.comBroker.fire(BB.EVENTS.LOAD_SCENE, this, null, selectedSceneID);
            // }
        }, 2000);
    }

    /**
     Delete block is a private method that is always called regardless if instance has
     been inherited or not. Used for releasing memory for garbage collector.
     @method _deleteBlock
     @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
     @return none
     **/
    _deleteBlock(i_memoryOnly) {
        // if (!i_memoryOnly)
        //     pepper.removeBlockFromTimelineChannel(this.m_block_id);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_SELECTED, this);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_LENGTH_CHANGING, this);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CHANGED, this);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.GRADIENT_COLOR_CLOSED, this);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.BLOCK_BORDER_CHANGE, this);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.ALPHA_CHANGED, this);
        // BB.comBroker.stopListenWithNamespace(BB.EVENTS.LOCK_CHANGED, this);
        // $(Elements.SHOW_BACKGROUND).off(this.m_proxyToggleBgKey, this.m_proxyToggleBg);
        // $(Elements.SHOW_BORDER).off(this.m_proxyToggleBorderKey, this.m_proxyToggleBorder);

        // if (this.off != undefined)
        //     this.off('modified');
        //
        // if (this.m_sceneSelectedHandler)
        //     this.m_canvas.off('object:selected', this.m_sceneSelectedHandler);
        //
        // $.each(this, function (k) {
        //     this[k] = undefined;
        // });
    }
}