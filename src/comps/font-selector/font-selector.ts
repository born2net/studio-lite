import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {Subject} from "rxjs";
import {FontLoaderService} from "../../services/font-loader-service";
import {timeout} from "../../decorators/timeout-decorator";
import {Lib} from "../../Lib";

export interface IFontSelector {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    alignment: 'left' | 'center' | 'right',
    font: string;
    color: string;
    size: number;
}

@Component({
    selector: 'font-selector',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <div id="fontSelectorTemplate">
            <div class="form-group">
                <select (change)="_onFontChanged($event)" name="fontSelection" class="fontSelection propControlWidth form-control">
                    <option [selected]="font==m_config.font" *ngFor="let font of m_fonts">
                        {{font}}
                    </option>
                </select>
                <div>
                    <div class="btn-group" role="group" aria-label="...">
                        <button (click)="_onFontStyleToggle('bold')" type="button" name="bold" class="fontFormatter btn btn-default btn-sm" [ngClass]="{active: m_config.bold}">
                            <i class="gencons fa fa-bold"></i>
                        </button>
                        <button (click)="_onFontStyleToggle('underline')" type="button" name="underline" class="fontFormatter btn btn-default btn-sm" [ngClass]="{active: m_config.underline}">
                            <i class="gencons fa fa-underline"></i>
                        </button>
                        <button (click)="_onFontStyleToggle('italic')" type="button" name="italic" class="fontFormatter btn btn-default btn-sm" [ngClass]="{active: m_config.italic}">
                            <i class="gencons fa fa-italic"></i>
                        </button>
                        <button (click)="_moveColorPicker()" #borderColor (colorPickerChange)="m_borderColorChanged.next($event)"
                                [cpOKButton]="true" [cpOKButtonClass]="'btn btn-primary btn-xs'"
                                [(colorPicker)]="m_config.color"
                                [cpPosition]="'left'"
                                [cpWidth]="'230px'"
                                [cpAlphaChannel]="'disabled'" class="colorPicker offSet"
                                [cpFallbackColor]="'#123'"
                                [style.background]="m_config.color" [value]="m_config.color">
                        </button>
                    </div>
                    <div class="btn-group" role="group" aria-label="...">
                        <button (click)="_onAlignmentChange('left')" type="button" name="alignLeft" class="fontAlignment btn btn-default btn-sm" [ngClass]="{active: m_config.alignment == 'left'}">
                            <i class="gencons fa fa-align-left"></i>
                        </button>
                        <button (click)="_onAlignmentChange('center')" type="button" name="alignCenter" class="fontAlignment btn btn-default btn-sm" [ngClass]="{active: m_config.alignment == 'center'}">
                            <i class="gencons fa fa-align-center"></i>
                        </button>
                        <button (click)="_onAlignmentChange('right')" type="button" name="alignRight" class="fontAlignment btn btn-default btn-sm" [ngClass]="{active: m_config.alignment == 'right'}">
                            <i class="gencons fa fa-align-right"></i>
                        </button>
                        <input (change)="_onFontSizeChanged(fontSize.value)" #fontSize class="offSet" name="fontSizeInput" type="number" [(ngModel)]="m_config.size" style="width: 60px">

                    </div>
                </div>
                <div style="clear: both; padding: 3px"></div>
                <div>
                </div>
            </div>
        </div>

    `,
    styles: [`
        /*:host /deep/ .color-picker {*/
        /*position: relative;*/
        /*} */

        .fontSelection {
            width: 200px;
        }

        .offSet {
            position: relative;
            top: 5px;
        }

        input {
            height: 30px;
        }

        button {
            margin: 5px;
            height: 30px;
        }

        .colorPicker {
            width: 20px;
            float: left;
            display: inline-block;
            margin: 0 10px 0 0;
            padding: 15px 45px;
            border-radius: 0;
            border: 1px solid gray;
            background: #ffffff;
            padding: 10px 20px 10px 20px;
            text-decoration: none;
        }
    `]

})
export class FontSelector extends Compbaser implements AfterViewInit {

    bold: boolean;
    italic: boolean;
    underline: boolean;
    alignment: 'left' | 'center' | 'right';
    m_fonts: Array<string>;
    m_borderColorChanged = new Subject();
    m_moveColorPickerOnce = false;

    m_config: IFontSelector = {
        size: 12,
        alignment: 'right',
        bold: true,
        italic: true,
        font: 'Lora',
        underline: true,
        color: '#ff0000',
    }

    constructor(private fontService: FontLoaderService, private el: ElementRef) {
        super();
        this.m_fonts = this.fontService.getFonts();
        this._listenColorChanged();
    }

    @Input()
    set setConfig(i_config: IFontSelector) {
        if (!i_config) return;
        if (Lib.ColorToDecimal(i_config.color)==0){
            i_config.color = '#ffffff';
        };
        this.m_config = i_config
    }

    @Output()
    onChange: EventEmitter<IFontSelector> = new EventEmitter<IFontSelector>();

    _listenColorChanged() {
        this.cancelOnDestroy(
            //
            this.m_borderColorChanged
                .debounceTime(500)
                .filter(v => v != '#123')
                .skip(1)
                .subscribe((i_color) => {
                    this.m_config.color = String(i_color);
                    this.onChange.emit(this.m_config);
                }, (e) => console.error(e))
        )
    }

    @timeout(1)
    _moveColorPicker() {
        if (this.m_moveColorPickerOnce) return;
        this.m_moveColorPickerOnce = true;
        jQuery(".color-picker", this.el.nativeElement).css("left", "+=100").css("top", "-=100");
        ;
    }

    _onFontChanged(e) {
        this.m_config.font = e.target.value;
        this.onChange.emit(this.m_config);
    }

    _onFontSizeChanged(i_value) {
        this.m_config.size = i_value;
        this.onChange.emit(this.m_config);
    }

    _onFontStyleToggle(i_style) {
        this.m_config[i_style] = !this.m_config[i_style];
        this.onChange.emit(this.m_config);
    }

    _onAlignmentChange(direction: 'left' | 'center' | 'right') {
        this.m_config.alignment = direction;
        this.onChange.emit(this.m_config);
    }

    ngAfterViewInit() {

    }

    ngOnInit() {
    }

    destroy() {
    }
}