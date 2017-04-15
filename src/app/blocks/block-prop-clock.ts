import {AfterViewInit, ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {Compbaser} from "ng-mslib";
import {IFontSelector} from "../../comps/font-selector/font-selector";
import {Lib} from "../../Lib";

@Component({
    selector: 'block-prop-clock',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <div style="padding: 5px">
            <form novalidate autocomplete="off">
                <div class="row">
                    <ul class="list-group">
                        <li class="list-group-item">
                            <div id="blockClockCommonProperties">
                                <span i18n>Choose format</span>
                                <div class="radio" *ngFor="let item of m_clockFormats">
                                    <label>
                                        <input type="radio" name="options" (click)="m_model.options = item; _onFormatChanged(item)" [checked]="item === m_model.options" [value]="item">
                                        {{item.format}}
                                    </label>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </form>
        </div>
        <font-selector (onChange)="_onFontChanged($event)" [setConfig]="m_fontConfig"></font-selector>
    `
})
export class BlockPropClock extends Compbaser implements AfterViewInit {

    m_blockData: IBlockData;
    m_fontConfig: IFontSelector;
    m_clockFormats = [{
        type: 'longDateAndTime',
        format: 'Friday, Mar 21 2018 at 8:59AM'
    }, {
        type: 'longDate',
        format: 'Friday, Mar 21 2018'
    }, {
        type: 'shortDayTime',
        format: 'Friday 9:10 AM'
    }, {
        type: 'date',
        format: '3/21/18'
    }, {
        type: 'time',
        format: '9:00:39 AM'
    }];

    m_model = {
        options: this.m_clockFormats[0]
    };

    constructor(private fb: FormBuilder, private rp: RedPepperService, private bs: BlockService) {
        super();
    }

    @Input()
    set setBlockData(i_blockData) {
        if (this.m_blockData && this.m_blockData.blockID != i_blockData.blockID) {
            this.m_blockData = i_blockData;
            this._render();
        } else {
            this.m_blockData = i_blockData;
        }
    }

    _onFontChanged(config: IFontSelector) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Clock');
        var xSnippetFont = jXML(xSnippet).find('Font');
        config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
        config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
        config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'none');
        xSnippetFont.attr('fontColor', Lib.ColorToDecimal(config.color));
        xSnippetFont.attr('fontSize', config.size);
        xSnippetFont.attr('fontFamily', config.font);
        xSnippetFont.attr('textAlign', config.alignment);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    _onFormatChanged(e) {
        var mask = this.bs.getBlockBoilerplate(this.m_blockData.blockCode).getDateTimeMask(e.type);
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Clock');
        xSnippet.attr('clockMask', mask);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    ngAfterViewInit() {
        this._render();
    }

    _render() {
        var self = this;
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Clock');
        var mask = jXML(xSnippet).attr('clockMask');
        var xSnippetFont = jXML(xSnippet).find('Font');

        this.m_clockFormats.forEach(i_clockFormat => {
            var currMask = self.bs.getBlockBoilerplate(self.m_blockData.blockCode).getDateTimeMask(i_clockFormat.type);
            if (mask == currMask) {
                this.m_model = {options: i_clockFormat};
            }
        });

        this.m_fontConfig = {
            size: Number(xSnippetFont.attr('fontSize')),
            alignment: <any>xSnippetFont.attr('textAlign'),
            bold: xSnippetFont.attr('fontWeight') == 'bold' ? true : false,
            italic: xSnippetFont.attr('fontStyle') == 'italic' ? true : false,
            font: xSnippetFont.attr('fontFamily'),
            underline: xSnippetFont.attr('textDecoration') == 'underline' ? true : false,
            color: Lib.ColorToHex(Lib.DecimalToHex(xSnippetFont.attr('fontColor'))),
        }
    }

    destroy() {
        // console.log('destroy html component');
    }
}
