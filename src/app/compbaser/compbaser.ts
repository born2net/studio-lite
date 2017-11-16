import {Subscriber} from "rxjs";
import {Component, HostListener} from "@angular/core";
// import {
//     Subscriber,
//     Subject,
//     Observable
// } from "rxjs";
// type UnSubscriber = Function | Subscriber<any>;
// var c:UnSubscriber = Observable.create((a)=>{}).subscribe(()=>{});


export class Compbaser {
    private unsubFunctions: Array<any> = [];
    private noRedirect:boolean = false;
    me = '';


    @HostListener('click', ['$event'])
    clickHandler(event) {
        if (this.noRedirect){
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }

    constructor() {
        this.me = this.getCompSelector(this.constructor);
    }

    public preventRedirect(i_value:boolean){
        this.noRedirect = i_value;
    }

    protected getCompSelector(i_constructor) {

        // in module: entryComponents: [TimelineProps],
        // constructor(private resolver: ComponentFactoryResolver) {
        //      let componentFactory = resolver.resolveComponentFactory(TimelineProps)
        //      console.log(componentFactory.selector);
        // }

        if (window.location.href.indexOf('localhost') == -1)
            return;
        var annotations = Reflect.getMetadata('annotations', i_constructor);
        if (!annotations)
            return ''
        var componentMetadata = annotations.find(annotation => {
            return (annotation instanceof Component);
        });
        return componentMetadata.selector;
    }

    protected cancelOnDestroy(i_function: any): void {
        this.unsubFunctions.push(i_function);
    }

    private ngOnDestroy() {
        // console.log('unsubscribing on behalf of ' + this.me);
        this.unsubFunctions.map((f: any) => {
            if (f instanceof Subscriber) {
                f.unsubscribe();
            } else {
                //todo: fix
                //f()
            }
        });
        this.destroy();
        this.unsubFunctions = null;
        this.me = null;
    }

    // override by sub class component
    destroy() {
    };
}