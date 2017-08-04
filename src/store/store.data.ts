import {Map, List} from 'immutable';
import {UserModel} from "../models/UserModel";
import {AuthenticateFlags, SideProps} from "./actions/appdb.actions";
import {ISDK, CampaignBoardsModel} from "../store/imsdb.interfaces_auto";
import {appDb} from "../store/reducers/appdb.reducer";
import {msDatabase} from "../store/reducers/msdb.reducer";
import {storeFreeze} from "ngrx-store-freeze";
import {ActionReducer, combineReducers} from "@ngrx/store";
import {ApplicationState} from "./application.state";
import {compose} from "@ngrx/core";
import {MainAppShowStateEnum} from "../app/app-component";
import {LocationMarkModel} from "../models/LocationMarkModel";
import {StationModel} from "../models/StationModel";
import {FasterqLineModel} from "../models/fasterq-line-model";
import {FasterqQueueModel} from "../models/fasterq-queue-model";
import {FasterqAnalyticsModel} from "../models/fasterq-analytics";
import {LiveLogModel} from "../models/live-log-model";

const reducers = {msDatabase, appDb};
export const developmentReducer: ActionReducer<ApplicationState> = compose(storeFreeze, combineReducers)(reducers);
export const productionReducer: ActionReducer<ApplicationState> = combineReducers(reducers);

export enum StoryBoardListViewModeEnum {
    ListMode,
    StoryMode
}

export interface IMsDatabase {
    thread: { [key: number]: any };
    sdk: ISDK;
}

export interface IStation {
    id: number;
    localAddress: any;
    publicIp: string;
    localPort: number;
    name: string;
    watchDogConnection: number;
    status: string;
    startTime: string;
    runningTime: string;
    caching: boolean;
    totalMemory: number;
    peakMemory: number;
    appVersion: string;
    airVersion: string;
    os: string;
    socket: number;
    connection: number;
    connectionStatusChanged: boolean;
    lastUpdate: string;
    stationColor: string;
}

export interface IUiStateCampaign {
    campaignTimelineChannelSelected?: number;
    campaignTimelineBoardViewerSelected?: number;
    campaignCreateOrientation?: number,
    campaignCreateResolution?: string,
    campaignCreateName?: string,
    campaignSelected?: number;
    timelineSelected?: number;
    blockChannelSelected?: number;
    storyBoardItemSelected?: number;
    storyBoardOutputSelected?: number;
    storyBoardChannelSelected?: number;
    storyBoardListViewModeSelected?: number;
}

export interface IUiStateLocation {
    loadLocationMap?: boolean;
    locationMarkerSelected?: LocationMarkModel;
}

export interface IUiStateResources {
    resourceSelected?: number;
}

export interface IUiStateStations {
    stationSelected?: number;
}

export interface IUiStateFatserq {
    fasterqLineSelected?: number;
    fasterqQueueSelected?: number;
    fasterqNowServicing?: string;
}

export interface IUiStateScene {
    sceneSelected?: number;
    blockSelected?: number;
    fabric?: {
        scale?: number;
    }
}

export interface IUIMultiStationSelected {
    stations: Map<any,any>;
}

export interface IUiState {
    mainAppState?: MainAppShowStateEnum;
    previewMode?: number;
    uiSideProps?: number;
    appSized?: Map<any, any>;
    appSaved?: string;
    campaign?: IUiStateCampaign;
    locationMap?: IUiStateLocation;
    resources?: IUiStateResources;
    stations?: IUiStateStations;
    fasterq?: IUiStateFatserq;
    scene?: IUiStateScene;
    multiStationSelected?: IUIMultiStationSelected;
}

export interface IFasterQ {
    lines: List<FasterqLineModel>
    queues: List<FasterqQueueModel>
    analytics: List<FasterqAnalyticsModel>
    terminal: FasterqLineModel
}

export interface IContactForm {
    email: string;
    message: string;
}

export interface IAppDb {
    uiState: IUiState;
    totalStations: string;
    appStartTime: number;
    appBaseUrl: string;
    userModel: UserModel;
    liveLog: List<LiveLogModel>;
    stations: List<StationModel>;
    fasterq: IFasterQ;
    cloudServers: string;
    serversStatus: string;
    appAuthStatus: Map<string, AuthenticateFlags>;
    appBaseUrlUser: string;
    appBaseUrlCloud: string;
    appBaseUrlServices: string;
    contact: Map<string, any>; //IContactForm waiting for next version of immutablejs to support typed maps
}

export const INITIAL_STORE_DATA: IMsDatabase = {
    thread: null,
    sdk: null
}

export const INITIAL_APP_DB: IAppDb = {
    uiState: {
        mainAppState: MainAppShowStateEnum.INIT,
        previewMode: -1,
        uiSideProps: SideProps.none,
        appSized: Map({}),
        appSaved: '00:00:00',
        campaign: {
            campaignTimelineBoardViewerSelected: -1,
            campaignTimelineChannelSelected: -1,
            campaignSelected: -1,
            timelineSelected: -1,
            storyBoardListViewModeSelected: StoryBoardListViewModeEnum.ListMode,
            campaignCreateOrientation: -1,
            blockChannelSelected: -1,
            campaignCreateResolution: '',
            campaignCreateName: '',
            storyBoardItemSelected: -1,
            storyBoardOutputSelected: -1,
            storyBoardChannelSelected: -1
        },
        locationMap: {
            loadLocationMap: false,
            locationMarkerSelected: null
        },
        resources: {
            resourceSelected: -1
        },
        stations: {
            stationSelected: -1
        },
        fasterq: {
            fasterqLineSelected: -1,
            fasterqQueueSelected: -1,
            fasterqNowServicing: ''

        },
        scene: {
            sceneSelected: -1,
            blockSelected: -1,
            fabric: {
                scale: -1
            }
        },
        multiStationSelected: {
            stations: Map({})
        }

    },
    totalStations: '',
    appStartTime: -1,
    appBaseUrl: '',
    stations: List([]),
    liveLog: List([]),
    fasterq: {
        lines: List([]),
        queues: List([]),
        analytics: List([]),
        terminal: null

    },
    userModel: new UserModel({
        user: '',
        pass: '',
        authenticated: false,
        businessId: -1,
        rememberMe: false,
        twoFactorRequired: false,
        accountType: -1
    }),
    appAuthStatus: Map({authStatus: AuthenticateFlags.NONE}),
    cloudServers: '',
    serversStatus: '',
    appBaseUrlUser: '',
    appBaseUrlCloud: '',
    appBaseUrlServices: '',
    contact: Map({
        email: '',
        message: '',
        type: 0
    })
};