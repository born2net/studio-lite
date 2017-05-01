import {ChangeDetectionStrategy, EventEmitter, Component, Input, Output} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    selector: 'locale-selector',
    styleUrls: ['./local-selector.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <div *ngIf="m_orientation=='inline'">
            <ul class="f32">
                <li (click)="redirect(locale)" *ngFor="let locale of locales" class="flag {{locale.flag}}">
                </li>
            </ul>
        </div>
        <div *ngIf="m_orientation=='modal'">
            <h4 style="display: inline-block">Selected language: {{m_selectedLocale?.name}}</h4>
            <button [disabled]="!m_selectedLocale" (click)="_saveAndReload()" class="btn btn-primary pull-right">Save and reload language</button>
            <table class="f32 table">
                <thead>
                <tr>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr (click)="_onSelected(locale)" *ngFor="let locale of locales; let i = index" class="flag2">
                    <td class="flag2 {{locale.flag}}"></td>
                    <td>{{locale.name}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    `
})
export class LocaleSelector extends Compbaser {

    m_selectedLocale;
    m_orientation;

    /**
     locale info:

     project: https://github.com/lafeber/world-flags-sprite
     flags codes: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
     google codes: https://cloud.google.com/translate/docs/languages
     docs: https://angular.io/docs/ts/latest/cookbook/i18n.html

     **/

    locales = [
        {flag: 'us', locale: 'en', name: 'English'},
        {flag: 'cn', locale: 'zh-CN', name: 'Chinese'},
        {flag: 'in', locale: 'bn', name: 'Bengali'},
        {flag: 'es', locale: 'es', name: 'Spanish'},
        {flag: 'in', locale: 'hi', name: 'Hindi'},
        {flag: 'jo', locale: 'ar', name: 'Arabic'},
        {flag: 'il', locale: 'iw', name: 'Hebrew'},
        {flag: 'br', locale: 'pt', name: 'Portuguese'},
        {flag: 'de', locale: 'de', name: 'German'},
        {flag: 'jp', locale: 'ja', name: 'Japanese'},
        {flag: 'ru', locale: 'ru', name: 'Russian'},
        {flag: 'ph', locale: 'tl', name: 'Filipino'},
        {flag: 'fr', locale: 'fr', name: 'French'},
        {flag: 'gr', locale: 'el', name: 'Greek'},
        {flag: 'kr', locale: 'ko', name: 'Korean'},
        {flag: 'th', locale: 'th', name: 'Thai'},
        {flag: 'my', locale: 'ms', name: 'Malay'},
        {flag: 'it', locale: 'it', name: 'Italian'}
    ]

    constructor(private yp: YellowPepperService) {
        super();
    }

    @Input()
    set orientation(i_orientation: 'inline' | 'modal') {
        this.m_orientation = i_orientation;
    }

    @Output()
    onLocaleChanged: EventEmitter<any> = new EventEmitter<any>();

    _saveAndReload() {
        this.onLocaleChanged.emit(this.m_selectedLocale);
    }

    _onSelected(i_locale) {
        this.m_selectedLocale = i_locale;
    }

    public redirect(i_locale) {
        window.onbeforeunload = () => {
        };
        window.location.replace(`https://secure.digitalsignage.com/studioweb/locale/${i_locale.locale}/`);
    }

    destroy() {
    }
}

