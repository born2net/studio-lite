import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {FormGroupDirective} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {Actions} from '@ngrx/effects';
import {YellowPepperService} from "../../services/yellowpepper.service";
import * as _ from 'lodash';
import {ACTION_FORM_UPDATE} from "../../store/actions/appdb.actions";

const FORM_SUBMIT_SUCCESS = 'FORM_SUBMIT_SUCCESS';
const FORM_SUBMIT_ERROR = 'FORM_SUBMIT_ERROR';

export const formSuccessAction = path => ({
    type: FORM_SUBMIT_SUCCESS,
    payload: {
        path
    }
});

export const formErrorAction = (path, error) => ({
    type: FORM_SUBMIT_ERROR,
    payload: {
        path,
        error
    }
});

@Directive({
    selector: '[connectForm]'
})
export class ConnectFormDirective {
    @Input('connectForm') path: string;
    @Input() debounce: number = 300;
    @Output() error = new EventEmitter();
    @Output() success = new EventEmitter();
    formChange: Subscription;
    formSuccess: Subscription;
    formError: Subscription;

    constructor(private formGroupDirective: FormGroupDirective,
                private actions$: Actions,
                private yp: YellowPepperService) {
    }

    ngOnInit() {
        this.yp.ngrxStore.select(state => _.get(state, this.path))
            .take(1)
            .subscribe((val: Map<any, any>) => {
                this.formGroupDirective.form.patchValue(val.toJSON());
            });

        this.formChange = this.formGroupDirective.form.valueChanges
            .debounceTime(this.debounce)
            .subscribe(value => {
                // remove the first level of store path, i.e 'appDb.contact' becomes just 'connect'
                this.yp.ngrxStore.dispatch({
                    type: ACTION_FORM_UPDATE,
                    payload: {
                        value,
                        path: this.path.split('.').slice(1, this.path.length - 1).join(),
                    }
                });
            });

        this.formSuccess = this.actions$
            .ofType(FORM_SUBMIT_SUCCESS)
            .filter(({payload}) => payload.path === this.path)
            .subscribe(() => {
                this.formGroupDirective.form.reset();
                this.success.emit();
            });

        this.formError = this.actions$
            .ofType(FORM_SUBMIT_ERROR)
            .filter(({payload}) => payload.path === this.path)
            .subscribe(({payload}) => {
                return this.error.emit(payload.error)
            })
    }

    ngOnDestroy() {
        this.formChange.unsubscribe();
        this.formError.unsubscribe();
        this.formSuccess.unsubscribe();
    }

}