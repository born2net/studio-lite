import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {ApplicationState} from "../store/application.state";
import {AppdbAction} from "../store/actions/appdb.actions";
import {EFFECT_INIT_REDUXIFY_MSDB} from "../store/effects/msdb.effects";
import {RedPepperService} from "./redpepper.service";

@Injectable()
export class StoreService {
    constructor(private store: Store<ApplicationState>, private appdbAction: AppdbAction, private rp:RedPepperService) {

        // todo: disabled injection as broken in AOT
        // constructor(@Inject(forwardRef(() => Store)) private store: Store<ApplicationState>,
        //     @Inject(forwardRef(() => AppdbAction)) private appdbAction: AppdbAction,
        //     @Inject(forwardRef(() => RedPepperService)) private redPepperService: RedPepperService,
        //     @Inject('OFFLINE_ENV') private offlineEnv) {

        this.store.dispatch(this.appdbAction.initAppDb());
    }

    private singleton: boolean = false;

    public loadServices() {
        if (this.singleton) return;
        this.singleton = true;
        this.rp.injectPseudoScenePlayersIDs();
        this.store.dispatch({type: EFFECT_INIT_REDUXIFY_MSDB})
        // this.rp.reduxCommit();
        con('loaded network services...');
    }
}
