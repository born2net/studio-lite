import {Directive, ElementRef, EventEmitter, Input, NgZone, Output} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

/**
 *  Usage
 *

 directive that allows you to load images which are deferred (not available right away)
 so image will be polled. While image is polled we can show default image as well as
 as loading image.

 usage:

 <img lazyImage class="center-block" style="width: 229px; height: 130px"
 [url]="['https://secure.digitalsignage.com/studioweb/assets/some_lazy1.png','https://secure.digitalsignage.com/studioweb/assets/some_lazy2.png']"
 [loadingImage]="'https://secure.digitalsignage.com/studioweb/assets/screen_loading.png'"
 [defaultImage]="'https://secure.digitalsignage.com/studioweb/assets/screen.png'"
 [errorImage]="'https://secure.digitalsignage.com/studioweb/assets/screen_error.png'"
 [retry]="5"
 [delay]="1500"
 (loaded)="_onLoaded()"
 (error)="_onError()"
 (completed)="_onCompleted()">

 or to use via API

 ...

 @ViewChild(LazyImage)
 lazyImage: LazyImage;

 _lazyLoad() {
     this.lazyImage.setUrl(['https://secure.digitalsignage.com/studioweb/assets/some_lazy.png']);
 }

 _resetSnapshotSelection() {
    if (this.lazyImage)
         this.lazyImage.resetToDefault();
 }

 _takeSnapshot() {
     this.lazyImage.url = 'http://example.com/foo.png;
 }

 ...

 */

@Directive({
    selector: '[lazyImage]'
})
export class LazyImage {

    private m_urls: Array<string> = [];
    private m_index = 0;
    private cancel$ = new Subject();

    constructor(private el: ElementRef, private ngZone: NgZone) {
    }

    // @Input('lazyImage') lazyImage;   // to change support to directive of: <img lazyImage="'http://www...'" ...

    @Output() loaded: EventEmitter<any> = new EventEmitter<any>();
    @Output() completed: EventEmitter<any> = new EventEmitter<any>();
    @Output() errored: EventEmitter<any> = new EventEmitter<any>();
    @Input() defaultImage: string;
    @Input() loadingImage: string;
    @Input() errorImage: string;
    @Input() retry: number = 5;
    @Input() delay: number = 1000;

    @Input()
    set urls(i_urls: Array<string>) {
        this.setUrls(i_urls)
    }

    setUrls(i_urls: Array<string>) {
        this.m_index = 0;
        this.m_urls = i_urls;
        this.loadImage(i_urls);
    }

    public resetToDefault() {
        this.setImage(this.el.nativeElement, this.defaultImage);
        this.cancel$.next({})
    }

    ngAfterViewInit() {
        this.setImage(this.el.nativeElement, this.defaultImage);
    }

    ngOnInit() {
    }

    setImage(element: HTMLElement, i_url) {
        // const isImgNode = element.nodeName.toLowerCase() === 'img';
        // if (isImgNode) {
        // } else {
        //     element.style.backgroundImage = `url('${imagePath}')`;
        // }
        (<HTMLImageElement>element).src = i_url;
        return element;
    }

    loadImage(i_urls) {
        const pollAPI$ = Observable.defer(() => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                var url;
                if (i_urls[this.m_index]){
                    url =  i_urls[this.m_index];
                    this.m_index++;
                } else {
                    this.m_index = 0;
                    url =  i_urls[this.m_index];
                }
                img.src = url;
                img.onload = () => {
                    resolve(url);
                };
                img.onerror = err => {
                    this.setImage(this.el.nativeElement, this.loadingImage);
                    reject(err)
                };
            })
        }).retryWhen(err => {
            return err.scan((errorCount, err) => {
                if (errorCount >= this.retry) {
                    throw err;
                }
                return errorCount + 1;
            }, 0)
                .delay(this.delay);
        })
            .takeUntil(this.cancel$)

        pollAPI$.subscribe((v) => {
            this.setImage(this.el.nativeElement, v)
            this.loaded.emit();
        }, (e) => {
            this.setImage(this.el.nativeElement, this.errorImage);
            this.errored.emit();
            // console.error(e)
        }, () => {
            this.completed.emit();
        })

    }

    destroy() {
    }
}
