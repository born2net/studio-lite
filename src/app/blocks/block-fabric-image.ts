import {BlockFabric} from "./block-fabric";
import * as _ from "lodash";
import {BlockLabels} from "../../interfaces/Consts";

const blockType = BlockLabels.BLOCKCODE_IMAGE;

export class BlockFabricImage extends BlockFabric {

    m_canvas;
    m_gridMagneticMode = 0;
    m_nativeID;
    m_fileFormat;

    constructor(options, i_blockService, i_pepper) {
        super(options, i_blockService, i_pepper, blockType)
        this.m_blockService = i_blockService;
        this.m_pepper = i_pepper;
        this.m_blockType = blockType;
        _.extend(options, {blockType: this.m_blockType})
        this._initResourcesData();
    }

    /**
     Set the instance resource data from msdb which includes resource_id (handle of a resource)
     as well as the description of the resource and icon.
     @method _initResourcesData
     **/
    _initResourcesData() {
        var domPlayerData = this._getBlockPlayerData();
        var xSnippet = $(domPlayerData).find('Resource');
        this.m_resourceID = $(xSnippet).attr('hResource');
        this.m_nativeID = this.m_pepper.getResourceNativeID(this.m_resourceID);
        if (_.isNull(this.m_nativeID)) {
            this._selfDestruct();
            return;
        }
        this.m_blockName = this.m_pepper.getResourceRecord(this.m_resourceID).resource_name;
        this.m_blockDescription = this.m_pepper.getResourceName(this.m_resourceID);
        this.m_fileFormat = this.m_pepper.getResourceType(this.m_resourceID);
        this.m_blockFontAwesome = this.m_blockService.getFontAwesome(this.m_fileFormat);
    }

    /**
     Convert the block into a fabric js compatible object
     @Override
     @method fabricateBlock
     **/
    fabricateBlock(i_canvasScale, i_callback) {

        var domPlayerData = this._getBlockPlayerData();
        var layout = $(domPlayerData).find('Layout');
        var businessID = this.m_pepper.getUserData().businessID;
        var elemID = _.uniqueId('imgElemrand')
        var imgPath;

        if (this.m_fileFormat == 'swf') {
            imgPath = './_assets/flash.png';
        } else {
            /*
             if (platform.name == 'Chrome') {
             // CDN
             imgPath = window.g_protocol + 's3.signage.me/business' + this.m_pepper.getUserData().businessID + '/resources/';
             imgPath = 'https://s3.signage.me/business' + this.m_pepper.getUserData().businessID + '/resources/';
             imgPath += +this.m_nativeID + '.' + this.m_fileFormat;
             } else {
             // Legacy
             imgPath = window.g_protocol + this.m_pepper.getUserData().domain + '/Resources/business' + this.m_pepper.getUserData().businessID + '/resources/' + this.m_nativeID + '.' + this.m_fileFormat;
             }
             */
            imgPath = window.g_protocol + this.m_pepper.getUserData().domain + '/Resources/business' + this.m_pepper.getUserData().businessID + '/resources/' + this.m_nativeID + '.' + this.m_fileFormat;
            // log('loading img from ' + imgPath);
        }

        var initImage = (i_image, i_passed) => {
            if (!i_passed) {
                i_callback();
                return;
            }
            $(i_image).width(1000).height(800).appendTo('body');
            var options = this._fabricateOptions(parseInt(layout.attr('y')), parseInt(layout.attr('x')), parseInt(layout.attr('width')), parseInt(layout.attr('height')), parseInt(layout.attr('rotation')));
            var img = new fabric.Image(i_image, options);
            _.extend(this, img);
            this._fabricAlpha(domPlayerData);
            this._fabricLock();
            this['canvasScale'] = i_canvasScale;
            i_callback();
        };

        // manage errors of resources which don't load
        $(`<img src="${imgPath}" style="display: none" >`).on('load', function() {
            initImage(this, true);
        }).on('error', function() {
            initImage(this, false);
        })
    }

    /**
     Get the resource id of the embedded resource
     **/
    getResourceID() {
        return this.m_resourceID;
    }

    /**
     Delete this block
     @method deleteBlock
     @params {Boolean} i_memoryOnly if true only remove from existance but not from msdb
     **/
    deleteBlock(i_memoryOnly) {
        // $(Elements.IMAGE_ASPECT_RATIO).off('change', this.m_inputChangeHandler);
        this._deleteBlock(i_memoryOnly);
    }

}
