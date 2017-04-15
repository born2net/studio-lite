import {Injectable, Inject} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/debounceTime";
import {Action, Store} from "@ngrx/store";
import {Actions, Effect} from "@ngrx/effects";
import {Observable} from "rxjs";
import {RedPepperService} from "../../services/redpepper.service";

export const EFFECT_INIT_REDUXIFY_MSDB = 'EFFECT_INIT_REDUXIFY_MSDB';
export const EFFECT_GET_STATIONS = 'EFFECT_GET_STATIONS';

@Injectable()
export class MsdbEffects {

    constructor(private actions$: Actions,
                private redPepperService: RedPepperService,
                private http: Http) {
    }

    @Effect({dispatch: false})
    reduxifyMsdb$: Observable<Action> = this.actions$.ofType(EFFECT_INIT_REDUXIFY_MSDB)
        .do(() => {
            this.redPepperService.reduxCommit(null, true);
        })

    //todo: add @Effect() getStations API as it is a pure side effecr
    @Effect()
    getStations: Observable<Action> = this.actions$.ofType(EFFECT_GET_STATIONS)
        .debounceTime(500)
        .mergeMap(({payload}) => {
            const {term, type} = payload;
            const url = `https://api.spotify.com/v1/search?q=${term}&type=${type}`;
            return this.http
                .get(url)
                .map((res) => ({type: 'SEARCH_RESULTS', payload: res.json()}))
                .takeUntil(this.actions$.ofType('SEARCH_CANCELLED'))
                .catch((err: any, b: any) => {
                    return Observable.of({type: 'SEARCH_ERROR', payload: err});
                })
        })

}


