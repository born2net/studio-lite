import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BlockService, IBlockData} from "./block-service";
import {Compbaser, NgmslibService} from "ng-mslib";
import * as _ from "lodash";
import {IFontSelector} from "../../comps/font-selector/font-selector";
import {Lib} from "../../Lib";

@Component({
    selector: 'block-prop-json-item',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <form novalidate autocomplete="off" class="inner5" [formGroup]="m_contGroup">
            <div class="row">
                <div id="blockJsonItemCommonProperties">
                    <div *ngIf="jsonItemFieldContainer">
                        <span data-localize="JsonItem">Json path notation</span>
                        <br/>
                        <input type="text" name="name" formControlName="jsonItemField" value="jsonItemField" placeholder="json item">
                    </div>
                    <div>
                        <div *ngIf="jsonItemTextFieldsContainer">
                            <label style="padding-right: 78px; width: 200px" for="jsonItemTextFields" data-localize="field">
                                field </label>
                            <select formControlName="jsonItemTextFields" (change)="_onJsonItemTextFieldsChanged($event)" class="propControlWidth form-control">
                                <option [value]="field.value" *ngFor="let field of m_fields">{{field.label}}</option>
                            </select>
                        </div>
                    </div>
                    <br/>
                    <div *ngIf="jsonItemDualNumericSettings">
                        <label style="display: inline-block; padding-right: 8px"> row </label>
                        <label style="display: inline-block"> column </label>
                        <div class="spinnerDimHeight">
                            <div style="float: left">
                                <span data-numeric="column">
                                     <input (change)="_onDualNumericChanged()" formControlName="jsonItemDualNumeric1" type="number" style="width: 60px">
                                </span>
                            </div>
                        </div>
                        <div class="spinnerDimHeight">
                            <div style="float: left">
                                <span data-numeric="row">
                                 <input (change)="_onDualNumericChanged()" formControlName="jsonItemDualNumeric2" type="number" style="width: 60px">
                              </span>
                            </div>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                    <div *ngIf="jsonItemFontSettings">
                        <font-selector (onChange)="_onFontChanged($event)" [setConfig]="m_fontConfig"></font-selector>
                    </div>
                    <div *ngIf="jsonItemDateSettings">
                        <div class="clearfix"></div>
                        <label class="pull-left" data-localize="dateFormat">date format</label>
                        <select formControlName="jsonItemDateFormat" (change)="_onJsonItemDateFieldsChanged($event)" class="propControlWidth form-control">
                            <option [value]="dateField.value" *ngFor="let dateField of m_dateFields">{{dateField.value}}</option>
                        </select>
                    </div>
                    <div *ngIf="jsonItemIconSettings">
                        <span i18n>maintain aspect ratio</span>
                        <div class="material-switch pull-right">
                            <input #imageRatio (change)="_toggleAspectRatio(imageRatio.checked)"
                                   formControlName="jsonItemMaintainAspectRatio"
                                   class="default-prop-width"
                                   id="imageRatio"
                                   name="imageRatio" type="checkbox"/>
                            <label for="imageRatio" class="label-primary"></label>
                        </div>
                        <div class="clearfix" style="padding-bottom: 13px"></div>
                    </div>
                </div>
            </div>
        </form>
    `
})
export class BlockPropJsonItem extends Compbaser implements AfterViewInit {
    m_formInputs = {};
    m_contGroup: FormGroup;
    m_blockData: IBlockData;
    m_sheetList = [];
    m_sheetSeleced: any = {};
    m_fields = [];
    m_dateFields = [];
    m_fontConfig: IFontSelector;

    jsonItemFieldContainer;
    jsonItemTextFieldsContainer;
    jsonItemDualNumericSettings;
    jsonItemIconSettings;
    jsonItemDateSettings;
    jsonItemFontSettings;

    constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private bs: BlockService, private ngmslibService: NgmslibService) {
        super();
        this.m_contGroup = fb.group({
            'jsonItemField': [''],
            'jsonItemTextFields': [''],
            'jsonItemDualNumeric1': [''],
            'jsonItemDualNumeric2': [''],
            'jsonItemDateFormat': [''],
            'jsonItemMaintainAspectRatio': ['']
        });
        _.forEach(this.m_contGroup.controls, (value, key: string) => {
            this.m_formInputs[key] = this.m_contGroup.controls[key] as FormControl;
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

    private _render() {
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom
        var jXMLdata = jXML(domPlayerData).find('Json').find('Data');
        var mode = jXMLdata.attr('mode');

        // JSON item (no mime)
        if (_.isUndefined(this.m_blockData.playerMimeScene)) {
            var domPlayerData = this.m_blockData.playerDataDom;
            var xSnippet = jXML(domPlayerData).find('XmlItem');
            var xSnippetFont = jXML(xSnippet).find('Font');
            var fieldName = jXML(xSnippet).attr('fieldName');

            this.jsonItemFieldContainer = true;
            this.jsonItemTextFieldsContainer = false;
            this.jsonItemDualNumericSettings = false;
            this.jsonItemIconSettings = false;
            this.jsonItemDateSettings = false;
            this.m_formInputs['jsonItemField'].setValue(fieldName);
            this._populateFonts(xSnippetFont)
        } else {
            // Json mime
            this._populateMimeType();
        }
    }

    _toggleAspectRatio(i_value) {
        i_value = StringJS(i_value).booleanToNumber()
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
        jXML(xSnippet).attr('maintainAspectRatio', i_value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData)
    }

    _onJsonItemTextFieldsChanged(event) {
        var name = event.target.value;
        var mime = this.m_blockData.playerMimeScene;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
        _.forEach(this.m_config[mime].fields, (k) => {
            if (k.name == name) {
                jXML(xSnippet).attr('fieldType', k.type);
                jXML(xSnippet).attr('fieldName', k.name);
                this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
                this._populateMimeType();

            }
        })
    }

    _onJsonItemDateFieldsChanged(event) {
        var value = event.target.value;
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
        jXML(xSnippet).attr('dateFormat', value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
        this._populateMimeType();
    }

    _onDualNumericChanged(){
        var domPlayerData: XMLDocument = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
        var row = this.m_contGroup.value.jsonItemDualNumeric1;
        var column = this.m_contGroup.value.jsonItemDualNumeric2;
        var fieldName = `$cells.${row}.${column}.value`;
        jXML(xSnippet).attr('fieldName', fieldName);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }
    
    _onFontChanged(config: IFontSelector) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
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

    /**
     The component is a subclass of JSON item (i.e.: it has a mimetype) so we need to populate it according
     to its mimetype config options
     **/
    private _populateMimeType() {
        var self = this;
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
        var xSnippetFont = jXML(xSnippet).find('Font');
        var fieldType = jXML(xSnippet).attr('fieldType');
        var fieldName = jXML(xSnippet).attr('fieldName');
        var maintainAspectRatio = jXML(xSnippet).attr('maintainAspectRatio');
        var dateFormat = jXML(xSnippet).attr('dateFormat');

        this.jsonItemFieldContainer = false;
        this.jsonItemTextFieldsContainer = true;

        this.m_fields = [{type: '', value: '', label: 'no field selected'}];
        var fields: any = self.m_config[this.m_blockData.playerMimeScene].fields;
        _.each(fields, (k: any) => this.m_fields.push({type: k.type, value: k.name, label: k.label}));
        this.m_formInputs['jsonItemTextFields'].setValue(fieldName)

        // populate according to filed type (text/resource)
        switch (fieldType) {
            case 'resource': {
                this.jsonItemFontSettings = false;
                this.jsonItemDateSettings = false;
                this.jsonItemIconSettings = true;
                self._populateAspectRatio(maintainAspectRatio);
                break;
            }
            case 'date': {
                self._populateDateFormat(dateFormat);
                this._populateFonts(xSnippetFont);
                this.jsonItemDateSettings = true;
                break;
            }
            case 'dual_numeric': {
            }
            case 'text': {
                this.jsonItemIconSettings = false;
                this.jsonItemDateSettings = false;
                this.jsonItemFontSettings = true;
                this._populateFonts(xSnippetFont);
                break;
            }
        }

        // populate according to mimetype exception or default behavior
        switch (this.m_blockData.playerMimeScene) {
            case 'Json.spreadsheet': {
                this.jsonItemDualNumericSettings = true;
                self._populateDualNumeric();
                break;
            }
            default: {
                this.jsonItemDualNumericSettings = false;
            }
        }
        this.cd.markForCheck();
        this.cd.detectChanges();
    }

    private _populateFonts(xSnippetFont) {
        this.m_fontConfig = {
            bold: xSnippetFont.attr('fontWeight') === 'bold' ? true : false,
            italic: xSnippetFont.attr('fontStyle') === 'italic' ? true : false,
            underline: xSnippetFont.attr('textDecoration') === 'underline' ? true : false,
            alignment: <any>xSnippetFont.attr('textAlign'),
            font: xSnippetFont.attr('fontFamily'),
            color: Lib.ColorToHex(Lib.DecimalToHex(xSnippetFont.attr('fontColor'))),
            size: Number(xSnippetFont.attr('fontSize'))
        };
        // this.cd.markForCheck();
    }

    /**
     Populate date format for common types of date styles on dropdown selection
     @method _populateDateFormat
     @param {string} i_selectedFormat
     **/
    private _populateDateFormat(i_selectedFormat) {
        var formats = [
            'D/M/Y',
            'DD/MM/YY',
            'DD/MM/YYYY',
            'DD/MMM/YY',
            'MM/DD/YY',
            'MM/DD/YYYY',
            'MMM/DD/YYYY ',
            'D/M/Y J:NN:SS',
            'DD/MM/YY J:NN:SS',
            'DD/MM/YYYY J:NN:SS',
            'DD/MMM/YY J:NN:SS',
            'MM/DD/YY J:NN:SS',
            'MM/DD/YYYY J:NN:SS',
            'MMM/DD/YYYY J:NN:SS',
            'J:NN:SS',
            'J:NN:SS A',
            'J:NN:SS A',
            'J:NN'
        ];
        this.m_dateFields = [{value: 'select format'}];
        for (var i = 0; i < formats.length; i++) {
            this.m_dateFields.push({value: formats[i]});
        }
        this.m_formInputs['jsonItemDateFormat'].setValue(i_selectedFormat)
    }

    /**
     Populate aspect ratio switch button
     **/
    private _populateAspectRatio(i_aspectRatio) {
        var value = StringJS(i_aspectRatio).booleanToNumber();
        this.m_formInputs['jsonItemMaintainAspectRatio'].setValue(value)
    }

    /**
     Populate the dual numeric steppers that are used in components like the google sheets
     @method _populateDualNumeric
     **/
    private _populateDualNumeric() {
        var row: string = '1';
        var column: string = '1';
        var domPlayerData = this.m_blockData.playerDataDom;
        var xSnippet = jXML(domPlayerData).find('XmlItem');
        var fieldName = jXML(xSnippet).attr('fieldName');
        var re = /cells.([0-9]+).([0-9]+).value/i;
        var match = fieldName.match(re);
        if (!_.isNull(match)) {
            row = String(match[1]);
            column = String(match[2]);
        }
        this.m_formInputs['jsonItemDualNumeric1'].setValue(row)
        this.m_formInputs['jsonItemDualNumeric2'].setValue(column)
        // var spinners = jXML('.spinner', Elements.JSON_ITEM_DUAL_NUMERIC_SETTINGS);
        // jXML(spinners[0]).spinner('value', row);
        // jXML(spinners[2]).spinner('value', column);
    }

    ngAfterViewInit() {
        this._render();
    }

    m_config = {
        'Json.instagram.feed': {
            title: 'Instagram',
            tabTitle: 'Posts',
            fields: {
                1: {
                    name: "title",
                    type: "text",
                    label: "title"
                },
                2: {
                    name: "urlImage",
                    type: "resource",
                    label: "image"
                },
                3: {
                    name: "video",
                    type: "resource",
                    label: "video"
                }
            }
        },
        'Json.twitter': {
            title: 'Twitter',
            tabTitle: 'Tweets',
            fields: {
                1: {
                    name: "name",
                    type: "text",
                    label: "name"
                },
                2: {
                    name: "text",
                    type: "text",
                    label: "text"
                },
                3: {
                    name: "screen_name",
                    type: "text",
                    label: "screen name"
                },
                4: {
                    name: "created_at",
                    type: "text",
                    label: "created at"
                },
                5: {
                    name: "profile_background_image_url",
                    type: "resource",
                    label: "Background image"
                },
                6: {
                    name: "profile_image_url",
                    type: "resource",
                    label: "Image"
                }
            }
        },
        'Json.digg': {
            title: 'Digg',
            tabTitle: 'Posts',
            fields: {
                1: {
                    name: "title",
                    type: "text",
                    label: "title"
                },
                2: {
                    name: "link",
                    type: "resource",
                    label: "image"
                }
            }
        },
        'Json.spreadsheet': {
            title: 'Spreadsheet',
            tabTitle: 'Cells',
            fields: {
                1: {
                    name: "$cells.1.1.value",
                    type: "dual_numeric",
                    label: "Sheet cell"
                }
            }
        },

        'Json.calendar': {
            title: 'Calendar',
            tabTitle: 'Date',
            fields: {
                1: {
                    name: "summary",
                    type: "text",
                    label: "summary"
                },
                2: {
                    name: "description",
                    type: "text",
                    label: "description"
                },
                3: {
                    name: "organizer",
                    type: "text",
                    label: "organizer"
                },
                4: {
                    name: "organizerEmail",
                    type: "text",
                    label: "organizer email"
                },
                5: {
                    name: "created",
                    type: "text",
                    label: "created"
                },
                6: {
                    name: "startDateTime_time",
                    type: "date",
                    label: "start date time"
                },
                7: {
                    name: "endDateTime_time",
                    type: "date",
                    label: "end date time"
                },
                8: {
                    name: "updated",
                    type: "text",
                    label: "updated"
                }
            }
        },
        'Json.weather': {
            title: 'World weather',
            tabTitle: 'Conditions',
            fields: {
                1: {
                    name: "$[0].data.current_condition[0].iconPath",
                    type: "resource",
                    label: "current icon"
                },
                2: {
                    name: "$[0].data.current_condition[0].temp_@",
                    type: "text",
                    label: "current temp"
                },
                3: {
                    name: "$[0].data.current_condition[0].humidity",
                    type: "text",
                    label: "current humidity"
                },
                4: {
                    name: "$[0].data.weather[0].iconPath",
                    type: "resource",
                    label: "today icon"
                },
                5: {
                    name: "$[0].data.weather[0].mintemp@",
                    type: "text",
                    label: "today min temp"
                },
                6: {
                    name: "$[0].data.weather[0].maxtemp@",
                    type: "text",
                    label: "today max temp"
                },
                7: {
                    name: "$[0].data.weather[0].day",
                    type: "text",
                    label: "today label"
                },
                8: {
                    name: "$[0].data.weather[1].iconPath",
                    type: "resource",
                    label: "today+1 icon"
                },
                9: {
                    name: "$[0].data.weather[1].mintemp@",
                    type: "text",
                    label: "today+1 min temp"
                },
                10: {
                    name: "$[0].data.weather[1].maxtemp@",
                    type: "text",
                    label: "today+1 max temp"
                },
                11: {
                    name: "$[0].data.weather[1].day",
                    type: "text",
                    label: "today+1 label"
                },
                12: {
                    name: "$[0].data.weather[2].iconPath",
                    type: "resource",
                    label: "today+2 icon"
                },
                13: {
                    name: "$[0].data.weather[2].mintemp@",
                    type: "text",
                    label: "today+2 min temp"
                },
                14: {
                    name: "$[0].data.weather[2].maxtemp@",
                    type: "text",
                    label: "today+2 max temp"
                },
                15: {
                    name: "$[0].data.weather[2].day",
                    type: "text",
                    label: "today+2 label"
                },
                16: {
                    name: "$[0].data.weather[3].iconPath",
                    type: "resource",
                    label: "today+3 icon"
                },
                17: {
                    name: "$[0].data.weather[3].mintemp@",
                    type: "text",
                    label: "today+3 min temp"
                },
                18: {
                    name: "$[0].data.weather[3].maxtemp@",
                    type: "text",
                    label: "today+3 max temp"
                },
                19: {
                    name: "$[0].data.weather[3].day",
                    type: "text",
                    label: "today+3 label"
                },
                20: {
                    name: "$[0].data.weather[4].iconPath",
                    type: "resource",
                    label: "today+4 icon"
                },
                21: {
                    name: "$[0].data.weather[4].mintemp@",
                    type: "text",
                    label: "today+4 min temp"
                },
                22: {
                    name: "$[0].data.weather[4].maxtemp@",
                    type: "text",
                    label: "today+4 max temp"
                },
                23: {
                    name: "$[0].data.weather[4].day",
                    type: "text",
                    label: "today+4 label"
                },
                24: {
                    name: "$[0].data.weather[5].iconPath",
                    type: "resource",
                    label: "today+5 icon"
                },
                25: {
                    name: "$[0].data.weather[5].mintemp@",
                    type: "text",
                    label: "today+5 min temp"
                },
                26: {
                    name: "$[0].data.weather[5].maxtemp@",
                    type: "text",
                    label: "today+5 max temp"
                },
                27: {
                    name: "$[0].data.weather[5].day",
                    type: "text",
                    label: "today+5 label"
                },
                28: {
                    name: "$[0].data.weather[6].iconPath",
                    type: "resource",
                    label: "today+6 icon"
                },
                29: {
                    name: "$[0].data.weather[6].mintemp@",
                    type: "text",
                    label: "today+6 min temp"
                },
                30: {
                    name: "$[0].data.weather[6].maxtemp@",
                    type: "text",
                    label: "today+6 max temp"
                },
                31: {
                    name: "$[0].data.weather[6].day",
                    type: "text",
                    label: "today+6 label"
                }
            }
        }
    }

    destroy() {
    }
}
