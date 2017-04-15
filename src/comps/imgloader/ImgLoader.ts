import {Component, ChangeDetectionStrategy, ChangeDetectorRef, Input} from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/distinctUntilChanged';
import {Lib} from "../../Lib";

@Component({
    selector: 'imgLoader',
    changeDetection: ChangeDetectionStrategy.Default,
    template: `
            <div *ngIf="defaultImage"> 
              <img [ngStyle]="_style.img" [ngClass]="{'img-circle': circle}" [src]="getImageUrl()" (load)="onImageLoaded()" (error)="onImageError()" />
            </div>
    `
})

export class ImgLoader {

    constructor(private cdr:ChangeDetectorRef) {
    }

    @Input('style')
    _style:any = {};

    @Input()
    defaultImage:string = '';

    @Input()
    circle:boolean = false;

    @Input()
    images:Array<string> = [];

    private imageRetries:number = 0;

    private getImageUrl() {
        if (this.images.length == 0)
            return this.defaultImage;
        if (this.images[this.imageRetries] == undefined)
            return this.defaultImage;
        var url = this.images[this.imageRetries] + (Lib.DevMode() ? '?random=xyz' : `?random=' ${Math.random()}`);
        return url;
    }

    private onImageLoaded() {
        this.cdr.detach();
    }

    private onImageError() {
        this.imageRetries++;
    }

    public reloadImage(){
        this.imageRetries = 0;
        this.cdr.reattach();
    }

}