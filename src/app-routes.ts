import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {LoginPanel} from "./comps/entry/LoginPanel";
import {Logout} from "./comps/logout/Logout";
import {AuthService} from "./services/AuthService";
import {AutoLogin} from "./comps/entry/AutoLogin";
import {Dashboard} from "./app/dashboard/dashboard-navigation";
import {Appwrap} from "./app/appwrap";
import {FasterqTerminal} from "./app/fasterq/fasterq-terminal";

const routes: Routes = [
    {path: 'index.html', data: {title: 'Login'}, component: AutoLogin},
    {path: 'AutoLogin', data: {title: 'Login'}, component: AutoLogin},
    {path: 'FasterqTerminal/:id', data: {title: 'FasterqTerminal'}, component: FasterqTerminal},
    {path: 'UserLogin', data: {title: 'Login'}, component: LoginPanel},
    {path: 'UserLogin/:twoFactor', data: {title: 'Login'}, component: LoginPanel},
    {path: 'UserLogin/:twoFactor/:user/:pass', data: {title: 'Login'}, component: LoginPanel},
    {path: 'Logout', component: Logout},
    {path: '', pathMatch: 'full', redirectTo: '/App1/Dashboard'},
    {path: 'studioweb', pathMatch: 'full', redirectTo: '/App1/Dashboard'},  // IE/FF compatibility
    {
        path: 'App1', component: Appwrap,
        children: [
            {path: '', component: Appwrap, canActivate: [AuthService]},
            {path: 'Dashboard', component: Dashboard, data: {title: 'Dashboard'}, canActivate: [AuthService]},
            {path: 'Campaigns', loadChildren: '../app/campaigns/index#CampaignsLazyModule', data: {title: 'Campaigns'}, canActivate: [AuthService]},
            {path: 'Fasterq', loadChildren: '../app/fasterq/index#FasterqLazyModule', data: {title: 'Fasterq'}, canActivate: [AuthService]},
            {path: 'Scenes', loadChildren: '../app/scenes/index#ScenesLazyModule', data: {title: 'Scenes'}, canActivate: [AuthService]},
            {path: 'Resources', loadChildren: '../app/resources/index#ResourcesLazyModule', data: {title: 'Resources'}, canActivate: [AuthService]},
            {path: 'Help', loadChildren: '../app/help/index#HelpLazyModule', data: {title: 'Help'}, canActivate: [AuthService]},
            {path: 'Install', loadChildren: '../app/install/index#InstallLazyModule', data: {title: 'Install'}, canActivate: [AuthService]},
            {path: 'Settings', loadChildren: '../app/settings/index#SettingsLazyModule', data: {title: 'Settings'}, canActivate: [AuthService]},
            {path: 'Stations', loadChildren: '../app/stations/index#StationsLazyModule', data: {title: 'Stations'}, canActivate: [AuthService]},
            {path: 'Studiopro', loadChildren: '../app/studiopro/index#StudioProLazyModule', data: {title: 'Studiopro'}, canActivate: [AuthService]},
            {path: 'Logout', component: Logout, data: {title: 'Logout'}, canActivate: [AuthService]},
            {path: '**', redirectTo: 'Dashboard'}
        ]
    }
];

export const routing = RouterModule.forRoot(routes, {enableTracing: false, preloadingStrategy: PreloadAllModules});


