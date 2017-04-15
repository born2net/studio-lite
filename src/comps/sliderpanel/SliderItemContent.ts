import {ApplicationRef, ChangeDetectorRef, Component, DoCheck, Input, Output, TemplateRef, ViewContainerRef} from "@angular/core";
import {Sliderpanel} from "./Sliderpanel";
import {Observable, Subject} from "rxjs";
import {Compbaser} from "ng-mslib";

export interface ISliderItemData {
    to: string;
    direction: string;
}

@Component({
    selector: 'SlideritemContent',
    template: `
        <button *ngIf="fromDirection && showFromButton" type="button" (click)="onPrev()" class="btn btn-default btn-sm">
            <span class="fa fa-arrow-left "></span>
        </button>

        <button *ngIf="toDirection && showToButton" type="button" (click)="onNext()" class="btn btn-default btn-sm">
            <span class="fa fa-arrow-right"></span>
        </button>
        <ng-content></ng-content>
    `,
})
export class SlideritemContent extends Compbaser {

    private m_onChanges$ = new Subject()

    constructor(private viewContainer: ViewContainerRef, protected sliderPanel: Sliderpanel, private cd: ChangeDetectorRef, ap:ApplicationRef) {
        super();
        this.viewContainer.element.nativeElement.classList.add('page');
        this.sliderPanel.addSlider(this);

        this.cancelOnDestroy(
            this.m_onChanges$.debounceTime(300)
                .subscribe((data: any) => {
                    this.sliderPanel.slideToPage(data.to, data.direction)
                    this.cd.markForCheck();
                })
        )
    }

    @Input() toDirection: 'left' | 'right';
    @Input() fromDirection: 'left' | 'right';
    @Input() to: string;
    @Input() from: string;
    @Input() showToButton: boolean = true;
    @Input() showFromButton: boolean = true;
    @Output() onChange: Observable<ISliderItemData> = new Subject().delay(300).debounceTime(1000);

    public addClass(i_className) {
        this.viewContainer.element.nativeElement.classList.add(i_className);
    }

    public hasClass(i_className) {
        this.viewContainer.element.nativeElement.classList.contains(i_className);
    }

    public getNative() {
        return this.viewContainer.element.nativeElement;
    }

    public removeClass(i_className) {
        this.viewContainer.element.nativeElement.classList.remove(i_className);
    }

    public slideTo(to: string, direction: string) {
        (this.onChange as Subject<ISliderItemData>).next({
            to: to,
            direction: direction
        })
        this.m_onChanges$.next({to, direction})
        // this.sliderPanel.slideToPage(to, direction)
    }

    public onNext() {
        this.slideTo(this.to, this.toDirection);
    }

    public onPrev() {
        this.slideTo(this.from, this.fromDirection);
    }

    destroy(){
        // console.log('dest SliderItem');
    }
}

