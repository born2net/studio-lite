import {Action} from "@ngrx/store";

export interface ActionWithPayload<T> extends Action {
    payload: T;
}

export interface Actioning extends Action {
    payload?: any;
}