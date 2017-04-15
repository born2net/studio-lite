import {Component, Host, Output, EventEmitter} from '@angular/core';
import {Tabs} from '../tabs/tabs';

@Component({
    selector: 'tab',
    inputs: [
        'title:tabtitle',
        'active'
    ],
    styles: [`
        .pane {
            padding: 1em;
            background-color: white;
            border-left: 1px solid #dddddd;
            border-right: 1px solid #dddddd;
            border-bottom: 1px solid #dddddd;
        }
    `],
    template: `
        <div [hidden]="!_active" class="pane">
            <ng-content></ng-content>
        </div>
    `
})

/**
 Add this Tab as part of it's parents Tabs component
 use @Host to make sure we only look for a parent Tabs dependency injector
 and don't go any further to prevent lookup of wrong Tabs under misconfiguration
 **/
export class Tab {

    constructor(@Host() private tabs: Tabs) {
        tabs.addTab(this);
    }

    @Output()
    activated: EventEmitter<any> = new EventEmitter<any>();

    public title: string;
     _active = false;
     _show = true;

    public set active(value) {
        this._active = value || false;
        if (this._active)
            this.activated.emit(true);
    }

    public get active() {
        return this._active;
    }

    public set show(value) {
        this._show = value;
        if (value == false) {
            this._active = false
            this.tabs.checkActive();
        }
    }

    public get show() {
        return this._show;
    }

}
