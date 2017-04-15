import {BlockFabric} from "./block-fabric";
import * as _ from "lodash";
import {BlockLabels} from "../../interfaces/Consts";


const blockType = BlockLabels.BLOCKCODE_SVG;

export class BlockFabricSvg extends BlockFabric {

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


    // /var/www/sites/dynasite/htdocs/_msportal/_js/_node/public/assets/14.svg
    /**
     Convert the block into a fabric js compatible object, called externally on creation of block
     @Override
     @method fabricateBlock
     **/
    fabricateBlock(i_canvasScale, i_callback) {
        var self = this;

        var domPlayerData = self._getBlockPlayerData();
        var layout = $(domPlayerData).find('Layout');

        var w = parseInt(layout.attr('width'));
        var h = parseInt(layout.attr('height'));
        var rec = self._fabricRect(w, h, domPlayerData);

        var svgPath = window.g_protocol + self.m_pepper.getUserData().domain + '/Resources/business' + self.m_pepper.getUserData().businessID + '/resources/' + self.m_nativeID + '.' + self.m_fileFormat;
        var urlPath = jQuery.base64.encode(svgPath);
        var srvPath = 'https://secure.digitalsignage.com/proxyRequest/' + urlPath;

        //svgPath = 'https://secure.digitalsignage.com/_public/assets/15.svg';
        //svgPath = 'https://ida.signage.me/Test/14.svg';
        //svgPath = 'https://ida.signage.me/code/14.svg';
        //svgPath = "https://s3-us-west-2.amazonaws.com/oregon-signage-resources/business372844/resources/14.svg";
        //svgPath = 'https://ida2.signage.me/14.svg';

        $.get(srvPath, function (svg) {
            var hh, ww, svgHeight, svgWidth, re;

            // set new height in SVG per current selection box height
            hh = layout.attr('height');

            // catch load errors
            svgHeight = svg.match(/(height=")([^\"]*)/)
            if (_.isNull(svgHeight)) {
                i_callback();
                return;
            }
            svgHeight = svgHeight[2];
            re = new RegExp('height="' + svgHeight + '"', "ig");
            svg = svg.replace(re, 'height="' + hh + '"');

            // set new width in SVG per current selection box width
            ww = layout.attr('width');
            svgWidth = svg.match(/(width=")([^\"]*)/)[2];
            re = new RegExp('width="' + svgWidth + '"', "ig");
            svg = svg.replace(re, 'width="' + ww + '"');

            fabric.loadSVGFromString(svg, function (objects:any, options) {
                objects[0].heightAttr = hh;
                objects[0].widthAttr = ww;
                objects[0].height = hh;
                objects[0].width = ww;

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

        }, 'text');
    }

    /**
     Get the resource id of the embedded resource
     @method getResourceID
     @return {Number} resource_id;
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
