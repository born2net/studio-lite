import {Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {Observable} from "rxjs";
import {SideProps} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {ResourcesModel} from "../../store/imsdb.interfaces_auto";
import {Lib} from "../../Lib";
import {RedPepperService} from "../../services/redpepper.service";

@Component({
    selector: 'resource-props-manager',
    styles: [`
        ul {
            padding: 0
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <hr/>
        <ul matchBodyHeight="50" style="overflow-y: auto; overflow-x: hidden" [ngSwitch]="m_sideProps$ | async">
            <div *ngSwitchCase="m_sidePropsEnum.resourceProps">
                <h5><i class="fa fa-{{m_formatIcon}}"></i>resource property</h5>
                <input class="form-control" inlength="1" placeholder="resource name" (blur)="_onUpdateResourceName($event)" [(ngModel)]="m_resourceName" type="text"/>
                <br/>
                <div [ngSwitch]="m_resourceType">
                    <div *ngSwitchCase="'image'">
                        <img style="width: 100%" class="img-responsive" [src]="m_imagePath"/>
                    </div>
                    <div *ngSwitchCase="'svg'">
                        <svg-icon style="padding-left: 30px" [height]="'300'" [width]="'260'" [path]="m_svgPath"></svg-icon>
                        
                    </div>
                </div>
                <div [ngSwitch]="m_resourceType">
                    <div *ngSwitchCase="'video'">
                        <div style="width: 100%; height: 200px">
                            <media-player [playResource]="m_playResource"></media-player>
                        </div>
                    </div>
                </div>
                <div [ngSwitch]="m_resourceType">
                    <div *ngSwitchCase="'swf'">
                        <p>Flash swf content</p>
                        <div class="col-xs-4"></div>
                        <i style="color: red" class="fa-5x col-xs-4 fa fa-flash"></i>
                        <div class="col-xs-4"></div>
                    </div>
                </div>

            </div>

            <div *ngSwitchCase="m_sidePropsEnum.miniDashboard">
                <h4>resource dashboard</h4>
            </div>

        </ul>



    `,
})
export class ResourcePropsManager extends Compbaser {

    m_resourceType;
    m_sideProps$: Observable<SideProps>;
    m_sidePropsEnum = SideProps;
    m_uiUserFocusItem$: Observable<SideProps>;
    m_formatIcon = '';
    m_resourceName = '';
    m_selectedResource: ResourcesModel;
    m_playResource = '';
    m_svgPath = '';
    m_imagePath = '';

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();
        this.m_uiUserFocusItem$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);
        this.m_sideProps$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);

        this.cancelOnDestroy(
            //
            this.yp.listenResourceSelected()
                .subscribe((i_resource: ResourcesModel) => {
                    this.m_selectedResource = i_resource;
                    this.m_resourceName = this.m_selectedResource.getResourceName();
                    switch (this.m_selectedResource.getResourceType()) {
                        case 'svg':{
                            this.m_formatIcon = 'spinner';
                            this.m_resourceType = 'svg';


                            path = window['g_protocol'] + this.rp.getUserData().domain + '/Resources/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + 'svg';
                            path = $.base64.encode(path);
                            // var path = window['g_protocol'] + 's3.signage.me/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + this.m_selectedResource.getResourceType();
                            // var urlPath = $.base64.encode(path);
                            // this.m_svgPath = 'https://secure.digitalsignage.com/proxyRequest/' + path;
                            // console.log(this.m_svgPath);
                            this.m_svgPath = 'https://secure.digitalsignage.com/proxyRequest/' + path;
                            // this.m_svgPath = 'https://secure.digitalsignage.com/proxyRequest/aHR0cHM6Ly9wbHV0by5zaWduYWdlLm1lL1Jlc291cmNlcy9idXNpbmVzczM1ODYxMy9yZXNvdXJjZXMvMzQuc3Zn';
                            break;
                        }
                        case 'jpg':
                        case 'png': {
                            this.m_formatIcon = 'image';
                            this.m_resourceType = 'image';
                            var path = 'http://' + 's3.signage.me/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + this.m_selectedResource.getResourceType();
                            this.m_imagePath = path;
                            break;
                        }
                        case 'm4v':
                        case 'mp4':
                        case 'flv': {
                            this.m_formatIcon = 'video-camera';
                            this.m_resourceType = 'video';
                            var path = 'http://' + 's3.signage.me/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + this.m_selectedResource.getResourceType();
                            this.m_playResource = path;
                            // path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' +  BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                            console.log(path);
                            break;
                        }
                        case 'swf': {
                            this.m_formatIcon = 'bolt';
                            this.m_resourceType = 'swf';
                            break;
                        }
                    }
                }, (e) => console.error(e))
        )

    }

    _onUpdateResourceName(event) {
        var text = Lib.CleanProbCharacters(this.m_resourceName, 1);
        this.rp.setResourceRecord(this.m_selectedResource.getResourceId(), 'resource_name', text);
        this.rp.reduxCommit();
        // var elem = self.$el.find('[data-resource_id="' + this.m_selectedResource.getResourceId() + '"]');
        // elem.find('span').text(text);
    }

    ngOnInit() {
    }

    destroy() {
    }
}