import {Injectable} from "@angular/core";
import {Action, Store} from "@ngrx/store";
import {ApplicationState} from "../store/application.state";
import {Observable} from "rxjs";
import {BranchStationsModelExt, CampaignsModelExt, PlayerDataModelExt} from "../store/model/msdb-models-extended";
import {
    BoardsModel,
    BoardTemplatesModel,
    BoardTemplateViewersModel, CampaignBoardsModel,
    CampaignTimelineBoardTemplatesModel,
    CampaignTimelineBoardViewerChanelsModel,
    CampaignTimelineChanelPlayersModel,
    CampaignTimelineChanelsModel,
    CampaignTimelineSchedulesModel,
    CampaignTimelineSequencesModel,
    CampaignTimelinesModel,
    PlayerDataModel,
    ResourcesModel
} from "../store/imsdb.interfaces_auto";
import {OrientationEnum} from "../app/campaigns/campaign-orientation";
import {List} from "immutable";
import * as _ from "lodash";
import {UserModel} from "../models/UserModel";
import X2JS from "x2js";
import {ISceneData} from "../app/blocks/block-service";
import {IScreenTemplateData} from "../interfaces/IScreenTemplate";
import {LocationMarkModel} from "../models/LocationMarkModel";
import {StationModel} from "../models/StationModel";
import {FasterqLineModel} from "../models/fasterq-line-model";
import {FasterqAnalyticsModel} from "../models/fasterq-analytics";
import {FasterqQueueModel} from "../models/fasterq-queue-model";


@Injectable()
export class YellowPepperService {

    parser;

    constructor(private store: Store<ApplicationState>) {
        this.parser = new X2JS({
            escapeMode: true,
            attributePrefix: "_",
            arrayAccessForm: "none",
            emptyNodeForm: "text",
            enableToStringFunc: true,
            arrayAccessFormPaths: [],
            skipEmptyTextNodesForObj: true
        });
    }

    public dispatch(action: Action) {
        this.store.dispatch(action);
    }

    public get ngrxStore(): Store<ApplicationState> {
        return this.store;
    }

    private reducePlayerDataModelsToSceneData(playerDataModels: List<PlayerDataModel>): Array<ISceneData> {
        return playerDataModels.reduce((result: Array<ISceneData>, playerDataModel: PlayerDataModelExt) => {
            var playerDataId = playerDataModel.getPlayerDataId();
            var xml = playerDataModel.getPlayerDataValue();
            var domPlayerData = $.parseXML(xml)
            var scene_id_pseudo_id = $(domPlayerData).find('Player').eq(0).attr('id')
            result.push({
                scene_id: playerDataId,
                scene_id_pseudo_id: scene_id_pseudo_id,
                scene_native_id: playerDataModel.getNativeId,
                block_pseudo_id: scene_id_pseudo_id,
                domPlayerData: domPlayerData,
                playerDataModel: playerDataModel,
                domPlayerDataXml: xml,
                domPlayerDataJson: this.parser.xml2js(xml),
            });
            return result;
        }, [])
    }

    listenMainAppState() {
        return this.store.select(store => store.appDb.uiState.mainAppState)
    }

    /**
     Listen to when a campaign timeline channel is selected
     **/
    listenChannelSelected(emitOnEmpty: boolean = false): Observable<CampaignTimelineChanelsModel> {
        var channelSelected$ = this.store.select(store => store.appDb.uiState.campaign.campaignTimelineChannelSelected);
        var channelsList$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanels);
        return channelSelected$.withLatestFrom(
            channelsList$,
            (channelId, channels) => {
                return channels.find((i_channel: CampaignTimelineChanelsModel) => {
                    return i_channel.getCampaignTimelineChanelId() == channelId;
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to campaign timeline channel block (player) is selected (via .withLatestFrom)
     **/
    listenBlockChannelSelected(emitOnEmpty: boolean = false): Observable<CampaignTimelineChanelPlayersModel> {
        var blockSelected$ = this.store.select(store => store.appDb.uiState.campaign.blockChannelSelected);
        var channelBlocksList$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players);
        return blockSelected$.withLatestFrom(
            channelBlocksList$,
            (blockId, blocks) => {
                return blocks.find((i_block: CampaignTimelineChanelPlayersModel) => {
                    return i_block.getCampaignTimelineChanelPlayerId() == blockId
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to campaign timeline channel block (player) is selected >>>OR<<< its value has changed in store slice (via .combineLatest)
     **/
    listenBlockChannelSelectedOrChanged(emitOnEmpty: boolean = false): Observable<CampaignTimelineChanelPlayersModel> {
        var blockSelected$ = this.store.select(store => store.appDb.uiState.campaign.blockChannelSelected);
        var channelBlocksList$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players);
        return blockSelected$.combineLatest(
            channelBlocksList$,
            (blockId, blocks) => {
                return blocks.find((i_block: CampaignTimelineChanelPlayersModel) => {
                    return i_block.getCampaignTimelineChanelPlayerId() == blockId
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to when a timeline is selected via the store state uiState.campaign.timelineSelected
     **/
    listenTimelineSelected(emitOnEmpty: boolean = false): Observable<CampaignTimelinesModel> {
        var timelineSelected$ = this.store.select(store => store.appDb.uiState.campaign.timelineSelected);
        var timelineList$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timelines);
        return timelineSelected$
            .withLatestFrom(
                timelineList$,
                (timelineId, timelines) => {
                    return timelines.find((i_timeline: CampaignTimelinesModel) => {
                        return i_timeline.getCampaignTimelineId() == timelineId;
                    });
                }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }


    /**
     Listen to changes in selected scene
     **/
    listenSelectedSceneChanged(emitOnEmpty: boolean = false): Observable<PlayerDataModelExt> {
        var sceneSelected = this.store.select(store => store.appDb.uiState.scene.sceneSelected);
        var playerDataList$ = this.store.select(store => store.msDatabase.sdk.table_player_data);
        return sceneSelected.combineLatest(
            playerDataList$,
            (sceneId, player_data) => {
                return player_data.find((i_player: PlayerDataModelExt) => {
                    return i_player.getPlayerDataId() == sceneId
                });
            }).distinct()
            .mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     listen UI campaign > timeline > board_viewer selected and return back the associated channel with that board id
     **/
    listenCampaignTimelineBoardViewerSelected(emitOnEmpty: boolean = false): Observable<CampaignTimelineBoardViewerChanelsModel> {
        var boardSelected$ = this.store.select(store => store.appDb.uiState.campaign.campaignTimelineBoardViewerSelected);
        var $viewerChannels$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_viewer_chanels);
        return boardSelected$
            .withLatestFrom(
                $viewerChannels$,
                (boardId, viewerChannels) => {
                    if (emitOnEmpty && (_.isUndefined(boardId) || boardId == -1)) {
                        return null;
                    }
                    return viewerChannels.find((i_viewerChannel: CampaignTimelineBoardViewerChanelsModel) => {
                        return i_viewerChannel.getBoardTemplateViewerId() == boardId;
                    });
                }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    listenLocationMapLoad(): Observable<any> {
        return this.store.select(store => store.appDb.uiState.locationMap.loadLocationMap);
    }

    listenAppSizeChanged(): Observable<any> {
        return this.store.select(store => store.appDb.uiState.appSized);
    }

    listenLocationMarkerSelected(): Observable<LocationMarkModel> {
        return this.store.select(store => store.appDb.uiState.locationMap.locationMarkerSelected)
            .filter(v => !_.isNull(v));
    }


    listenTimelineDurationChanged(emitOnEmpty: boolean = false): Observable<number> {
        var $timelinesList$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timelines);
        return this.listenCampaignSelected()
            .combineLatest($timelinesList$, (campaign, timelines) => {
                return campaign
            }).mergeMap(campaign => {
                return this.listenCampaignTimelines(campaign.getCampaignId())
            }).mergeMap((i_timelines: List<CampaignTimelinesModel>) => {
                var total = 0;
                i_timelines.forEach((v) => {
                    var t = parseInt(v.getTimelineDuration());
                    total = total + t;
                })
                return Observable.of(total);
            })
    }

    listenUserModel(): Observable<UserModel> {
        return this.store.select(store => store.appDb.userModel)
            .filter((userModel) => !_.isUndefined(userModel.resellerId) )
    }

    /**
     listen to all timeline for specified campaign id
     **/
    listenCampaignTimelines(i_campaign_id: number): Observable<List<CampaignTimelinesModel>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timelines)
            .map((campaignTimelinesModels: List<CampaignTimelinesModel>) => {
                return campaignTimelinesModels.filter((campaignTimelinesModel: CampaignTimelinesModel) => {
                    return campaignTimelinesModel.getCampaignId() == i_campaign_id;
                });
            })
    }

    listenFasterqLineSelected(): Observable<FasterqLineModel> {
        var selected$ = this.store.select(store => store.appDb.uiState.fasterq.fasterqLineSelected);
        var lines$ = this.store.select(store => store.appDb.fasterq.lines);
        return selected$
            .combineLatest(lines$, (lineId, lines: List<FasterqLineModel>) => {
                return lines.find((line: FasterqLineModel) => {
                    return line.lineId == lineId;
                });
            }).filter(value => value != null);
    }

    listenFasterqQueueModelSelected(): Observable<FasterqQueueModel> {
        var selected$ = this.store.select(store => store.appDb.uiState.fasterq.fasterqQueueSelected);
        var queues$ = this.store.select(store => store.appDb.fasterq.queues);
        return selected$
            .combineLatest(queues$, (serviceId, queues: List<FasterqQueueModel>) => {
                return queues.find((queue: FasterqQueueModel) => {
                    return queue.serviceId == serviceId;
                });
            }).filter(value => value != null);
    }

    listenFasterqQueueSelected(): Observable<any> {
        return this.store.select(store => store.appDb.uiState.fasterq.fasterqQueueSelected);
    }

    listenFasterqQueueLastServicedPolled(): Observable<any> {
        return this.store.select(store => store.appDb.uiState.fasterq.fasterqNowServicing);
    }

    listenGlobalBoardSelectedChanged(emitOnEmpty: boolean = false): Observable<BoardTemplateViewersModel> {
        var globalBoardTemplateViewerSelected$ = this.ngrxStore.select(store => store.appDb.uiState.campaign.campaignTimelineBoardViewerSelected);
        var tableBoardTemplatesList$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_board_template_viewers);
        return globalBoardTemplateViewerSelected$
            .combineLatest(tableBoardTemplatesList$, (globalBoardTemplateViewerId: number, boards: List<BoardTemplateViewersModel>) => {
                return boards.find((i_board: BoardTemplateViewersModel) => {
                    return i_board.getBoardTemplateViewerId() == globalBoardTemplateViewerId;
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to changes in selected scene
     **/
    listenSceneOrBlockSelected(emitOnEmpty: boolean = false): Observable<ISceneData> {
        var sceneSelected$ = this.store.select(store => store.appDb.uiState.scene.sceneSelected);
        var blockSelected$ = this.store.select(store => store.appDb.uiState.scene.blockSelected);
        return blockSelected$.combineLatest(sceneSelected$, (blockId, sceneId) => {
            return {blockId, sceneId}
        }).filter((ids) => {
            if (!emitOnEmpty) return true; // no filter requested
            return ids && ids.blockId != -1
        }).mergeMap(ids => {
            return this.getScene(ids.sceneId)
                .map((playerDataModel: PlayerDataModelExt) => {
                    var domPlayerData = $.parseXML(playerDataModel.getPlayerDataValue())
                    var selectedSnippet: any = $(domPlayerData).find(`[id="${ids.blockId}"]`)[0];
                    var mimeType = $(domPlayerData).find('Player').attr('mimeType');
                    var xml = (new XMLSerializer()).serializeToString(selectedSnippet);
                    selectedSnippet = $.parseXML(xml)
                    var sceneData: ISceneData = {
                        scene_id: ids.sceneId,
                        scene_native_id: playerDataModel.getNativeId,
                        scene_id_pseudo_id: null,
                        block_pseudo_id: ids.blockId,
                        playerDataModel: playerDataModel,
                        domPlayerData: selectedSnippet,
                        domPlayerDataXml: xml,
                        domPlayerDataJson: this.parser.xml2js(xml),
                        mimeType: mimeType
                    }
                    return sceneData;
                });
        }).distinct()
            .mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to changes in scene fabric scale changes
     **/
    listenFabricSceneScaled(): Observable<number> {
        return this.store.select(store => store.appDb.uiState.scene.fabric.scale).map(v => {
            return v;
        })
    }

    /**
     Get player_data via its scene id
     **/
    listenScene(scene_id): Observable<PlayerDataModel> {
        return this.store.select(store => store.msDatabase.sdk.table_player_data)
            .map((playerDataModels: List<PlayerDataModel>) => {
                return playerDataModels.find((playerDataModel: PlayerDataModel) => {
                    return scene_id == playerDataModel.getPlayerDataId();
                })
            })
    }

    /**
     Listen to changes in selected scene
     **/
    listenSceneOrBlockSelectedChanged(): Observable<ISceneData> {
        var sceneSelected$ = this.store.select(store => store.appDb.uiState.scene.sceneSelected);
        var blockSelected$ = this.store.select(store => store.appDb.uiState.scene.blockSelected);
        var player_data$ = this.store.select(store => store.msDatabase.sdk.table_player_data);
        return blockSelected$.combineLatest(sceneSelected$, player_data$, (blockId, sceneId) => {
            return {blockId, sceneId}
        }).filter((ids) => {
            return ids && ids.sceneId != -1 && ids.blockId != -1
        }).mergeMap(ids => {

            return this.listenScene(ids.sceneId)
                .mergeMap((playerDataModel: PlayerDataModelExt) => {
                    var domPlayerData = $.parseXML(playerDataModel.getPlayerDataValue())
                    var selectedSnippet: any = $(domPlayerData).find(`[id="${ids.blockId}"]`)[0];
                    var sceneData: ISceneData;

                    /** if block was removed notify of empty **/
                    if (_.isUndefined(selectedSnippet))
                        return Observable.empty()

                    var mimeType = $(domPlayerData).find('Player').attr('mimeType');
                    var xml = (new XMLSerializer()).serializeToString(selectedSnippet);
                    selectedSnippet = $.parseXML(xml)
                    sceneData = {
                        scene_id: ids.sceneId,
                        scene_native_id: playerDataModel.getNativeId,
                        scene_id_pseudo_id: null,
                        block_pseudo_id: ids.blockId,
                        playerDataModel: playerDataModel,
                        domPlayerData: selectedSnippet,
                        domPlayerDataXml: xml,
                        domPlayerDataJson: this.parser.xml2js(xml),
                        mimeType: mimeType
                    }
                    return Observable.of(sceneData);
                });
        }).distinct()
        // .mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    listenSceneSelected(emitOnEmpty: boolean = false): Observable<ISceneData> {
        var sceneSelected$ = this.store.select(store => store.appDb.uiState.scene.sceneSelected);
        return sceneSelected$
            .filter(i_scene_id => {
                if (!emitOnEmpty) return true; // no filter requested
                return i_scene_id != -1;
            })
            .withLatestFrom(
                this.listenScenes(),
                (sceneId, scenes: Array<ISceneData>) => {
                    return scenes.find((scene: ISceneData) => {
                        return scene.scene_id == sceneId;
                    });
                }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to ONLY when a campaign is selected via the store state uiState.campaign.campaignSelected and grab latest CampaignModel
     **/
    listenCampaignSelected(emitOnEmpty: boolean = false): Observable<CampaignsModelExt> {
        var campaignSelected$ = this.store.select(store => store.appDb.uiState.campaign.campaignSelected);
        var campaignsList$ = this.store.select(store => store.msDatabase.sdk.table_campaigns);
        return campaignSelected$
            .withLatestFrom(
                campaignsList$,
                (campaignId, campaigns) => {
                    return campaigns.find((i_campaign: CampaignsModelExt) => {
                        return i_campaign.getCampaignId() == campaignId;
                    });
                }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Listen to when a channel that is selected changed value
     **/
    listenChannelValueChanged(emitOnEmpty: boolean = false): Observable<CampaignTimelineChanelsModel> {
        var channelIdSelected$ = this.ngrxStore.select(store => store.appDb.uiState.campaign.campaignTimelineChannelSelected)
        var channels$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanels);
        return channelIdSelected$
            .combineLatest(channels$, (channelId: number, channels: List<CampaignTimelineChanelsModel>) => {
                return channels.find((i_channel: CampaignTimelineChanelsModel) => {
                    return i_channel.getCampaignTimelineChanelId() == channelId;
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    listenResourceSelected(emitOnEmpty: boolean = false): Observable<ResourcesModel> {
        var selected$ = this.store.select(store => store.appDb.uiState.resources.resourceSelected);
        var resources$ = this.store.select(store => store.msDatabase.sdk.table_resources);
        return selected$
            .withLatestFrom(resources$, (resourceId, resources: List<ResourcesModel>) => {
                return resources.find((resource: ResourcesModel) => {
                    return resource.getResourceId() == resourceId;
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    listenStationSelected(): Observable<StationModel> {
        var selected$ = this.store.select(store => store.appDb.uiState.stations.stationSelected);
        var stations$ = this.store.select(store => store.appDb.stations);
        return selected$
            .combineLatest(stations$, (stationId, stations: List<StationModel>) => {
                if (_.isUndefined(stations))
                    return null;
                return stations.find((station: StationModel) => {
                    return station.id == stationId;
                });
            }).filter(value => value != null);
    }

    listenStationBranchSelected(): Observable<StationModel> {
        var selected$ = this.store.select(store => store.appDb.uiState.stations.stationSelected);
        var stations$ = this.store.select(store => store.appDb.stations);
        var branches$ = this.store.select(store => store.msDatabase.sdk.table_branch_stations);
        return selected$
            .combineLatest(stations$, branches$, (stationId, stations: List<StationModel>, branches: List<BranchStationsModelExt>) => {
                if (_.isUndefined(stations))
                    return null;
                return stations.find((station: StationModel) => {
                    return station.id == stationId;
                });
            }).filter(value => value != null);
    }

    listenResources(): Observable<List<ResourcesModel>> {
        return this.store.select(store => store.msDatabase.sdk.table_resources)
            .map((resourceModels: List<ResourcesModel>) => {
                return resourceModels.filter((i_resourceModel: ResourcesModel) => {
                    return i_resourceModel.getChangeType() != 3
                })
            })
    }

    listenStations(): Observable<List<StationModel>> {
        return this.store.select(store => store.appDb.stations);
    }

    /**
     Listen to when a campaign that is selected changed value
     **/
    listenCampaignValueChanged(emitOnEmpty: boolean = false): Observable<CampaignsModelExt> {
        var campaignIdSelected$ = this.ngrxStore.select(store => store.appDb.uiState.campaign.campaignSelected)
        var campaigns$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_campaigns);
        return campaignIdSelected$
            .combineLatest(campaigns$, (campaignId: number, campaigns: List<CampaignsModelExt>) => {
                return campaigns.find((i_campaign: CampaignsModelExt) => {
                    return i_campaign.getCampaignId() == campaignId;
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }


    /**
     Listen to when a scheduler that is selected changed value
     **/
    listenSchedulerValueChanged(emitOnEmpty: boolean = false): Observable<CampaignTimelineSchedulesModel> {
        var campaignTimelineIdSelected$ = this.ngrxStore.select(store => store.appDb.uiState.campaign.timelineSelected)
        var schedules$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_schedules);
        return campaignTimelineIdSelected$
            .combineLatest(schedules$, (campaignSchedarId: number, schedules: List<CampaignTimelineSchedulesModel>) => {
                return schedules.find((i_schedules: CampaignTimelineSchedulesModel) => {
                    return i_schedules.getCampaignTimelineId() == campaignSchedarId;
                });
            }).mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
    }

    /**
     Get all Scenes and update on any scene change
     **/
    listenScenes(): Observable<Array<ISceneData>> {
        return this.store.select(store => store.msDatabase.sdk.table_player_data)
            .map((playerDataModels: List<PlayerDataModel>) => {
                return this.reducePlayerDataModelsToSceneData(playerDataModels)
            });
    }

    listenFasterqLines(): Observable<List<FasterqLineModel>> {
        return this.store.select(store => store.appDb.fasterq.lines)
    }

    listenFasterqQueues(): Observable<List<FasterqQueueModel>> {
        return this.store.select(store => store.appDb.fasterq.queues)
    }

    listenFasterqAnalytics(): Observable<List<FasterqAnalyticsModel>> {
        return this.store.select(store => store.appDb.fasterq.analytics)
    }

    /**
     Returns the record for a station id
     **/
    listenStationRecord(i_native_station_id): Observable<BranchStationsModelExt> {
        return this.ngrxStore.select(store => store.msDatabase.sdk.table_branch_stations)
            .map((i_branchStationsModels: List<BranchStationsModelExt>) => {
                return i_branchStationsModels.find((i_branchStationsModel) => {
                    return i_branchStationsModel.getNativeId == i_native_station_id;
                })
            });
    }

    /**
     get time line total duration by channel
     **/
    getTimelineTotalDurationByChannel(i_campaign_timeline_id): Observable<number> {
        var table_campaign_timeline_chanels$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanels)
        var table_campaign_timeline_chanel_players$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
        return Observable.combineLatest(table_campaign_timeline_chanels$, table_campaign_timeline_chanel_players$,
            (table_campaign_timeline_chanels: List<CampaignTimelineChanelsModel>,
             table_campaign_timeline_chanel_players: List<CampaignTimelineChanelPlayersModel>) => {
                var longestChannelDuration = 0;
                // loop over channels of timeline and sum up lengths
                table_campaign_timeline_chanels.forEach(i_campaignTimelineChanelsModel => {
                    if (i_campaignTimelineChanelsModel.getCampaignTimelineId() == i_campaign_timeline_id) {
                        // console.log('found channel ' + i_campaignTimelineChanelsModel.getChanelName());
                        var timelineDuration = 0;
                        table_campaign_timeline_chanel_players.forEach(i_campaignTimelineChanelPlayersModel => {
                            if (i_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelId() == i_campaignTimelineChanelsModel.getCampaignTimelineChanelId()) {
                                timelineDuration += parseFloat(i_campaignTimelineChanelPlayersModel.getPlayerDuration());
                                if (timelineDuration > longestChannelDuration)
                                    longestChannelDuration = timelineDuration;
                            }
                        })
                        // console.log('total ' + timelineDuration + ' longest so far ' + longestChannelDuration);
                    }
                })
                // console.log('winner ' + longestChannelDuration);
                return longestChannelDuration;
            })
    }

    getStationCampaignID(i_native_station_id): Observable<number> {
        var table_branch_stations$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_branch_stations)
        var table_campaign_boards$ = this.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_boards)
        return table_branch_stations$
            .combineLatest(
                table_campaign_boards$, (branchStationsModels: List<BranchStationsModelExt>, campaignBoardsModels: List<CampaignBoardsModel>) => {
                    return {branchStationsModels, campaignBoardsModels}
                })
            .map((value) => {
                var branchStationsModel: BranchStationsModelExt = value.branchStationsModels.find((i_branchStationsModel: BranchStationsModelExt) => {
                    return i_branchStationsModel.getNativeId == i_native_station_id;
                })
                if (!branchStationsModel)
                    return Observable.empty()
                var campaignBoardsModel = value.campaignBoardsModels.find((i_campaignBoardsModel: CampaignBoardsModel) => {
                    return i_campaignBoardsModel.getCampaignBoardId() == branchStationsModel.getCampaignBoardId();
                })
                return campaignBoardsModel.getCampaignId();
            }).take(1);
    }

    getPreviewMode() {
        return this.store.select(store => store.appDb.uiState.previewMode).take(1)
    }

    /**
     Get all Scenes in current state and return array of player_data_id domPlayerData : ISceneData
     **/
    getScenes(): Observable<Array<ISceneData>> {
        return this.store.select(store => store.msDatabase.sdk.table_player_data)
            .map((playerDataModels: List<PlayerDataModel>) => {
                return this.reducePlayerDataModelsToSceneData(playerDataModels)
            }).take(1);
    }

    getCampaigns(): Observable<List<CampaignsModelExt>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaigns)
            .take(1);
    }

    /**
     Returns all scenes
     **/
    getSceneNames(): Observable<Array<any>> {
        return this.store.select(store => store.msDatabase.sdk.table_player_data)
            .map((i_layerDataModels: List<PlayerDataModel>) => {
                return i_layerDataModels.reduce((result, i_layerDataModel) => {
                    var domPlayerData = $.parseXML(i_layerDataModel.getPlayerDataValue())
                    var player_data_id = i_layerDataModel.getPlayerDataId();
                    var scene = {
                        id: player_data_id,
                        label: (jXML(domPlayerData).find('Player').attr('label')),
                        mimeType: jXML(domPlayerData).find('Player').attr('mimeType')
                    };
                    result.push(scene)
                    return result;
                }, [])
            }).take(1);
    }

    /**
     Get a timeline's duration which is set as the total sum of all blocks within the longest running channel
     **/
    getTimelineTotalDuration(i_campaign_timeline_id): Observable<string> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timelines)
            .map((campaignTimelinesModels: List<CampaignTimelinesModel>) => {
                return campaignTimelinesModels.reduce((result: string, campaignTimelineModel) => {
                    if (campaignTimelineModel.getCampaignTimelineId() == i_campaign_timeline_id)
                        result = campaignTimelineModel.getTimelineDuration();
                    return result;
                }, '')
            }).take(1);
    }

    /**
     Get logged in user info
     **/
    getUserModel(): Observable<UserModel> {
        return this.store.select(store => store.appDb.userModel)
            .take(1)
    }

    isBrandingDisabled(): Observable<boolean> {
        return this.store.select(store => store.appDb.userModel)
            .filter(i_user => {
                return i_user.getAccountType() != -1;
            })
            .map((i_user: UserModel) => {
                var res = i_user.resellerId == 1 || i_user.resellerWhiteLabel.WhiteLabel.attr.enabled == "0"
                return res;
            })
    }

    /**
     Get all timeline s for specified campaign id
     **/
    getNewCampaignParmas(): Observable<{}> {
        return this.store.select(store => store.appDb.uiState.campaign)
            .take(1)
    }

    /**
     Use a viewer_id to reverse enumerate over the mapping of viewers to channels via:
     campaign_timeline_viewer_chanels -> table_campaign_timeline_chanels
     so we can find the channel assigned to the viewer_id provided.
     **/
    getChannelFromCampaignTimelineBoardViewer(i_campaign_timeline_board_viewer_id): Observable<CampaignTimelineChanelsModel> {
        return this.ngrxStore.select(store => store.msDatabase.sdk.table_campaign_timeline_board_viewer_chanels)
            .map((i_campaignTimelineBoardViewerChanels: List<CampaignTimelineBoardViewerChanelsModel>) => {
                return i_campaignTimelineBoardViewerChanels.find((i_campaignTimelineBoardViewerChanel: CampaignTimelineBoardViewerChanelsModel) => {
                    return i_campaignTimelineBoardViewerChanel.getCampaignTimelineBoardViewerChanelId() == i_campaign_timeline_board_viewer_id;
                })
            }).concatMap((v: CampaignTimelineBoardViewerChanelsModel) => {
                return this.getChannelOfTimeline(v.getCampaignTimelineChanelId())
            }).take(1);
    }

    /**
     Get all the campaign > timeline > channel of a timeline
     **/
    getChannelOfTimeline(i_campaign_timeline_chanel_id): Observable<CampaignTimelineChanelsModel> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanels)
            .map((campaignTimelineChanels: List<CampaignTimelineChanelsModel>) => {
                return campaignTimelineChanels.find((campaignTimelineChanelsModel: CampaignTimelineChanelsModel) => {
                    return campaignTimelineChanelsModel.getCampaignTimelineChanelId() == i_campaign_timeline_chanel_id
                })
            }).take(1);
    }

    /**
     Get all the block IDs of a particular channel.
     **/
    getChannelBlocks(i_campaign_timeline_chanel_id): Observable<Array<number>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
            .map((campaignTimelineChanelPlayersModels: List<CampaignTimelineChanelPlayersModel>) => {
                return campaignTimelineChanelPlayersModels.reduce((result: Array<number>, campaignTimelineChanelsModel) => {
                    if (campaignTimelineChanelsModel.getCampaignTimelineChanelId() == i_campaign_timeline_chanel_id)
                        result.push(campaignTimelineChanelsModel.getCampaignTimelineChanelPlayerId());
                    return result;
                }, [])
            }).take(1);
    }

    /**
     Get Scene player data as dom
     **/
    getScenePlayerdataDom(i_scene_id): Observable<string> {
        return this.sterilizePseudoId(i_scene_id)
            .mergeMap(scene_id => {
                return this.getScene(scene_id)
                    .map((playerDataModel: PlayerDataModel) => {
                        return playerDataModel.getPlayerDataValue();
                    })
            }).take(1);
    }

    /**
     Get player_data via its scene id
     **/
    getScene(scene_id): Observable<PlayerDataModelExt> {
        return this.store.select(store => store.msDatabase.sdk.table_player_data)
            .map((playerDataModels: List<PlayerDataModel>) => {
                return playerDataModels.find((playerDataModel: PlayerDataModel) => {
                    return scene_id == playerDataModel.getPlayerDataId();
                })
            }).take(1);
    }

    /**
     Sterilize pseudo id to scene id always returns scene_id as an integer rather pseudo id
     @method sterilizePseudoId
     @param {Number} i_id
     @return {Number} i_id
     **/
    sterilizePseudoId(i_id): Observable<number> {
        var id = parseInt(i_id);
        if (_.isNaN(id))
            return this.getSceneIdFromPseudoId(i_id);
        return Observable.of(i_id);
    }

    /**
     Translate an injected id to a table_player_data scene id
     @method createPseudoSceneID
     @param {Number} getSceneIdFromPseudoId
     @return {Number} scene id
     **/
    getSceneIdFromPseudoId(i_pseudo_id): Observable<number> {
        return this.getScenes()
            .mergeMap((i_sceneList: Array<ISceneData>) => {
                return Observable.from(i_sceneList)
            }).filter((i_scene: ISceneData) => {
                return i_pseudo_id == jXML(i_scene.domPlayerData).find('Player').eq(0).attr('id');
            }).map((i_scene: ISceneData) => {
                return i_scene.scene_id;
            }).take(1);
    }


    /**
     Get all the model of a particular channel.
     Push them into an array so they are properly sorted by player offset time.
     **/
    getChannelBlockModels(i_campaign_timeline_chanel_id): Observable<List<CampaignTimelineChanelPlayersModel>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
            .map((campaignTimelineChanelPlayersModels: List<CampaignTimelineChanelPlayersModel>) => {
                return campaignTimelineChanelPlayersModels.filter(campaignTimelineChanelsModel => {
                    return campaignTimelineChanelsModel.getCampaignTimelineChanelId() == i_campaign_timeline_chanel_id;
                })
            }).take(1);
    }

    /**
     get a scene block playerdata
     **/
    // getScenBlockRecord(i_scene_id, i_player_data_id) {
    //     var self = this;
    //     i_scene_id = pepper.sterilizePseudoId(i_scene_id);
    //     self.m_msdb.table_player_data().openForEdit(i_scene_id);
    //     var recPlayerData = self.m_msdb.table_player_data().getRec(i_scene_id);
    //     var player_data = recPlayerData['player_data_value'];
    //     var domPlayerData = $.parseXML(player_data)
    //     var foundSnippet = $(domPlayerData).find('[id="' + i_player_data_id + '"]');
    //     return foundSnippet[0];
    // }

    /**
     Get a player_id record from sdk by player_id primary key.
     **/
    getChannelBlockRecord(i_player_id): Observable<CampaignTimelineChanelPlayersModel> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
            .map((i_campaignTimelineChanelPlayersModels: List<CampaignTimelineChanelPlayersModel>) => {
                return i_campaignTimelineChanelPlayersModels
                    .find((i_campaignTimelineChanelPlayersModel) => {
                        return i_campaignTimelineChanelPlayersModel.getCampaignTimelineChanelPlayerId() == i_player_id
                    })
            }).take(1)
    }

    /**
     Get a resource record via its resource_id.
     **/
    getResourceRecord(i_resource_id): Observable<ResourcesModel> {
        return this.store.select(store => store.msDatabase.sdk.table_resources)
            .map((i_resourcesModels: List<ResourcesModel>) => {
                return i_resourcesModels
                    .find((i_resourcesModel) => {
                        return i_resourcesModel.getResourceId() == i_resource_id
                    })
            }).take(1)
    }

    // /**
    //  Get all Scenes and convert them to dom objects returning a hash of object literals
    //  @method getScenes
    //  @return {Object} all scenes as objects
    //  **/
    // getSceneMime(i_sceneID): Observable<any> {
    //     return this.store.select(store => store.msDatabase.sdk.table_player_data)
    //         .map((playerDataModels: List<PlayerDataModel>) => {
    //             return playerDataModels.reduce((result: Array<any>, playerDataModel) => {
    //                 var recPlayerData = playerDataModel.getPlayerDataValue();
    //                 var domPlayerData = $.parseXML(recPlayerData)
    //                 result.push(domPlayerData);
    //                 return result;
    //             }, [])
    //         }).take(1);
    // }
    //
    // /**
    //  Returns all scenes
    //  @method getSceneMime
    //  @param {Number} i_sceneID
    //  @return {Object} scene names
    //  **/
    // getSceneMime(i_sceneID) {
    //
    //     var mimeType = '';
    //     $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
    //         var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
    //         var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
    //         var id = $(domPlayerData).find('Player').attr('id');
    //         if (id == i_sceneID)
    //             mimeType = $(domPlayerData).find('Player').attr('mimeType');
    //     });
    //     return mimeType;
    // }

    /**
     Get all the campaign > timeline > channels ids of a timeline
     **/
    getChannelsOfTimeline(i_campaign_timeline_id): Observable<any> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanels)
            .map((campaignTimelineChanels: List<CampaignTimelineChanelsModel>) => {
                return campaignTimelineChanels.reduce((result: Array<number>, campaignTimelineChanelsModel) => {
                    if (campaignTimelineChanelsModel.getCampaignTimelineId() == i_campaign_timeline_id)
                        result.push(campaignTimelineChanelsModel.getCampaignTimelineChanelId());
                    return result;
                }, [])
            }).take(1);
    }

    /**
     Get all timeline s for specified campaign id
     **/
    getCampaignTimelines(i_campaign_id: number): Observable<List<CampaignTimelinesModel>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timelines)
            .map((campaignTimelinesModels: List<CampaignTimelinesModel>) => {
                return campaignTimelinesModels.filter((campaignTimelinesModel: CampaignTimelinesModel) => {
                    return campaignTimelinesModel.getCampaignId() == i_campaign_id;
                });
            }).take(1);
    }

    /**
     Get a block's (a.k.a player) total hours / minutes / seconds playback length on the timeline_channel.
     **/
    getBlockTimelineChannelBlockLength(i_campaign_timeline_chanel_player_id): Observable<number> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_chanel_players)
            .map((i_players: List<CampaignTimelineChanelPlayersModel>) => {
                return i_players.reduce((result: number, i_player) => {
                    if (i_player.getCampaignTimelineChanelPlayerId() == i_campaign_timeline_chanel_player_id)
                        result = i_player.getPlayerDuration();
                    return result;
                }, 0)
            }).take(1);
    }

    /**
     Get the total duration in seconds of the channel
     @method getTotalDurationChannel
     **/
    getTotalDurationChannel(i_selected_campaign_timeline_chanel_id) {
        return this.getChannelBlocks(i_selected_campaign_timeline_chanel_id)
            .concatMap((i_blockIds) => {
                return Observable.from(i_blockIds);
            }).flatMap((i_blockId) => {
                return this.getBlockTimelineChannelBlockLength(i_blockId)
            }).reduce((acc: number, x: number) => {
                return acc + Number(x);
            }, 0).take(1);
    }

    /**
     Get the sequence index of a timeline in the specified campaign
     **/
    getCampaignTimelineSequencerIndex(i_campaign_timeline_id): Observable<number> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_sequences)
            .map((campaignTimelineSequencesModels: List<CampaignTimelineSequencesModel>) => {
                var found: CampaignTimelineSequencesModel = campaignTimelineSequencesModels.find((campaignTimelineSequencesModel: CampaignTimelineSequencesModel) => {
                    return campaignTimelineSequencesModel.getCampaignTimelineId() == i_campaign_timeline_id
                });
                return found.getSequenceIndex();
            }).take(1);
    }

    /**
     Get the sequence index of a timeline in the specified campaign
     **/
    getCampaignsSchedule(i_campaign_timeline_id): Observable<CampaignTimelineSchedulesModel> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_schedules)
            .map((campaignTimelineSchedulesModel: List<CampaignTimelineSchedulesModel>) => {
                return campaignTimelineSchedulesModel.find((campaignTimelineSchedulesModel: CampaignTimelineSchedulesModel) => {
                    return campaignTimelineSchedulesModel.getCampaignTimelineId() == i_campaign_timeline_id
                });
            }).take(1);
    }

    /**
     Get all the global board template ids of a timeline
     * **/
    getGlobalTemplateIdOfTimeline(i_campaign_timeline_id): Observable<Array<number>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_templates)
            .map((campaignTimelineBoardTemplatesModels: List<CampaignTimelineBoardTemplatesModel>) => {
                return campaignTimelineBoardTemplatesModels.reduce((result: Array<number>, campaignTimelineBoardTemplatesModel) => {
                    if (campaignTimelineBoardTemplatesModel.getCampaignTimelineId() == i_campaign_timeline_id)
                        result.push(campaignTimelineBoardTemplatesModel.getBoardTemplateId());
                    return result;
                }, [])
            }).take(1);
    }

    /**
     Get all the campaign > timeline > board > template ids of a timeline
     **/
    getTemplatesOfTimeline(i_campaign_timeline_id): Observable<Array<number>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_templates)
            .map((campaignTimelineBoardTemplatesModels: List<CampaignTimelineBoardTemplatesModel>) => {
                return campaignTimelineBoardTemplatesModels.reduce((result: Array<number>, campaignTimelineBoardTemplatesModel) => {
                    if (campaignTimelineBoardTemplatesModel.getCampaignTimelineId() == i_campaign_timeline_id)
                        result.push(campaignTimelineBoardTemplatesModel.getCampaignTimelineBoardTemplateId());
                    return result;
                }, [])
            }).take(1);
    }

    /**
     *
     * Get a channel associated with the selected viewer
     */
    getChannelFromViewer(i_selectedTimeline_id, i_campaign_timeline_board_viewer_id): Observable<{}> {
        return this.getChannelsOfTimeline(i_selectedTimeline_id).switchMap((timeline_channel_ids: Array<number>) => {
            return Observable.from(timeline_channel_ids).concatMap((channel: number) => {
                return this.getAssignedViewerIdFromChannelId(channel)
                    .map(viewer_id => {
                        if (viewer_id == i_campaign_timeline_board_viewer_id) {
                            return {viewer_id, channel};
                        } else {
                            return null;
                        }
                    }).skipWhile(value => value == null)
            })
        }).take(1);
    }

    /**
     Get the assigned viewer id to the specified channel
     **/
    getAssignedViewerIdFromChannelId(i_campaign_timeline_channel_id): Observable<number> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_viewer_chanels)
            .map((campaignTimelineBoardViewerChanelsModel: List<CampaignTimelineBoardViewerChanelsModel>) => {
                return campaignTimelineBoardViewerChanelsModel.reduce((result: number, campaignTimelineBoardViewerChanelsModel) => {
                    if (campaignTimelineBoardViewerChanelsModel.getCampaignTimelineChanelId() == i_campaign_timeline_channel_id)
                        result = (campaignTimelineBoardViewerChanelsModel.getBoardTemplateViewerId());
                    return result;
                }, -1)
            }).take(1);
    }

    /**
     Get a timeline model from timeline id
     **/
    getTimeline(i_campaign_timeline_id): Observable<CampaignTimelinesModel> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timelines)
            .map((campaignTimelinesModels: List<CampaignTimelinesModel>) => {
                return campaignTimelinesModels.find((campaignTimelineModel) => {
                    return campaignTimelineModel.getCampaignTimelineId() == i_campaign_timeline_id
                })
            }).take(1);
    }

    /**
     Build screenProps json object with all viewers and all of their respective attributes for the given timeline_id / template_id
     **/
    getTemplateViewersScreenProps(i_campaign_timeline_id, i_campaign_timeline_board_template_id, timelineName = ''): Observable<IScreenTemplateData> {

        var table_campaign_timeline_board_templates$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_templates);
        var table_campaign_timeline_board_viewer_chanels$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_viewer_chanels);
        var table_board_template_viewers$ = this.store.select(store => store.msDatabase.sdk.table_board_template_viewers);
        var table_board_templates = this.store.select(store => store.msDatabase.sdk.table_board_templates);
        var table_boards$ = this.store.select(store => store.msDatabase.sdk.table_boards);

        var counter = -1;
        var screenProps = {};
        var viewOrderIndexes = {};
        var boardWidth;
        var boardHeight;
        var boardOrientation;

        return Observable.combineLatest(
            table_campaign_timeline_board_templates$,
            table_board_template_viewers$,
            table_campaign_timeline_board_viewer_chanels$,
            table_board_templates,
            table_boards$,

            (campaignTimelineBoardTemplatesModels: List<CampaignTimelineBoardTemplatesModel>,
             boardTemplateViewersModels: List<BoardTemplateViewersModel>,
             campaignTimelineBoardViewerChanelsModels: List<CampaignTimelineBoardViewerChanelsModel>,
             boardTemplates: List<BoardTemplatesModel>,
             boardsModel: List<BoardsModel>) => {

                campaignTimelineBoardViewerChanelsModels.forEach((campaignTimelineBoardViewerChanelsModel: CampaignTimelineBoardViewerChanelsModel, v) => {

                    if (campaignTimelineBoardViewerChanelsModel.getCampaignTimelineBoardTemplateId() == i_campaign_timeline_board_template_id) {

                        var board_template_viewer_id = campaignTimelineBoardViewerChanelsModel.getBoardTemplateViewerId();
                        boardTemplateViewersModels.forEach((recBoardTemplateViewer: BoardTemplateViewersModel) => {
                            if (recBoardTemplateViewer.getBoardTemplateViewerId() == board_template_viewer_id) {

                                var boardId = boardTemplates.find((boardTemplateModel) => {
                                    return boardTemplateModel.getBoardTemplateId() == recBoardTemplateViewer.getBoardTemplateId();
                                }).getBoardId();

                                var boardModel = boardsModel.find((boardModel) => {
                                    return boardModel.getBoardId() == boardId;
                                });
                                boardWidth = boardModel.getBoardPixelWidth();
                                boardHeight = boardModel.getBoardPixelHeight();
                                if (boardWidth > boardHeight) {
                                    boardOrientation = OrientationEnum.HORIZONTAL;
                                } else {
                                    boardOrientation = OrientationEnum.VERTICAL;
                                }
                                // console.log(i_campaign_timeline_board_template_id + ' ' + recBoardTemplateViewer['board_template_viewer_id']);
                                counter++;
                                screenProps['sd' + counter] = {};
                                screenProps['sd' + counter]['campaign_timeline_board_viewer_id'] = recBoardTemplateViewer.getBoardTemplateViewerId();
                                screenProps['sd' + counter]['campaign_timeline_id'] = i_campaign_timeline_id;
                                screenProps['sd' + counter]['x'] = recBoardTemplateViewer.getPixelX();
                                screenProps['sd' + counter]['y'] = recBoardTemplateViewer.getPixelY();
                                screenProps['sd' + counter]['w'] = recBoardTemplateViewer.getPixelWidth();
                                screenProps['sd' + counter]['h'] = recBoardTemplateViewer.getPixelHeight();

                                // make sure that every view_order we assign is unique and sequential
                                var viewOrder = recBoardTemplateViewer.getViewerOrder();
                                if (!_.isUndefined(viewOrderIndexes[viewOrder])) {
                                    for (var i = 0; i < 100; i++) {
                                        if (_.isUndefined(viewOrderIndexes[i])) {
                                            viewOrder = i;
                                            break;
                                        }
                                    }
                                }
                                viewOrderIndexes[viewOrder] = true;
                                screenProps['sd' + counter]['view_order'] = viewOrder;
                            }
                        })
                    }
                })
                var screenTemplateData: IScreenTemplateData = {
                    screenProps: screenProps,
                    resolution: `${boardWidth}x${boardHeight}`,
                    screenType: '',
                    orientation: boardOrientation,
                    name: timelineName,
                    scale: 14,
                    campaignTimelineId: i_campaign_timeline_id,
                    campaignTimelineBoardTemplateId: i_campaign_timeline_board_template_id
                }
                return screenTemplateData;
            }).take(1)
    }

    /**
     Get campaigns from campaign id
     **/
    getCampaign(i_campaign_id: number): Observable<CampaignsModelExt> {
        return this.store.select(store => store.msDatabase.sdk.table_campaigns)
            .map((campaignModels: List<CampaignsModelExt>) => {
                return campaignModels.find((campaignModel: CampaignsModelExt) => {
                    return campaignModel.getCampaignId() == i_campaign_id;
                });
            }).take(1);
    }


    /*****************************************************/
    // below are some brain dumps and examples only
    /*****************************************************/

    private campaignSelectedExampleMultipleLatestFromSelections() {
        var campaignSelected$ = this.store.select(
            store => store.appDb.uiState.campaign.campaignSelected
        );
        var boards$ = this.store.select(
            store => store.msDatabase.sdk.table_boards
        );
        var campaignsList$ = this.store.select(
            store => store.msDatabase.sdk.table_campaigns
        );
        return campaignSelected$.withLatestFrom(
            campaignsList$,
            (campaignId, campaigns) => {
                return campaigns.find((i_campaign: CampaignsModelExt) => {
                    return i_campaign.getCampaignId() == campaignId;
                });
            }).withLatestFrom(
            boards$,
            (campaign: CampaignsModelExt, boards: List<BoardsModel>) => {
                return campaign;
            });
    }

    private findCampaignByIdTest(i_campaignId: number): Observable<CampaignsModelExt> {
        return this.store.select(store => store.msDatabase.sdk.table_campaigns)
            .take(1)
            .map((i_campaigns: List<CampaignsModelExt>) => {
                // console.log('look up campaign ' + i_campaignId);
                return i_campaigns.find((i_campaign: CampaignsModelExt) => {
                    return i_campaign.getCampaignId() == i_campaignId;
                });
            });
    }

    private findCampaignByIdConcatTemp1(i_campaignId): Observable<CampaignsModelExt> {
        var campaign1$ = this.findCampaignByIdTest(i_campaignId)
        var campaign2$ = this.findCampaignByIdTest(1)
        var campaign3$ = this.findCampaignByIdTest(2)

        return campaign1$.concatMap((x: CampaignsModelExt) => {
            return campaign2$;
        }, (a: CampaignsModelExt, b: CampaignsModelExt) => {
            return a;
        }).concatMap((campaignsModel: CampaignsModelExt) => {
            return this.findCampaignByIdTest(campaignsModel.getCampaignId())
        }, (c: CampaignsModelExt, d: CampaignsModelExt) => {
            return d;
        }).concatMap((campaignsModel: CampaignsModelExt) => this.findCampaignByIdTest(campaignsModel.getCampaignId()), (e: CampaignsModelExt, f: CampaignsModelExt) => {
            return e
        }).take(1)
    }

}


// /**
//  Listen to changes in selected scene
//  **/
// listenSceneOrBlockChanged(emitOnEmpty: boolean = false): Observable<any> {
//     return this.store.select(store => store.msDatabase.sdk.table_player_data);
//
//     // var sceneSelected$ = this.store.select(store => store.appDb.uiState.scene.sceneSelected);
//     // var player_data$ = this.store.select(store => store.msDatabase.sdk.table_player_data);
//     // var blockSelected$ = this.store.select(store => store.appDb.uiState.scene.blockSelected);
//     // return sceneSelected$.combineLatest(player_data$, (sceneId, player_data) => {
//     //     return {sceneId, player_data}
//     // }).filter((ids) => {
//     //     if (!emitOnEmpty) return true; // no filter requested
//     //     return ids && ids.sceneId != -1
//     // }).withLatestFrom(blockSelected$, (a, b) => {
//     //     return {a, b};
//     // }).map(ids => {
//     //     return ids;
//     //     // return this.getScene(ids.sceneId)
//     //     // .map((playerDataModel: PlayerDataModelExt) => {
//     //     //     var domPlayerData = $.parseXML(playerDataModel.getPlayerDataValue())
//     //     //     var selectedSnippet: any = $(domPlayerData).find(`[id="${ids.blockId}"]`)[0];
//     //     //     var mimeType = $(domPlayerData).find('Player').attr('mimeType');
//     //     //     var xml = (new XMLSerializer()).serializeToString(selectedSnippet);
//     //     //     selectedSnippet = $.parseXML(xml)
//     //     //     var sceneData: ISceneData = {
//     //     //         scene_id: ids.sceneId,
//     //     //         scene_id_pseudo_id: null,
//     //     //         block_pseudo_id: ids.blockId,
//     //     //         playerDataModel: playerDataModel,
//     //     //         domPlayerData: selectedSnippet,
//     //     //         domPlayerDataXml: xml,
//     //     //         domPlayerDataJson: this.parser.xml2js(xml),
//     //     //         mimeType: mimeType
//     //     //     }
//     //     //     return sceneData;
//     //     // });
//     // }).distinct()
//     //     .mergeMap(v => (v ? Observable.of(v) : ( emitOnEmpty ? Observable.of(v) : Observable.empty())));
// }