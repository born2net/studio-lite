import {ChangeDetectionStrategy, Component, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {MediaPlayer} from "../../comps/media-player/media-player";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Observable} from "rxjs/Observable";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        button { padding: 8px; margin: 8px; width: 200px }
    `],
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    animations: [
        trigger('routeAnimation', [
            state('*', style({opacity: 1})),
            transition('void => *', [
                style({opacity: 0}),
                animate(333)
            ]),
            transition('* => void', animate(333, style({opacity: 0})))
        ])
    ],
    template: `
        <div id="helpPanel">
            <!-- video tutorials -->
            <h3 data-localize="videoTutorial">Video tutorial</h3>
            <button class="videos btn btn-primary btn-lg" (click)="_onPlay('http://s3.signage.me/business1000/resources/StudioLite.mp4')">
                <span data-localize="basicIntroductionVideo">basic introduction</span>
            </button>
            <button class="videos btn btn-primary btn-lg" (click)="_onPlay('http://s3.signage.me/business1000/resources/SceneComponentsLite.mp4')">
                <span data-localize="sceneAndComponents">Scenes and components</span>
            </button>
            <button class="videos btn btn-primary btn-lg"  (click)="_onPlay('http://s3.signage.me/business1000/resources/StudioLiteAdv.mp4')">
                <span data-localize="advancedConfigurationVideo">advanced configuration</span>
            </button>
            <button class="videos btn btn-primary btn-lg"  (click)="_onPlay('http://s3.signage.me/business1000/resources/LiteSeqVsSched.mp4')">
                <span data-localize="seqVsSchedVideo2">sequencer vs scheduler</span>
            </button>
            <button class="videos btn btn-primary btn-lg"  (click)="_onPlay('http://s3.signage.me/business1000/resources/LiteCollection.mp4')">
                <span data-localize="collectionComponent">collection component</span>
            </button>
            <button class="videos btn btn-primary btn-lg"  (click)="_onPlay('http://s3.signage.me/business1000/resources/LocationBased.mp4')">
                <span data-localize="locationBasedComponent">location based component</span>
            </button>
            <button class="videos btn btn-primary btn-lg"  (click)="_onPlay('http://s3.signage.me/business1000/resources/LiteGoogleCalendar.mp4')">
                <span data-localize="googleCalendarComponent">Google Calendar</span>
            </button>
            <button class="videos btn btn-primary btn-lg"  (click)="_onPlay('http://s3.signage.me/business1000/resources/FasterQv2.mp4')">
                <span>FasterQue line management</span>
            </button>
            <hr/>
            <div class="reshid">
                <h3 i18n > links</h3>
                <ul>
                    <li *ngIf="isBrandingDisabled | async">
                        <a class="helpLinks"target="_blank" href="http://lite.digitalsignage.com" data-localize="studioLitePage">StudioLite page</a>
                    </li>
                    <li *ngIf="isBrandingDisabled | async">
                        <a class="helpLinks"target="_blank" href="http://script.digitalsignage.com/forum/index.php" data-localize="supportForum">Support forum</a>
                    </li>
                    <li *ngIf="isBrandingDisabled | async">
                        <a class="helpLinks"target="_blank" href="http://git.digitalsignage.com" data-localize="openSource">Open source</a>
                    </li>
                    <li *ngIf="isBrandingDisabled | async">
                        <a class="helpLinks" target="_blank" href="http://script.digitalsignage.com/cgi-bin/webinar.cgi" data-localize="webinar">Webinar</a>
                    </li>
                    <li *ngIf="isBrandingDisabled | async">
                        <a class="helpLinks" target="_blank" href="http://www.digitalsignage.com/_html/faqs.html" data-localize="faq">FAQs</a>
                    </li>
                    <li *ngIf="isBrandingDisabled | async">
                        <a class="helpLinks" target="_blank"  href="http://www.digitalsignage.com/support/upload/index.php?/Knowledgebase/List" data-localize="knowledgeBase">Knowledge base</a>
                    </li>
                    <li>
                        <a class="helpLinks" target="_blank"  href="http://www.digitalsignage.com/files/FQ_PrinterSetup.pdf">Setting up FasterQ printer</a>
                    </li>
                </ul>
            </div>
            <hr/>
            <h5 i18n>Powered by Google's Angular framework</h5>
            <a class="helpLinks" target="_blank"  href="https://angular.io/">
                <img src="./assets/angular.png"/>
            </a>
            
        </div>
        <modal (onDismiss)="_onClose()" (onClose)="_onClose()" [size]="'lg'" #modal>
            <modal-header [show-close]="true">
            </modal-header>
            <modal-body>
                <media-player *ngIf="m_playing" [autoPlay]="true" #mediaPlayer [playResource]="m_playResource"></media-player>
            </modal-body>
            <modal-footer [show-default-buttons]="false"></modal-footer>
        </modal>
    `
})
export class HelpNavigation extends Compbaser {

    m_playResource
    m_playing = false;
    isBrandingDisabled: Observable<boolean>;

    @ViewChild('modal')
    modal: ModalComponent;

    @ViewChild('mediaPlayer')
    media: MediaPlayer;

    constructor(private yp:YellowPepperService) {
        super();
        this.isBrandingDisabled = this.yp.isBrandingDisabled()
    }

    _onClose(){
        this.m_playing = false;
    }

    _onPlay(i_path){
        this.m_playResource = i_path;
        this.modal.open('lg')
        this.m_playing = true;
    }
    destroy() {
    }
}