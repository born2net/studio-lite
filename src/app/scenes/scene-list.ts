import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {IUiState} from "../../store/store.data";
import {SideProps} from "../../store/actions/appdb.actions";
import {BlockService, ISceneData} from "../blocks/block-service";

@Component({
    selector: 'scene-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <ul (click)="$event.preventDefault()" class="appList list-group">

            <a *ngFor="let scene of m_scenes; let i = index" (click)="_onSceneSelected($event, scene, i)"
               [ngClass]="{'selectedItem': selectedIdx == i}" href="#" class="list-group-item">
                <h4>{{scene?.playerDataModel.getSceneName}}</h4>
                <!-- todo: build local array from playerDataModel on use it as data source so we can remove XML processing from getSceneName and show font awesome -->
                <!--<i class="fa {{item.blockFontAwesome}}"></i>-->
                <p class="list-group-item-text">scene type: {{scene?.playerDataModel.getSceneMime}} </p>
                <div class="openProps">
                    <button type="button" class="props btn btn-default btn-sm"><i style="font-size: 1.5em" class="props fa fa-gear"></i></button>
                </div>
            </a>
        </ul>
    `,
})
export class SceneList extends Compbaser {
    selectedIdx = -1;
    m_scenes: Array<ISceneData>;
    m_selectedScene: ISceneData;

    constructor(private bs: BlockService) {
        super();
    }

    @Input()
    set scenes(i_scenes: Array<ISceneData>) {
        this.m_scenes = i_scenes;
    }

    @Output()
    slideToSceneEditor: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    slideToSceneName: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onSceneSelected: EventEmitter<any> = new EventEmitter<any>();

    _onSceneSelected(event: MouseEvent, scene: ISceneData, index) {
        this.selectedIdx = index;
        let uiState: IUiState;
        if (jQuery(event.target).hasClass('props')) {
            uiState = {
                uiSideProps: SideProps.sceneProps,
                scene: {sceneSelected: scene.scene_id}
            }
            this.onSceneSelected.emit(uiState)
        } else {
            uiState = {
                uiSideProps: SideProps.miniDashboard,
                scene: {sceneSelected: scene.scene_id}
            }
            this.slideToSceneEditor.emit();
            this.onSceneSelected.emit(uiState)
        }
        this.m_selectedScene = scene;
    }

    resetSelection(){
        this.selectedIdx = -1;
    }

    ngOnInit() {
    }

    destroy() {
    }
}