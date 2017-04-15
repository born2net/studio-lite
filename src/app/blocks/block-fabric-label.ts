import {BlockFabric} from "./block-fabric";
import * as _ from "lodash";
import {Lib} from "../../Lib";
import {BlockLabels} from "../../interfaces/Consts";


const blockType = BlockLabels.LABEL;

export class BlockFabricLabel extends BlockFabric {

    constructor(options, i_blockService, i_pepper) {
        super(options, i_blockService, i_pepper, blockType)
        this.m_blockService = i_blockService;
        this.m_pepper = i_pepper;
        this.m_blockType = blockType;
        _.extend(options, {blockType: this.m_blockType})
    }

    /**
     Convert the block into a fabric js compatible object
     @Override
     @method fabricateBlock
     @param {number} i_canvasScale
     @param {function} i_callback
     **/
    fabricateBlock(i_canvasScale, i_callback) {

        var domPlayerData = this._getBlockPlayerData();
        var layout = $(domPlayerData).find('Layout');
        var label = $(domPlayerData).find('Label');
        var text = $(label).find('Text').text();
        var font = $(label).find('Font');

        var url = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';

        //$.getScript(src, function (data) {
        //    console.log(data);
        //});

        var t = new fabric.IText(text, {
            fontSize: Number($(font).attr('fontSize')),
            //fontFamily: 'Graduate',
            //fontFamily: 'Jolly Lodger',
            //fontFamily: 'Arial',
            fontFamily: $(font).attr('fontFamily'),
            fill: '#' + Lib.DecimalToHex($(font).attr('fontColor')),
            textDecoration: $(font).attr('textDecoration'),
            fontWeight: $(font).attr('fontWeight'),
            fontStyle: $(font).attr('fontStyle'),
            textAlign: $(font).attr('textAlign'),
            top: 5,
            left: 5
        });

        // calculate block so it can always contain the text it holds and doesn't bleed
        this.m_minSize.w = t.width < 50 ? 50 : t.width * 1.2;
        this.m_minSize.h = t.height < 50 ? 50 : t.height * 1.2;
        var w = parseInt(layout.attr('width')) < this.m_minSize.w ? this.m_minSize.w : parseInt(layout.attr('width'));
        var h = parseInt(layout.attr('height')) < this.m_minSize.h ? this.m_minSize.h : parseInt(layout.attr('height'));

        var rec = this._fabricRect(w, h, domPlayerData);
        var o = this._fabricateOptions(parseInt(layout.attr('y')), parseInt(layout.attr('x')), w, h, parseInt(layout.attr('rotation')));
        //var group = new fabric.Group([ rec, t ], o);
        //_.extend(this, group);

        rec.originX = 'center';
        rec.originY = 'center';
        t.top = 0 - (rec.height / 2);
        t.left = 0 - (rec.width / 2);
        _.extend(this, o);
        this.add(rec);
        this.add(t);
        this._fabricAlpha(domPlayerData);
        this._fabricLock();
        this['canvasScale'] = i_canvasScale;

        //$.ajax({
        //    url: url,
        //    async: false,
        //    dataType: "script",
        //    complete: function(e){
        //        setTimeout(i_callback,1)
        //    }
        //});
        setTimeout(i_callback,1);

        var direction = $(font).attr('textAlign');
        switch (direction) {
            case 'left': {
                break;
            }
            case 'center': {
                t.set({
                    textAlign: direction,
                    originX: direction,
                    left: 0
                });
                break;
            }
            case 'right': {
                t.set({
                    textAlign: direction,
                    originX: direction,
                    left: rec.width / 2
                });
                break;
            }
        }

        // todo: add shadow
        //http://jsfiddle.net/Kienz/fgWNL/
        //http://jsfiddle.net/fabricjs/7gvJG/
        //http://jsfiddle.net/5KKQ2/
        //t.set('shadow', {
        //    color: 'black',
        //    blur: 1,
        //    offsetX:3,
        //    offsetY: 1
        //});({ color: 'rgba(12,12,12,1)' });
        //rec.set('shadow', {
        //    color: 'black',
        //    blur: 1,
        //    offsetX:3,
        //    offsetY: 1
        //});
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
