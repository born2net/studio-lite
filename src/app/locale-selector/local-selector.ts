import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {Compbaser} from "ng-mslib";

@Component({
    selector: 'locale-selector',
    styleUrls: ['./local-selector.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <div *ngIf="type=='inline'">
            <ul class="f32">
                <li (click)="onLocale(locale)" *ngFor="let locale of locales" class="flag {{locale.flag}}">
                </li>
            </ul>
        </div>
        <div *ngIf="type=='modal'">
            <table class="f32 table">
                <thead>
                <tr>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr (click)="onLocale(locale)" *ngFor="let locale of locales; let i = index" class="flag2">
                    <td class="flag2 {{locale.flag}}"></td>
                    <td>{{locale.name}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    `
})
export class LocaleSelector extends Compbaser {

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

    constructor() {
        super();
    }

    @Input() type: 'inline' | 'modal';

    onLocale(i_locale) {
        window.onbeforeunload = () => {
        };
        window.location.replace(`https://secure.digitalsignage.com/studioweb/locale/${i_locale.locale}/`);
    }
}

