import {Action as NgRxAction} from '@ngrx/store';
export interface Action extends NgRxAction {
    payload?: any;
}