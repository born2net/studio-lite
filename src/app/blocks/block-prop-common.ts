import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {timeout} from "../../decorators/timeout-decorator";
import {Subject} from "rxjs";
import {RedPepperService} from "../../services/redpepper.service";
import {Compbaser} from "ng-mslib";
import {Lib} from "../../Lib";
import * as _ from "lodash";
import {BlockLabels} from "../../interfaces/Consts";

@Component({
    selector: 'block-prop-common',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form class="inner5" novalidate autocomplete="off" [formGroup]="contGroup">
            <div class="row">
                <div class="panel-heading">
                    <small class="release">common properties
                        <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                    </small>

                </div>
                <ul class="list-group">
                    <li class="list-group-item">
                        alpha
                        <input id="slider1" (change)="_onAlphaChange($event)" [formControl]="contGroup.controls['alpha']" type="range" min="0" max="1" step="0.1"/>
                    </li>
                    <li [ngClass]="{hidden: m_isPropsForScene}" class="list-group-item">
                        background
                        <button style="position: relative; top: 15px" (click)="_onRemoveBackgroundClicked()" class="btn btn-default btn-sm pull-right" type="button">
                            <i class="fa fa-times"></i>
                        </button>
                        <div id="bgColorGradientSelector"></div>
                    </li>
                    <li *ngIf="m_isPropsForScene" class="list-group-item">
                        <div style="padding-top: 20px; padding-bottom: 20px">
                            <span i18n>scene background color</span>
                            <br/>
                            <div class="material-switch pull-right">
                                <input #colorSelection (change)="_toggleSceneBackground(colorSelection.checked)"
                                       [formControl]="contGroup.controls['sceneBackground']"
                                       id="colorSelection"
                                       name="colorSelection" type="checkbox"/>
                                <label for="colorSelection" class="label-primary"></label>
                            </div>
                            <input #sceneBackgroundColor [disabled]="!colorSelection.checked" (colorPickerChange)="m_sceneBackgroundColorChanged.next($event)"
                                   [cpOKButton]="true" [cpOKButtonClass]="'btn btn-primary btn-xs'"
                                   [cpFallbackColor]="'#123'"
                                   [cpPresetColors]="[]"
                                   [(colorPicker)]="m_sceneBackgroundColor" [cpPosition]="'bottom'"
                                   [cpAlphaChannel]="'disabled'" style="width: 185px"
                                   [style.background]="m_sceneBackgroundColor" [value]="m_sceneBackgroundColor"/>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div style="padding-top: 20px; padding-bottom: 20px">
                            <span i18n>border color</span>
                            <br/>
                            <div class="material-switch pull-right">
                                <input #borderSelection (change)="_toggleBorder(borderSelection.checked)"
                                       [formControl]="contGroup.controls['border']"
                                       id="borderSelection"
                                       name="borderSelection" type="checkbox"/>
                                <label for="borderSelection" class="label-primary"></label>
                            </div>
                            <input #borderColor [disabled]="!borderSelection.checked" (colorPickerChange)="m_borderColorChanged.next($event)"
                                   [cpOKButton]="true" [cpOKButtonClass]="'btn btn-primary btn-xs'"
                                   [cpFallbackColor]="'#123'"
                                   [cpPresetColors]="[]"
                                   [(colorPicker)]="m_color" [cpPosition]="'bottom'"
                                   [cpAlphaChannel]="'disabled'" style="width: 185px"
                                   [style.background]="m_color" [value]="m_color"/>
                        </div>
                    </li>
                </ul>
            </div>
        </form>
    `
})
export class BlockPropCommon extends Compbaser implements AfterViewInit {

    private formInputs = {};
    contGroup: FormGroup;
    m_blockData: IBlockData;
    m_isPropsForScene: boolean = false;
    m_borderColorChanged = new Subject();
    m_sceneBackgroundColorChanged = new Subject();
    m_color;
    m_sceneBackgroundColor;

    constructor(@Inject('BLOCK_PLACEMENT') private blockPlacement: string, private cd: ChangeDetectorRef, private fb: FormBuilder, private rp: RedPepperService, private bs: BlockService, private el: ElementRef) {
        super();
        this.contGroup = fb.group({
            'alpha': [0],
            'borderColor': [],
            'border': [0],
            'sceneBackgroundColor': [],
            'sceneBackground': [0]
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
        this._listenBorderChanged();
    }

    /**
     * set block data for the component.
     * on first selection we just set the blockData, in subsequent calls we only
     * re-render if we are dealing with a new block id, note that on componet creation
     * the rendering is done via ngAfterViewInit
     * @param i_blockData
     */
    @Input()
    set setBlockData(i_blockData) {
        if (this.m_blockData && this.m_blockData.blockID != i_blockData.blockID) {
            this.m_blockData = i_blockData;
            this._render();
        } else {
            this.m_blockData = i_blockData;
        }
    }

    ngAfterViewInit() {
        this._listenBorderChanged();
        this._bgGradientWidgetInit();
        this._render();
    }

    /**
     * Render the component with latest data from BlockData
     */
    _render() {
        this.m_isPropsForScene = parseInt(this.m_blockData.blockCode) == BlockLabels.BLOCKCODE_SCENE ? true : false;
        this._alphaPopulate();
        this._gradientPopulate();
        this._sceneBackgroundPopulate();
        this._borderPropsPopulate();
    }

    _listenBorderChanged() {
        this.cancelOnDestroy(
            //
            this.m_borderColorChanged
                .debounceTime(500)
                .filter(v => v != '#123')
                .subscribe((i_color: any) => {
                    var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
                    var border = this._findBorder(domPlayerData);
                    jXML(border).attr('borderColor', Lib.HexToDecimal(i_color));
                    this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
                }, (e) => console.error(e))
        )

        this.cancelOnDestroy(
            //
            this.m_sceneBackgroundColorChanged
                .debounceTime(500)
                .filter(v => v != '#123')
                .subscribe((i_color: any) => {
                    var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
                    var xPoints = this._findGradientPoints(domPlayerData);
                    jXML(xPoints).find('Point').attr('color', Lib.HexToDecimal(i_color));
                    this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
                    this.bs.notifySceneBgChanged();
                }, (e) => console.error(e))
        )
    }

    /**
     Toggle block background on UI checkbox selection
     @method _toggleBorder
     @param {event} e
     **/
    _toggleSceneBackground(i_checked: boolean) {
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
        var checked = i_checked == true ? 1 : 0;
        if (checked) {
            var xBgSnippet = this.bs.getCommonBackgroundXML();
            var data = jXML(domPlayerData).find('Data').eq(0);
            jXML(data).find('Background').remove();
            jXML(data).append(jXML(xBgSnippet));
            this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
            this._sceneBackgroundPopulate();
        } else {
            var xSnippet = this._findGradientPointsScene(domPlayerData);
            jXML(xSnippet).empty();
            this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        }
        this.bs.notifySceneBgChanged()
    }

    /**
     Toggle block background on UI checkbox selection
     @method _toggleBorder
     @param {event} e
     **/
    _toggleBorder(i_checked: boolean) {
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
        var checked = i_checked == true ? 1 : 0;
        if (checked) {
            var xBgSnippet = this.bs.getCommonBorderXML();
            var data = jXML(domPlayerData).find('Data').eq(0);
            var bgData: any = this._findBorder(data);
            if (bgData.length > 0 && !_.isUndefined(bgData.replace)) { // ie bug workaround
                bgData.replace(jXML(xBgSnippet));
            } else {
                jXML(data).append(jXML(xBgSnippet));
            }
            this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        } else {
            var xSnippet = this._findBorder(domPlayerData);
            jXML(xSnippet).remove();
            this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        }
    }

    /**
     On changes in msdb model updated UI common alpha properties
     @method _alphaPopulate
     **/
    _alphaPopulate() {
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData);
        var data = jXML(domPlayerData).find('Data').eq(0);
        var xSnippet = jXML(data).find('Appearance').eq(0);
        var a1: any = jXML(xSnippet).attr('alpha');
        if (_.isUndefined(a1)) a1 = 1;
        this.formInputs['alpha'].setValue(a1)
    }

    _onAlphaChange(event) {
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData);
        var data = jXML(domPlayerData).find('Data').eq(0);
        var xSnippet = jXML(data).find('Appearance').eq(0);
        jXML(xSnippet).attr('alpha', event.target.value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        this.bs.notifySceneBlockChanged(this.m_blockData)
    }

    _sceneBackgroundPropsPopulate() {
        var self = this;
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
        var xSnippet = self._findBorder(domPlayerData);
        if (xSnippet.length > 0) {
            var color = jXML(xSnippet).attr('borderColor');
            this._updateBorderColor(true, color)
        } else {
            this._updateBorderColor(false, '16777215')
        }
    }

    /**
     On changes in msdb model updated UI common border properties
     @method _borderPropsPopulate
     **/
    _borderPropsPopulate() {
        var self = this;
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
        var xSnippet = self._findBorder(domPlayerData);
        if (xSnippet.length > 0) {
            var color = jXML(xSnippet).attr('borderColor');
            this._updateBorderColor(true, color)
        } else {
            this._updateBorderColor(false, '16777215')
        }
    }

    @timeout(50)
    _sceneBackgroundPopulate() {
        if (!this.m_isPropsForScene) return;
        var domPlayerData = this.bs.getBlockPlayerData(this.m_blockData)
        var xPoints = this._findGradientPointsScene(domPlayerData);
        var color = jXML(xPoints).find('Point').attr('color');
        if (_.isUndefined(color))
            return this.formInputs['sceneBackground'].setValue(false)
        this.formInputs['sceneBackground'].setValue(true);
        color = '#' + Lib.DecimalToHex(color);
        this.m_sceneBackgroundColor = color;
        this.cd.markForCheck();
    }

    @timeout(50)
    _updateBorderColor(i_value, i_color) {
        this.formInputs['border'].setValue(i_value);
        this.m_color = '#' + Lib.DecimalToHex(i_color);
        // this.formInputs['border_input'].setValue(this.m_color);
        this.cd.markForCheck();
    }

    @timeout(50)
    _updateSceneBackgroundColor(i_value, i_color) {
        this.formInputs['sceneBackground'].setValue(i_value);
        this.m_color = '#' + Lib.DecimalToHex(i_color);
        this.cd.markForCheck();
    }

    /**
     Find the border section in player_data for selected block
     @method _findBorder
     @param  {object} i_domPlayerData
     @return {Xml} xSnippet
     **/
    _findBorder(i_domPlayerData) {
        return jXML(i_domPlayerData).find('Border');
    }

    /**
     Load jXML gradient component once
     @method _bgGradientWidgetInit
     **/
    _bgGradientWidgetInit() {
        var self = this;
        var lazyUpdateBgColor = _.debounce(function (points, styles) {
            if (points.length == 0)
                return;
            self._gradientChanged({points: points, styles: styles})
            // console.log('gradient 1...' + Math.random());
        }, 50);

        var gradientColorPickerClosed = function () {
            // console.log('gradient 2');
        };

        jQuery('#bgColorGradientSelector', self.el.nativeElement).gradientPicker({
            change: lazyUpdateBgColor,
            closed: gradientColorPickerClosed,
            fillDirection: "90deg"
        });

        // always close gradient color picker on mouseout
        // jXML('.colorpicker').on('mouseleave', function (e) {
        //     jXML(document).trigger('mousedown');
        //     console.log('gradient 3');
        // });
    }

    /**
     On changes in msdb model updated UI common gradient background properties
     @method _gradientPopulate
     **/
    _gradientPopulate() {
        var self = this;
        var gradient = jXML('#bgColorGradientSelector', self.el.nativeElement).data("gradientPicker-sel");
        // gradient.changeFillDirection("top"); /* change direction future support */
        this._bgGradientWidgetClear();
        var domPlayerData = self.m_blockData.playerDataDom;
        var xSnippet = self._findGradientPoints(domPlayerData);
        if (xSnippet.length > 0) {
            var points = jXML(xSnippet).find('Point');
            $.each(points, function (i, point) {
                var pointColor = Lib.DecimalToHex(jXML(point).attr('color'));
                var pointMidpoint = (parseInt(jXML(point).attr('midpoint')) / 250);
                gradient.addPoint(pointMidpoint, pointColor, true);
            });
        }
    }

    _bgGradientWidgetClear() {
        var gradient = jQuery('#bgColorGradientSelector', this.el.nativeElement).data("gradientPicker-sel");
        gradient.removeAllPoints();
        gradient.clear();
    }

    _gradientChanged(e) {
        var self = this;
        var points: any = e.points;
        var styles = e.styles;
        if (points.length == 0)
            return;
        var domPlayerData = self.m_blockData.playerDataDom;
        jXML(domPlayerData).find('Background').remove();
        var pointsXML = "";
        for (var i = 0; i < points.length; ++i) {
            var pointMidpoint: any = (points[i].position * 250);
            var color = Lib.ColorToDecimal(points[i].color);
            var xPoint = '<Point color="' + color + '" opacity="1" midpoint="' + pointMidpoint + '" />';
            // log(xPoint);
            // jXML(gradientPoints).append(xPoint);
            pointsXML += xPoint;
        }
        var xPointsSnippet = jXML.parseXML(this.bs.getCommonBackgroundXML());
        jXML(xPointsSnippet).find('GradientPoints').empty().append(pointsXML);
        var newGradientPoints = (new XMLSerializer()).serializeToString(xPointsSnippet);
        jXML(domPlayerData).find('Data').append(newGradientPoints)
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _findGradientPoints(i_domPlayerData) {
        var xSnippet = jXML(i_domPlayerData).find('GradientPoints');
        return xSnippet;
    }

    _findGradientPointsScene(i_domPlayerData) {
        var xBackground = jXML(i_domPlayerData).find('Layout').eq(0).siblings().filter('Background');
        var xSnippet = jXML(xBackground).find('GradientPoints').eq(0);
        return xSnippet;
    }


    _onRemoveBackgroundClicked() {
        this._bgGradientWidgetClear();
        var domPlayerData = this.m_blockData.playerDataDom;
        var gradientPoints = this._findGradientPoints(domPlayerData);
        jXML(gradientPoints).empty();
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _findBackground(i_domPlayerData) {
        var xSnippet = jXML(i_domPlayerData).find('Background');
        return xSnippet;
    }

    destroy() {
        var gradient = jXML('#bgColorGradientSelector', this.el.nativeElement).data("gradientPicker-sel");
        gradient.destroyed();
    }
}

