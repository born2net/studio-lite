import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import {Lib, urlRegExp} from "../../Lib";
import * as _ from "lodash";
import {IFontSelector} from "../../comps/font-selector/font-selector";

@Component({
    selector: 'block-prop-rss',
    host: {'(input-blur)': 'saveToStore($event)'},
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <ul class="list-group">
                    <li class="list-group-item">
                        <select #sceneSelection class="default-prop-width" (change)="_onRssSelected($event)" formControlName="rssSelection">
                            <option [value]="rss.url" *ngFor="let rss of m_mrssLinksData">{{rss.label}}</option>
                        </select>
                    </li>
                    <li *ngIf="m_showCustomUrl" class="list-group-item">
                        <input class="default-prop-width" type="text" formControlName="url"/>
                    </li>
                    <li class="list-group-item">
                        <label i18n>RSS refresh (minutes)</label><br/>
                        <input class="default-prop-width" type="number" min="1" [formControl]="m_contGroup.controls['minRefreshTime']"/>
                    </li>
                    <li class="list-group-item">
                        <label i18n>RSS scroll direction</label>
                        <br/>
                        <input type="radio" value="0" name="vertical" formControlName="vertical">
                        <span i18n>Horizontal</span>
                        <br/>
                        <input type="radio" value="1" name="vertical" formControlName="vertical">
                        <span i18n>Vertical</span>
                    </li>
                    <li class="list-group-item">
                        <label i18n>RSS scroll speed</label>
                        <br/>
                        <input type="radio" value="20" name="speed" formControlName="speed">
                        <span i18n>slow</span>
                        <br/>
                        <input type="radio" value="50" name="speed" formControlName="speed">
                        <span i18n>medium</span>
                        <br/>
                        <input type="radio" value="100" name="speed" formControlName="speed">
                        <span i18n>fast</span>
                    </li>
                    
                </ul>
            </div>
            <font-selector (onChange)="_onFontChanged($event)" [setConfig]="m_fontConfig"></font-selector>
        </form>
    `
})
export class BlockPropRss extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_fontConfig: IFontSelector;
    m_blockData: IBlockData;
    m_showCustomUrl = false;
    m_mrssLinksData = [];
    m_mrssLinks = '<TextRss>' +
        '<Rss label="Top Stories" url="http://rss.news.yahoo.com/rss/topstories"/>' +
        '<Rss label="U.S. National" url="http://rss.news.yahoo.com/rss/us"/>' +
        '<Rss label="Elections" url="http://rss.news.yahoo.com/rss/elections"/>' +
        '<Rss label="Terrorism" url="http://rss.news.yahoo.com/rss/terrorism"/>' +
        '<Rss label="World" url="http://rss.news.yahoo.com/rss/world"/>' +
        '<Rss label="Mideast Conflict" url="http://rss.news.yahoo.com/rss/mideast"/>' +
        '<Rss label="Iraq" url="http://rss.news.yahoo.com/rss/iraq"/>' +
        '<Rss label="Politics" url="http://rss.news.yahoo.com/rss/politics"/>' +
        '<Rss label="Business" url="http://rss.news.yahoo.com/rss/business"/>' +
        '<Rss label="Technology" url="http://rss.news.yahoo.com/rss/tech"/>' +
        '<Rss label="Sports" url="http://rss.news.yahoo.com/rss/sports"/>' +
        '<Rss label="Entertainment" url="http://rss.news.yahoo.com/rss/entertainment"/>' +
        '<Rss label="Health" url="http://rss.news.yahoo.com/rss/health"/>' +
        '<Rss label="Odd News" url="http://rss.news.yahoo.com/rss/oddlyenough"/>' +
        '<Rss label="Science" url="http://rss.news.yahoo.com/rss/science"/>' +
        '<Rss label="Opinion/Editorial" url="http://rss.news.yahoo.com/rss/oped"/>' +
        '<Rss label="Obituaries" url="http://rss.news.yahoo.com/rss/obits"/>' +
        '<Rss label="Most Emailed" url="http://rss.news.yahoo.com/rss/mostemailed"/>' +
        '<Rss label="Most Viewed" url="http://rss.news.yahoo.com/rss/mostviewed"/>' +
        '<Rss label="Most Recommended" url="http://rss.news.yahoo.com/rss/highestrated"/>' +
        '<Rss label="Custom" url=""/>' +
        '</TextRss>'

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'url': ['', [Validators.pattern(urlRegExp)]],
            'minRefreshTime': [1],
            'vertical': [0],
            'speed': [50],
            'rssSelection': []
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
        })
        var links = jXML(jXML.parseXML(this.m_mrssLinks)).find('Rss');
        _.forEach(links, (k, v) => {
            this.m_mrssLinksData.push({
                url: jXML(k).attr('url'),
                label: jXML(k).attr('label')
            })
        });
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

    @Input() external: boolean = false;

    _isUrlCustom(i_url): boolean {
        var feed = this.m_mrssLinksData.find(o => o.url == i_url);
        if (feed && feed.label == 'Custom') return true;
        if (feed) return false;
        return true;
    }

    _onRssSelected(event) {
        this.m_showCustomUrl = this._isUrlCustom(event.target.value);
    }

    _onFontChanged(config: IFontSelector) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Rss');
        var xSnippetFont = jXML(xSnippet).find('Font').eq(0);
        config.bold == true ? xSnippetFont.attr('fontWeight', 'bold') : xSnippetFont.attr('fontWeight', 'normal');
        config.italic == true ? xSnippetFont.attr('fontStyle', 'italic') : xSnippetFont.attr('fontStyle', 'normal');
        config.underline == true ? xSnippetFont.attr('textDecoration', 'underline') : xSnippetFont.attr('textDecoration', 'none');
        xSnippetFont.attr('fontColor', Lib.ColorToDecimal(config.color));
        xSnippetFont.attr('fontSize', config.size);
        xSnippetFont.attr('fontFamily', config.font);
        xSnippetFont.attr('textAlign', config.alignment);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    private _render() {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom
        var xSnippet = jXML(domPlayerData).find('Rss');
        var xSnippetFont = jXML(xSnippet).find('Font').eq(0);
        var url = xSnippet.attr('url');
        var vertical = jXML(xSnippet).attr('vertical');
        var minRefreshTime = jXML(xSnippet).attr('minRefreshTime')
        var speed = jXML(xSnippet).attr('speed')

        if (this._isUrlCustom(url)) {
            this.m_showCustomUrl = true;
            this.m_formInputs['rssSelection'].setValue('');
            this.m_formInputs['url'].setValue(url);
        } else {
            this.m_showCustomUrl = false;
            this.m_formInputs['rssSelection'].setValue(url);
        }
        this.m_formInputs['minRefreshTime'].setValue(minRefreshTime);
        this.m_formInputs['speed'].setValue(speed);
        this.m_formInputs['vertical'].setValue(vertical);

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

    ngAfterViewInit() {
        this._render();
    }

    private saveToStore() {
        // con(this.m_contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.m_contGroup.value)));
        if (this.m_contGroup.status != 'VALID')
            return;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('Rss');
        if (this.m_contGroup.value.rssSelection == ''){
            jXML(xSnippet).attr('url', this.m_contGroup.value.url);
        } else {
            jXML(xSnippet).attr('url', this.m_contGroup.value.rssSelection);
        }
        jXML(xSnippet).attr('minRefreshTime', this.m_contGroup.value.minRefreshTime);
        jXML(xSnippet).attr('speed', this.m_contGroup.value.speed);
        jXML(xSnippet).attr('vertical', this.m_contGroup.value.vertical);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    destroy() {
    }
}