import {Component, Input, ChangeDetectionStrategy, ElementRef, Renderer} from '@angular/core';
import {Http, Response} from '@angular/http';
@Component({
    selector: 'svg-icon',
    template: `
        <ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIcon {
    @Input()
    set path(val: string) {
        this.loadSvg(val);
    }

    @Input() height;
    @Input() width;
    @Input() alt: string;

    constructor(private http: Http, private elementRef: ElementRef,  private renderer: Renderer,) {

    }

    loadSvg(val: string) {
        // this.http.get(`svgs/${val}.svg`) // grab locally
        this.http.get(val)
            .subscribe(
                res => {
                    // get our element and clean it out
                    const element = this.elementRef.nativeElement;
                    var svgFinal;
                    element.innerHTML = '';
                    // get response and build svg element
                    var response = res.text();
                    const parser = new DOMParser();


                    if (this.height && this.width) {
                        var svgHeight, svgWidth, re;
                        svgHeight = response.match(/(height=")([^\"]*)/)[2];
                        re = new RegExp('height="' + svgHeight + '"', "ig");
                        response = response.replace(re, `height="${this.height}"`);

                        svgWidth = response.match(/(width=")([^\"]*)/)[2];
                        re = new RegExp('width="' + svgWidth + '"', "ig");
                        response = response.replace(re, `width="${this.width}"`);
                        // var s = new String(response);
                    }

                    svgFinal = parser.parseFromString(response, 'image/svg+xml');
                    element.appendChild(svgFinal.documentElement);
                    // insert the svg result

                },
                err => {
                    console.error(err);
                });
    }
}