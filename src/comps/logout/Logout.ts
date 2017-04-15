import {Component} from "@angular/core";
import {LocalStorage} from "../../services/LocalStorage";
import {RedPepperService} from "../../services/redpepper.service";
import {MainAppShowStateEnum} from "../../app/app-component";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";
import {IUiState} from "../../store/store.data";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Compbaser} from "ng-mslib";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'Logout',
    providers: [LocalStorage],
    styles: [`
        .fa {
            display: inline-table;
        }
        .btn-xlarge {
            vertical-align: center;
            margin: 30px;
            /*width: 100%;*/
            padding: 48px 48px;
            font-size: 22px;
            color: white;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
            background: #62b1d0;
            border: 0;
            border-bottom: 3px solid #9FE8EF;
            cursor: pointer;
            -webkit-box-shadow: inset 0 -3px #9FE8EF;
            box-shadow: inset 0 -3px #9FE8EF;
            width: 300px;
        }

        .btn-xlarge:active {
            top: 2px;
            outline: none;
            -webkit-box-shadow: none;
            box-shadow: none;
        }

        .btn-xlarge:hover {
            background: #a9a9a9;
        }
    `],
    template: `
        <div class="row">
            <div class="center-block">
                <button href="#"  (click)="_onSaveChangesLogout()" class="btn btn-xlarge"><i class="fa fa-floppy-o fa-5x" ></i><h4>Save and Logout</h4></button>
                <button href="#"  (click)="_onLogout()" class="btn btn-xlarge"><i class="fa fa-power-off fa-5x" ></i><h4>Just Logout</h4></button>
            </div>
        </div>
        `
})

export class Logout extends Compbaser {
    constructor(private localStorage: LocalStorage, private rp: RedPepperService, private yp:YellowPepperService) {
        super();
        this.cancelOnDestroy(
            this.yp.listenMainAppState()
                .subscribe((i_value: MainAppShowStateEnum) => {
                    switch (i_value) {
                        case MainAppShowStateEnum.SAVED: {
                            this._onLogout();
                            break;
                        }
                    }
                }, (e) => console.error(e))
        )
    }

    _onSaveChangesLogout(){
        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
    }

    @timeout(500)
    _onLogout() {
        window.onbeforeunload = () => {
        };
        this.localStorage.removeItem('remember_me_studioweb');
        let uiState: IUiState = {mainAppState: MainAppShowStateEnum.GOODBYE}
        this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        if (this.rp.getUserData().resellerID == 1)
            jQuery('body').fadeOut(1000, function () {
                window.location.replace('http://www.digitalsignage.com');
            });
    }
}
