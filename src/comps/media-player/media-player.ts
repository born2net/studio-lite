import {Component, Input} from "@angular/core";
import {VgAPI} from "videogular2/core";

@Component({
    selector: 'media-player',
    template: `
        <!--<button (click)="onSwap('https://s3.signage.me/business1000/resources/SceneComponentsLite.mp4','video/mp4')">swap</button>-->

        <vg-player (onPlayerReady)="onPlayerReady($event)" style="width: 100%; height: 100%">
            <vg-overlay-play></vg-overlay-play>
            <vg-buffering></vg-buffering>

            <vg-scrub-bar>
                <vg-scrub-bar-current-time></vg-scrub-bar-current-time>
                <vg-scrub-bar-buffering-time></vg-scrub-bar-buffering-time>
            </vg-scrub-bar>

            <vg-controls [vgAutohide]="true" [vgAutohideTime]="1.5">
                <vg-play-pause></vg-play-pause>
                <vg-playback-button></vg-playback-button>

                <vg-time-display vgProperty="current" vgFormat="mm:ss"></vg-time-display>

                <vg-scrub-bar style="pointer-events: none;"></vg-scrub-bar>

                <vg-time-display vgProperty="left" vgFormat="mm:ss"></vg-time-display>
                <vg-time-display vgProperty="total" vgFormat="mm:ss"></vg-time-display>

                <vg-track-selector></vg-track-selector>
                <vg-mute></vg-mute>
                <vg-fullscreen></vg-fullscreen>
                <vg-volume></vg-volume>


            </vg-controls>

            <video width="100%" height="100%" [vgMedia]="media" #media id="singleVideo" preload="auto"> <!-- crossorigin -->
                <source *ngFor="let video of sources" [src]="video.src" [type]="video.type">
                <!--<track kind="subtitles" label="English" src="http://static.videogular.com/assets/subs/pale-blue-dot.vtt" srclang="en" default>-->
                <!--<track kind="subtitles" label="Español" src="http://static.videogular.com/assets/subs/pale-blue-dot-es.vtt" srclang="es">-->
            </video>
        </vg-player>
    `
})
export class MediaPlayer {
    sources: Array<Object>;
    api: VgAPI

    constructor() {
        this.sources = [
            {
                src: "http://s3.signage.me/business1000/resources/OfflineUpdate.mp4",
                type: "video/mp4"
            }
        ];
    }

    @Input()
    set playResource(i_resource: string) {
        this.onSwap(i_resource, 'video/mp4')
    }

    @Input() autoPlay:boolean = false;

    onSwap(source: string, type: string) {
        if (this.api) this.api.pause();
        this.sources = new Array<Object>();
        this.sources.push({
            src: source,
            type: type
        });
        setTimeout(() => {
            this.api.getDefaultMedia().currentTime = 0;
            if (this.api && this.autoPlay)
                this.api.play();
        }, 300)


    }

    getApi(): VgAPI {
        return this.api;
    }

    onPlayerReady(i_api: VgAPI) {
        this.api = i_api;
        // this.api.fsAPI.toggleFullscreen()
        // this.api.getDefaultMedia().subscriptions.ended.subscribe(
        //     () => {
        //         // Set the video to the beginning
        //         this.api.getDefaultMedia().currentTime = 0;
        //     }
        // );
    }
}

