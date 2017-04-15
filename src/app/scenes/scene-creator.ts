import {Component, ChangeDetectionStrategy, AfterViewInit, Output, EventEmitter, ViewChild} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {BlockService} from "../blocks/block-service";
import * as _ from 'lodash';
import {Lib} from "../../Lib";
import {RedPepperService} from "../../services/redpepper.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {IUiState} from "../../store/store.data";
import {ACTION_UISTATE_UPDATE} from "../../store/actions/appdb.actions";
import {ToastsManager} from "ng2-toastr";
import {PLACEMENT_IS_SCENE} from "../../interfaces/Consts";
import {MainAppShowStateEnum} from "../app-component";

@Component({
    selector: 'scene-creator',
    styleUrls: ['./scene-creator.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small class="debug">{{me}}</small>
        <button (click)="_goBack()" type="button" style="margin-left: 8px" title="add new timeline" class="btn btn-default btn-sm">
            <span class="glyphicon glyphicon-chevron-left"></span>
        </button>
        <div class="clearfix"></div>
        <div *ngIf="m_selectTypeMode" style="padding: 5px 20px 0px 15px">
            <div *ngFor="let category of m_sceneCategories" (click)="_onAddScene(category)" class="col-xs-12 col-sm-6 col-md-6 col-lg-4 profileCard">
                <div class="profileCard1">
                    <div class="pImg">
                        <span class="fa {{category.icon}} fa-4x"></span>
                    </div>
                    <div class="pDes">
                        <h1 class="text-center">{{category.name}}</h1>
                        <p>{{category.description}}</p>
                        <a class="btn btn-md">
                            <span class="fa fa-plus fa-2x"></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div *ngIf="!m_selectTypeMode" style="padding: 20px">
            <div (click)="_onTemplateSelected(account)" *ngFor="let account of m_sceneAccounts" class="col-xs-1" style="margin: 10px">
                <img class="sceneImportThumb" src="https://secure.digitalsignage.com/studioweb/assets/scenes/{{account.sceneName}}.jpg"/>
                <!--<img class="sceneImportThumb" src="../assets/scenes/{{account.sceneName}}.jpg"/>-->
            </div>
        </div>
        <modal (onClose)="_onSceneImport()" #modal>
            <modal-header [show-close]="true">
                <h4 i18n class="modal-title">import template</h4>
            </modal-header>
            <modal-body>
                <img [src]="m_largePreview" style="width: 512px; height: 286px; position: relative; left: 28px">
            </modal-body>
            <modal-footer [close-button-label]="'download'" [show-default-buttons]="true"></modal-footer>
        </modal>
    `,
})
export class SceneCreator extends Compbaser implements AfterViewInit {

    m_selectedAccount;
    m_largePreview = '';
    m_sceneCategories = [];
    m_sceneAccounts = [];
    m_selectTypeMode = true;
    m_sceneTemplates;
    m_selectedSceneMime: string;

    constructor(private yp: YellowPepperService, private bs: BlockService, private rp: RedPepperService, private toastr: ToastsManager) {
        super();
        this._initSceneTemplates();
    }

    @ViewChild(ModalComponent)
    modal: ModalComponent;

    @Output()
    onGoBack: EventEmitter<any> = new EventEmitter<any>();

    ngAfterViewInit() {

        this.m_sceneCategories = [
            {
                name: 'from empty',
                mimeType: 'blank',
                icon: 'fa-star',
                description: 'Create your own design, simply start with a blank scene and mix in your favorite images, videos, SVG graphics and even smart components. Get all the power to design your own custom scene.'
            },
            {
                name: 'from template',
                mimeType: 'template',
                icon: 'fa-paint-brush',
                description: 'With hundreds of beautiful pre-made designs you are sure to find something you like. The scene templates are preloaded with images and labels so its a great way to get started'
            }
        ];

        var blocks = (this.bs.getBlocks());
        _.forEach(blocks, (block: any) => {
            if (block.mimeType) {
                this.m_sceneCategories.push({
                    name: block.description,
                    mimeType: block.mimeType,
                    icon: block.fontAwesome,
                    description: block.jsonItemLongDescription
                });
            }
        });

        this.cancelOnDestroy(
            this.yp.listenMainAppState()
                .skip(1)
                .subscribe(i_status => {
                    if (i_status == MainAppShowStateEnum.SAVED) {
                        this.toastr.info('scene imported and is available in scene list');
                        this._goBack();
                    }
                })
        )

    }

    _onSceneImport() {
        this.rp.loaderManager.importScene(this.m_selectedAccount.businessId, this.m_selectedAccount.nativeId, (i_SceneId) => {
            this.rp.injectPseudoScenePlayersIDs(i_SceneId);
            let uiState: IUiState = {mainAppState: MainAppShowStateEnum.SAVE}
            this.yp.ngrxStore.dispatch(({type: ACTION_UISTATE_UPDATE, payload: uiState}))
        });
    }

    _onTemplateSelected(account) {
        this.m_selectedAccount = account;
        this.m_largePreview = `http://s3.signage.me/business1000/resources/scenes_snaps/${account.sceneName}.png`
        this.modal.open();
    }

    private _getTemplates() {
        this.m_sceneAccounts = [];
        for (var sceneName in this.m_sceneTemplates) {
            var sceneConfig = this.m_sceneTemplates[sceneName];

            switch (this.m_selectedSceneMime) {
                case 'Json.digg': {
                    if (sceneName.indexOf('Digg') == -1)
                        continue;
                    break;
                }
                case 'Json.twitter': {
                    if (sceneName.indexOf('Twitter') == -1)
                        continue;
                    break;
                }
                case 'Json.instagram': {
                    if (sceneName.indexOf('Instagram') == -1)
                        continue;
                    break;
                }
                case 'Json.calendar': {
                    if (sceneName.indexOf('Calendar') == -1)
                        continue;
                    break;
                }
                case 'Json.spreadsheet': {
                    if (sceneName.indexOf('Sheet') == -1)
                        continue;
                    break;
                }
                case 'Json.weather': {
                    if (sceneName.indexOf('Weather') == -1)
                        continue;
                    break;
                }
                default: {
                }
            }
            this.m_sceneAccounts.push({
                nativeId: sceneConfig[2],
                sceneName: sceneName,
                businessId: sceneConfig[0],
                src: `_assets/scenes/'${sceneName}.jpg`
            })
        }
        this.m_sceneAccounts.pop();
    }

    _onAddScene(category) {
        switch (category.mimeType) {
            case 'blank': {
                this._nameScene((i_name) => {
                    if (_.isUndefined(i_name) || i_name.length == 0)
                        return;
                    var player_data = this.bs.getBlockBoilerplate('3510').getDefaultPlayerData(PLACEMENT_IS_SCENE);
                    var sceneId = this.rp.createScene(player_data, '', i_name);
                    this.rp.reduxCommit();
                    this.toastr.info('scene imported and is available in scene list');
                    this._goBack();
                });
                return;
            }
            case 'template': {

                this.m_selectedSceneMime = 'all';
                break;
            }
            case 'Json.digg': {
                this.m_selectedSceneMime = 'Json.digg';
                break;
            }
            case 'Json.twitter': {
                this.m_selectedSceneMime = 'Json.twitter';
                break;
            }
            case 'Json.instagram.feed': {
                this.m_selectedSceneMime = 'Json.instagram';
                break;
            }
            case 'Json.calendar': {
                this.m_selectedSceneMime = 'Json.calendar';
                break;
            }
            case 'Json.weather': {
                this.m_selectedSceneMime = 'Json.weather';
                break;
            }
            case 'Json.spreadsheet': {
                this.m_selectedSceneMime = 'Json.spreadsheet';
                break;
            }

        }
        this._getTemplates();
        this.m_selectTypeMode = false;


    }

    _goBack() {
        this.onGoBack.emit()
    }

    private _nameScene(i_cb) {
        bootbox.prompt("Give your scene a name:", (result) => {
            if (result === null) {
                i_cb();
            } else {
                result = Lib.CleanChar(result);
                i_cb(result);
            }
        });
    }

    ngOnInit() {
    }

    destroy() {
    }

    private _initSceneTemplates() {
        this.m_sceneTemplates = {
            Template21: [396594, 'ida.signage.me', 50],
            Template18: [396594, 'ida.signage.me', 47],
            Template23: [396594, 'ida.signage.me', 52],
            Template24: [396594, 'ida.signage.me', 53],
            Template22: [396594, 'ida.signage.me', 51],
            Template6: [396594, 'ida.signage.me', 34],
            Template13: [396594, 'ida.signage.me', 42],
            Template8: [396594, 'ida.signage.me', 36],
            Template10: [396594, 'ida.signage.me', 39],
            Template12: [396594, 'ida.signage.me', 41],
            Template1: [396594, 'ida.signage.me', 29],
            Template4: [396594, 'ida.signage.me', 32],
            Template5: [396594, 'ida.signage.me', 33],
            Template7: [396594, 'ida.signage.me', 35],
            Template3: [396594, 'ida.signage.me', 31],
            Template9: [396594, 'ida.signage.me', 38],
            Template2: [396594, 'ida.signage.me', 30],
            Template11: [396594, 'ida.signage.me', 40],
            Template15: [396594, 'ida.signage.me', 44],
            Template16: [396594, 'ida.signage.me', 45],
            Template14: [396594, 'ida.signage.me', 43],
            Template17: [396594, 'ida.signage.me', 46],
            Template19: [396594, 'ida.signage.me', 48],
            Template20: [396594, 'ida.signage.me', 49],
            Template26: [396595, 'ida.signage.me', 4],
            Template40: [396595, 'ida.signage.me', 18],
            Template42: [396595, 'ida.signage.me', 21],
            Template34: [396595, 'ida.signage.me', 12],
            Template27: [396595, 'ida.signage.me', 5],
            Template38: [396595, 'ida.signage.me', 16],
            Template35: [396595, 'ida.signage.me', 13],
            Template37: [396595, 'ida.signage.me', 15],
            Template39: [396595, 'ida.signage.me', 17],
            Template36: [396595, 'ida.signage.me', 14],
            Template29: [396595, 'ida.signage.me', 7],
            Template44: [396595, 'ida.signage.me', 23],
            Template43: [396595, 'ida.signage.me', 22],
            Template32: [396595, 'ida.signage.me', 10],
            Template46: [396595, 'ida.signage.me', 24],
            Template41: [396595, 'ida.signage.me', 19],
            Template45: [396595, 'ida.signage.me', 25],
            Template47: [396595, 'ida.signage.me', 20],
            Template48: [396595, 'ida.signage.me', 26],
            Template25: [396595, 'ida.signage.me', 3],
            Template28: [396595, 'ida.signage.me', 6],
            Template30: [396595, 'ida.signage.me', 8],
            Template31: [396595, 'ida.signage.me', 9],
            Template33: [396595, 'ida.signage.me', 11],
            Template57: [396596, 'ida.signage.me', 14],
            Template59: [396596, 'ida.signage.me', 16],
            Template58: [396596, 'ida.signage.me', 15],
            Template62: [396596, 'ida.signage.me', 19],
            Template61: [396596, 'ida.signage.me', 18],
            Template53: [396596, 'ida.signage.me', 10],
            Template65: [396596, 'ida.signage.me', 22],
            Template63: [396596, 'ida.signage.me', 20],
            Template66: [396596, 'ida.signage.me', 23],
            Template67: [396596, 'ida.signage.me', 24],
            Template64: [396596, 'ida.signage.me', 21],
            Template68: [396596, 'ida.signage.me', 25],
            Template70: [396596, 'ida.signage.me', 27],
            Template72: [396596, 'ida.signage.me', 29],
            Template51: [396596, 'ida.signage.me', 8],
            Template52: [396596, 'ida.signage.me', 9],
            Template50: [396596, 'ida.signage.me', 7],
            Template71: [396596, 'ida.signage.me', 28],
            Template49: [396596, 'ida.signage.me', 6],
            Template54: [396596, 'ida.signage.me', 11],
            Template55: [396596, 'ida.signage.me', 12],
            Template56: [396596, 'ida.signage.me', 13],
            Template60: [396596, 'ida.signage.me', 17],
            Template69: [396596, 'ida.signage.me', 26],
            Template81: [396597, 'ida.signage.me', 25],
            Template73: [396597, 'ida.signage.me', 17],
            Template78: [396597, 'ida.signage.me', 22],
            Template79: [396597, 'ida.signage.me', 23],
            Template84: [396597, 'ida.signage.me', 28],
            Template76: [396597, 'ida.signage.me', 20],
            Template77: [396597, 'ida.signage.me', 21],
            Template86: [396597, 'ida.signage.me', 30],
            Template87: [396597, 'ida.signage.me', 31],
            Template85: [396597, 'ida.signage.me', 29],
            Template83: [396597, 'ida.signage.me', 27],
            Template90: [396597, 'ida.signage.me', 34],
            Template91: [396597, 'ida.signage.me', 35],
            Template92: [396597, 'ida.signage.me', 36],
            Template89: [396597, 'ida.signage.me', 33],
            Template95: [396597, 'ida.signage.me', 40],
            Template94: [396597, 'ida.signage.me', 38],
            Template88: [396597, 'ida.signage.me', 32],
            Template75: [396597, 'ida.signage.me', 19],
            Template93: [396597, 'ida.signage.me', 37],
            Template74: [396597, 'ida.signage.me', 18],
            Template82: [396597, 'ida.signage.me', 26],
            Template80: [396597, 'ida.signage.me', 24],
            Template96: [396598, 'ida.signage.me', 12],
            Template98: [396598, 'ida.signage.me', 14],
            Template99: [396598, 'ida.signage.me', 15],
            Template100: [396598, 'ida.signage.me', 16],
            Template97: [396598, 'ida.signage.me', 13],
            Template116: [401213, 'ida.signage.me', 21],
            Template117: [401213, 'ida.signage.me', 22],
            Template102: [401213, 'ida.signage.me', 6],
            Template105: [401213, 'ida.signage.me', 9],
            Template109: [401213, 'ida.signage.me', 13],
            Template101: [401213, 'ida.signage.me', 5],
            Template108: [401213, 'ida.signage.me', 12],
            Template111: [401213, 'ida.signage.me', 15],
            Template110: [401213, 'ida.signage.me', 14],
            Template113: [401213, 'ida.signage.me', 17],
            Template112: [401213, 'ida.signage.me', 16],
            Template115: [401213, 'ida.signage.me', 20],
            Template119: [401213, 'ida.signage.me', 24],
            Template114: [401213, 'ida.signage.me', 19],
            Template106: [401213, 'ida.signage.me', 10],
            Template103: [401213, 'ida.signage.me', 7],
            Template104: [401213, 'ida.signage.me', 8],
            Template107: [401213, 'ida.signage.me', 11],
            Template120: [401213, 'ida.signage.me', 25],
            Template118: [401213, 'ida.signage.me', 23],
            Template127: [402393, 'ida.signage.me', 13],
            Template123: [402393, 'ida.signage.me', 9],
            Template122: [402393, 'ida.signage.me', 8],
            Template121: [402393, 'ida.signage.me', 7],
            Template124: [402393, 'ida.signage.me', 10],
            Template125: [402393, 'ida.signage.me', 11],
            Template126: [402393, 'ida.signage.me', 12],
            Template128: [402393, 'ida.signage.me', 14],
            Template130: [402393, 'ida.signage.me', 16],
            Template129: [402393, 'ida.signage.me', 15],
            Template140: [402394, 'ida.signage.me', 13],
            Template132: [402394, 'ida.signage.me', 5],
            Template137: [402394, 'ida.signage.me', 10],
            Template138: [402394, 'ida.signage.me', 11],
            Template135: [402394, 'ida.signage.me', 8],
            Template136: [402394, 'ida.signage.me', 9],
            Template131: [402394, 'ida.signage.me', 4],
            Template133: [402394, 'ida.signage.me', 6],
            Template134: [402394, 'ida.signage.me', 7],
            Template139: [402394, 'ida.signage.me', 12],
            Template142: [402395, 'ida.signage.me', 10],
            Template146: [402395, 'ida.signage.me', 14],
            Template141: [402395, 'ida.signage.me', 9],
            Template144: [402395, 'ida.signage.me', 12],
            Template145: [402395, 'ida.signage.me', 13],
            Template143: [402395, 'ida.signage.me', 11],
            Template148: [402395, 'ida.signage.me', 16],
            Template147: [402395, 'ida.signage.me', 15],
            Template149: [402395, 'ida.signage.me', 17],
            Template150: [402395, 'ida.signage.me', 18],
            Template155: [402397, 'ida.signage.me', 22],
            Template154: [402397, 'ida.signage.me', 21],
            Template151: [402397, 'ida.signage.me', 18],
            Template152: [402397, 'ida.signage.me', 19],
            Template153: [402397, 'ida.signage.me', 20],
            Template156: [402397, 'ida.signage.me', 23],
            Template157: [402397, 'ida.signage.me', 24],
            Template158: [402397, 'ida.signage.me', 25],
            Template159: [402397, 'ida.signage.me', 26],
            Template160: [402397, 'ida.signage.me', 27],
            Template168: [402398, 'ida.signage.me', 25],
            Template169: [402398, 'ida.signage.me', 26],
            Template161: [402398, 'ida.signage.me', 18],
            Template162: [402398, 'ida.signage.me', 19],
            Template164: [402398, 'ida.signage.me', 20],
            Template163: [402398, 'ida.signage.me', 21],
            Template165: [402398, 'ida.signage.me', 22],
            Template167: [402398, 'ida.signage.me', 24],
            Template166: [402398, 'ida.signage.me', 23],
            Template170: [402398, 'ida.signage.me', 27],
            Template171: [402399, 'ida.signage.me', 12],
            Template174: [402399, 'ida.signage.me', 15],
            Template172: [402399, 'ida.signage.me', 13],
            Template176: [402399, 'ida.signage.me', 17],
            Template173: [402399, 'ida.signage.me', 14],
            Template178: [402399, 'ida.signage.me', 19],
            Template177: [402399, 'ida.signage.me', 18],
            Template179: [402399, 'ida.signage.me', 20],
            Template180: [402399, 'ida.signage.me', 21],
            Template175: [402399, 'ida.signage.me', 16],
            Template187: [402400, 'ida.signage.me', 16],
            Template188: [402400, 'ida.signage.me', 17],
            Template181: [402400, 'ida.signage.me', 10],
            Template182: [402400, 'ida.signage.me', 11],
            Template183: [402400, 'ida.signage.me', 12],
            Template184: [402400, 'ida.signage.me', 13],
            Template185: [402400, 'ida.signage.me', 14],
            Template186: [402400, 'ida.signage.me', 15],
            Template190: [402400, 'ida.signage.me', 19],
            Template189: [402400, 'ida.signage.me', 18],
            Template192: [402401, 'ida.signage.me', 9],
            Template193: [402401, 'ida.signage.me', 11],
            Template194: [402401, 'ida.signage.me', 12],
            Template197: [402401, 'ida.signage.me', 16],
            Template198: [402401, 'ida.signage.me', 17],
            Template199: [402401, 'ida.signage.me', 18],
            Template200: [402401, 'ida.signage.me', 19],
            Template191: [402401, 'ida.signage.me', 8],
            Template195: [402401, 'ida.signage.me', 13],
            Template196: [402401, 'ida.signage.me', 14],
            Template204: [402402, 'ida.signage.me', 20],
            Template206: [402402, 'ida.signage.me', 22],
            Template201: [402402, 'ida.signage.me', 17],
            Template202: [402402, 'ida.signage.me', 18],
            Template203: [402402, 'ida.signage.me', 19],
            Template205: [402402, 'ida.signage.me', 21],
            Template207: [402402, 'ida.signage.me', 23],
            Template208: [402402, 'ida.signage.me', 24],
            Template209: [402402, 'ida.signage.me', 25],
            Template210: [402402, 'ida.signage.me', 26],
            Template214: [402444, 'ida.signage.me', 13],
            Template213: [402444, 'ida.signage.me', 12],
            Template212: [402444, 'ida.signage.me', 11],
            Template219: [402444, 'ida.signage.me', 18],
            Template211: [402444, 'ida.signage.me', 10],
            Template215: [402444, 'ida.signage.me', 14],
            Template216: [402444, 'ida.signage.me', 15],
            Template217: [402444, 'ida.signage.me', 16],
            Template218: [402444, 'ida.signage.me', 17],
            Template220: [402444, 'ida.signage.me', 19],
            Template227: [402446, 'ida.signage.me', 16],
            Template222: [402446, 'ida.signage.me', 11],
            Template224: [402446, 'ida.signage.me', 13],
            Template230: [402446, 'ida.signage.me', 19],
            Template221: [402446, 'ida.signage.me', 10],
            Template223: [402446, 'ida.signage.me', 12],
            Template225: [402446, 'ida.signage.me', 14],
            Template226: [402446, 'ida.signage.me', 15],
            Template228: [402446, 'ida.signage.me', 17],
            Template229: [402446, 'ida.signage.me', 18],
            Template238: [405214, 'ida.signage.me', 10],
            Template231: [405214, 'ida.signage.me', 3],
            Template232: [405214, 'ida.signage.me', 4],
            Template233: [405214, 'ida.signage.me', 5],
            Template236: [405214, 'ida.signage.me', 8],
            Template237: [405214, 'ida.signage.me', 9],
            Template239: [405214, 'ida.signage.me', 11],
            Template240: [405214, 'ida.signage.me', 12],
            Template235: [405214, 'ida.signage.me', 7],
            Template234: [405214, 'ida.signage.me', 6],
            Template241: [405215, 'ida.signage.me', 10],
            Template247: [405215, 'ida.signage.me', 16],
            Template248: [405215, 'ida.signage.me', 17],
            Template242: [405215, 'ida.signage.me', 11],
            Template243: [405215, 'ida.signage.me', 12],
            Template244: [405215, 'ida.signage.me', 13],
            Template245: [405215, 'ida.signage.me', 14],
            Template246: [405215, 'ida.signage.me', 15],
            Template249: [405215, 'ida.signage.me', 18],
            Template250: [405215, 'ida.signage.me', 19],
            Template258: [405216, 'ida.signage.me', 14],
            Template253: [405216, 'ida.signage.me', 9],
            Template256: [405216, 'ida.signage.me', 12],
            Template257: [405216, 'ida.signage.me', 13],
            Template251: [405216, 'ida.signage.me', 7],
            Template254: [405216, 'ida.signage.me', 10],
            Template255: [405216, 'ida.signage.me', 11],
            Template259: [405216, 'ida.signage.me', 15],
            Template252: [405216, 'ida.signage.me', 8],
            Template260: [405216, 'ida.signage.me', 16],
            Template267: [405217, 'ida.signage.me', 20],
            Template261: [405217, 'ida.signage.me', 14],
            Template262: [405217, 'ida.signage.me', 15],
            Template268: [405217, 'ida.signage.me', 21],
            Template266: [405217, 'ida.signage.me', 19],
            Template265: [405217, 'ida.signage.me', 18],
            Template270: [405217, 'ida.signage.me', 23],
            Template263: [405217, 'ida.signage.me', 16],
            Template264: [405217, 'ida.signage.me', 17],
            Template269: [405217, 'ida.signage.me', 22],
            Template273: [405218, 'ida.signage.me', 20],
            Template274: [405218, 'ida.signage.me', 21],
            Template275: [405218, 'ida.signage.me', 22],
            Template279: [405218, 'ida.signage.me', 26],
            Template271: [405218, 'ida.signage.me', 18],
            Template272: [405218, 'ida.signage.me', 19],
            Template278: [405218, 'ida.signage.me', 25],
            Template276: [405218, 'ida.signage.me', 23],
            Template277: [405218, 'ida.signage.me', 24],
            Template280: [405218, 'ida.signage.me', 27],
            Template283: [405219, 'ida.signage.me', 19],
            Template284: [405219, 'ida.signage.me', 20],
            Template286: [405219, 'ida.signage.me', 22],
            Template281: [405219, 'ida.signage.me', 17],
            Template282: [405219, 'ida.signage.me', 18],
            Template285: [405219, 'ida.signage.me', 21],
            Template287: [405219, 'ida.signage.me', 23],
            Template288: [405219, 'ida.signage.me', 24],
            Template289: [405219, 'ida.signage.me', 25],
            Template290: [405219, 'ida.signage.me', 26],
            Template294: [405220, 'ida.signage.me', 15],
            Template295: [405220, 'ida.signage.me', 16],
            Template293: [405220, 'ida.signage.me', 14],
            Template297: [405220, 'ida.signage.me', 18],
            Template291: [405220, 'ida.signage.me', 12],
            Template292: [405220, 'ida.signage.me', 13],
            Template296: [405220, 'ida.signage.me', 17],
            Template298: [405220, 'ida.signage.me', 19],
            Template299: [405220, 'ida.signage.me', 20],
            Template300: [405220, 'ida.signage.me', 21],
            Template306: [405221, 'ida.signage.me', 10],
            Template307: [405221, 'ida.signage.me', 11],
            Template309: [405221, 'ida.signage.me', 13],
            Template301: [405221, 'ida.signage.me', 5],
            Template302: [405221, 'ida.signage.me', 6],
            Template303: [405221, 'ida.signage.me', 7],
            Template304: [405221, 'ida.signage.me', 8],
            Template305: [405221, 'ida.signage.me', 9],
            Template308: [405221, 'ida.signage.me', 12],
            Template310: [405221, 'ida.signage.me', 14],
            Template311: [405222, 'ida.signage.me', 24],
            Template313: [405222, 'ida.signage.me', 26],
            Template314: [405222, 'ida.signage.me', 27],
            Template315: [405222, 'ida.signage.me', 28],
            Template312: [405222, 'ida.signage.me', 25],
            Template317: [405222, 'ida.signage.me', 30],
            Template316: [405222, 'ida.signage.me', 29],
            Template319: [405222, 'ida.signage.me', 32],
            Template318: [405222, 'ida.signage.me', 31],
            Template320: [405222, 'ida.signage.me', 34],
            Template321: [405223, 'ida.signage.me', 21],
            Template326: [405223, 'ida.signage.me', 26],
            Template325: [405223, 'ida.signage.me', 25],
            Template329: [405223, 'ida.signage.me', 30],
            Template324: [405223, 'ida.signage.me', 24],
            Template328: [405223, 'ida.signage.me', 29],
            Template322: [405223, 'ida.signage.me', 22],
            Template323: [405223, 'ida.signage.me', 23],
            Template327: [405223, 'ida.signage.me', 28],
            //Template340: [405223,'ida.signage.me',32],
            Template331: [405224, 'ida.signage.me', 27],
            Template332: [405224, 'ida.signage.me', 28],
            Template338: [405224, 'ida.signage.me', 35],
            Template339: [405224, 'ida.signage.me', 36],
            Template335: [405224, 'ida.signage.me', 32],
            Template337: [405224, 'ida.signage.me', 34],
            Template334: [405224, 'ida.signage.me', 31],
            Template340: [405224, 'ida.signage.me', 37],
            Template336: [405224, 'ida.signage.me', 33],
            Template333: [405224, 'ida.signage.me', 30],
            Template341: [407718, 'ida.signage.me', 4],
            Template344: [407718, 'ida.signage.me', 7],
            Template345: [407718, 'ida.signage.me', 8],
            Template346: [407718, 'ida.signage.me', 9],
            Template348: [407718, 'ida.signage.me', 11],
            Template343: [407718, 'ida.signage.me', 6],
            Template342: [407718, 'ida.signage.me', 5],
            Template347: [407718, 'ida.signage.me', 10],
            Template349: [407718, 'ida.signage.me', 12],
            Template350: [407718, 'ida.signage.me', 13],
            Template351: [407720, 'ida.signage.me', 5],
            Template353: [407720, 'ida.signage.me', 7],
            Template352: [407720, 'ida.signage.me', 6],
            Template355: [407720, 'ida.signage.me', 9],
            Template356: [407720, 'ida.signage.me', 11],
            Template354: [407720, 'ida.signage.me', 10],
            Template357: [407720, 'ida.signage.me', 12],
            Template360: [407720, 'ida.signage.me', 15],
            Template358: [407720, 'ida.signage.me', 13],
            Template359: [407720, 'ida.signage.me', 14],
            Template362: [407721, 'ida.signage.me', 6],
            Template364: [407721, 'ida.signage.me', 8],
            Template367: [407721, 'ida.signage.me', 11],
            Template361: [407721, 'ida.signage.me', 5],
            Template368: [407721, 'ida.signage.me', 12],
            Template370: [407721, 'ida.signage.me', 14],
            Template365: [407721, 'ida.signage.me', 9],
            Template369: [407721, 'ida.signage.me', 13],
            Template363: [407721, 'ida.signage.me', 7],
            Template366: [407721, 'ida.signage.me', 10],
            Template371: [407722, 'ida.signage.me', 15],
            Template373: [407722, 'ida.signage.me', 16],
            Template372: [407722, 'ida.signage.me', 17],
            Template374: [407722, 'ida.signage.me', 18],
            Template375: [407722, 'ida.signage.me', 19],
            Template378: [407722, 'ida.signage.me', 21],
            Template376: [407722, 'ida.signage.me', 20],
            Template379: [407722, 'ida.signage.me', 23],
            Template377: [407722, 'ida.signage.me', 22],
            Template380: [407722, 'ida.signage.me', 24],
            Template382: [407723, 'ida.signage.me', 28],
            Template384: [407723, 'ida.signage.me', 30],
            Template385: [407723, 'ida.signage.me', 31],
            Template381: [407723, 'ida.signage.me', 27],
            Template388: [407723, 'ida.signage.me', 34],
            Template387: [407723, 'ida.signage.me', 33],
            Template386: [407723, 'ida.signage.me', 32],
            Template389: [407723, 'ida.signage.me', 35],
            Template390: [407723, 'ida.signage.me', 36],
            Template383: [407723, 'ida.signage.me', 29],
            Template392: [407725, 'ida.signage.me', 17],
            Template397: [407725, 'ida.signage.me', 22],
            Template400: [407725, 'ida.signage.me', 25],
            Template398: [407725, 'ida.signage.me', 23],
            Template399: [407725, 'ida.signage.me', 24],
            Template391: [407725, 'ida.signage.me', 16],
            Template393: [407725, 'ida.signage.me', 18],
            Template394: [407725, 'ida.signage.me', 19],
            Template395: [407725, 'ida.signage.me', 20],
            Template396: [407725, 'ida.signage.me', 21],
            Template401: [407726, 'ida.signage.me', 18],
            Template404: [407726, 'ida.signage.me', 21],
            Template405: [407726, 'ida.signage.me', 22],
            Template406: [407726, 'ida.signage.me', 23],
            Template403: [407726, 'ida.signage.me', 20],
            Template407: [407726, 'ida.signage.me', 24],
            Template408: [407726, 'ida.signage.me', 25],
            Template402: [407726, 'ida.signage.me', 19],
            Template409: [407726, 'ida.signage.me', 26],
            Template410: [407726, 'ida.signage.me', 27],
            Template411: [407727, 'ida.signage.me', 8],
            Template413: [407727, 'ida.signage.me', 10],
            Template415: [407727, 'ida.signage.me', 12],
            Template414: [407727, 'ida.signage.me', 11],
            Template416: [407727, 'ida.signage.me', 13],
            Template417: [407727, 'ida.signage.me', 14],
            Template419: [407727, 'ida.signage.me', 16],
            Template418: [407727, 'ida.signage.me', 15],
            Template412: [407727, 'ida.signage.me', 9],
            Template420: [407727, 'ida.signage.me', 17],
            Template428: [407728, 'ida.signage.me', 17],
            Template429: [407728, 'ida.signage.me', 18],
            Template421: [407728, 'ida.signage.me', 10],
            Template422: [407728, 'ida.signage.me', 11],
            Template423: [407728, 'ida.signage.me', 12],
            Template424: [407728, 'ida.signage.me', 13],
            Template425: [407728, 'ida.signage.me', 14],
            Template426: [407728, 'ida.signage.me', 15],
            Template427: [407728, 'ida.signage.me', 16],
            Template430: [407728, 'ida.signage.me', 19],
            Template434: [407729, 'ida.signage.me', 22],
            Template439: [407729, 'ida.signage.me', 27],
            Template433: [407729, 'ida.signage.me', 21],
            Template438: [407729, 'ida.signage.me', 26],
            Template431: [407729, 'ida.signage.me', 19],
            Template432: [407729, 'ida.signage.me', 20],
            Template435: [407729, 'ida.signage.me', 23],
            Template436: [407729, 'ida.signage.me', 24],
            Template437: [407729, 'ida.signage.me', 25],
            Template440: [407729, 'ida.signage.me', 28],
            Template442: [407730, 'ida.signage.me', 13],
            Template443: [407730, 'ida.signage.me', 14],
            Template444: [407730, 'ida.signage.me', 15],
            Template446: [407730, 'ida.signage.me', 17],
            Template445: [407730, 'ida.signage.me', 16],
            Template448: [407730, 'ida.signage.me', 19],
            Template449: [407730, 'ida.signage.me', 20],
            Template441: [407730, 'ida.signage.me', 12],
            Template447: [407730, 'ida.signage.me', 18],
            Template450: [407730, 'ida.signage.me', 21],
            Template454: [411108, 'ida.signage.me', 7],
            Template455: [411108, 'ida.signage.me', 8],
            Template453: [411108, 'ida.signage.me', 6],
            Template456: [411108, 'ida.signage.me', 9],
            Template457: [411108, 'ida.signage.me', 10],
            Template458: [411108, 'ida.signage.me', 11],
            Template459: [411108, 'ida.signage.me', 12],
            Template452: [411108, 'ida.signage.me', 5],
            Template460: [411108, 'ida.signage.me', 13],
            Template451: [411108, 'ida.signage.me', 4],
            Template461: [411110, 'ida.signage.me', 12],
            Template463: [411110, 'ida.signage.me', 14],
            Template462: [411110, 'ida.signage.me', 13],
            Template465: [411110, 'ida.signage.me', 16],
            Template466: [411110, 'ida.signage.me', 17],
            Template467: [411110, 'ida.signage.me', 18],
            Template464: [411110, 'ida.signage.me', 15],
            Template469: [411110, 'ida.signage.me', 20],
            Template470: [411110, 'ida.signage.me', 21],
            Template468: [411110, 'ida.signage.me', 19],
            Template471: [411111, 'ida.signage.me', 10],
            Template473: [411111, 'ida.signage.me', 12],
            Template474: [411111, 'ida.signage.me', 13],
            Template475: [411111, 'ida.signage.me', 14],
            Template476: [411111, 'ida.signage.me', 15],
            Template472: [411111, 'ida.signage.me', 11],
            Template479: [411111, 'ida.signage.me', 18],
            Template480: [411111, 'ida.signage.me', 19],
            Template478: [411111, 'ida.signage.me', 17],
            Template477: [411111, 'ida.signage.me', 16],
            Template483: [411112, 'ida.signage.me', 7],
            Template481: [411112, 'ida.signage.me', 5],
            Template484: [411112, 'ida.signage.me', 8],
            Template486: [411112, 'ida.signage.me', 10],
            Template482: [411112, 'ida.signage.me', 6],
            Template485: [411112, 'ida.signage.me', 9],
            Template488: [411112, 'ida.signage.me', 12],
            Template489: [411112, 'ida.signage.me', 13],
            Template487: [411112, 'ida.signage.me', 11],
            Template490: [411112, 'ida.signage.me', 14],
            Template491: [411113, 'ida.signage.me', 17],
            Template493: [411113, 'ida.signage.me', 19],
            Template494: [411113, 'ida.signage.me', 20],
            Template497: [411113, 'ida.signage.me', 23],
            Template492: [411113, 'ida.signage.me', 18],
            Template495: [411113, 'ida.signage.me', 21],
            Template496: [411113, 'ida.signage.me', 22],
            Template498: [411113, 'ida.signage.me', 24],
            Template499: [411113, 'ida.signage.me', 25],
            Template500: [411113, 'ida.signage.me', 26],
            Digg9: [411115, 'ida.signage.me', 21],
            Digg6: [411115, 'ida.signage.me', 18],
            Digg10: [411115, 'ida.signage.me', 22],
            Digg11: [411115, 'ida.signage.me', 23],
            Digg12: [411115, 'ida.signage.me', 24],
            Digg8: [411115, 'ida.signage.me', 20],
            Digg14: [411115, 'ida.signage.me', 26],
            Digg13: [411115, 'ida.signage.me', 25],
            Digg15: [411115, 'ida.signage.me', 27],
            Digg16: [411115, 'ida.signage.me', 28],
            Digg17: [411115, 'ida.signage.me', 29],
            Digg18: [411115, 'ida.signage.me', 30],
            Digg19: [411115, 'ida.signage.me', 31],
            Digg20: [411115, 'ida.signage.me', 32],
            Digg1: [411115, 'ida.signage.me', 12],
            Digg2: [411115, 'ida.signage.me', 14],
            Digg3: [411115, 'ida.signage.me', 15],
            Digg4: [411115, 'ida.signage.me', 16],
            Digg5: [411115, 'ida.signage.me', 17],
            Digg7: [411115, 'ida.signage.me', 19],
            Digg21: [434454, 'jupiter.signage.me', 6],
            Sheet6: [411116, 'ida.signage.me', 24],
            Sheet7: [411116, 'ida.signage.me', 25],
            Sheet5: [411116, 'ida.signage.me', 23],
            Sheet12: [411116, 'ida.signage.me', 30],
            Sheet13: [411116, 'ida.signage.me', 31],
            Sheet15: [411116, 'ida.signage.me', 33],
            Sheet9: [411116, 'ida.signage.me', 27],
            Sheet16: [411116, 'ida.signage.me', 34],
            Sheet10: [411116, 'ida.signage.me', 28],
            Sheet17: [411116, 'ida.signage.me', 35],
            Sheet19: [411116, 'ida.signage.me', 37],
            Sheet14: [411116, 'ida.signage.me', 32],
            Sheet18: [411116, 'ida.signage.me', 36],
            Sheet11: [411116, 'ida.signage.me', 29],
            Sheet8: [411116, 'ida.signage.me', 26],
            Sheet1: [411116, 'ida.signage.me', 19],
            //Calendar1: [411116,'ida.signage.me',17],
            Sheet2: [411116, 'ida.signage.me', 20],
            Sheet3: [411116, 'ida.signage.me', 21],
            Sheet4: [411116, 'ida.signage.me', 22],
            Sheet20: [411116, 'ida.signage.me', 38],
            Sheet21: [434454, 'jupiter.signage.me', 8],
            Calendar11: [411117, 'ida.signage.me', 22],
            Calendar10: [411117, 'ida.signage.me', 24],
            Calendar12: [411117, 'ida.signage.me', 25],
            //Twitter1: [411117,'ida.signage.me',12],
            Calendar3: [411117, 'ida.signage.me', 15],
            Calendar13: [411117, 'ida.signage.me', 26],
            Calendar15: [411117, 'ida.signage.me', 28],
            Calendar5: [411117, 'ida.signage.me', 17],
            Calendar9: [411117, 'ida.signage.me', 21],
            Calendar14: [411117, 'ida.signage.me', 27],
            Calendar6: [411117, 'ida.signage.me', 18],
            Calendar16: [411117, 'ida.signage.me', 29],
            Calendar4: [411117, 'ida.signage.me', 16],
            Calendar17: [411117, 'ida.signage.me', 30],
            Calendar7: [411117, 'ida.signage.me', 19],
            Calendar18: [411117, 'ida.signage.me', 31],
            Calendar8: [411117, 'ida.signage.me', 20],
            Calendar1: [411117, 'ida.signage.me', 13],
            Calendar2: [411117, 'ida.signage.me', 14],
            Calendar19: [411117, 'ida.signage.me', 32],
            Calendar20: [411117, 'ida.signage.me', 33],
            Calendar21: [434454, 'jupiter.signage.me', 5],
            Twitter1: [411119, 'ida.signage.me', 24],
            Twitter2: [411119, 'ida.signage.me', 25],
            Twitter4: [411119, 'ida.signage.me', 27],
            Twitter3: [411119, 'ida.signage.me', 26],
            Twitter6: [411119, 'ida.signage.me', 29],
            Twitter7: [411119, 'ida.signage.me', 30],
            Twitter5: [411119, 'ida.signage.me', 28],
            Twitter8: [411119, 'ida.signage.me', 31],
            Twitter9: [411119, 'ida.signage.me', 32],
            Twitter10: [411119, 'ida.signage.me', 33],
            Twitter12: [411119, 'ida.signage.me', 35],
            Twitter11: [411119, 'ida.signage.me', 34],
            Twitter13: [411119, 'ida.signage.me', 36],
            Twitter14: [411119, 'ida.signage.me', 37],
            Twitter16: [411119, 'ida.signage.me', 39],
            Twitter17: [411119, 'ida.signage.me', 40],
            Twitter19: [411119, 'ida.signage.me', 42],
            Twitter15: [411119, 'ida.signage.me', 38],
            Twitter20: [411119, 'ida.signage.me', 43],
            Twitter18: [411119, 'ida.signage.me', 41],
            Weather1: [411114, 'ida.signage.me', 12],
            Weather2: [411114, 'ida.signage.me', 13],
            Weather3: [411114, 'ida.signage.me', 14],
            Weather13: [411114, 'ida.signage.me', 24],
            Weather10: [411114, 'ida.signage.me', 21],
            Weather11: [411114, 'ida.signage.me', 22],
            Weather16: [411114, 'ida.signage.me', 27],
            Weather17: [411114, 'ida.signage.me', 28],
            Weather18: [411114, 'ida.signage.me', 29],
            Weather19: [411114, 'ida.signage.me', 30],
            Weather4: [411114, 'ida.signage.me', 15],
            Weather20: [411114, 'ida.signage.me', 31],
            Weather5: [411114, 'ida.signage.me', 16],
            Weather12: [411114, 'ida.signage.me', 23],
            Weather14: [411114, 'ida.signage.me', 25],
            Weather15: [411114, 'ida.signage.me', 26],
            Weather6: [411114, 'ida.signage.me', 17],
            Weather7: [411114, 'ida.signage.me', 18],
            Weather8: [411114, 'ida.signage.me', 19],
            Weather9: [411114, 'ida.signage.me', 20],
            Weather23: [411120, 'ida.signage.me', 20],
            Weather22: [411120, 'ida.signage.me', 19],
            Weather26: [411120, 'ida.signage.me', 23],
            Weather21: [411120, 'ida.signage.me', 18],
            Weather27: [411120, 'ida.signage.me', 24],
            Weather29: [411120, 'ida.signage.me', 26],
            Weather24: [411120, 'ida.signage.me', 21],
            Weather25: [411120, 'ida.signage.me', 22],
            Weather28: [411120, 'ida.signage.me', 25],
            Weather30: [411120, 'ida.signage.me', 27],
            Weather31: [411120, 'ida.signage.me', 28],
            Weather32: [411120, 'ida.signage.me', 30],
            Weather33: [411120, 'ida.signage.me', 31],
            Weather34: [411120, 'ida.signage.me', 32],
            Weather35: [411120, 'ida.signage.me', 33],
            Weather36: [411120, 'ida.signage.me', 34],
            Weather37: [411120, 'ida.signage.me', 35],
            Weather38: [411120, 'ida.signage.me', 36],
            Weather39: [411120, 'ida.signage.me', 38],
            Weather40: [411120, 'ida.signage.me', 39],
            Weather41: [411120, 'ida.signage.me', 40],
            Weather42: [411120, 'ida.signage.me', 42],
            Weather43: [411120, 'ida.signage.me', 41],
            Weather44: [411120, 'ida.signage.me', 43],
            Weather46: [434454, 'jupiter.signage.me', 7]
        }

    }
}
