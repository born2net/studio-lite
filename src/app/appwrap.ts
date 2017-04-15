import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {Compbaser} from "ng-mslib";
import {Observable} from "rxjs/Observable";
import {YellowPepperService} from "../services/yellowpepper.service";

@Component({
    template: `
        <div id="appWrapComp" class="row" style="margin-left: 0; margin-right: 0;">
            <ng-menu class="col-md-1" [routePrefix]="'App1'" [fileMenuMode]="true">
                <ng-menu-item [fontawesome]="'fa-dashboard'" [title]="'Dashboard'"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-navicon'" [title]="'Campaigns'"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-certificate'" [title]="'Resources'"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-crosshairs'" [title]="'Scenes'" class="wizardHookScene"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-laptop'" [title]="'Stations'"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-group'" [title]="'Fasterq'"></ng-menu-item>
                <!--<ng-menu-item [fontawesome]="'fa-cog'" [title]="'Settings'"></ng-menu-item>-->
                <ng-menu-item [fontawesome]="'fa-cloud-upload'" [title]="'Studiopro'"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-heart'" [title]="'Help'"></ng-menu-item>
                <ng-menu-item *ngIf="isBrandingDisabled | async" [fontawesome]="'fa-rocket'" [title]="'Install'"></ng-menu-item>
                <ng-menu-item [fontawesome]="'fa-power-off'" [title]="'Logout'"></ng-menu-item>
            </ng-menu>
            <div class="col-md-11" id="mainPanelWrapWasp" >
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class Appwrap extends Compbaser {

    isBrandingDisabled: Observable<boolean>

    constructor(private router: Router, private yp:YellowPepperService) {
        super();
        jQuery(".navbar-header .navbar-toggle").trigger("click");
        jQuery('.navbar-nav').css({
            display: 'block'
        });
        this.isBrandingDisabled = this.yp.isBrandingDisabled()
    }

    // public listenMenuChanges() {
    // var unsub = self.commBroker.onEvent(Consts.Events().MENU_SELECTION).subscribe((e: IMessage) => {
    //     if (!this.routerActive)
    //         return;
    //     let screen = (e.message);
    //     self.router.navigate([`/App1/${screen}`]);
    // });
    // }
}