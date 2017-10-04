import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import * as _ from "lodash";
import {BlockService, IBlockData, ISceneData} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {timeout} from "../../decorators/timeout-decorator";
import {BlockLabels} from "../../interfaces/Consts";

@Component({
    selector: 'block-prop-position',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`

        .checkered {
            background-image:
                    -moz-linear-gradient(45deg, #000 25%, transparent 25%,transparent 75%, #000 75%, #000 100%),
                    -moz-linear-gradient(45deg, #000 25%, transparent 25%,transparent 75%, #000 75%, #000 100%);
            background-image:
                    -webkit-linear-gradient(45deg, #000 25%, transparent 25%,transparent 75%, #000 75%, #000 100%),
                    -webkit-linear-gradient(45deg, #000 25%, transparent 25%,transparent 75%, #000 75%, #000 100%);
            -moz-background-size:50px 50px;
            background-size:50px 50px;
            -webkit-background-size:5px 5px;
            background-position:0 0, 5px 5px;
        }
        
        li {
            padding-top: 3px;
            padding-bottom: 3px;
        }

        form {
            padding: 20px;
        }

        .inliner {
            display: inline-block;
            width: 60px;
        }

        input.ng-invalid {
            border-right: 10px solid red;
        }

        .material-switch {
            position: relative;
            padding-top: 10px;
        }

        .input-group {
            padding-top: 10px;
        }

        i {
            width: 20px;
        }
    `],
    template: `
        <div>
            <form novalidate autocomplete="off" [formGroup]="m_contGroup">
                <div class="row">
                    <div class="inner userGeneral">
                        <div class="row">
                            <div class="inner userGeneral">
                                <ul class="list-group">
                                    <li *ngIf="!m_blockIsScene" class="list-group-item">
                                        <span i18n class="inliner">top</span>
                                        <input type="number" class="numStepper inliner" formControlName="pixel_y">
                                    </li>
                                    <li *ngIf="!m_blockIsScene" class="list-group-item">
                                        <span i18n class="inliner">left</span>
                                        <input type="number" class="numStepper inliner" formControlName="pixel_x">
                                    </li>
                                    <li class="list-group-item">
                                        <span i18n class="inliner">width</span>
                                        <input type="number" type="number" min="50" max="4096" class="numStepper inliner" formControlName="pixel_width">
                                    </li>
                                    <li class="list-group-item">
                                        <span i18n class="inliner">height</span>
                                        <input type="number" min="50" max="4096" class="numStepper inliner" formControlName="pixel_height">
                                    </li>
                                    <li *ngIf="!m_blockIsScene" class="list-group-item">
                                        <span i18n class="inliner">rotation</span>
                                        <input type="number" min="0" max="360" class="numStepper inliner" formControlName="rotation">
                                    </li>
                                    <li class="list-group-item">
                                        <button i18n type="button" style="width: 125px" class="btn btn-secondary btn-sm" (click)="saveToStoreLayout()">apply changes</button>
                                    </li>
                                    <hr/>
                                    <li *ngIf="!m_blockIsScene" class="list-group-item">
                                        <br/>
                                        <span i18n>locked</span>
                                        <div class="material-switch pull-right">
                                            <input (change)="saveToStoreLock(locked.checked)"
                                                   formControlName="locked"
                                                   id="locked" #locked
                                                   name="locked" type="checkbox"/>
                                            <label for="locked" class="label-primary"></label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <table border="0" style="width: 150px; height: 150px">
                        <tr>
                            <td></td>
                            <td><input type="checkbox"></td>
                            <td><input type="checkbox"></td>
                            <td><input type="checkbox"></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><input type="checkbox" style="padding-right: 5px"></td>
                            <td colspan="3" rowspan="3" class="checkered" style="background-color: #c1c1c1"></td>
                            <td><input type="text" style="width: 32px; margin-left: 5px"/></td>
                        </tr>
                        <tr>
                            <td><input type="checkbox" style="margin-right: 5px"></td>
                            <td><input type="text" style="width: 32px; margin-left: 5px"/></td>
                        </tr>
                        <tr>
                            <td><input type="checkbox"></td>
                            <td><input type="text" style="width: 32px; margin-left: 5px"/></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input type="text" style="width: 32px"/></td>
                            <td><input type="text" style="width: 32px"/></td>
                            <td><input type="text" style="width: 32px"/></td>
                            <td></td>
                        </tr>
                    </table>


                    <!--<input type="checkbox" style="margin-right: 30px" class="pull-left"/>-->
                    <!--<input type="checkbox" style="margin-right: 30px" class="pull-left"/>-->
                    <!--<input type="checkbox" style="margin-right: 30px" class="pull-left"/>-->
                    <!--<div class="clearFloat"></div>                    -->
                    <!--<input type="checkbox" style="margin-top: 30px"/>-->
                    <!--<br/>-->
                    <!--<input type="checkbox" style="margin-top: 30px"/>-->
                    <!--<br/>-->
                    <!--<input type="checkbox" style="margin-top: 30px"/>                                        -->
                </div>
            </form>
        </div>
    `
})
export class BlockPropPosition extends Compbaser {

    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_canvasScale = -1;
    m_blockIsScene = false;

    constructor(private fb: FormBuilder, private rp: RedPepperService, private yp: YellowPepperService, private bs: BlockService, private cd: ChangeDetectorRef) {
        super();

        this.m_contGroup = fb.group({
            'pixel_y': [0],
            'pixel_x': [0],
            'pixel_width': [0],
            'pixel_height': [0],
            'rotation': [0],
            'locked': []
        });

        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })

        this.cancelOnDestroy(
            //
            this.yp.listenSceneOrBlockSelectedChanged()
                .combineLatest(this.yp.listenFabricSceneScaled(), (i_sceneData: ISceneData, i_scale: number) => {
                    this.m_canvasScale = i_scale;
                    return i_sceneData
                })
                .mergeMap((i_sceneData: ISceneData) => {
                    return this.bs.getBlockDataInScene(i_sceneData)
                })
                .subscribe((blockData: IBlockData) => {
                    this.m_blockIsScene = parseInt(blockData.blockCode) == BlockLabels.BLOCKCODE_SCENE ? true : false;
                    this.m_blockData = blockData;
                    this.m_formInputs['locked'].setValue(StringJS(blockData.playerDataJson.Player._locked).booleanToNumber());
                    this.m_formInputs['rotation'].setValue(blockData.playerDataJson.Player.Data.Layout._rotation);
                    this.m_formInputs['pixel_height'].setValue(blockData.playerDataJson.Player.Data.Layout._height);
                    this.m_formInputs['pixel_width'].setValue(blockData.playerDataJson.Player.Data.Layout._width);
                    this.m_formInputs['pixel_x'].setValue(blockData.playerDataJson.Player.Data.Layout._x);
                    this.m_formInputs['pixel_y'].setValue(blockData.playerDataJson.Player.Data.Layout._y);
                    this.cd.markForCheck();
                }, (e) => console.error(e))
        )
    }

    ngAfterViewInit() {
        // this.cancelOnDestroy(
        //     this.m_contGroup.valueChanges
        //         .map(v => {
        //             for (var z in v)
        //                 v[z] = parseInt(v[z])
        //             return v;
        //         })
        //         .filter(v => !_.some(v, (o) => _.isNaN(o)))
        //         .startWith({})
        //         .pairwise()
        //         .filter(v => !_.isEqual(v[0], v[1]))
        //         .debounceTime(1000)
        //         .subscribe((v) => {
        //             this.saveToStoreLayout();
        //         }, (e) => console.error(e)) //cancelOnDestroy please
        // )
    }

    saveToStoreLayout() {
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var x = this.m_contGroup.value.pixel_x;
        var y = this.m_contGroup.value.pixel_y;
        var w = this.m_contGroup.value.pixel_width;
        var h = this.m_contGroup.value.pixel_height;
        var r = this.m_contGroup.value.rotation;
        var blockMinWidth = 50;
        var blockMinHeight = 50;
        if (h < blockMinHeight)
            h = blockMinHeight;
        if (w < blockMinWidth)
            w = blockMinWidth;

        if (this.m_blockIsScene) {
            $(domPlayerData).find('Layout').eq(0).attr('width', w);
            $(domPlayerData).find('Layout').eq(0).attr('height', h);
            this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
            this.bs.notifyReloadScene(this.m_blockData.scene.handle);

        } else {

            var layout = $(domPlayerData).find('Layout');
            layout.attr('rotation', parseInt(r));
            layout.attr('x', parseInt(x));
            layout.attr('y', parseInt(y));
            layout.attr('width', parseInt(w));
            layout.attr('height', parseInt(h));
            this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
            this.bs.notifySceneBlockChanged(this.m_blockData);
        }
    }

    @timeout(250)
    private saveToStoreLock(v) {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var r = v == true ? 1 : 0;
        jXML(domPlayerData).find('Player').attr('locked', r);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        this.bs.notifySceneBlockChanged(this.m_blockData);
    }

    destroy() {
    }
}
