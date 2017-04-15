import {Component, ChangeDetectionStrategy, ElementRef, ViewChild, ChangeDetectorRef} from "@angular/core";
import {FormControl, FormGroup, FormBuilder} from "@angular/forms";
import * as _ from "lodash";
import {LocalStorage} from "../../services/LocalStorage";
import {AppdbAction, AuthenticateFlags} from "../../store/actions/appdb.actions";
import {UserModel} from "../../models/UserModel";
import {Map} from "immutable";
import {EFFECT_TWO_FACTOR_UPDATING} from "../../store/effects/appdb.effects";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";

@Component({
    selector: 'Twofactor',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <form novalidate autocomplete="off" [formGroup]="contGroup">
                <div class="row">
                    <div class="inner userGeneral">
                        <div class="panel panel-default tallPanel">
                            <div class="panel-heading">
                                <small class="release">general properties
                                    <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                                </small>
                            </div>
                            <ul class="list-group">
                                <li *ngIf="twoFactorStatus" class="list-group-item">
                                    Two factor login with Google Authenticator
                                    <div class="material-switch pull-right">
                                        <input (change)="onChangeStatus(customerNetwork2.checked)"
                                               [formControl]="contGroup.controls['TwofactorCont']"
                                               id="customerNetwork2" #customerNetwork2
                                               name="customerNetwork2" type="checkbox"/>
                                        <label for="customerNetwork2" class="label-primary"></label>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div>
            <div *ngIf="!twoFactorStatus">
                <input #activate type="text" class="longInput form-control" placeholder="scan with Google Authenticator and enter token">
                <button (click)="onActivate()" style="margin-top: 5px" class="btn btn-primary pull-right">activate</button>
            </div>
        </div>
    `,
    styles: [`.material-switch {
        position: relative;
        padding-top: 10px;
    }`]
})
export class Twofactor extends Compbaser {
    constructor(private fb: FormBuilder,
                private localStorage: LocalStorage,
                private el: ElementRef,
                private cd: ChangeDetectorRef,
                private appdbAction: AppdbAction,
                private yp: YellowPepperService) {
        super();
        this.contGroup = fb.group({
            'TwofactorCont': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
        this.yp.ngrxStore.select(store => store.appDb.userModel).subscribe((userModel: UserModel) => {
            this.twoFactorStatus = userModel.getTwoFactorRequired();
            this.changeTwoFactorStatus();
        }, (e) => {
            console.error(e)
        })
        this.renderFormInputs();
        this.listenEvents();
    }

    @ViewChild('activate')
    activateToken;

    twoFactorStatus: boolean;
    contGroup: FormGroup;
    formInputs = {};

    private listenEvents() {
        this.cancelOnDestroy(
            this.yp.ngrxStore.select(store => store.appDb.appAuthStatus).skip(1).subscribe((i_authStatus: Map<string,AuthenticateFlags>) => {
                let authStatus: AuthenticateFlags = i_authStatus.get('authStatus')
                switch (authStatus) {
                    case AuthenticateFlags.TWO_FACTOR_UPDATE_PASS: {
                        bootbox.alert('Congratulations, activated');
                        break;
                    }
                    case AuthenticateFlags.TWO_FACTOR_UPDATE_FAIL: {
                        bootbox.alert('wrong token entered');
                        break;
                    }
                }
            }, (e) => {
                console.error(e)
            }))
    }

    private changeTwoFactorStatus() {
        if (this.twoFactorStatus) {
            this.twoFactorStatus = true;
            this.removeQrCode();
            this.cd.markForCheck();
            this.localStorage.removeItem('remember_me_studioweb');
            this.renderFormInputs();
        } else {
            // this.removeQrCode();
            this.cd.markForCheck();
        }
    }

    private onActivate() {
        if (this.activateToken.nativeElement.value.length < 6)
            return bootbox.alert('token is too short');
        this.yp.ngrxStore.dispatch({
            type: EFFECT_TWO_FACTOR_UPDATING,
            payload: {
                token: this.activateToken.nativeElement.value,
                enable: true
            }
        })
    }

    private addQrCode() {
        this.removeQrCode();
        this.appdbAction.getQrCodeTwoFactor().take(1).subscribe((qrCode) => {
            this.removeQrCode();
            jQuery(this.el.nativeElement).append(qrCode);
            var svg = jQuery(this.el.nativeElement).find('svg').get(0);
            // var w = svg.width.baseVal.value;
            // var h = svg.height.baseVal.value;
            svg.setAttribute('viewBox', '0 0 ' + 100 + ' ' + 100);
            svg.setAttribute('width', '40%');
            // svg.setAttribute('height', '100%');
        }, (e) => console.error(e));
    }

    private removeQrCode() {
        jQuery(this.el.nativeElement).find('svg').remove();
    }

    private onChangeStatus(i_twoFactorStatus: boolean) {
        this.twoFactorStatus = i_twoFactorStatus;
        if (this.twoFactorStatus) {
            this.removeQrCode();
        } else {
            this.addQrCode();
            bootbox.alert('Token removed, be sure to delete the entry now from Google Authenticator as it is no longer valid');
        }
    }

    private renderFormInputs() {
        this.formInputs['TwofactorCont'].setValue(this.twoFactorStatus);
        if (this.twoFactorStatus) {
            this.removeQrCode();
        } else {
            this.addQrCode();
        }
    }

}