import {Directive, ElementRef, HostListener, Input, AfterContentInit} from "@angular/core";

@Directive({
    selector: '[matchBodyHeight]'
})
export class MatchBodyHeight implements AfterContentInit {

    constructor(private el: ElementRef) {
    }

    // offset total height
    @Input() matchBodyHeight:number = 50;

    ngAfterContentInit() {
        this.onResize();
    }

    @HostListener('window:resize')
    onResize() {
        var bodyHeight = jQuery('body').height() - this.matchBodyHeight;
        jQuery(this.el.nativeElement).height(bodyHeight);
    }

    ngOnDestroy(){
        // console.log('dest matchBodyHeight');
    }
}

// import {timeout} from "../../decorators/timeout-decorator";
// constructor { this.enableScroller() }
// @timeout(500)
// private enableScroller() {
//     // jQuery('.ng-content-wrapper', this.el.nativeElement).css('overflow-y', 'scroll');
// }
// @HostBinding('style.overflow')
// overFlow;
//     jQuery('.ng-content-wrapper', this.el.nativeElement)
//         .delay(500)
//         .queue(function (next) {
//             $(this).css('overflow-y', 'scroll');
//             next();
//         });