import {Component, ChangeDetectionStrategy, ElementRef, ContentChild, AfterViewInit} from "@angular/core";
import {PanelSplitMain} from "./panel-split-main";
import {PanelSplitSide} from "./panel-split-side";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'panel-split-container',
    template: `
            <div class="row">            
                <ng-content></ng-content>
            </div>
    `
})
export class PanelSplitContainer implements AfterViewInit {
    constructor(private el: ElementRef) {
    }

    @ContentChild(PanelSplitMain)
    panelSpiltMain: PanelSplitMain

    @ContentChild(PanelSplitSide)
    panelSplitSide: PanelSplitSide

    ngAfterViewInit() {
        if (!this.panelSpiltMain || !this.panelSplitSide)
            throw new Error('panel-split-container requires main and side children');
        this.panelSplitSide.onToggle.subscribe((value: boolean) => {
            this.panelSpiltMain.setFullScreen(value)
        }, (e) => console.error(e))
    }

}

