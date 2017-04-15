import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule, JsonpModule} from "@angular/http";
import {Infobox} from "../comps/infobox/Infobox";
import {Sliderpanel} from "../comps/sliderpanel/Sliderpanel";
import {Slideritem} from "../comps/sliderpanel/Slideritem";
import {PanelSplitMain} from "../comps/panel-split/panel-split-main";
import {PanelSplitSide} from "../comps/panel-split/panel-split-side";
import {PanelSplitContainer} from "../comps/panel-split/panel-split-container";
import {ListToArrayPipe} from "../pipes/list-to-array-pipe";
import {MatchBodyHeight} from "../comps/match-body-height/match-body-height";
import {ScreenTemplate} from "../comps/screen-template/screen-template";
import {BlurForwarder} from "../comps/blurforwarder/BlurForwarder";
import {ContextMenuModule} from "ngx-contextmenu";
import {ChartModule} from "angular2-highcharts";
import {BlockPropContainer} from "../app/blocks/block-prop-container";
import {FormatSecondsPipe} from "../pipes/format-seconds-pipe";
import {DraggableList} from "../comps/draggable-list/draggable-list";
import {ColorPickerModule} from "ngx-color-picker";
import {Tabs} from "../comps/tabs/tabs";
import {Tab} from "../comps/tabs/tab";
import {BlockPropCommon} from "../app/blocks/block-prop-common";
import {BlockPropHtml} from "../app/blocks/block-prop-html";
import {BlockPropClock} from "../app/blocks/block-prop-clock";
import {FontSelector} from "../comps/font-selector/font-selector";
import {BlockPropWeather} from "../app/blocks/block-prop-weather";
import {BlockPropJsonPlayer} from "../app/blocks/block-prop-json-player";
import {SimpleGridModule} from "../comps/simple-grid-module/SimpleGridModule";
import {DropdownModule, RadioButtonModule} from "primeng/primeng";
import {BlockPropInstagram} from "../app/blocks/block-prop-instagram";
import {BlockPropCalendar} from "../app/blocks/block-prop-calendar";
import {BlockPropSheets} from "../app/blocks/block-prop-sheets";
import {BlockPropTwitter} from "../app/blocks/block-prop-twitter";
import {BlockPropVideo} from "../app/blocks/block-prop-video";
import {BlockPropLabel} from "../app/blocks/block-prop-label";
import {BlockPropImage} from "../app/blocks/block-prop-image";
import {BlockPropMrss} from "../app/blocks/block-prop-mrss";
import {BlockPropRss} from "../app/blocks/block-prop-rss";
import {BlockPropCollection} from "../app/blocks/block-prop-collection";
import {JsonEventGrid} from "../app/blocks/json-event-grid";
import {BlockPropQR} from "../app/blocks/block-prop-qr";
import {BlockPropYouTube} from "../app/blocks/block-prop-youtube";
import {BlockPropDigg} from "../app/blocks/block-prop.digg";
import {BlockPropFasterQ} from "../app/blocks/block-prop-fasterq";
import {BlockPropLocation} from "../app/blocks/block-prop-location";
import {AddContent} from "../app/campaigns/add-content";
import {BlockPropScene} from "../app/blocks/block-prop-scene";
import {Loading} from "../comps/loading/loading";
import {BlockPropJsonItem} from "../app/blocks/block-prop-json-item";
import {LivePreview} from "../app/live-preview/live-preview";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {AgmCoreModule} from "angular2-google-maps/core";
import {LocationMap} from "../app/location/location-map";
import {SlideritemContent} from "../comps/sliderpanel/SliderItemContent";
import {MediaPlayer} from "../comps/media-player/media-player";
import {VgCoreModule} from "videogular2/core";
import {VgControlsModule} from "videogular2/controls";
import {VgOverlayPlayModule} from "videogular2/overlay-play";
import {VgBufferingModule} from "videogular2/buffering";
import {FilterModelPipe} from "../filters/filter-model-pipe";
import {SvgIcon} from "../comps/svg-icon/svg-icon";
import {LazyImage} from "../comps/lazy-image/lazy-image";
import {ProUpgrade} from "../app/studiopro/pro-upgrade";

var sharedComponents = [Tabs, Tab, Infobox, Sliderpanel, Slideritem, SlideritemContent, PanelSplitMain, PanelSplitSide, PanelSplitContainer, ListToArrayPipe, FormatSecondsPipe, MatchBodyHeight, ScreenTemplate, BlurForwarder, DraggableList, AddContent, Loading,
    FontSelector, BlockPropContainer, BlockPropCommon, BlockPropHtml, BlockPropClock, BlockPropWeather, BlockPropInstagram, BlockPropJsonPlayer, BlockPropJsonItem, LivePreview, LocationMap, MediaPlayer, FilterModelPipe, SvgIcon, LazyImage, ProUpgrade,
    BlockPropScene, BlockPropCalendar, BlockPropSheets, BlockPropTwitter, BlockPropVideo, BlockPropImage, BlockPropLabel, BlockPropMrss, BlockPropLocation, BlockPropRss, BlockPropDigg, BlockPropFasterQ, BlockPropCollection, BlockPropQR, BlockPropYouTube, JsonEventGrid];

@NgModule({
    imports: [CommonModule, FormsModule, HttpModule, JsonpModule, ReactiveFormsModule, ContextMenuModule, ChartModule, ReactiveFormsModule, ColorPickerModule, DropdownModule, RadioButtonModule, SimpleGridModule, Ng2Bs3ModalModule, AgmCoreModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule],
    exports: [CommonModule, FormsModule, HttpModule, JsonpModule, ReactiveFormsModule, ContextMenuModule, ChartModule, ColorPickerModule, DropdownModule, RadioButtonModule, SimpleGridModule, Ng2Bs3ModalModule, AgmCoreModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule, ...sharedComponents],
    entryComponents: [ScreenTemplate],
    declarations: [...sharedComponents]
})

export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: []
        };
    }
}