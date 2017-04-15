import {AfterViewInit, ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {RedPepperService} from "../../services/redpepper.service";
import {Compbaser, NgmslibService} from "ng-mslib";
import {Lib, urlRegExp} from "../../Lib";
import * as _ from "lodash";
import {IFontSelector} from "../../comps/font-selector/font-selector";

@Component({
    selector: 'block-prop-label',
    host: {
        '(input-blur)': 'saveToStore($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `

        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <ul class="list-group">
                    <li class="list-group-item">
                        <textarea class="default-prop-width" spellcheck="true" rows="10" cols="50" type="textarea" [formControl]="m_contGroup.controls['text']">
                        </textarea>
                    </li>
                </ul>
            </div>
        </form>
        <font-selector (onChange)="_onFontChanged($event)" [setConfig]="m_fontConfig"></font-selector>
    `
})
export class BlockPropLabel extends Compbaser implements AfterViewInit {

    private formInputs = {};
    m_fontConfig: IFontSelector;
    m_contGroup: FormGroup;
    m_blockData: IBlockData;

    constructor(private fb: FormBuilder, private rp: RedPepperService, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'text': ['']
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
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

    ngAfterViewInit() {
        this._render();
    }

    _render() {
        var domPlayerData = this.m_blockData.playerDataDom
        var xSnippetLabel = jXML(domPlayerData).find('Label');
        var xSnippetText = jXML(xSnippetLabel).find('Text');
        var xSnippetFont = jXML(xSnippetLabel).find('Font');
        this.m_fontConfig = {
            bold: xSnippetFont.attr('fontWeight') == 'bold' ? true : false,
            italic: xSnippetFont.attr('fontStyle') == 'italic' ? true : false,
            underline: xSnippetFont.attr('textDecoration') == 'underline' ? true : false,
            alignment: xSnippetFont.attr('textAlign') as any,
            font: xSnippetFont.attr('fontFamily'),
            color: Lib.ColorToHex(Lib.DecimalToHex(xSnippetFont.attr('fontColor'))),
            size: parseInt(xSnippetFont.attr('fontSize'))
        };
        this.formInputs['text'].setValue(xSnippetText.text());
    }

    _onFontChanged(config: IFontSelector) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Label');
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

    private saveToStore() {
        // console.log(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var text = this.formInputs['text'].value;
        text = Lib.CleanProbCharacters(text, 1);
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Label');
        var xSnippetText = jXML(xSnippet).find('Text');
        if (text != xSnippetText.text()){
            jXML(xSnippetText).text(text);
        }


        var xSnippet = jXML(domPlayerData).find('HTML');
        xSnippet.attr('src', this.formInputs['text'].value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}
