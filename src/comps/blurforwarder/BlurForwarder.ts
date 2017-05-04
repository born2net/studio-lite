import {Directive, ElementRef, Renderer} from "@angular/core";
@Directive({
    selector: 'input,select,textarea',
    host: {
        '(blur)': 'onBlur($event)'
    }
})
export class BlurForwarder {
    constructor(private elRef: ElementRef) {
    }

    onBlur($event) {
        // this.renderer.invokeElementMethod(this.elRef.nativeElement, 'dispatchEvent', [new CustomEvent('input-blur', {bubbles: true})]);
        // or just
        // don't error out on older browsers just fail silently
        try {
            this.elRef.nativeElement.dispatchEvent(new CustomEvent('input-blur', { bubbles: true }));
        } catch (e){

        }

        // if you don't care about webworker compatibility
    }
}