import {Component, ChangeDetectionStrategy, AfterViewInit} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    selector: 'locale-selector',
    styles: [`
        ul {
            width: 275px;
            padding-left: 0px; 
            padding-top: 50px;
        }
        li {
            cursor: pointer;
            opacity: 0.3;
        }
        li:hover {
            opacity: 1;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <ul class="f32">
            <li (click)="onLocale(locale)" *ngFor="let locale of locales" class="flag {{locale.flag}}"></li>
        </ul>
    `
})
export class LocaleSelector extends Compbaser implements AfterViewInit {

    locales  = [
        {flag: 'cn', locale: 'zh-CN', name: 'Chinese'},
        {flag: 'il', locale: 'iw', name: 'Hebrew'},
        {flag: 'es', locale: 'es', name: 'Spanish'},
        {flag: 'in', locale: 'hi', name: 'Hindi'},
        {flag: 'jo', locale: 'ar', name: 'Arabic'},
        {flag: 'br', locale: 'pt', name: 'Portuguese'},
        {flag: 'de', locale: 'de', name: 'German'},
        {flag: 'in', locale: 'bn', name: 'Bengali'},
        {flag: 'jp', locale: 'ja', name: 'Japanese'},
        {flag: 'ru', locale: 'ru', name: 'Russian'},
        {flag: 'ph', locale: 'tl', name: 'Filipino'},
        {flag: 'fr', locale: 'fr', name: 'French'},
        {flag: 'gr', locale: 'el', name: 'Greek'},
        {flag: 'kr', locale: 'ko', name: 'Korean'},
        {flag: 'th', locale: 'th', name: 'Thai'},
        {flag: 'it', locale: 'it', name: 'Italian'}
    ]

    constructor(private yp: YellowPepperService) {
        super();
    }

    onLocale(i_locale){
        window.location.replace(`https://secure.digitalsignage.com/studioweb/locale/${i_locale.locale}/`);
    }

    ngAfterViewInit() {


    }

    ngOnInit() {
    }

    destroy() {
    }
}

