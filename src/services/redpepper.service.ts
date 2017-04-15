import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {IDataBaseManager, ILoadManager, IPepperAuthReply, IPepperConnection} from "../store/imsdb.interfaces";
import * as MsdbModels from "../store/imsdb.interfaces_auto";
import {ISDK, PlayerDataModel, TableNames} from "../store/imsdb.interfaces_auto";
import * as MsdbModelsExtended from "../store/model/msdb-models-extended";
import {StoreModel} from "../store/model/StoreModel";
import {List} from "immutable";
import {ACTION_INJECT_SDK} from "../store/actions/appdb.actions";
import {Store} from "@ngrx/store";
import {ApplicationState} from "../store/application.state";
import * as _ from "lodash";
import {NgmslibService} from "ng-mslib";
import {IAddContents} from "../interfaces/IAddContent";
import {BlockLabels, PLACEMENT_CHANNEL} from "../interfaces/Consts";
import X2JS from "x2js";
import {BlockService} from "../app/blocks/block-service";

export interface IPepperUserData {
    userName: string;
    userPass: string;
    domain: string;
    businessID: number;
    eri: string;
    authTime: string;
    whiteLabel: boolean;
    resellerName: string;
    resellerID: number;
    components: any;
}


var parser = new X2JS({
    escapeMode: true,
    attributePrefix: "_",
    arrayAccessForm: "none",
    emptyNodeForm: "text",
    enableToStringFunc: true,
    arrayAccessFormPaths: [],
    skipEmptyTextNodesForObj: true
});

export type redpepperTables = {
    tables: ISDK
    tableNames: Array<string>;
}

@Injectable()
export class RedPepperService {

    constructor(private store: Store<ApplicationState>, private ngmslibService: NgmslibService) {
    }

    private m_tablesPendingToProcess: Array<any> = [];
    private m_loaderManager: ILoadManager;
    private m_tempScenePlayerIDs: any;
    private databaseManager: IDataBaseManager;

    private m_authenticated = false;
    private m_domain;
    private m_whiteLabel;
    private m_userName;
    private m_userPassword;
    private m_resellerId = -1;
    private m_resellerName = '';
    private m_businessID = -1;
    private m_eri = '';
    private m_authTime;

    public dbConnect(i_user, i_pass): Observable<any> {
        var self = this;
        return Observable.create(observer => {
            self.m_loaderManager = new LoaderManager() as ILoadManager;
            self.databaseManager = self.m_loaderManager.m_dataBaseManager;

            self.m_loaderManager.create(i_user, i_pass, (pepperAuthReply: IPepperAuthReply) => {
                var pepperConnection: IPepperConnection = {
                    pepperAuthReply: pepperAuthReply,
                    dDataBaseManager: self.databaseManager,
                    loadManager: self.m_loaderManager,
                }
                observer.next(pepperConnection);
                if (pepperAuthReply.status == true) {
                    self.m_authenticated = true;
                    self.m_domain = self.m_loaderManager['m_domain'];
                    var resellerInfo = self.m_loaderManager['m_resellerInfo'];
                    self.m_userName = i_user;
                    self.m_userPassword = i_pass;
                    self.m_whiteLabel = parseInt($(resellerInfo).find('WhiteLabel').attr('enabled'));
                    self.m_resellerId = parseInt($(resellerInfo).find('BusinessInfo').attr('businessId'));
                    self.m_resellerName = $(resellerInfo).find('BusinessInfo').attr('name');
                    self.m_businessID = self.m_loaderManager['m_businessId'];
                    self.m_eri = self.m_loaderManager['m_eri'];
                    self.m_authTime = Date.now();
                }
            });
        })
    }

    public get loaderManager() {
        return this.m_loaderManager;
    }

    /**
     Save to remote server
     @method save
     @return none
     **/
    save(i_callback) {
        this.m_loaderManager.save(i_callback);
    }

    /**
     Sync internal sdk to remote mediaSERVER account
     @method requestData
     @param {Function} i_callback
     **/
    sync(i_callBack) {
        this.m_loaderManager.requestData(i_callBack);
    }

    private addPendingTables(tables: Array<any>) {
        tables.forEach(table => {
            if (this.m_tablesPendingToProcess.indexOf(table) == -1)
                this.m_tablesPendingToProcess.push(table);
        });
    }

    /**
     Return all authenticated user data
     **/
    getUserData(): IPepperUserData {
        return {
            userName: this['m_userName'],
            userPass: this['m_userPassword'],
            domain: this['m_domain'],
            businessID: this['m_businessID'],
            eri: this['m_eri'],
            authTime: this['m_authTime'],
            whiteLabel: this['m_whiteLabel'],
            resellerName: this['m_resellerName'],
            resellerID: this['m_resellerId'],
            components: this['m_components']
        };
    }

    private resetPendingTables() {
        this.m_tablesPendingToProcess = [];
    }

    private capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * reduxCommit: this is the secret sauce that syncs the entire msdb which downloads on init
     * to the redux store.
     *
     * if passed in table names, use them to sync to redux
     * if not, try and see if any pending pendingTableSync exist, if so sync to redux
     * if not, process the entire msdb table list to redux store
     * if forceAll, just process all tables
     * @param tableNameTargets
     * @param forceAll (pass 1st arg as null and 2nd as true)
     * @returns {redpepperTables}
     */
    reduxCommit(tableNameTargets?: Array<string>, forceAll?: boolean): redpepperTables {
        var tablesNames: Array<string> = [];

        if (forceAll) {
            this.m_tablesPendingToProcess = [];
        }

        if (tableNameTargets) {
            tablesNames = tableNameTargets;
        } else {
            if (this.m_tablesPendingToProcess.length > 0) {
                tablesNames = this.m_tablesPendingToProcess;
            } else {
                tablesNames = TableNames;
            }
        }
        tablesNames = tablesNames.map(tableName => {
            if (tableName.indexOf('table_') > -1)  // protection against appending table_
                return tableName.replace(/table_/, '');
            return tableName;
        });
        var tableNamesTouched = {};
        var redpepperSet: redpepperTables = {tables: null, tableNames: tablesNames};
        var tables = {}
        tablesNames.forEach((table, v) => {
            var tableName = 'table_' + table;
            var storeName = this.capitalizeFirstLetter(StringJS(table).camelize().s) + 'Model';
            var storeModelList: List<StoreModel> = List<StoreModel>();
            tables[tableName] = storeModelList;
            if (this.databaseManager[tableName]().getAllPrimaryKeys().length == 0) {
                tables[tableName] = storeModelList;
                tableNamesTouched[tableName] = tableName;
            } else {
                $(this.databaseManager[tableName]().getAllPrimaryKeys()).each((k, primary_id) => {
                    var record = this.databaseManager[tableName]().getRec(primary_id);
                    if (record.change_type == 3)
                        return;
                    record.self = null;
                    record.__proto__ = null;
                    var newClass: StoreModel;
                    if (MsdbModelsExtended[storeName + 'Ext']) {
                        newClass = new MsdbModelsExtended[storeName + 'Ext'](record);
                    } else {
                        newClass = new MsdbModels[storeName](record);
                    }
                    storeModelList = storeModelList.push(newClass);
                    tables[tableName] = storeModelList;
                    tableNamesTouched[tableName] = tableName;
                });
            }
            redpepperSet.tables = tables as any;
            redpepperSet.tableNames = Object.keys(tableNamesTouched).map(function (key) {
                return tableNamesTouched[key];
            });
        });
        this.resetPendingTables();
        this.store.dispatch({type: ACTION_INJECT_SDK, payload: [redpepperSet]})
        return redpepperSet;
    }

    /**
     Inject unique player ids for all players within a scene
     @method injectPseudoScenePlayersIDs
     @param {Number} i_scene_id
     **/
    injectPseudoScenePlayersIDs(i_scene_id?) {
        var scenes = {};
        if (!_.isUndefined(i_scene_id)) {
            var domPlayerData = this.getScenePlayerdataDom(i_scene_id);
            scenes[i_scene_id] = domPlayerData;
        } else {
            scenes = this.getScenes();
        }
        _.each(scenes, (domPlayerData: any, scene_id) => {
            $(domPlayerData).find('Player').eq(0).attr('id', this.generateSceneId());
            $(domPlayerData).find('Players').find('Player').each((i, player) => {
                var blockID = this.generateSceneId();
                $(player).attr('id', blockID);
            });
            this.setScenePlayerData(scene_id, (new XMLSerializer()).serializeToString(domPlayerData));
        });
    }

    /**
     set entire scene playerdata
     @method setScenePlayerData
     @return {Number} scene player_data id
     **/
    setScenePlayerData(i_scene_id, i_player_data) {
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        this.databaseManager.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = this.databaseManager.table_player_data().getRec(i_scene_id);
        recPlayerData['player_data_value'] = i_player_data;
        this.addPendingTables(['table_player_data']);
    }

    /**
     Remove a scene
     @method removeScene
     **/
    removeScene(i_scene_player_data_id) {
        var i_scene_id = this.sterilizePseudoId(i_scene_player_data_id);
        this.databaseManager.table_player_data().openForDelete(i_scene_id);
        this.addPendingTables(['table_player_data']);
    }

    /**
     Remove all player ids from i_domPlayerData
     @method stripPlayersID
     **/
    stripPlayersID(i_domPlayerData) {
        $(i_domPlayerData).removeAttr('id');
        return i_domPlayerData;
    }

    /**
     Remove specific player id (i.e.: block) from scene player_data
     @method removeScenePlayer
     @param {Number} i_scene_id
     @param {Number} i_player_id
     **/
    removeScenePlayer(i_scene_id, i_player_data_id) {
        console.log(i_player_data_id);
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        this.databaseManager.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = this.databaseManager.table_player_data().getRec(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data)
        $(domPlayerData).find('[id="' + i_player_data_id + '"]').remove();
        this.setScenePlayerData(i_scene_id, (new XMLSerializer()).serializeToString(domPlayerData));
        this.addPendingTables(['table_player_data']);
    }

    /**
     append scene player block to pepper player_data table
     @method appendScenePlayerBlock
     @param {Number} i_scene_id
     @param {XML} i_player_data
     **/
    appendScenePlayerBlock(i_scene_id, i_player_data) {
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        this.databaseManager.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = this.databaseManager.table_player_data().getRec(i_scene_id);
        var scene_player_data = recPlayerData['player_data_value'];
        var sceneDomPlayerData = $.parseXML(scene_player_data);
        var playerData: any = $.parseXML(i_player_data);
        // use first child to overcome the removal by jXML of the HTML tag
        $(sceneDomPlayerData).find('Players').append(playerData.firstChild);
        // $(sceneDomPlayerData).find('Players').append($(i_player_data));
        var player_data = this.xmlToStringIEfix(sceneDomPlayerData);
        recPlayerData['player_data_value'] = player_data;
        this.addPendingTables(['table_player_data']);
    }

    /**
     set a block id inside a scene with new player_data
     @method setScenePlayerdataBlock
     @param {Number} i_scene_id
     @param {Number} i_player_data_id
     @param {XML} player_data
     **/
    setScenePlayerdataBlock(i_scene_id, i_player_data_id, i_player_data) {
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        this.databaseManager.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = this.databaseManager.table_player_data().getRec(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data);
        var playerData: any = $.parseXML(i_player_data);
        // use first child to overcome the removal by jXML of the HTML tag
        $(domPlayerData).find('[id="' + i_player_data_id + '"]').replaceWith(playerData.firstChild);
        player_data = this.xmlToStringIEfix(domPlayerData);
        this.setScenePlayerData(i_scene_id, player_data);
        this.addPendingTables(['table_player_data']);
    }

    /**
     Create a new Scene
     If mimetype was give as an argument and it's of format
     Json.xxxx (i.e.: Json.weather, Json.spreadsheet ...) add it to scene table as well
     @method createScene
     @optional i_mimeType
     @optional i_name
     @return {Number} scene player_data id
     **/
    createScene(i_player_data, i_mimeType, i_name) {
        var table_player_data: any = this.databaseManager.table_player_data();
        var recPlayerData = table_player_data.createRecord();
        if (i_mimeType && i_mimeType.match(/Json./)) {
            i_player_data = $.parseXML(i_player_data);
            $(i_player_data).find('Player').attr('mimeType', i_mimeType);
            i_player_data = this.xmlToStringIEfix(i_player_data);
        }
        if (!_.isUndefined(i_name)) {
            i_player_data = $.parseXML(i_player_data);
            $(i_player_data).find('Player').attr('label', i_name);
            i_player_data = this.xmlToStringIEfix(i_player_data);
        }
        recPlayerData['player_data_value'] = i_player_data;
        table_player_data.addRecord(recPlayerData);
        var scene_id = recPlayerData['player_data_id'];
        this.injectPseudoScenePlayersIDs(scene_id);
        // this.databaseManager.fire(Pepper['SCENE_CREATED'], this, null, recPlayerData['player_data_id']);
        this.addPendingTables(['table_player_data']);
        return this.getPseudoIdFromSceneId(scene_id);
    }

    /**
     Translate a scene id to its matching pseudo scene id
     @method getPseudoIdFromSceneId
     @param {Number} i_scene_id
     @return {Number} pseudo id
     **/
    getPseudoIdFromSceneId(i_scene_id) {
        var found = undefined;
        var scenes = this.getScenes();
        _.each(scenes, function (domPlayerData, scene_id) {
            var injectedID = $(domPlayerData).find('Player').eq(0).attr('id');
            if (i_scene_id == scene_id)
                found = injectedID;
        });
        return found;
    }

    /**
     Remove all references to a scene id from within Scenes > BlockCollections that refer to that particular scene id
     In other words, check all scenes for existing block collections, and if they refer to scene_id, remove that entry
     @method removeSceneFromBlockCollectionWithSceneId
     @param {Number} i_scene_id scene id to search for and remove in all scenes > BlockCollections
     **/
    removeSceneFromBlockCollectionInScenes(i_scene_id) {
        $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each((k, player_data_id) => {
            var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BlockLabels.BLOCKCODE_COLLECTION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('Collection').children().each(function (k, page) {
                        var scene_id = $(page).find('Player').attr('hDataSrc');
                        if (scene_id == i_scene_id) {
                            $(page).remove();
                            currentSceneID = this.sterilizePseudoId(currentSceneID);
                            this.databaseManager.table_player_data().openForEdit(currentSceneID);
                            var player_data = this.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
        this.addPendingTables(['table_player_data']);
    }

    /**
     Remove the scene from any block collection which resides in campaign timeline channels that uses that scene in its collection list
     @method removeSceneFromBlockCollectionsInChannels
     @param {Number} i_scene_id
     @return none
     **/
    removeSceneFromBlockCollectionsInChannels(i_scene_id) {
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (parseInt(blockType) == BlockLabels.BLOCKCODE_COLLECTION) {
                $(domPlayerData).find('Collection').children().each((k, page) => {
                    var scene_hDataSrc;
                    var type = $(page).attr('type');
                    if (type == 'scene') {
                        scene_hDataSrc = $(page).find('Player').attr('hDataSrc');
                        if (scene_hDataSrc == i_scene_id) {
                            $(page).remove();
                            var player_data = this.xmlToStringIEfix(domPlayerData)
                            this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            this.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    removeSceneFromBlockLocationInScenes(i_scene_id) {
        $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each((k, player_data_id) => {
            var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BlockLabels.LOCATION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('GPS').children().each(function (k, page) {
                        var scene_id = $(page).find('Player').attr('hDataSrc');
                        if (scene_id == i_scene_id) {
                            $(page).remove();
                            currentSceneID = this.sterilizePseudoId(currentSceneID);
                            this.databaseManager.table_player_data().openForEdit(currentSceneID);
                            var player_data = this.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
        $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each((k, player_data_id) => {
            var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BlockLabels.LOCATION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('Fixed').children().each(function (k, page) {
                        var scene_id = $(page).find('Player').attr('hDataSrc');
                        if (scene_id == i_scene_id) {
                            $(page).remove();
                            currentSceneID = this.sterilizePseudoId(currentSceneID);
                            this.databaseManager.table_player_data().openForEdit(currentSceneID);
                            var player_data = this.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
        this.addPendingTables(['table_player_data']);
    }

    /**
     Remove the scene from any block collection which resides in campaign timeline channels that uses that scene in its collection list
     @method removeSceneFromBlockCollectionsInChannels
     @param {Number} i_scene_id
     @return none
     **/
    removeSceneFromBlockLocationInChannels(i_scene_id) {
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (parseInt(blockType) == BlockLabels.LOCATION) {
                $(domPlayerData).find('GPS').children().each((k, page) => {
                    var scene_hDataSrc;
                    var type = $(page).attr('type');
                    if (type == 'scene') {
                        scene_hDataSrc = $(page).find('Player').attr('hDataSrc');
                        if (scene_hDataSrc == i_scene_id) {
                            $(page).remove();
                            var player_data = this.xmlToStringIEfix(domPlayerData)
                            this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            this.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (parseInt(blockType) == BlockLabels.LOCATION) {
                $(domPlayerData).find('Fixed').children().each((k, page) => {
                    var scene_hDataSrc;
                    var type = $(page).attr('type');
                    if (type == 'scene') {
                        scene_hDataSrc = $(page).find('Player').attr('hDataSrc');
                        if (scene_hDataSrc == i_scene_id) {
                            $(page).remove();
                            var player_data = this.xmlToStringIEfix(domPlayerData)
                            this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            this.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Remove blocks (a.k.a players) from all campaign timeline  channels that use the specified scene_id
     @method removeBlocksWithSceneID
     @param {Number} i_scene_id
     @return none
     **/
    removeBlocksWithSceneID(i_scene_id) {
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var scene_id = $(domPlayerData).find('Player').attr('hDataSrc');
            if (scene_id == i_scene_id)
                this.removeBlockFromTimelineChannel(campaign_timeline_chanel_player_id);
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Change a viewer's (aka screen division) order (layer) z-order
     @method updateTemplateViewerOrder
     @param {number} i_board_template_viewer_id
     @param {number} i_view_order
     **/
    updateTemplateViewerOrder(i_board_template_viewer_id, i_view_order) {
        this.databaseManager.table_board_template_viewers().openForEdit(i_board_template_viewer_id);
        var recEditBoardTemplateViewer = this.databaseManager.table_board_template_viewers().getRec(i_board_template_viewer_id);
        recEditBoardTemplateViewer['viewer_order'] = i_view_order;
        this.addPendingTables(['table_board_template_viewers']);
    }

    /**
     Set a Board Template Viewer props
     @method setBoardTemplateViewer
     @param {Number} i_board_template_viewer_id
     @return {Number} i_props
     **/
    setBoardTemplateViewer(i_campaign_timeline_board_template_id, i_board_template_viewer_id, i_props) {
        var x = Math.round(i_props.x);
        var y = Math.round(i_props.y);
        var w = Math.round(i_props.w);
        var h = Math.round(i_props.h);

        // console.log('savings: template_id: ' + i_campaign_timeline_board_template_id + ' view_id: ' + i_board_template_viewer_id + ' ' + x + 'x' + y + ' ' + w + '/' + h);

        this.databaseManager.table_board_template_viewers().openForEdit(i_board_template_viewer_id);
        var recEditBoardTemplateViewer = this.databaseManager.table_board_template_viewers().getRec(i_board_template_viewer_id);
        recEditBoardTemplateViewer['pixel_x'] = x;
        recEditBoardTemplateViewer['pixel_y'] = y;
        recEditBoardTemplateViewer['pixel_width'] = w;
        recEditBoardTemplateViewer['pixel_height'] = h;
        // this.announceTemplateViewerEdited(i_campaign_timeline_board_template_id);
        this.addPendingTables(['table_board_template_viewers']);
    }

    /**
     Remove all blocks (i.e.: players) from campaign > timeline > channel
     @method removeBlocksFromTimelineChannel
     @param {Number} i_block_id
     @return none
     **/
    removeBlocksFromTimelineChannel(i_campaign_timeline_chanel_id) {
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id'] == i_campaign_timeline_chanel_id) {
                var status = this.databaseManager.table_campaign_timeline_chanel_players().openForDelete(campaign_timeline_chanel_player_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Update a timeline's duration which is set as the total sum of all blocks within the longest running channel
     @method updateTotalTimelineDuration
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    updateTotalTimelineDuration(i_campaign_timeline_id): void {
        var longestChannelDuration = 0;
        // Get all timelines
        $(this.databaseManager.table_campaign_timelines().getAllPrimaryKeys()).each((k, campaign_timeline_id) => {
            if (campaign_timeline_id == i_campaign_timeline_id) {
                // get all channels that belong to timeline
                $(this.databaseManager.table_campaign_timeline_chanels().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_id) => {
                    var recCampaignTimelineChannel = this.databaseManager.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
                    if (campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {
                        var timelineDuration = 0;
                        // get all players / resources that belong timeline
                        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
                            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                            if (campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                                // console.log(campaign_timeline_chanel_player_id + ' ' + recCampaignTimelineChannelPlayer['player_duration']);
                                timelineDuration += parseFloat(recCampaignTimelineChannelPlayer['player_duration']);
                                if (timelineDuration > longestChannelDuration)
                                    longestChannelDuration = timelineDuration;
                            }
                        });
                    }
                });
            }
        });
        this.setCampaignTimelineRecord(i_campaign_timeline_id, 'timeline_duration', longestChannelDuration);
        this.addPendingTables(['table_campaign_timelines', 'table_campaign_timeline_chanels', 'table_campaign_timeline_chanel_players']);
    }


    /**
     Update a timeline's duration which is set as the total sum of all blocks within the longest running channel
     @method updateTotalTimelineDuration
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    getGlobalBoardFromCampaignId(i_campaign_id) {
        var res;
        _.find(this.databaseManager.table_campaign_boards().getAllPrimaryKeys(), (campaign_board_id) => {
            var recCampaignTimeline = this.databaseManager.table_campaign_boards().getRec(campaign_board_id);
            if (recCampaignTimeline.campaign_id == i_campaign_id) {
                var board_id = recCampaignTimeline['board_id']
                res = this.databaseManager.table_boards().getRec(board_id);
            }
        });
        return res;
    }

    /**
     Remove the association between the screen division (aka viewer) and all channels that are assigned with that viewer
     @method removeTimelineBoardViewerChannel
     @param {Number} i_campaign_timeline_board_template_id
     @return {Number} return the channel that was de-associated with viewer
     **/
    removeTimelineBoardViewerChannel(i_board_template_viewer_id) {
        var campaign_timeline_chanel_id = -1;
        $(this.databaseManager.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each((k, campaign_timeline_board_viewer_chanel_id) => {
            var recCampaignTimelineViewerChanels = this.databaseManager.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineViewerChanels['board_template_viewer_id'] == i_board_template_viewer_id) {
                campaign_timeline_chanel_id = recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'];
                this.databaseManager.table_campaign_timeline_board_viewer_chanels().openForDelete(campaign_timeline_board_viewer_chanel_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_board_viewer_chanels']);
        return campaign_timeline_chanel_id;
    }

    /**
     Remove board template viewer
     @method removeBoardTemplateViewer
     @param {Number} i_board_template_id
     @param {Number} i_board_template_viewer_id
     **/
    removeBoardTemplateViewer(i_board_template_id, i_board_template_viewer_id) {
        this.databaseManager.table_board_template_viewers().openForDelete(i_board_template_viewer_id);
        this.addPendingTables(['table_board_template_viewers']);
    }

    /**
     Assign viewer (screen division) on the timeline to channel
     @method assignViewerToTimelineChannel
     @param {Number} i_campaign_timeline_board_template_id
     @param {Object} i_viewers a json object with all viewers
     @param {Array} i_channels a json object with all channels
     @return none
     **/
    assignViewerToTimelineChannel(i_campaign_timeline_board_template_id, i_viewer_id, i_channel_id) {
        var viewerChanels: any = this.databaseManager.table_campaign_timeline_board_viewer_chanels();
        var viewerChanel = viewerChanels.createRecord();
        viewerChanel.campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
        viewerChanel.board_template_viewer_id = i_viewer_id;
        viewerChanel.campaign_timeline_chanel_id = i_channel_id;
        viewerChanels.addRecord(viewerChanel);
        this.addPendingTables(['table_campaign_timeline_board_viewer_chanels']);
    }

    /**
     Remove a channel from a timeline
     @method removeChannelFromTimeline
     @param {Number} i_channel_id
     @return {Boolean} status
     **/
    removeChannelFromTimeline(i_channel_id): number {
        this.addPendingTables(['table_campaign_timeline_chanels']);
        return this.databaseManager.table_campaign_timeline_chanels().openForDelete(i_channel_id);
    }

    /**
     Create a new campaign in the local database
     @method createCampaign
     @param {Number} i_campaginName
     @return {Number} campaign id created
     **/
    createCampaign(i_campaignName): number {
        var campaigns = this.databaseManager.table_campaigns();
        var campaign = campaigns.createRecord();
        campaign.campaign_name = i_campaignName;
        campaigns.addRecord(campaign, undefined);
        this.addPendingTables(['campaigns']);
        return campaign.campaign_id;
    }

    //todo: finish process
    createCampaignEntire(screenProps: {}, campaignName: string, resolution: string): number {

        if (campaignName == '')
            campaignName = 'new campaign';

        var w = resolution.split('x')[0]
        var h = resolution.split('x')[1]
        var board_id = this.createBoard('my board', w, h);
        var newTemplateData = this.createNewTemplate(board_id, screenProps);
        var board_template_id = newTemplateData['board_template_id']
        var viewers = newTemplateData['viewers'];
        var m_selected_campaign_id = this.createCampaign('campaign');
        var campaign_board_id = this.assignCampaignToBoard(m_selected_campaign_id, board_id);
        this.setCampaignRecord(m_selected_campaign_id, 'campaign_name', campaignName);
        var campaign_timeline_id = this.createNewTimeline(m_selected_campaign_id);
        this.setCampaignTimelineSequencerIndex(m_selected_campaign_id, campaign_timeline_id, 0);
        this.setTimelineTotalDuration(campaign_timeline_id, '0');
        this.createCampaignTimelineScheduler(m_selected_campaign_id, campaign_timeline_id);
        var campaign_timeline_board_template_id = this.assignTemplateToTimeline(campaign_timeline_id, board_template_id, campaign_board_id);
        var channels = this.createTimelineChannels(campaign_timeline_id, viewers);
        this.assignViewersToTimelineChannels(campaign_timeline_board_template_id, viewers, channels);
        this.reduxCommit();
        return m_selected_campaign_id;
    }

    /**
     Create channel and assign that channel to the specified timeline
     @method createTimelineChannel
     @param {Number} i_campaign_timeline_id the timeline id to assign channel to
     @return {Array} createdChanels array of channel ids created
     **/
    createTimelineChannel(i_campaign_timeline_id) {
        var chanels: any = this.databaseManager.table_campaign_timeline_chanels();
        var chanel = chanels.createRecord();
        chanel.chanel_name = "CH";
        chanel.campaign_timeline_id = i_campaign_timeline_id;
        chanels.addRecord(chanel);
        // this.databaseManager.fire(Pepper['NEW_CHANNEL_ADDED'], this, null, {
        //     chanel: chanel['campaign_timeline_chanel_id'],
        //     campaign_timeline_id: i_campaign_timeline_id
        // });
        this.addPendingTables(['table_campaign_timeline_chanels']);
        return chanel['campaign_timeline_chanel_id'];
    }

    renameCampaign(i_campaignId, i_newCampaignName): void {
        this.setCampaignRecord(i_campaignId, 'campaign_name', i_newCampaignName)
        this.addPendingTables(['campaigns']);
    }

    /**
     Create a global viewer in an existing board_template
     @method createViewer
     @param {Number} board_template_id
     @param {Number} i_board_template_id
     @param {Object} i_props
     @return {Number} viewer id
     **/
    createViewer(i_board_template_id, i_props) {
        var viewers: any = this.databaseManager.table_board_template_viewers();
        var viewer = viewers.createRecord();
        viewer.viewer_name = "Viewer";
        viewer.pixel_width = i_props['w'];
        viewer.pixel_height = i_props['h'];
        viewer.pixel_x = i_props['x'];
        viewer.pixel_y = i_props['y'];
        viewer.board_template_id = i_board_template_id;
        viewers.addRecord(viewer);
        this.addPendingTables(['table_board_template_viewers']);
        return viewer['board_template_viewer_id'];
    }

    /**
     Create a new board, also known as Screen (screen divisions reside inside the board as viewers)
     @method createBoard
     @param {Number} i_boardName
     @param {Number} i_width of the board
     @param {Number} i_height of the board
     @return {Number} the board id
     **/
    createBoard(i_boardName, i_width, i_height): number {
        var boards = this.databaseManager.table_boards();
        var board = boards.createRecord();
        board.board_name = i_boardName;
        board.board_pixel_width = i_width;
        board.board_pixel_height = i_height;
        boards.addRecord(board, undefined);
        this.addPendingTables(['table_boards']);
        return board['board_id'];
    }

    /**
     Create a new global template (screen and viewers) and assign the new template to the given global board_id
     @method createNewTemplate
     @param {Number} i_board_id
     @param {Object} i_screenProps json object with all the viewers and attributes to create in msdb
     @return {Object} returnData encapsulates the board_template_id and board_template_viewer_ids created
     **/
    createNewTemplate(i_board_id, i_screenProps): any {
        var returnData = {
            board_template_id: -1,
            viewers: []
        };
        // create screen template under board_id
        var boardTemplates = this.databaseManager.table_board_templates();
        var boardTemplate = boardTemplates.createRecord();
        boardTemplate.template_name = "board template";
        boardTemplate.board_id = i_board_id; // bind screen template to board
        boardTemplates.addRecord(boardTemplate, undefined);

        var board_template_id = boardTemplate['board_template_id'];

        // add viewers (screen divisions)
        var viewers = this.databaseManager.table_board_template_viewers();
        var i = 0;
        for (var screenValues in i_screenProps) {
            i++;
            var viewer = viewers.createRecord();
            viewer.viewer_name = "Viewer" + i;
            viewer.pixel_width = i_screenProps[screenValues]['w'];
            viewer.pixel_height = i_screenProps[screenValues]['h'];
            viewer.pixel_x = i_screenProps[screenValues]['x'];
            viewer.pixel_y = i_screenProps[screenValues]['y'];
            viewer.board_template_id = boardTemplate.board_template_id; // bind screen division to screen template
            viewers.addRecord(viewer, undefined);
            returnData['viewers'].push(viewer['board_template_viewer_id']);
        }
        returnData['board_template_id'] = board_template_id
        this.addPendingTables(['table_board_templates', 'table_board_template_viewers']);
        return returnData;
    }

    /**
     Check that every timeline within a campaign has a scheduler table entry, if not, create one with default values
     @method checkAndCreateCampaignTimelineScheduler
     @param {Number} i_campaign_id
     @return none
     **/
    checkAndCreateCampaignTimelineScheduler(i_campaign_id) {
        $(this.databaseManager.table_campaign_timelines().getAllPrimaryKeys()).each((k, campaign_timeline_id) => {
            var recCampaignTimeline = this.databaseManager.table_campaign_timelines().getRec(campaign_timeline_id);

            // if found a one timeline that belongs to i_campaign_id
            if (recCampaignTimeline['campaign_id'] == i_campaign_id) {
                var schedulerFound = 0;
                $(this.databaseManager.table_campaign_timeline_schedules().getAllPrimaryKeys()).each((k, campaign_timeline_schedule_id) => {
                    var recCampaignTimelineSchedule = this.databaseManager.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
                    if (recCampaignTimelineSchedule.campaign_timeline_id == campaign_timeline_id)
                        schedulerFound = 1;
                });
                if (!schedulerFound)
                    this.createCampaignTimelineScheduler(i_campaign_id, campaign_timeline_id);
            }
        });
    }

    /**
     Returns all scenes
     @method getSceneMime
     @param {Number} i_sceneID
     @return {Object} scene names
     **/
    getSceneMime(i_sceneID) {
        var mimeType = '';
        $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each((k, player_data_id) => {
            var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
            var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
            var id = $(domPlayerData).find('Player').attr('id');
            if (id == i_sceneID)
                mimeType = $(domPlayerData).find('Player').attr('mimeType');
        });
        return mimeType;
    }

    /**
     Set a campaign table record for the specified i_campaign_id.
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignRecord
     @param {Number} i_campaign_id
     @param {Object} i_key
     @param {String} i_value
     @return {Object} foundCampaignRecord
     **/
    setCampaignRecord(i_campaign_id, i_key, i_value): void {
        var value = this.ngmslibService.cleanCharForXml(i_value);
        this.databaseManager.table_campaigns().openForEdit(i_campaign_id);
        var recCampaign = this.databaseManager.table_campaigns().getRec(i_campaign_id);
        recCampaign[i_key] = value;
        this.addPendingTables(['table_campaigns']);
    }

    /**
     Assign a campaign to a board, binding the to by referenced ids
     @method assignCampaignToBoard
     @param {Number} i_campaign_id the campaign id to assign to board
     @param {Number} i_board_id the board id to assign to campaign
     @return {Number} campain_board_id
     **/
    assignCampaignToBoard(i_campaign_id, i_board_id): number {
        var campaign_boards = this.databaseManager.table_campaign_boards();
        var campain_board = campaign_boards.createRecord();
        campain_board.campaign_id = i_campaign_id;
        campain_board.board_id = i_board_id;
        campaign_boards.addRecord(campain_board, undefined);
        this.addPendingTables(['table_campaign_boards']);
        return campain_board['campaign_board_id']
    }

    /**
     Set a resource record via its resource_id.
     The method uses generic key / value fields so it can set any part of the record.
     @method setResourceRecord
     @param {Number} i_resource_id
     @param {Number} i_key
     @param {String} i_value
     @return {Object} foundResourceRecord
     **/
    setResourceRecord(i_resource_id, i_key, i_value) {
        this.databaseManager.table_resources().openForEdit(i_resource_id);
        var recResource = this.databaseManager.table_resources().getRec(i_resource_id);
        recResource[i_key] = i_value;
        this.addPendingTables(['table_resources']);
    }

    /**
     Set a channel_id record in channels table using key and value
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignTimelineChannelRecord
     @param {Number} i_channel_id
     @param {Number} i_key
     @param {String} i_value
     @return none
     **/
    setCampaignTimelineChannelRecord(i_channel_id, i_key, i_value) {
        this.databaseManager.table_campaign_timeline_chanels().openForEdit(i_channel_id);
        var recChannel = this.databaseManager.table_campaign_timeline_chanels().getRec(i_channel_id);
        recChannel[i_key] = i_value;
    }

    /**
     Create a new timeline under the specified campaign_id
     @method createNewTimeline
     @param {Number} i_campaign_id
     @return {Number} campaign_timeline_id the timeline id created
     **/
    createNewTimeline(i_campaign_id): number {
        var timelines = this.databaseManager.table_campaign_timelines();
        var timeline = timelines.createRecord();
        timeline.campaign_id = i_campaign_id;
        timeline.timeline_name = "Timeline";
        timelines.addRecord(timeline, undefined);
        this.addPendingTables(['table_campaign_timelines']);
        return timeline['campaign_timeline_id'];
    }

    /**
     Set the sequence index of a timeline in campaign. If timeline is not found in sequencer, we insert it with the supplied i_sequenceIndex
     @method setCampaignTimelineSequencerIndex
     @param {Number} i_campaign_id
     @param {Number} i_campaign_timeline_id
     @param {Number} i_sequenceIndex is the index to use for the timeline so we can playback the timeline in the specified index order
     @return none
     **/
    setCampaignTimelineSequencerIndex(i_campaign_id, i_campaign_timeline_id, i_sequenceIndex): void {
        var updatedSequence = false;
        $(this.databaseManager.table_campaign_timeline_sequences().getAllPrimaryKeys()).each((k, campaign_timeline_sequence_id) => {
            var recCampaignTimelineSequence = this.databaseManager.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence.campaign_timeline_id == i_campaign_timeline_id) {
                this.databaseManager.table_campaign_timeline_sequences().openForEdit(campaign_timeline_sequence_id);
                var recEditCampaignTimelineSequence = this.databaseManager.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
                recEditCampaignTimelineSequence.sequence_index = i_sequenceIndex;
                recEditCampaignTimelineSequence.sequence_count = 0;
                updatedSequence = true;
            }
        });

        // i_campaign_timeline_id was not found in the sequencer so create new record
        if (updatedSequence == false) {
            var table_campaign_timeline_sequences = this.databaseManager.table_campaign_timeline_sequences();
            var recCampaignTimelineSequence = table_campaign_timeline_sequences.createRecord();
            recCampaignTimelineSequence.sequence_index = i_sequenceIndex;
            recCampaignTimelineSequence.sequence_count = 0;
            recCampaignTimelineSequence.campaign_timeline_id = i_campaign_timeline_id;
            recCampaignTimelineSequence.campaign_id = i_campaign_id;
            table_campaign_timeline_sequences.addRecord(recCampaignTimelineSequence, undefined);
        }
        this.addPendingTables(['table_campaign_timeline_sequences']);
    }

    /**
     get a scene block playerdata
     @method getScenePlayerdataBlock
     @param {Number} i_scene_id
     @param {Number} i_player_data_id
     @return {Number} i_player_data_id
     **/
    getScenePlayerdataBlock(i_scene_id, i_player_data_id) {
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        // this.databaseManager.table_player_data().openForEdit(i_scene_id);
        var recPlayerData = this.databaseManager.table_player_data().getRec(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data)
        var foundSnippet = $(domPlayerData).find('[id="' + i_player_data_id + '"]');
        return foundSnippet[0];
    }

    /**
     Assign viewers (screen divisions) on the timeline to channels, so we get one viewer per channel
     @method assignViewersToTimelineChannels
     @param {Number} i_campaign_timeline_board_template_id
     @param {Object} i_viewers a json object with all viewers
     @param {Array} i_channels a json object with all channels
     @return none
     **/
    assignViewersToTimelineChannels(i_campaign_timeline_board_template_id, i_viewers, i_channels): void {
        var viewerChanels = this.databaseManager.table_campaign_timeline_board_viewer_chanels();
        for (var i in i_viewers) {
            var viewerChanel = viewerChanels.createRecord();
            viewerChanel.campaign_timeline_board_template_id = i_campaign_timeline_board_template_id;
            viewerChanel.board_template_viewer_id = i_viewers[i];
            viewerChanel.campaign_timeline_chanel_id = i_channels.shift();
            viewerChanels.addRecord(viewerChanel, undefined);
        }
        this.addPendingTables(['table_campaign_timeline_board_viewer_chanels']);
    }

    /**
     Create a campaign timelime scheduler record for new timeline
     @method createCampaignTimelineScheduler
     @param {Number} i_campaign_id
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    createCampaignTimelineScheduler(i_campaign_id, i_campaign_timeline_id): void {
        var startDate = new Date();
        var endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        var dateStart = startDate.getMonth() + 1 + '/' + startDate.getDate() + '/' + startDate.getFullYear() + ' 12:00 AM';
        var dateEnd = endDate.getMonth() + 1 + '/' + endDate.getDate() + '/' + endDate.getFullYear() + ' 12:00 AM';
        var table_campaign_timeline_schedules = this.databaseManager.table_campaign_timeline_schedules();
        var recCampaignTimelineSchedules = table_campaign_timeline_schedules.createRecord();
        recCampaignTimelineSchedules.campaign_timeline_id = i_campaign_timeline_id;
        recCampaignTimelineSchedules.custom_duration = 'True';
        recCampaignTimelineSchedules.duration = 3600;
        recCampaignTimelineSchedules.repeat_type = 1;
        recCampaignTimelineSchedules.week_days = 127;
        recCampaignTimelineSchedules.conflict = false;
        recCampaignTimelineSchedules.pattern_name = 'pattern';
        recCampaignTimelineSchedules.priority = 1;
        recCampaignTimelineSchedules.start_date = dateStart;
        recCampaignTimelineSchedules.end_date = dateEnd;
        table_campaign_timeline_schedules.addRecord(recCampaignTimelineSchedules, undefined);
        this.addPendingTables(['table_campaign_timeline_schedules']);
    }

    /**
     Get a list of all campaigns per the account
     @method getCampaignIDs
     @return {Array} campaigns
     **/
    getCampaignIDs(): Array<number> {
        var campaignsIds = [];
        $(this.databaseManager.table_campaigns().getAllPrimaryKeys()).each((k, campaign_id) => {
            campaignsIds.push(campaign_id);
        });
        return campaignsIds;
    }

    /**
     Translate an injected id to a table_player_data scene id
     @method createPseudoSceneID
     @param {Number} getSceneIdFromPseudoId
     @return {Number} scene id
     **/
    getSceneIdFromPseudoId(i_pseudo_id) {
        var found = undefined;
        var scenes = this.getScenes();
        _.each(scenes, (domPlayerData, scene_id) => {
            var pseudo_id = $(domPlayerData).find('Player').eq(0).attr('id');
            if (pseudo_id == i_pseudo_id)
                found = scene_id;
        });
        return found;
    }

    /**
     Returns all scenes
     @method getSceneMime
     @param {Number} i_sceneID
     @return {Object} scene names
     **/
    getSceneMimeType(i_sceneID, i_playerDataModels: List<PlayerDataModel>): string {
        var found = i_playerDataModels.find((i_playerDataModel: PlayerDataModel) => {
            var domPlayerData = i_playerDataModel.getPlayerDataValue();
            return i_sceneID == jXML(domPlayerData).find('Player').attr('id')
        })
        return jXML(found).find('Player').attr('mimeType');
    }

    /**
     Bind the template (screen division template)to the specified timeline (i_campaign_timeline_id).
     We need to also provide the board_template_id (screen template of the global board) as well as
     the campaign's board_id to complete the binding
     @method assignTemplateToTimeline
     @param {Number} i_campaign_timeline_id to assign to template
     @param {Number} i_board_template_id is the global board id (does not belong to campaign) to assign to the template
     @param {Number} i_campaign_board_id is the campaign specific board id that will be bound to the template
     @return {Number} campaign_timeline_board_template_id
     **/
    assignTemplateToTimeline(i_campaign_timeline_id, i_board_template_id, i_campaign_board_id): number {
        var timelineTemplate = this.databaseManager.table_campaign_timeline_board_templates();
        var timelineScreen = timelineTemplate.createRecord();
        timelineScreen.campaign_timeline_id = i_campaign_timeline_id;
        timelineScreen.board_template_id = i_board_template_id;
        timelineScreen.campaign_board_id = i_campaign_board_id;
        timelineTemplate.addRecord(timelineScreen, undefined);
        this.addPendingTables(['table_campaign_timeline_board_templates']);
        return timelineScreen['campaign_timeline_board_template_id'];
    }

    /**
     Create channels and assign these channels to the timeline
     @method createTimelineChannels
     @param {Number} i_campaign_timeline_id the timeline id to assign channel to
     @param {Object} i_viewers we use viewer as a reference count to know how many channels to create (i.e.: one per channel)
     @return {Array} createdChanels array of channel ids created
     **/
    createTimelineChannels(i_campaign_timeline_id, i_viewers): Array<any> {
        var createdChanels = [];
        var x = 0;
        for (var i in i_viewers) {
            x++;
            var chanels = this.databaseManager.table_campaign_timeline_chanels();
            var chanel = chanels.createRecord();
            chanel.chanel_name = "CH" + x;
            chanel.campaign_timeline_id = i_campaign_timeline_id;
            chanels.addRecord(chanel, undefined);
            createdChanels.push(chanel['campaign_timeline_chanel_id']);
        }
        this.addPendingTables(['table_campaign_timeline_chanels']);
        return createdChanels;
    }

    /**
     Set a timeline's total duration
     @method setTimelineTotalDuration
     @param {Number} i_campaign_timeline_id
     @param {Number} i_totalDuration
     **/
    setTimelineTotalDuration(i_campaign_timeline_id, i_totalDuration): void {
        this.databaseManager.table_campaign_timelines().openForEdit(i_campaign_timeline_id);
        var recCampaignTimeline = this.databaseManager.table_campaign_timelines().getRec(i_campaign_timeline_id);
        recCampaignTimeline['timeline_duration'] = i_totalDuration;
        this.addPendingTables(['table_campaign_timelines']);
    }

    /**
     Set a station record via object arg into sdk table_branch_stations
     **/
    setStationRecordValue(i_native_station_id, field, value) {
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each((k, branch_station_id) => {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                this.databaseManager.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                recBranchStationEdit[field] = value;
            }
        });
        this.addPendingTables(['table_branch_stations']);
    }

    /**
     Remove the enitre campaigns and it's related boards
     @method removeCampaignEntirely
     @param {Number} i_campaign_id
     **/
    removeCampaignEntirely(i_campaign_id): void {
        var timelineIDs = this.getCampaignTimelines(i_campaign_id);
        for (var i = 0; i < timelineIDs.length; i++) {
            var timelineID = timelineIDs[i];
            var boardTemplateID = this.getGlobalTemplateIdOfTimeline(timelineID);
            this.removeTimelineFromCampaign(timelineID);
            var campaignTimelineBoardTemplateID = this.removeBoardTemplateFromTimeline(timelineID);
            this.removeTimelineBoardViewerChannels(campaignTimelineBoardTemplateID);
            this.removeBoardTemplate(boardTemplateID);
            this.removeBoardTemplateViewers(boardTemplateID);
            this.removeTimelineFromSequences(timelineID);
            this.removeSchedulerFromTime(timelineID);

            var channelsIDs = this.getChannelsOfTimeline(timelineID);
            for (var n = 0; n < channelsIDs.length; n++) {
                var channelID = channelsIDs[n];
                this.removeChannelFromTimeline(channelID);

                var blockIDs = this.getChannelBlocks(channelID);
                for (var x = 0; x < blockIDs.length; x++) {
                    var blockID = blockIDs[x];
                    this.removeBlockFromTimelineChannel(blockID);
                }
            }
        }
        this.removeCampaign(i_campaign_id);
        this.removeCampaignBoard(i_campaign_id);

        // check to see if any other campaigns are left, do some clean house and remove all campaign > boards
        var campaignIDs = this.getCampaignIDs();
        if (campaignIDs.length == 0)
            this.removeAllBoards();
    }

    /**
     Create a new player (a.k.a block) and add it to the specified channel_id
     @method createNewChannelPlayer
     **/
    createNewChannelPlayer(i_campaign_timeline_chanel_id: number, i_addContents: IAddContents, i_boilerPlate, i_offset: number) {
        con('adding block to channel ' + i_campaign_timeline_chanel_id);
        var timelinePlayers = this.databaseManager.table_campaign_timeline_chanel_players();
        var recTimelinePlayer = timelinePlayers.createRecord();
        var player_data = i_boilerPlate.getDefaultPlayerData(PLACEMENT_CHANNEL, i_addContents.resourceId);

        // dealing with embedded scene, override player_data with scene handle
        if (!_.isUndefined(i_addContents.sceneData))
            player_data = '<Player hDataSrc="' + i_addContents.sceneData.scene_id + '"/>';

        recTimelinePlayer.player_data = player_data;
        recTimelinePlayer.campaign_timeline_chanel_id = i_campaign_timeline_chanel_id;
        recTimelinePlayer.player_duration = 10;
        recTimelinePlayer.player_offset_time = i_offset;
        timelinePlayers.addRecord(recTimelinePlayer, null);

        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Returns the record for a station id
     @method getStationRecord
     @param {Number} i_native_station_id
     @return {Object} recBranchStation
     **/
    getStationRecord(i_native_station_id) {
        var record;
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each((k, branch_station_id) => {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                record = recBranchStation;
            }
        });
        return record;
    }

    /**
     Remove the entire campaign, but keep the board that was created with it as we can still use it in other campaign setups
     @method removeCampaignKeepBoards
     @param {Number} i_campaign_id
     **/
    removeCampaignKeepBoards(i_campaign_id): void {
        var timelineIDs = this.getCampaignTimelines(i_campaign_id);
        for (var i = 0; i < timelineIDs.length; i++) {
            var timelineID = timelineIDs[i];
            this.removeTimelineFromCampaign(timelineID);
            var campaignTimelineBoardTemplateID = this.removeBoardTemplateFromTimeline(timelineID);
            this.removeTimelineBoardViewerChannels(campaignTimelineBoardTemplateID);
            this.removeTimelineFromSequences(timelineID);
            this.removeSchedulerFromTime(timelineID);
            var channelsIDs = this.getChannelsOfTimeline(timelineID);
            for (var n = 0; n < channelsIDs.length; n++) {
                var channelID = channelsIDs[n];
                this.removeChannelFromTimeline(channelID);
                var blockIDs = this.getChannelBlocks(channelID);
                for (var x = 0; x < blockIDs.length; x++) {
                    var blockID = blockIDs[x];
                    this.removeBlockFromTimelineChannel(blockID);
                }
            }
        }
        this.removeCampaign(i_campaign_id);
        this.removeCampaignBoard(i_campaign_id);
    }

    /**
     Remove a campaign record
     @method removeCampaign
     @param {Number} i_campaign_id
     @return none
     **/
    removeCampaign(i_campaign_id) {
        this.databaseManager.table_campaigns().openForDelete(i_campaign_id);
        this.addPendingTables(['table_campaigns']);
    }

    /**
     Get Scene player data
     @method getScenePlayerdata
     @param {Number} i_scene_id
     @return {Object} XML scene player data
     **/
    getScenePlayerdata(i_scene_id) {
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        return this.getScenePlayerRecord(i_scene_id)['player_data_value'];
    }

    /**
     Get all timeline ids for specified campaign
     @method getCampaignTimelines
     @param {Number} i_campaign_id
     @return {Array} timeline ids
     **/
    getCampaignTimelines(i_campaign_id): Array<number> {
        var timelineIDs = [];
        $(this.databaseManager.table_campaign_timelines().getAllPrimaryKeys()).each((k, campaign_timeline_id) => {
            var recCampaignTimeline = this.databaseManager.table_campaign_timelines().getRec(campaign_timeline_id);
            if (recCampaignTimeline['campaign_id'] == i_campaign_id) {
                timelineIDs.push(campaign_timeline_id);
            }
        });
        this.addPendingTables(['table_campaign_timelines']);
        return timelineIDs;
    }

    /**
     save new station name
     @method setStationName
     @param {Number} branch_station_id
     @param {String} i_callBack
     **/
    setStationName(i_stationID, i_name) {
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each((k, branch_station_id) => {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_stationID) {
                this.databaseManager.table_branch_stations().openForEdit(branch_station_id);
                var recBranch = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                recBranch['station_name'] = i_name;
            }
        });
        this.addPendingTables(['table_branch_stations']);
    }

    /**
     Get all the global board template ids of a timeline
     @method getGlobalTemplateIdOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} foundGlobalBoardTemplatesIDs global board template ids
     **/
    getGlobalTemplateIdOfTimeline(i_campaign_timeline_id): number {
        var found = [];
        $(this.databaseManager.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each((k, table_campaign_timeline_board_template_id) => {
            var recCampaignTimelineBoardTemplate = this.databaseManager.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
            if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == i_campaign_timeline_id) {
                found.push(recCampaignTimelineBoardTemplate['board_template_id']);
            }
        });
        this.addPendingTables(['table_campaign_timeline_board_templates']);
        return found[0];
    }

    /**
     Remove a timeline from a campaign.
     @method removeTimelineFromCampaign
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    removeTimelineFromCampaign(i_campaign_timeline_id): void {
        this.databaseManager.table_campaign_timelines().openForDelete(i_campaign_timeline_id);
        this.addPendingTables(['table_campaign_timelines']);
    }

    /**
     Remove board template from timeline
     @method removeBoardTemplateFromTimeline
     @param {Number} i_timeline_id
     @return {Number} campaign_timeline_board_template_id
     **/
    removeBoardTemplateFromTimeline(i_timeline_id): number {
        var campaign_timeline_board_template_id = this.getTemplatesOfTimeline(i_timeline_id)[0];
        this.databaseManager.table_campaign_timeline_board_templates().openForDelete(campaign_timeline_board_template_id);
        this.addPendingTables(['table_campaign_timeline_board_templates']);
        return campaign_timeline_board_template_id;
    }

    /**
     Remove blocks (a.k.a players) from all campaign that use the specified resource_id (native id)
     @method removeBlocksWithResourceID
     @param {Number} i_resource_id
     @return none
     **/
    removeBlocksWithResourceID(i_resource_id) {
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var xPlayerData = parser.xml2js(playerData);
            var resourceID = undefined;
            try {
                resourceID = xPlayerData['Player']['Data']['Resource']['_hResource'];
            } catch (e) {
            }
            if (resourceID != undefined && resourceID == i_resource_id) {
                this.removeBlockFromTimelineChannel(campaign_timeline_chanel_player_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Remove a block (i.e.: player) from campaign > timeline > channel
     @method removeBlockFromTimelineChannel
     @param {Number} i_block_id
     @return none
     **/
    removeBlockFromTimelineChannel(i_block_id): void {
        var status = this.databaseManager.table_campaign_timeline_chanel_players().openForDelete(i_block_id);
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Remove board template viewers
     @method removeTimelineBoardViewerChannels
     @param {Number} i_campaign_timeline_board_template_id
     @return none
     **/
    removeTimelineBoardViewerChannels(i_campaign_timeline_board_template_id) {
        $(this.databaseManager.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each((k, campaign_timeline_board_viewer_chanel_id) => {
            var recCampaignTimelineViewerChanels = this.databaseManager.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineViewerChanels['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                this.databaseManager.table_campaign_timeline_board_viewer_chanels().openForDelete(campaign_timeline_board_viewer_chanel_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_board_viewer_chanels']);
    }

    /**
     Remove board template
     @method removeBoardTemplate
     @param {Number} i_campaign_timeline_board_template_id
     **/
    removeBoardTemplate(i_board_template_id): number {
        this.databaseManager.table_board_templates().openForDelete(i_board_template_id);
        this.addPendingTables(['table_board_templates']);
        return i_board_template_id;
    }

    /**
     Remove board template viewers
     @method removeBoardTemplateViewers
     @param {Number} i_board_template_id
     @return {Array} boardTemplateViewerIDs
     **/
    removeBoardTemplateViewers(i_board_template_id): Array<number> {
        var boardTemplateViewerIDs = [];
        $(this.databaseManager.table_board_template_viewers().getAllPrimaryKeys()).each((k, board_template_viewer_id) => {
            var recBoardTemplateViewers = this.databaseManager.table_board_template_viewers().getRec(board_template_viewer_id);
            if (recBoardTemplateViewers['board_template_id'] == i_board_template_id) {
                var a = this.databaseManager.table_board_template_viewers().openForDelete(board_template_viewer_id);
                boardTemplateViewerIDs.push(board_template_viewer_id);
            }
        });
        this.addPendingTables(['table_board_template_viewers']);
        return boardTemplateViewerIDs;
    }

    /**
     Get a global board record (not the board that assigned to a campaign, but global).
     Keep in mind that we only give as an argument the campaign > timeline > board > template id, so we have to query it and find
     out to which global board its pointing so we can grab the correct record for the correct global board.
     @method getGlobalBoardRecFromTemplate
     @param {Number} i_campaign_timeline_board_template_id to reverse map into global board
     @return {Object} global board record;
     **/
    getGlobalBoardRecFromTemplate(i_campaign_timeline_board_template_id) {
        var recCampaignTimelineBoardTemplate = this.databaseManager.table_campaign_timeline_board_templates().getRec(i_campaign_timeline_board_template_id);
        var board_template_id = recCampaignTimelineBoardTemplate['board_template_id'];
        var recBoardTemplate = this.databaseManager.table_board_templates().getRec(board_template_id);
        var board_id = recBoardTemplate['board_id'];
        var recBoard = this.databaseManager.table_boards().getRec(board_id);
        return recBoard;
    }

    /**
     Set a block's record using key value pair
     The method uses generic key / value fields so it can set any part of the record.
     @method setBlockRecord
     @param {Number} i_block_id
     @param {String} i_key
     @param {Number} i_value
     @return none
     **/
    setBlockRecord(i_block_id, i_key, i_value) {
        this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(i_block_id);
        var recEditBlock = this.databaseManager.table_campaign_timeline_chanel_players().getRec(i_block_id);
        recEditBlock[i_key] = i_value;
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Remove a timeline from sequences
     @method removeTimelineFromSequences
     @param {Number} i_timeline_id
     @return none
     **/
    removeTimelineFromSequences(i_campaign_timeline_id): void {
        $(this.databaseManager.table_campaign_timeline_sequences().getAllPrimaryKeys()).each((k, campaign_timeline_sequence_id) => {
            var recCampaignTimelineSequence = this.databaseManager.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence['campaign_timeline_id'] == i_campaign_timeline_id) {
                this.databaseManager.table_campaign_timeline_sequences().openForDelete(campaign_timeline_sequence_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_sequences']);
    }

    /**
     Set a block (a.k.a player) on the timeline_channel to a specified length in total seconds.
     @method setBlockTimelineChannelBlockLength
     @param {Number} i_campaign_timeline_chanel_player_id {string} plyer / block id
     @param {Number} i_hours total hours to play
     @param {Number} i_minutes total minutes to play
     @param {Number} i_seconds total seconds to play
     @return none
     **/
    setBlockTimelineChannelBlockLength(i_campaign_timeline_chanel_player_id, i_hours, i_minutes, i_seconds) {
        var totalSecInMin = 60;
        var totalSecInHour = totalSecInMin * 60;
        var totalSeconds = parseInt(i_seconds) + (parseInt(i_minutes) * totalSecInMin) + (parseInt(i_hours) * totalSecInHour)

        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            // var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (campaign_timeline_chanel_player_id == i_campaign_timeline_chanel_player_id) {
                this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                var recPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                recPlayer.player_duration = totalSeconds;
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
        // var returnData = {
        //     campaignTimelineChanelPlayerID: i_campaign_timeline_chanel_player_id,
        //     totalSeconds: totalSeconds
        // }
        // this.databaseManager.fire(Pepper['BLOCK_LENGTH_CHANGED'], this, null, returnData);
    }

    /**
     Set a station so its bound to campaign_id
     @method SetStationCampaignID
     @param {Number} i_native_station_id
     @param {Number} i_campaign_id
     **/
    setStationCampaignID(i_native_station_id, i_campaign_id) {
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each((k, branch_station_id) => {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                this.databaseManager.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                var campaign_board_id = this.getCampaignBoardIdFromCampaignId(i_campaign_id);
                recBranchStationEdit.campaign_board_id = campaign_board_id;
            }
        });
        this.addPendingTables(['table_branch_stations']);
    }

    /**
     Remove a schedule from timeline
     @method removeSchedulerFromTime
     @param {Number} i_campaign_timeline_id
     @return none
     **/
    removeSchedulerFromTime(i_campaign_timeline_id): void {
        $(this.databaseManager.table_campaign_timeline_schedules().getAllPrimaryKeys()).each((k, campaign_timeline_schedule_id) => {
            var recCampaignTimelineSchedule = this.databaseManager.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
            if (recCampaignTimelineSchedule.campaign_timeline_id == i_campaign_timeline_id) {
                this.databaseManager.table_campaign_timeline_schedules().openForDelete(campaign_timeline_schedule_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_schedules']);
    }

    /**
     Remove a timeline from a campaign.
     @method removeResource
     @param {Number} i_resource_id
     @return none
     **/
    removeResource(i_resource_id) {
        this.databaseManager.table_resources().openForDelete(i_resource_id);
        this.addPendingTables(['table_resources']);
    }

    /**
     Remove all refernce to a resource id from within Scenes > BlockCollections that refer to that particulat resource id
     In other words, check all scenes for existing block collections, and if they refer to resource id, remove that entry
     @method removeResourceFromBlockCollectionInScenes
     @param {Number} i_resource_id resource id to search for and remove in all scenes > BlockCollections
     **/
    removeResourceFromBlockCollectionInScenes(i_resource_id) {
        var self = this;
        $(self.databaseManager.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BlockLabels.BLOCKCODE_COLLECTION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('Collection').children().each(function (k, page) {
                        var resource_id = $(page).find('Resource').attr('hResource');
                        if (i_resource_id == resource_id) {
                            $(page).remove();
                            currentSceneID = self.sterilizePseudoId(currentSceneID);
                            self.databaseManager.table_player_data().openForEdit(currentSceneID);
                            var player_data = self.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
        this.addPendingTables(['table_player_data']);
    }

    removeResourceFromBlockLocationInScenes(i_resource_id) {
        var self = this;
        $(self.databaseManager.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BlockLabels.LOCATION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('Fixed').children().each(function (k, page) {
                        var resource_id = $(page).find('Resource').attr('hResource');
                        if (i_resource_id == resource_id) {
                            $(page).remove();
                            currentSceneID = self.sterilizePseudoId(currentSceneID);
                            self.databaseManager.table_player_data().openForEdit(currentSceneID);
                            var player_data = self.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
        $(self.databaseManager.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var currentSceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="' + BlockLabels.LOCATION + '"]').each(function (i, playerDataBlockCollection) {
                    $(playerDataBlockCollection).find('GPS').children().each(function (k, page) {
                        var resource_id = $(page).find('Resource').attr('hResource');
                        if (i_resource_id == resource_id) {
                            $(page).remove();
                            currentSceneID = self.sterilizePseudoId(currentSceneID);
                            self.databaseManager.table_player_data().openForEdit(currentSceneID);
                            var player_data = self.xmlToStringIEfix(domSceneData);
                            recPlayerData['player_data_value'] = player_data;
                        }
                    });
                });
            });
        });
        this.addPendingTables(['table_player_data']);
    }

    /**
     Remove all scene players that use resources (3100 & 3130) and that include the specified resource id
     @method removeAllScenePlayersWithResource
     @param {Number} i_resource_id
     **/
    removeAllScenePlayersWithResource(i_resource_id) {
        var self = this;
        $(self.databaseManager.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id) {
            var recPlayerData = self.databaseManager.table_player_data().getRec(player_data_id);
            var domSceneData = $.parseXML(recPlayerData['player_data_value']);
            var sceneID = $(domSceneData).find('Player').eq(0).attr('id');
            $(domSceneData).find('Player').each(function (i, playerData) {
                $(playerData).find('[player="3100"],[player="3130"],[player="3140"]').each(function (i, playeResourceData) {
                    var playerDataID = $(this).attr('id');
                    var hResource = $(playeResourceData).find('Resource').attr('hResource');
                    if (hResource == i_resource_id) {
                        self.removeScenePlayer(sceneID, playerDataID);
                    }
                });
            });
        });
        this.addPendingTables(['table_player_data']);
    }

    /**
     Remove the resource from any block collection which resides in campaign timeline channels that uses that resource in its collection list
     @method removeResourceFromBlockCollectionsInChannel
     @param {Number} i_resource_id
     @return none
     **/
    removeResourceFromBlockCollectionsInChannel(i_resource_id) {
        var self = this;
        $(self.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (parseInt(blockType) == BlockLabels.BLOCKCODE_COLLECTION) {
                $(domPlayerData).find('Collection').children().each(function (k, page) {
                    var resource_hResource;
                    var type = $(page).attr('type');
                    if (type == 'resource') {
                        resource_hResource = $(page).find('Resource').attr('hResource');
                        if (resource_hResource == i_resource_id) {
                            $(page).remove();
                            var player_data = self.xmlToStringIEfix(domPlayerData)
                            self.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            self.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    removeResourceFromBlockLocationInChannel(i_resource_id) {
        var self = this;
        $(self.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (parseInt(blockType) == BlockLabels.LOCATION) {
                $(domPlayerData).find('Fixed').children().each(function (k, page) {
                    var resource_hResource;
                    var type = $(page).attr('type');
                    if (type == 'resource') {
                        resource_hResource = $(page).find('Resource').attr('hResource');
                        if (resource_hResource == i_resource_id) {
                            $(page).remove();
                            var player_data = self.xmlToStringIEfix(domPlayerData)
                            self.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            self.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
        $(self.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
            var recCampaignTimelineChannelPlayer = self.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            var playerData = recCampaignTimelineChannelPlayer['player_data'];
            var domPlayerData = $.parseXML(playerData);
            var blockType = $(domPlayerData).find('Player').attr('player');
            if (parseInt(blockType) == BlockLabels.LOCATION) {
                $(domPlayerData).find('GPS').children().each(function (k, page) {
                    var resource_hResource;
                    var type = $(page).attr('type');
                    if (type == 'resource') {
                        resource_hResource = $(page).find('Resource').attr('hResource');
                        if (resource_hResource == i_resource_id) {
                            $(page).remove();
                            var player_data = self.xmlToStringIEfix(domPlayerData)
                            self.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                            self.setCampaignTimelineChannelPlayerRecord(campaign_timeline_chanel_player_id, 'player_data', player_data);
                        }
                    }
                });
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Get all the campaign > timeline > channels ids of a timeline
     @method getChannelsOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} channel ids
     **/
    getChannelsOfTimeline(i_campaign_timeline_id): Array<number> {
        var foundChannelsIDs = [];
        $(this.databaseManager.table_campaign_timeline_chanels().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_id) => {
            var recCampaignTimelineChannel = this.databaseManager.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
            if (i_campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {
                foundChannelsIDs.push(campaign_timeline_chanel_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanels']);
        return foundChannelsIDs;
    }

    /**
     Get all the block IDs of a particular channel.
     Push them into an array so they are properly sorted by player offset time.
     @method getChannelBlocksIDs
     @param {Number} i_campaign_timeline_chanel_id
     @return {Array} foundBlocks
     **/
    getChannelBlocks(i_campaign_timeline_chanel_id): Array<number> {
        var foundBlocks = [];
        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each((k, campaign_timeline_chanel_player_id) => {
            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
            if (i_campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                foundBlocks.push(campaign_timeline_chanel_player_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
        return foundBlocks;
    }

    /**
     Get campaign schedule for timeline
     @method setCampaignsSchedule
     @param {Number} i_campaign_timeline_id
     @param {Object} i_key
     @param {Object} i_value
     **/
    setCampaignsSchedule(i_campaign_timeline_id, i_key, i_value) {
        $(this.databaseManager.table_campaign_timeline_schedules().getAllPrimaryKeys()).each((k, campaign_timeline_schedule_id) => {
            var recCampaignTimelineSchedule = this.databaseManager.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
            if (recCampaignTimelineSchedule.campaign_timeline_id == i_campaign_timeline_id) {
                this.databaseManager.table_campaign_timeline_schedules().openForEdit(campaign_timeline_schedule_id);
                var recScheduler = this.databaseManager.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
                recScheduler[i_key] = String(i_value);
            }
        });
        this.addPendingTables(['table_campaign_timeline_schedules']);
    }

    /**
     Remove station, delete it from internal sdk and push to server on save
     @method removeStation
     @param {Number} i_station
     **/
    removeStation(i_native_station_id) {
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each((k, branch_station_id) => {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                this.databaseManager.table_branch_stations().openForDelete(branch_station_id);
                this.databaseManager.table_station_ads().openForDelete(branch_station_id);
            }
        });
        this.addPendingTables(['table_station_ads', 'table_branch_stations']);
    }

    /**
     Set a player_id record in sdk on key with value
     The method uses generic key / value fields so it can set any part of the record.
     **/
    setCampaignTimelineChannelPlayerRecord(i_player_id, i_key, i_value) {
        this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(i_player_id);
        var recPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(i_player_id);
        recPlayer[i_key] = i_value;
        this.addPendingTables(['table_campaign_timeline_chanel_players']);
    }

    /**
     Remove campaign board_id
     @method removeCampaignBoard
     @param {Number} i_campaign_id
     @return none
     **/
    removeCampaignBoard(i_campaign_id): void {
        $(this.databaseManager.table_campaign_boards().getAllPrimaryKeys()).each((k, campaign_board_id) => {
            var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(campaign_board_id);
            if (recCampaignBoard['campaign_id'] == i_campaign_id) {
                this.databaseManager.table_campaign_boards().openForDelete(campaign_board_id);
            }
        });
        this.addPendingTables(['table_campaign_boards']);
    }

    /**
     Get i_campaign_id into campaign_board_id using local table_campaign_boards (not global boards)
     @method getCampaignIdFromCampaignBoardId
     @param {Number} i_campaign_board_id
     @return {Number} campaign_id
     **/
    getCampaignBoardIdFromCampaignId(i_campaign_id) {
        var found_campaign_board_id = -1;
        $(this.databaseManager.table_campaign_boards().getAllPrimaryKeys()).each((k, campaign_board_id) => {
            var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(campaign_board_id);
            if (recCampaignBoard['campaign_id'] == i_campaign_id)
                found_campaign_board_id = recCampaignBoard['campaign_board_id'];
        });
        return found_campaign_board_id;
    }

    /**
     Remove all boards in sdk
     @method removeAllBoards
     @return none
     **/
    removeAllBoards(): void {
        $(this.databaseManager.table_boards().getAllPrimaryKeys()).each((k, board_id) => {
            this.databaseManager.table_boards().openForDelete(board_id);
        });
        this.addPendingTables(['table_boards']);
    }

    /**
     Get all the campaign > timeline > board > template ids of a timeline
     @method getTemplatesOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} template ids
     **/
    getTemplatesOfTimeline(i_campaign_timeline_id): Array<number> {
        var foundTemplatesIDs = [];
        $(this.databaseManager.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each((k, table_campaign_timeline_board_template_id) => {
            var recCampaignTimelineBoardTemplate = this.databaseManager.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
            if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == i_campaign_timeline_id) {
                foundTemplatesIDs.push(table_campaign_timeline_board_template_id);
            }
        });
        this.addPendingTables(['table_campaign_timeline_board_templates']);
        return foundTemplatesIDs;
    }

    /**
     Get Scene player data as dom
     @method getScenePlayerdataDom
     @param {Number} i_sceneID
     @return {Object} dom
     **/
    getScenePlayerdataDom(i_scene_id) {
        i_scene_id = this.sterilizePseudoId(i_scene_id);
        var scene_player_data = this.getScenePlayerRecord(i_scene_id)['player_data_value'];
        return $.parseXML(scene_player_data)
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // below here need to review code
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     Get proof of play stats report
     @method getProofOfPlayStats
     @param {Function} i_callBack
     @param {Number} i_year
     @param {Number} i_playerData
     @return {Number} i_month clientId.
     **/
    getProofOfPlayStats(i_year, i_month, i_callBack) {
        this.m_loaderManager.requestAdsReport(function (data) {
            var report = $(data.report).find('Report');
            i_callBack(report);
        }, i_year, i_month)
    }

    /**
     Get list of all create account samples, both lite and pro
     @method getSampleList
     @param {Function} i_callBack
     **/
    getSampleList(i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/getResellerTemplates.ashx?callback=?';
        $.getJSON(url, function (data) {
            i_callBack(data);
        });
    }

    /**
     Push a command to remote station
     @method sendCommand
     @param {String} i_command
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    sendCommand(i_command, i_stationId, i_callBack) {
        var url = window.g_protocol + this.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + this.getUserData().userName + '&i_password=' + this.getUserData().userPass + '&i_stationId=' + i_stationId + '&i_command=' + i_command + '&i_param1=' + 'SignageStudioLite' + '&i_param2=' + '&callback=?';
        console.log(url)
        $.getJSON(url, i_callBack);
    }

    /**
     Push an event to a local station / server for Location based content, see parms for details
     Keep in mind this supports both local and remote events
     @method sendLocalEventGPS
     @param {String} i_mode local or remote
     @param {Number} i_stationId
     @param {Number} i_lat
     @param {Number} i_lng
     @param {Function} i_callBack
     @return {String) short url
     **/
    sendLocalEventGPS(i_mode, i_lat, i_lng, i_id, i_ip, i_port, i_callBack) {

        // example posts
        // curl "http://192.168.92.133:1024/sendLocalEvent?eventName=gps&eventParam=34.22447,-118.828"
        // https://sun.signage.me/WebService/sendCommand.ashx?i_user=d39@ms.com&i_password=xxxx&i_stationId=44&i_command=event&i_param1=gps&i_param2=34.22447,-118.828&callback=
        var url;
        var returnUrl;
        if (i_mode == "local") {
            url = 'http://' + i_ip + ':' + i_port + '/sendLocalEvent?eventName=gps&eventParam=' + i_lat + ',' + i_lng;
            returnUrl = url;
        } else {
            url = window.g_protocol + this.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + this.getUserData().userName + '&i_password=' + this.getUserData().userPass + '&i_stationId=' + i_id + '&i_command=event&i_param1=' + 'gps' + '&i_param2=' + i_lat + ',' + i_lng + '&callback=?';
            returnUrl = '//remoteServer' + '&i_stationId=' + i_id + '&i_command=event&i_param1=' + 'gps' + '&i_param2=' + i_lat + ',' + i_lng;
        }
        // console.log(url);
        if (i_mode == 'local')
            return returnUrl;

        try {
            $.ajax({
                url: url,
                dataType: "jsonp",
                type: "post",
                complete (response) {
                    if (i_callBack)
                        i_callBack(response.statusText);
                },
                error (jqXHR, exception) {
                    console.log(jqXHR, exception);
                    if (i_callBack)
                        i_callBack(exception);
                }
            });
        } catch (e) {
            console.log('error on ajax' + e);
        }
        return returnUrl;
    }

    /**
     Push a command to remote station
     @method getLocalization
     @param {String} i_command
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    getLocalization(i_lang, i_callBack) {
        $.getJSON(window.g_protocol + window.g_masterDomain + '/WebService/getLocalList.ashx?callback=?', function (data) {
            data = _.invert(data);
            if (i_lang == 'zh')
                i_lang = 'zh-CN';
            var local = data[i_lang];
            var url = window.g_protocol + window.g_masterDomain + '/WebService/getResourceBundlesJson.ashx?local=' + local + '&bundleList=studiolite&callback=?';
            $.getJSON(url, function (data) {
                i_callBack(data);
            });
        });
    }

    /**
     Push a command to remote station, this v2 has a fall back and returns null on fails
     @method getLocalizationNew
     @param {String} i_command
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    getLocalizationNew(i_lang, i_callBack) {
        // $.getJSON(window.g_protocol + window.g_masterDomain + '/WebService/getLocalList.ashx?callback=?', function (data) {
        //     data = _.invert(data);
        //     if (i_lang == 'zh')
        //         i_lang = 'zh-CN';
        //     var local = data[i_lang];
        //     var url = window.g_protocol + window.g_masterDomain + '/WebService/getResourceBundlesJson.ashx?local=' + local + '&bundleList=studiolite&callback=?';
        //     $.getJSON(url, function (data) {
        //         i_callBack(data);
        //     }).error(function () {
        //         i_callBack(null);
        //     });
        // }).error(function (e) {
        //     i_callBack(null);
        // });
    }

    /**
     Return the url address of StudioLite
     @method getStudioLiteURL
     @return {String} url address
     **/
    getStudioLiteURL() {
        var protocol = window.g_protocol;
        if (window.g_masterDomain == 'galaxy.signage.me')
            protocol = 'https://';
        return protocol + window.g_masterDomain + '/_studiolite-dist/studiolite.html';
    }

    /**
     Return the url address of StudioPro
     @method getStudioProURL
     @return {String} url address
     **/
    getStudioProURL() {
        var protocol = window.g_protocol;
        return window.g_protocol + window.g_masterDomain + '/WebService/signagestudio_d.aspx';
    }

    /**
     Create a new mediaCLOUD account
     @method createAccount
     @param {Function} i_callBack
     **/
    createAccount(i_businessName, i_userName, i_password, i_templateBusinessId, i_resellerId, i_firstName, i_lastName, i_contactEmail, i_workPhone, i_cellPhone, i_address, i_city, i_state, i_contry, i_zipcode, i_callback) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=CreateCustomerAccount'
        url += '&businessName=' + i_businessName;
        url += '&userName=' + i_userName;
        url += '&password=' + i_password;
        url += '&templateBusinessId=' + i_templateBusinessId;
        url += '&resellerId=' + i_resellerId;
        url += '&firstName=' + i_firstName;
        url += '&lastName=' + i_lastName;
        url += '&contactEmail=' + i_contactEmail;
        url += '&workPhone=' + i_workPhone;
        url += '&cellPhone=' + i_cellPhone;
        url += '&address=' + i_address;
        url += '&city=' + i_city;
        url += '&state=' + i_state;
        url += '&contry=' + i_contry;
        url += '&zipcode=' + i_zipcode;
        url += '&callback=?';
        console.log(url);
        $.getJSON(url, i_callback);
    }

    /**
     Get business user info
     @method GetBusinessUserInfo
     @param {Function} i_callBack
     **/
    getAccountStatus(i_businessId, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=GetAccountStatus&businessId=' + i_businessId + '&callback=?';
        $.getJSON(url, i_callBack);
    }

    /**
     Get business user info
     @method GetBusinessUserInfo
     @param {Function} i_callBack
     **/
    resetPassword(i_email, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=ResetPassword&userName=' + i_email + '&callback=?';
        $.getJSON(url, i_callBack);
    }

    /**
     Get business user info
     @method ChangePassword
     @param {Function} i_callBack
     **/
    changePassword(i_email, i_oldPassword, i_newPassword, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=ChangePassword&userName=' + i_email + '&oldPassword=' + i_oldPassword + '&newPassword=' + i_newPassword + '&callback=?';
        $.getJSON(url, i_callBack);
    }

    /**
     Get business user info
     @method ChangeBusinessName
     @param {Function} i_callBack
     **/
    changeBusinessName(i_email, i_password, i_businessName, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=ChangeBusinessName&userName=' + i_email + '&password=' + i_password + '&busnessName=' + i_businessName + '&callback=?';
        $.getJSON(url, i_callBack);
    }

    /**
     Get business user info
     @method GetBusinessUserInfo
     @param {Function} i_callBack
     **/
    getBusinessUserInfo(i_user, i_pass, i_callBack) {
        var url = window.g_protocol + window.g_masterDomain + '/WebService/createNewAccount.ashx?command=GetBusinessUserInfo&userName=' + i_user + '&password=' + i_pass + '&callback=?';
        $.getJSON(url, i_callBack);
    }

    /**
     Push an event to remote station
     @method sendEvent
     @param {String} i_eventName
     @param {Number} i_stationId
     @param {Function} i_callBack
     **/
    sendEvent(i_eventName, i_stationId, i_callBack) {
        var url = window.g_protocol + this.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + this.getUserData().userName + '&i_password=' + this.getUserData().userPass + '&i_stationId=' + i_stationId + '&i_command=event&i_param1=' + i_eventName + '&i_param2=' + '&callback=?';
        $.getJSON(url, i_callBack);
    }

    /**
     Send remote command to retrieve snapshot of a running station
     @method sendSnapshot
     @param {String} i_fileName
     @param {Number} i_quality
     @param {Number} i_stationId
     @param {Function} i_callBack
     @return {String} image path url
     **/
    sendSnapshot(i_fileName, i_quality, i_stationId, i_callBack) {
        var url = window.g_protocol + this.getUserData().domain + '/WebService/sendCommand.ashx?i_user=' + this.getUserData().userName + '&i_password=' + this.getUserData().userPass + '&i_stationId=' + i_stationId + '&i_command=' + 'captureScreen2' + '&i_param1=' + i_fileName + '&i_param2=' + i_quality + '&callback=?';
        $.getJSON(url, i_callBack);
        var path = window.g_protocol + this.getUserData().domain + '/Snapshots/business' + this.getUserData().businessID + "/station" + i_stationId + '/' + i_fileName + '.jpg';
        // console.log(path);
        return path;
    }

    /**
     Build URL for player preview using supplied player parameters
     **/
    _livePreviewGetLink(i_playerParams, i_bannerMode): string {
        var rc4v2 = new RC4V2();
        var playerParams = rc4v2.encrypt(i_playerParams, '8547963624824263');
        var domain = this.getUserData().domain;
        var eri = this.getUserData().eri;
        var url = window.g_protocol + domain + '/WebService/SignagePlayerApp.html?eri=' + eri + '&playerParams=' + playerParams + '&banner=' + i_bannerMode;
        // console.log(url);
        return url;
    }

    /**
     Create a live preview URL for campaign
     @method livePreviewCampaign
     @param {Number} i_campaignID
     @param {Number} i_bannerMode
     @return {String} url
     **/
    livePreviewCampaign(i_campaignID, i_bannerMode) {
        var campaignBoardId = this.getCampaignBoardIdFromCampaignId(i_campaignID);
        var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(campaignBoardId);
        var campaignNativeID = recCampaignBoard['native_id'];
        var playerParams = this.getUserData().businessID + ',1,' + campaignNativeID;
        return this._livePreviewGetLink(playerParams, i_bannerMode);
    }

    /**
     Create a live preview URL for campaign
     @method livePreviewTimeline
     @param {Number} i_campaignID
     @param {Number} i_timelineID
     @param {Number} i_bannerMode
     @return {String} url
     **/
    livePreviewTimeline(i_campaignID, i_timelineID, i_bannerMode) {

        var campaignBoardId = this.getCampaignBoardIdFromCampaignId(i_campaignID);
        var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(campaignBoardId);
        var campaignNativeID = recCampaignBoard['native_id'];
        var recCampaignTimeline = this.getCampaignTimelineRecord(i_timelineID);
        var timelineNativeID = recCampaignTimeline['native_id'];
        var playerParams = this.getUserData().businessID + ',2,' + campaignNativeID + "," + timelineNativeID;
        return this._livePreviewGetLink(playerParams, i_bannerMode);
    }

    /**
     Create a live preview URL for a scene
     **/
    livePreviewScene(sceneID, i_bannerMode): string {
        // var sceneID = this.getSceneIdFromPseudoId(i_scene_id);
        var recPlayerData = this.getScenePlayerRecord(sceneID);
        var nativeID = recPlayerData['native_id'];
        var playerParams = this.getUserData().businessID + ',3,' + nativeID;
        return this._livePreviewGetLink(playerParams, i_bannerMode);
    }

    /**
     get a scene's default length
     @method getSceneDuration
     @param {number} i_scene_id
     @return {number} total seconds
     **/
    getSceneDuration(i_scene_id) {

        i_scene_id = this.sterilizePseudoId(i_scene_id);
        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        var totalInSeconds = 0;

        var recPlayerData = this.getScenePlayerRecord(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data);
        var xSnippet = $(domPlayerData).find('Scene');
        var totalSeconds = parseInt(xSnippet.attr('defaultDuration'));

        totalInSeconds = totalSeconds;
        if (totalSeconds >= 3600) {
            hours = Math.floor(totalSeconds / 3600);
            totalSeconds = totalSeconds - (hours * 3600);
        }
        if (totalSeconds >= 60) {
            minutes = Math.floor(totalSeconds / 60);
            seconds = totalSeconds - (minutes * 60);
        }
        if (hours == 0 && minutes == 0)
            seconds = totalSeconds;

        var playbackLength = {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            totalInSeconds: totalInSeconds
        };
        return playbackLength;
    }

    /**
     Set a scene's default length (can be overridden on timeline)
     @method setSceneDuration
     @param {number} i_scene_id
     @param {string} hours
     @param {string} minutes
     @param {string} seconds
     **/
    setSceneDuration(i_scene_id, i_hours, i_minutes, i_seconds) {

        i_scene_id = this.sterilizePseudoId(i_scene_id);
        var totalSecInMin = 60
        var totalSecInHour = totalSecInMin * 60
        var totalSeconds = parseInt(i_seconds) + (parseInt(i_minutes) * totalSecInMin) + (parseInt(i_hours) * totalSecInHour);
        var recPlayerData = this.getScenePlayerRecord(i_scene_id);
        var player_data = recPlayerData['player_data_value'];
        var domPlayerData = $.parseXML(player_data)
        var xSnippet = $(domPlayerData).find('Scene');
        xSnippet.attr('defaultDuration', totalSeconds);
        var player_data: any = (new XMLSerializer()).serializeToString(domPlayerData);
        this.setScenePlayerData(i_scene_id, player_data);
    }

    /**
     Returns all scenes
     @method getSceneNames
     @param {Number} i_playerData
     @return {Object} scene names
     **/
    getSceneNames() {
        var sceneNames: any = {};
        $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each(function (k, player_data_id: any) {
            var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
            var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
            sceneNames[player_data_id] = {
                label: ($(domPlayerData).find('Player').attr('label')),
                mimeType: $(domPlayerData).find('Player').attr('mimeType')
            };
        });
        return sceneNames;
    }


    /**
     Returns this model's attributes as...
     @method xmlToStringIEfix
     @param {Object} i_domPlayerData
     @return {String} xml string
     **/
    xmlToStringIEfix(i_domPlayerData) {
        var player_data = (new XMLSerializer()).serializeToString(i_domPlayerData);
        return this.ieFixEscaped(player_data);
    }

    /**
     "Good" old IE, always a headache, jXML workarounds....
     @method ieFixEscaped
     @param {String} escapedHTML
     @return {String}
     **/
    /**
     "Good" old IE, always a headache, jXML workarounds....
     @method ieFixEscaped
     @param {String} escapedHTML
     @return {String}
     **/
    ieFixEscaped(escapedHTML) {
        try {
            return escapedHTML.replace(/xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/<rss/gi, '<Rss').replace(/rss>/g, 'Rss>').replace(/<background/gi, '<Background').replace(/background>/gi, 'Background>').replace(/<appearance/gi, '<Appearance').replace(/appearance>/gi, 'Appearance>').replace(/<gradientpoints/gi, '<GradientPoints').replace(/gradientpoints>/gi, 'GradientPoints>').replace(/<aspectratio/gi, '<AspectRatio').replace(/aspectratio>/gi, 'AspectRatio>').replace(/<layout/gi, '<Layout').replace(/layout>/gi, 'Layout>').replace(/<title/gi, '<Title').replace(/title>/gi, 'Title>').replace(/<description/gi, '<Description').replace(/description>/gi, 'Description>').replace(/<data/gi, '<Data').replace(/data>/gi, 'Data>').replace(/<player/gi, '<Player').replace(/player>/gi, 'Player>').replace(/<players/gi, '<Players').replace(/players>/gi, 'Players>').replace(/<text/gi, '<Text').replace(/text>/gi, 'Text>').replace(/<eventCommands/gi, '<EventCommands').replace(/eventCommands>/gi, 'EventCommands>').replace(/<eventCommand/gi, '<EventCommand').replace(/eventCommand>/gi, 'EventCommand>').replace(/<border/gi, '<Border').replace(/border>/gi, 'Border>').replace(/<scene/gi, '<Scene').replace(/scene>/gi, 'Scene>').replace(/<clock/gi, '<Clock').replace(/clock>/gi, 'Clock>').replace(/<point/gi, '<Point').replace(/point>/gi, 'Point>').replace(/<video/gi, '<Video').replace(/video>/gi, 'Video>').replace(/<image/gi, '<Image').replace(/image>/gi, 'Image>').replace(/<label/gi, '<Label').replace(/label>/gi, 'Label>').replace(/<font/gi, '<Font').replace(/font>/gi, 'Font>').replace(/fontsize/gi, 'fontSize').replace(/startdate/gi, 'startDate').replace(/enddate/gi, 'endDate').replace(/fontcolor/gi, 'fontColor').replace(/fontfamily/gi, 'fontFamily').replace(/fontweight/gi, 'fontWeight').replace(/fontstyle/gi, 'fontStyle').replace(/bordercolor/gi, 'borderColor').replace(/borderthickness/gi, 'borderThickness').replace(/cornerradius/gi, 'cornerRadius').replace(/textdecoration/gi, 'textDecoration').replace(/textalign/gi, 'textAlign').replace(/hdatasrc/gi, 'hDataSrc').replace(/minrefreshtime/gi, 'minRefreshTime').replace(/itemspath/gi, 'itemsPath').replace(/slideshow/gi, 'slideShow').replace(/iteminterval/gi, 'itemInterval').replace(/playvideoinfull/gi, 'playVideoInFull').replace(/randomorder/gi, 'randomOrder').replace(/providertype/gi, 'providerType').replace(/fieldname/gi, 'fieldName').replace(/fieldtype/gi, 'fieldType').replace(/gradienttype/gi, 'gradientType').replace(/autorewind/gi, 'autoRewind').replace(/clockformat/gi, 'clockFormat').replace(/clockmask/gi, 'clockMask').replace(/hresource/gi, 'hResource').replace(/videoidlist/gi, 'VideoIdList').replace(/<page/gi, '<Page').replace(/page>/gi, 'Page>').replace(/<gps/gi, '<GPS').replace(/gps>/gi, 'GPS>').replace(/<fixed/gi, '<Fixed').replace(/fixed>/gi, 'Fixed>').replace(/<xmlitem/gi, '<XmlItem').replace(/xmlitem>/gi, 'XmlItem>').replace(/<json/gi, '<Json').replace(/json>/gi, 'Json>').replace(/<locationbased/gi, '<LocationBased').replace(/locationbased>/gi, 'LocationBased>').replace(/<params/gi, '<Params').replace(/params>/gi, 'Params>').replace(/<url/gi, '<Url').replace(/url>/gi, 'Url>').replace(/maintainaspectratio/gi, 'maintainAspectRatio').replace(/<resource/gi, '<Resource').replace(/resource>/g, 'Resource>').// replace(/<htdata/gi, '<htData').replace(/htdata>/gi, 'htData>').
            replace(/<link/gi, '<LINK').replace(/link>/g, 'LINK>');
        } catch (e) {
            console.log(e);
        }

    }

    // ieFixEscaped (escapedHTML) {
    //     return escapedHTML.replace(/xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '').
    //     replace(/&lt;/g, '<').
    //     replace(/&gt;/g, '>').
    //     replace(/&amp;/g, '&').
    //     replace(/<rss/gi, '<Rss').replace(/rss>/g, 'Rss>').
    //     replace(/<background/gi, '<Background').replace(/background>/gi, 'Background>').
    //     replace(/<appearance/gi, '<Appearance').replace(/appearance>/gi, 'Appearance>').
    //     replace(/<gradientpoints/gi, '<GradientPoints').replace(/gradientpoints>/gi, 'GradientPoints>').
    //     replace(/<aspectratio/gi, '<AspectRatio').replace(/aspectratio>/gi, 'AspectRatio>').
    //     replace(/<layout/gi, '<Layout').replace(/layout>/gi, 'Layout>').
    //     replace(/<title/gi, '<Title').replace(/title>/gi, 'Title>').
    //     replace(/<description/gi, '<Description').replace(/description>/gi, 'Description>').
    //     replace(/<data/gi, '<Data').replace(/data>/gi, 'Data>').
    //     replace(/<player/gi, '<Player').replace(/player>/gi, 'Player>').
    //     replace(/<players/gi, '<Players').replace(/players>/gi, 'Players>').
    //     replace(/<text/gi, '<Text').replace(/text>/gi, 'Text>').
    //     replace(/<eventCommands/gi, '<EventCommands').replace(/eventCommands>/gi, 'EventCommands>').
    //     replace(/<eventCommand/gi, '<EventCommand').replace(/eventCommand>/gi, 'EventCommand>').
    //     replace(/<border/gi, '<Border').replace(/border>/gi, 'Border>').
    //     replace(/<scene/gi, '<Scene').replace(/scene>/gi, 'Scene>').
    //     replace(/<clock/gi, '<Clock').replace(/clock>/gi, 'Clock>').
    //     replace(/<point/gi, '<Point').replace(/point>/gi, 'Point>').
    //     replace(/<video/gi, '<Video').replace(/video>/gi, 'Video>').
    //     replace(/<image/gi, '<Image').replace(/image>/gi, 'Image>').
    //     replace(/<label/gi, '<Label').replace(/label>/gi, 'Label>').
    //     replace(/<font/gi, '<Font').replace(/font>/gi, 'Font>').
    //     replace(/fontsize/gi, 'fontSize').
    //     replace(/startdate/gi, 'startDate').
    //     replace(/enddate/gi, 'endDate').
    //     replace(/fontcolor/gi, 'fontColor').
    //     replace(/fontfamily/gi, 'fontFamily').
    //     replace(/fontweight/gi, 'fontWeight').
    //     replace(/fontstyle/gi, 'fontStyle').
    //     replace(/bordercolor/gi, 'borderColor').
    //     replace(/borderthickness/gi, 'borderThickness').
    //     replace(/cornerradius/gi, 'cornerRadius').
    //     replace(/textdecoration/gi, 'textDecoration').
    //     replace(/textalign/gi, 'textAlign').
    //     replace(/hdatasrc/gi, 'hDataSrc').
    //     replace(/minrefreshtime/gi, 'minRefreshTime').
    //     replace(/itemspath/gi, 'itemsPath').
    //     replace(/slideshow/gi, 'slideShow').
    //     replace(/iteminterval/gi, 'itemInterval').
    //     replace(/playvideoinfull/gi, 'playVideoInFull').
    //     replace(/randomorder/gi, 'randomOrder').
    //     replace(/providertype/gi, 'providerType').
    //     replace(/fieldname/gi, 'fieldName').
    //     replace(/fieldtype/gi, 'fieldType').
    //     replace(/gradienttype/gi, 'gradientType').
    //     replace(/autorewind/gi, 'autoRewind').
    //     replace(/clockformat/gi, 'clockFormat').
    //     replace(/clockmask/gi, 'clockMask').
    //     replace(/hresource/gi, 'hResource').
    //     replace(/videoidlist/gi, 'VideoIdList').
    //     replace(/<page/gi, '<Page').replace(/page>/gi, 'Page>').
    //     replace(/<gps/gi, '<GPS').replace(/gps>/gi, 'GPS>').
    //     replace(/<fixed/gi, '<Fixed').replace(/fixed>/gi, 'Fixed>').
    //     replace(/<xmlitem/gi, '<XmlItem').replace(/xmlitem>/gi, 'XmlItem>').
    //     replace(/<json/gi, '<Json').replace(/json>/gi, 'Json>').
    //     replace(/<locationbased/gi, '<LocationBased').replace(/locationbased>/gi, 'LocationBased>').
    //     replace(/<params/gi, '<Params').replace(/params>/gi, 'Params>').
    //     replace(/<url/gi, '<Url').replace(/url>/gi, 'Url>').
    //     replace(/maintainaspectratio/gi, 'maintainAspectRatio').
    //     replace(/<resource/gi, '<Resource').replace(/resource>/g, 'Resource>').
    //     // replace(/<htdata/gi, '<htData').replace(/htdata>/gi, 'htData>').
    //     replace(/<link/gi, '<LINK').replace(/link>/g, 'LINK>');
    // }

    /**
     Get a unique scene > player id
     @method generateSceneId
     @return {Number} Unique scene player id
     **/
    generateSceneId() {
        return (jQuery.base64.encode(_.uniqueId('blockid'))).replace('=', '');
    }

    /**
     Sterilize pseudo id to scene id always returns scene_id as an integer rather pseudo id
     @method sterilizePseudoId
     @param {Number} i_id
     @return {Number} i_id
     **/
    sterilizePseudoId(i_id) {
        var id = parseInt(i_id);
        if (_.isNaN(id))
            return this.getSceneIdFromPseudoId(i_id);
        return i_id;
    }

    /**
     Sterilize pseudo id to scene id always returns scene_id as an integer rather pseudo id
     @method sterilizePseudoId
     **/
    sterilizePseudoIdFromScene(i_id, domPlayerData: XMLDocument) {
        var id = parseInt(i_id);
        if (_.isNaN(id)) {
            var f = $(domPlayerData).find('Player').eq(0).attr('id');
            return f;
        }
        return i_id;
    }

    /**
     Remove all player ids from player_data inside a scene
     @method stripScenePlayersIDs
     **/
    stripScenePlayersIDs() {

        this.m_tempScenePlayerIDs = {};
        var scenes = this.getScenes();
        _.each(scenes, function (domPlayerData: any, scene_id) {
            // $(domPlayerData).find('Player').eq(0).removeAttr('id');
            this.m_tempScenePlayerIDs[scene_id] = (new XMLSerializer()).serializeToString(domPlayerData);
            var players = $(domPlayerData).find('Players').find('Player').each(function (i, player) {
                // var blockID = this.databaseManager.generateSceneId();
                $(player).removeAttr('id');
            });
            this.databaseManager.setScenePlayerData(scene_id, (new XMLSerializer()).serializeToString(domPlayerData));
        });
    }

    /**
     When we remove scene player ids we actually store them aside so we can restore them back after a save as the
     remote server expects a scene's player_data to have no player ids on its scene player_data
     @method restoreScenesWithPlayersIDs
     **/
    restoreScenesWithPlayersIDs() {

        _.each(this.m_tempScenePlayerIDs, function (scene_player_data, scene_id) {
            this.databaseManager.setScenePlayerData(scene_id, scene_player_data);
        });
    }

    /**
     Get all Scenes and convert them to dom objects returning a hash of object literals
     @method getScenes
     @return {Object} all scenes as objects
     **/
    getScenes() {
        var scenes = {};
        $(this.databaseManager.table_player_data().getAllPrimaryKeys()).each((k, player_data_id) => {
            var recPlayerData = this.databaseManager.table_player_data().getRec(player_data_id);
            var domPlayerData = $.parseXML(recPlayerData['player_data_value'])
            scenes[recPlayerData['player_data_id']] = domPlayerData;
        });
        return scenes;
    }

    /**
     Get Scene player record from player_data table
     @method getScenePlayerRecord
     @param {Number} i_sceneID
     @return {Object} XML playerdata
     **/
    getScenePlayerRecord(i_scene_id) {
        return this.databaseManager.table_player_data().getRec(i_scene_id);
    }

    // /**
    //  Announce via event that a template view (screen layout) has been edited
    //  @method announceTemplateViewerEdited
    //  @param {Number} i_campaign_timeline_board_template_id
    //  **/
    // announceTemplateViewerEdited(i_campaign_timeline_board_template_id) {
    //     // this.databaseManager.fire(Pepper['TEMPLATE_VIEWER_EDITED'], this, null, i_campaign_timeline_board_template_id);
    // }

    /**
     Get the first board_id (output) that is assigned to the specified campaign_id
     @method getFirstBoardIDofCampaign
     @param {Number} i_campaign_id
     @return {Number} foundBoardID of the board, or -1 if none found
     **/
    getFirstBoardIDofCampaign(i_campaign_id) {
        var totalBoardsFound = 0;
        var foundCampainBoardID = -1;
        $(this.databaseManager.table_campaign_boards().getAllPrimaryKeys()).each((k, campaign_board_id) => {
            var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(campaign_board_id);
            if (i_campaign_id == recCampaignBoard.campaign_id && totalBoardsFound == 0) {
                foundCampainBoardID = recCampaignBoard['campaign_board_id']
                totalBoardsFound++;
            }
        });
        return foundCampainBoardID;
    }

    /**
     Get a campaign_board into it's matching pair in global boards.
     @method getBoardFromCampaignBoard
     @param {Number} i_campaign_board_id
     @return {Number} board_id
     **/
    getBoardFromCampaignBoard(i_campaign_board_id) {
        var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(i_campaign_board_id);
        return recCampaignBoard.board_id;
    }

    /**
     Get i_campaign_board_id into campaign_id using local table_campaign_boards (not global boards)
     @method getCampaignIdFromCampaignBoardId
     @param {Number} i_campaign_board_id
     @return {Number} campaign_id
     **/
    getCampaignIdFromCampaignBoardId(i_campaign_board_id) {

        var recCampaignBoard = this.databaseManager.table_campaign_boards().getRec(i_campaign_board_id);
        return recCampaignBoard.campaign_id;
    }

    /**
     get a Campaign's play mode (sceduler / sequencer) from timeline id
     @method getCampaignPlayModeFromTimeline
     @param {Number} i_campaign_timeline_id
     @return {Number} play mode
     **/
    getCampaignPlayModeFromTimeline(i_campaign_timeline_id) {
        var recTimeline = this.getCampaignTimelineRecord(i_campaign_timeline_id);
        var campaign_id = recTimeline.campaign_id;
        var recCampaign = this.getCampaignRecord(campaign_id);
        return String(recCampaign['campaign_playlist_mode']);
    }


    /**
     Get a Board Template Viewer props
     @method getBoardTemplateViewer
     @param {Number} i_board_template_viewer_id
     @return {Number} i_props
     **/
    getBoardTemplateViewer(i_board_template_viewer_id) {

        var recEditBoardTemplateViewer = this.databaseManager.table_board_template_viewers().getRec(i_board_template_viewer_id);
        return {
            x: recEditBoardTemplateViewer['pixel_x'],
            y: recEditBoardTemplateViewer['pixel_y'],
            w: recEditBoardTemplateViewer['pixel_width'],
            h: recEditBoardTemplateViewer['pixel_height']
        };
    }

    /**
     Get campaign schedule for timeline
     @method getCampaignsSchedules
     @param {Number} i_campaign_timeline_id
     @return {Object} schedule record
     **/
    getCampaignsSchedule(i_campaign_timeline_id) {

        var found = -1;
        $(this.databaseManager.table_campaign_timeline_schedules().getAllPrimaryKeys()).each(function (k, campaign_timeline_schedule_id) {
            var recCampaignTimelineSchedule = this.databaseManager.table_campaign_timeline_schedules().getRec(campaign_timeline_schedule_id);
            if (recCampaignTimelineSchedule.campaign_timeline_id == i_campaign_timeline_id)
                found = recCampaignTimelineSchedule;
        });
        return found;
    }

    /**
     Get the timeline id of the specific sequencer index offset (0 based) under the specified campaign
     @method getCampaignTimelineIdOfSequencerIndex
     @param {Number} i_campaign_id
     @param {Number} i_sequence_index
     @return {Number} timeline_id
     **/
    getCampaignTimelineIdOfSequencerIndex(i_campaign_id, i_sequence_index) {

        var timeline_id = -1;
        $(this.databaseManager.table_campaign_timeline_sequences().getAllPrimaryKeys()).each(function (k, campaign_timeline_sequence_id) {
            var recCampaignTimelineSequence = this.databaseManager.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            var sequenceIndex = recCampaignTimelineSequence['sequence_index'];
            if (sequenceIndex == i_sequence_index && i_campaign_id == recCampaignTimelineSequence['campaign_id'])
                timeline_id = recCampaignTimelineSequence['campaign_timeline_id']
        });
        return timeline_id;
    }

    /**
     Get the sequence index of a timeline in the specified campaign
     @method getCampaignTimelineSequencerIndex
     @param {Number} i_campaign_timeline_id
     @return {Number} sequenceIndex
     **/
    getCampaignTimelineSequencerIndex(i_campaign_timeline_id) {

        var sequenceIndex = -1;

        $(this.databaseManager.table_campaign_timeline_sequences().getAllPrimaryKeys()).each((k, campaign_timeline_sequence_id) => {
            var recCampaignTimelineSequence = this.databaseManager.table_campaign_timeline_sequences().getRec(campaign_timeline_sequence_id);
            if (recCampaignTimelineSequence['campaign_timeline_id'] == i_campaign_timeline_id) {
                sequenceIndex = recCampaignTimelineSequence['sequence_index'];
            }
        });
        return sequenceIndex;
    }

    /**
     Get all none deleted (!=3) resources per current account
     @method listenResources
     @return {Array} all records of all resources in current account
     **/
    getResources() {

        var resources = [];

        $(this.databaseManager.table_resources().getAllPrimaryKeys()).each(function (k, resource_id) {
            var recResource = this.databaseManager.table_resources().getRec(resource_id);
            // dont process deleted resources
            if (recResource['change_type'] == 3)
                return;
            var resourceName = resources.push(recResource);
        });
        return resources;
    }

    /**
     Get a resource record via its resource_id.
     @method getResourceRecord
     @param {Number} i_resource_id
     @return {Object} foundResourceRecord
     **/
    getResourceRecord(i_resource_id) {
        return this.databaseManager.table_resources().getRec(i_resource_id);
    }

    /**
     Get the type of a resource (png/jpg...) for specified native_id
     @method getResourceType
     @param {Number} i_resource_id
     @return {String} resourceType
     **/
    getResourceType(i_resource_id) {

        var recResource = this.databaseManager.table_resources().getRec(i_resource_id);
        return recResource['resource_type'];
    }

    /**
     Get the native resource id from handle
     @method getResourceNativeID
     @param {Number} i_resource_id
     @return {Number} nativeID
     **/
    getResourceNativeID(i_resource_id) {
        var recResource = this.databaseManager.table_resources().getRec(i_resource_id);
        if (_.isNull(recResource))
            return null;
        return recResource['native_id'];
    }

    /**
     Get the name of a resource from the resources table using it's native_id
     @method getResourceName
     @param {Number} i_resource_id
     @return {Number} resourceName
     **/
    getResourceName(i_resource_id) {

        var recResource = this.databaseManager.table_resources().getRec(i_resource_id);
        return recResource['resource_name'];
    }

    /**
     Get a campaign table record for the specified i_campaign_id.
     @method getCampaignRecord
     @param {Number} i_campaign_id
     @return {Object} foundCampaignRecord
     **/
    getCampaignRecord(i_campaign_id) {

        return this.databaseManager.table_campaigns().getRec(i_campaign_id);
    }

    /**
     Returns all of the campaign IDs that all stations belonging to account are associated with
     @method getStationCampaignIDs
     @return {Array} array of campaign IDs
     **/
    getStationCampaignIDs() {

        var campaignIDs = [];
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            var campaign_board_id = recBranchStation['campaign_board_id'];
            campaignIDs.push(this.getCampaignIdFromCampaignBoardId(campaign_board_id));
        });
        return campaignIDs;
    }

    /**
     Sync to pepper and get station name for station id, callback on server sync return
     @method getStationNameAsync
     @param {Number} i_stationID
     @param {Number} i_callBack
     **/
    getStationNameAsync(i_stationID, i_callBack) {
        this.sync(function () {
            $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
                var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                if (recBranchStation['native_id'] == i_stationID) {
                    i_callBack(recBranchStation['station_name'])
                }
            });
        });
    }

    /**
     Total branch stations
     **/
    getStationBranchTotal() {
        return this.databaseManager.table_branch_stations().getAllPrimaryKeys().length;
    }

    /**
     Get station name from sdk (no remote server async)
     @method getStationNameSync
     @param {Number} i_stationID
     @return {String} stationName
     **/
    getStationNameSync(i_stationID) {
        var stationName = '';
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_stationID) {
                var recBranch = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                stationName = recBranch['station_name'];
            }
        });
        return stationName;
    }

    /**
     Get station name from sdk (no remote server async)
     @method getAdPackContNames
     @param {Number} i_ad_local_content_id
     @return {Object}
     **/
    getAdPackContNames(i_ad_local_content_id) {

        var result = {
            contentName: '',
            packageName: ''
        };
        $(this.databaseManager.table_ad_local_contents().getAllPrimaryKeys()).each(function (k, ad_local_content_id) {
            var recAdLocalContent = this.databaseManager.table_ad_local_contents().getRec(ad_local_content_id);
            if (recAdLocalContent.native_id == i_ad_local_content_id) {
                var recAdLocalPackage = this.databaseManager.table_ad_local_packages().getRec(recAdLocalContent.ad_local_package_id);
                result = {
                    contentName: recAdLocalContent.content_name,
                    packageName: recAdLocalPackage.package_name
                };
            }
        });
        return result;
    }

    /**
     Returns the campaign id that a station is bound to
     @method getStationCampaignID
     @param {Number} i_native_station_id
     @return {Number} campaign_id
     **/
    getStationCampaignID(i_native_station_id) {

        var campaignID = -1;
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                var campaign_board_id = recBranchStation['campaign_board_id'];
                campaignID = this.getCampaignIdFromCampaignBoardId(campaign_board_id);
            }
        });
        return campaignID;
    }

    /**
     Set a station record via object arg into sdk table_branch_stations
     @method getStationRecord
     @param {Number} i_native_station_id
     @param {Object} record
     **/
    setStationRecord(i_native_station_id, i_record) {

        var record;
        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                this.databaseManager.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                recBranchStationEdit = i_record;
            }
        });
    }


    /**
     Set a station to server mode enable / disable
     @method setStationServerMode
     @param {Number} i_native_station_id
     @param {Boolean} i_mode
     **/
    setStationServerMode(i_native_station_id, i_enabled, i_lan_server_ip, i_port) {

        $(this.databaseManager.table_branch_stations().getAllPrimaryKeys()).each(function (k, branch_station_id) {
            var recBranchStation = this.databaseManager.table_branch_stations().getRec(branch_station_id);
            if (recBranchStation['native_id'] == i_native_station_id) {
                this.databaseManager.table_branch_stations().openForEdit(branch_station_id);
                var recBranchStationEdit = this.databaseManager.table_branch_stations().getRec(branch_station_id);
                recBranchStationEdit.lan_server_enabled = i_enabled;
                recBranchStationEdit.lan_server_port = i_port;
                recBranchStationEdit.lan_server_ip = i_lan_server_ip;
            }
        });
    }

    /**
     Upload new resources onto the remote server and return matching ids.
     The element id is of an HTML id of a multi-part upload element.
     @method uploadResources
     @param {String} i_elementID
     @return {Array} list of resources created from newly attached files or empty array if not valid resource loaded
     **/
    uploadResources(i_elementID, i_bs: BlockService) {
        var i_uploadFileElement: any = document.getElementById(i_elementID);
        var count = i_uploadFileElement.files.length;
        for (var iFile = 0; iFile < count; iFile++) {
            var fileName = i_uploadFileElement.files[iFile];
            var fileExtension = fileName.name.split('.')[1].toLowerCase();
            var block = i_bs.getBlockCodeFromFileExt(fileExtension);
            if (block == -1)
                return [];
        }
        var resourceList = this.loaderManager.createResources(document.getElementById(i_elementID));
        // BB.comBroker.fire('EVENTS.ADDED_RESOURCE');
        return resourceList;
    }


    /**
     Get a timeline's duration which is set as the total sum of all blocks within the longest running channel
     @method getTimelineTotalDuration
     @param {Number} i_campaign_timeline_id
     @return {Number} length in seconds
     **/
    getTimelineTotalDuration(i_campaign_timeline_id) {

        var recCampaignTimeline = this.databaseManager.table_campaign_timelines().getRec(i_campaign_timeline_id);
        if (!recCampaignTimeline)
            return 0;
        return recCampaignTimeline['timeline_duration'];
    }

    /**
     Get the total duration in seconds of all given block ids
     @method getTotalDurationOfBlocks
     @param {Array} i_blocks
     @return {Number} totalChannelLength
     **/
    getTotalDurationOfBlocks(i_blocks) {

        var totalChannelLength = 0;

        for (var i = 0; i < i_blocks.length; i++) {
            var block_id = i_blocks[i];
            $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                if (block_id == campaign_timeline_chanel_player_id) {
                    var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                    var playerDuration = recCampaignTimelineChannelPlayer['player_duration']
                    this.databaseManager.table_campaign_timeline_chanel_players().openForEdit(campaign_timeline_chanel_player_id);
                    // console.log('player ' + block_id + ' offset ' + totalChannelLength + ' playerDuration ' + playerDuration);
                    totalChannelLength = totalChannelLength + parseFloat(playerDuration);
                }
            });
        }
        return totalChannelLength;
    }

    /**
     Get a block's (a.k.a player) total hours / minutes / seconds playback length on the timeline_channel.
     @method getBlockTimelineChannelBlockLength
     @param {Number} i_campaign_timeline_chanel_player_id
     @return {Object} playbackLength as a json object with keys of hours minutes seconds
     **/
    getBlockTimelineChannelBlockLength(i_campaign_timeline_chanel_player_id) {

        var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(i_campaign_timeline_chanel_player_id);
        var totalSeconds = recCampaignTimelineChannelPlayer['player_duration'];
        return this.formatSecondsToObject(totalSeconds);
    }

    /**
     Format an object to seconds
     @method formatObjectToSeconds
     @param {Object} i_object with hours minutes and seconds key / values
     @return {Number}
     **/
    formatObjectToSeconds(i_object) {
        var seconds = i_object.seconds;
        var minutes = i_object.minutes;
        var hours = i_object.hours;
        hours = hours * 3600;
        minutes = minutes * 60;
        return seconds + minutes + hours;
    }

    /**
     Format a seconds value into an object broken into hours / minutes / seconds
     @method formatSecondsToObject
     @param {Number} i_totalSeconds
     @return {Object}
     **/
    formatSecondsToObject(i_totalSeconds) {
        var seconds: any = 0;
        var minutes: any = 0;
        var hours: any = 0;
        var totalInSeconds = i_totalSeconds;
        if (i_totalSeconds >= 3600) {
            hours = Math.floor(i_totalSeconds / 3600);
            i_totalSeconds = i_totalSeconds - (hours * 3600);
        }
        if (i_totalSeconds >= 60) {
            minutes = Math.floor(i_totalSeconds / 60);
            seconds = i_totalSeconds - (minutes * 60);
        }
        if (hours == 0 && minutes == 0)
            seconds = i_totalSeconds;
        var playbackLength = {
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            seconds: parseInt(seconds),
            totalInSeconds: parseInt(totalInSeconds)
        };
        return playbackLength;
    }

    /**
     Get a player_id record from sdk by player_id primary key.
     @method getCampaignTimelineChannelPlayerRecord
     @param {Number} i_player_id
     @return {Object} player record
     **/
    getCampaignTimelineChannelPlayerRecord(i_player_id) {
        return this.databaseManager.table_campaign_timeline_chanel_players().getRec(i_player_id);
    }

    /**
     Get a block's record using it's block_id
     @method getBlockRecord
     @param {Object} i_block_id
     @return {Object} recBlock
     **/
    getBlockRecord(i_block_id) {
        return this.databaseManager.table_campaign_timeline_chanel_players().getRec(i_block_id);
    }

    /**
     Get a channel_id record from table channels sdk by channel_id
     @method getCampaignTimelineChannelRecord
     @param {Number} i_channel_id
     @return {Object} channel record
     **/
    getCampaignTimelineChannelRecord(i_channel_id) {

        return this.databaseManager.table_campaign_timeline_chanels().getRec(i_channel_id);
    }

    /**
     Get a timeline record from sdk using i_campaign_timeline_id primary key.
     @method getCampaignTimelineRecord
     @param {Number} i_campaign_timeline_id
     @return {Object} player record
     **/
    getCampaignTimelineRecord(i_campaign_timeline_id) {

        return this.databaseManager.table_campaign_timelines().getRec(i_campaign_timeline_id);
    }

    /**
     Build screenProps json object with all viewers and all of their respective attributes for the given timeline_id / template_id
     @method getTemplateViewersScreenProps
     @param {Number} i_campaign_timeline_id
     @param {Number} i_campaign_timeline_board_template_id
     @return {Object} screenProps all viewers and all their properties
     **/
    getTemplateViewersScreenProps(i_campaign_timeline_id, i_campaign_timeline_board_template_id) {

        var counter = -1;
        var screenProps = {};
        var viewOrderIndexes = {};
        $(this.databaseManager.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {

            var recCampaignTimelineBoardViewerChanel = this.databaseManager.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineBoardViewerChanel['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                var recBoardTemplateViewer = this.databaseManager.table_board_template_viewers().getRec(recCampaignTimelineBoardViewerChanel['board_template_viewer_id']);
                // console.log(i_campaign_timeline_board_template_id + ' ' + recBoardTemplateViewer['board_template_viewer_id']);
                counter++;
                screenProps['sd' + counter] = {};
                screenProps['sd' + counter]['campaign_timeline_board_viewer_id'] = recBoardTemplateViewer['board_template_viewer_id'];
                screenProps['sd' + counter]['campaign_timeline_id'] = i_campaign_timeline_id;
                screenProps['sd' + counter]['x'] = recBoardTemplateViewer['pixel_x'];
                screenProps['sd' + counter]['y'] = recBoardTemplateViewer['pixel_y'];
                screenProps['sd' + counter]['w'] = recBoardTemplateViewer['pixel_width'];
                screenProps['sd' + counter]['h'] = recBoardTemplateViewer['pixel_height'];

                // make sure that every view_order we assign is unique and sequential
                var viewOrder = recBoardTemplateViewer['viewer_order'];
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
        });

        return screenProps;
    }

    /**
     Set a timeline records in sdk using i_campaign_timeline_id primary key.
     The method uses generic key / value fields so it can set any part of the record.
     @method setCampaignTimelineRecord
     @param {number} i_player_id
     @param {string} i_key the key to set
     @param {Object} i_value the value to set
     @return none
     **/
    setCampaignTimelineRecord(i_campaign_timeline_id, i_key, i_value) {

        this.databaseManager.table_campaign_timelines().openForEdit(i_campaign_timeline_id);
        var recTimeline = this.databaseManager.table_campaign_timelines().getRec(i_campaign_timeline_id);
        recTimeline[i_key] = i_value;
    }

    /**
     Use a viewer_id to reverse enumerate over the mapping of viewers to channels via:
     campaign_timeline_viewer_chanels -> table_campaign_timeline_chanels
     so we can find the channel assigned to the viewer_id provided.
     @method getChannelIdFromCampaignTimelineBoardViewer
     @param {Number} i_campaign_timeline_board_viewer_id
     @param {Number} i_campaign_timeline_id
     @return {Object} recCampaignTimelineViewerChanelsFound
     **/
    getChannelIdFromCampaignTimelineBoardViewer(i_campaign_timeline_board_viewer_id, i_campaign_timeline_id) {


        var recCampaignTimelineViewerChanelsFound = undefined;

        $(this.databaseManager.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineViewerChanels = this.databaseManager.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);

            // if true, we found the viewer selected under table campaign_timeline_viewer_chanels
            if (recCampaignTimelineViewerChanels['board_template_viewer_id'] == i_campaign_timeline_board_viewer_id) {

                $(this.databaseManager.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
                    var recCampaignTimelineChannel = this.databaseManager.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);

                    // if true, we found the channel the viewer was assined to as long as it is part of the current selected timeline
                    if (recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'] == campaign_timeline_chanel_id && recCampaignTimelineChannel['campaign_timeline_id'] == i_campaign_timeline_id) {
                        // console.log('selected: timeline_id ' + i_campaign_timeline_id + ' view_id ' + i_campaign_timeline_board_viewer_id + ' on channel_id ' + recCampaignTimelineViewerChanels['campaign_timeline_chanel_id']);
                        recCampaignTimelineViewerChanelsFound = recCampaignTimelineViewerChanels;
                    }
                });
            }
        });

        return recCampaignTimelineViewerChanelsFound;
    }

    /**
     Get the assigned viewer id to the specified channel
     @method getAssignedViewerIdFromChannelId
     @param {Number} i_campaign_timeline_channel_id
     @return {Number} foundViewerID
     **/
    getAssignedViewerIdFromChannelId(i_campaign_timeline_channel_id) {

        var foundViewerID;
        $(this.databaseManager.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineViewerChanels = this.databaseManager.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineViewerChanels['campaign_timeline_chanel_id'] == i_campaign_timeline_channel_id) {
                foundViewerID = recCampaignTimelineViewerChanels['board_template_viewer_id']
            }
        });
        return foundViewerID;
    }

    /**
     Sample function to demonstrate how to enumerate over records to query for specified template_id
     @method populateBoardTemplate
     @param {Number} i_campaign_timeline_board_template_id
     @return none
     **/
    populateBoardTemplate(i_campaign_timeline_board_template_id) {


        var recCampaignTimelineBoardTemplate = this.databaseManager.table_campaign_timeline_board_templates().getRec(i_campaign_timeline_board_template_id);

        // Get global board > board template so we can get the total width / height resolution of the board

        var recBoardTemplate = this.databaseManager.table_board_templates().getRec(recCampaignTimelineBoardTemplate['board_template_id']);
        var recBoard = this.databaseManager.table_boards().getRec(recBoardTemplate['board_id']);

        $(this.databaseManager.table_campaign_timeline_board_viewer_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_board_viewer_chanel_id) {
            var recCampaignTimelineBoardViewerChanel = this.databaseManager.table_campaign_timeline_board_viewer_chanels().getRec(campaign_timeline_board_viewer_chanel_id);
            if (recCampaignTimelineBoardViewerChanel['campaign_timeline_board_template_id'] == i_campaign_timeline_board_template_id) {
                var recBoardTemplateViewer = this.databaseManager.table_board_template_viewers().getRec(recCampaignTimelineBoardViewerChanel['board_template_viewer_id']);
                // console.log(i_campaign_timeline_board_template_id);
            }
        });
    }

    /**
     The jXML.Event constructor is exposed and can be used when calling trigger. The new operator is optional.
     @method event
     @param {Event} i_event
     @param {Object} i_context
     @param {Object} i_caller
     @param {Object} i_data
     @return none.

     event (i_event, i_context, i_caller, i_data) {
        return $.Event(i_event, {context: i_context, caller: i_caller, edata: i_data});
    }
     **/

    /**
     Sample function to demonstrate how to enumerate over records to query related tables of a campaign
     @method populateBoardTemplate
     @param {Number} i_campaign_timeline_board_template_id
     @return none
     **/
    populateCampaign() {


        // demo campaign_id
        var campaign_id = 1;

        // Get all timelines
        $(this.databaseManager.table_campaign_timelines().getAllPrimaryKeys()).each(function (k, campaign_timeline_id) {

            var recCampaignTimeline = this.databaseManager.table_campaign_timelines().getRec(campaign_timeline_id);

            // if timeline belongs to selected campaign
            if (recCampaignTimeline['campaign_id'] == campaign_id) {

                // get all campaign timeline board templates (screen divison inside output, gets all outputs, in our case only 1)
                $(this.databaseManager.table_campaign_timeline_board_templates().getAllPrimaryKeys()).each(function (k, table_campaign_timeline_board_template_id) {
                    var recCampaignTimelineBoardTemplate = this.databaseManager.table_campaign_timeline_board_templates().getRec(table_campaign_timeline_board_template_id);
                    if (recCampaignTimelineBoardTemplate['campaign_timeline_id'] == campaign_timeline_id) {
                        // console.log(recCampaignTimelineBoardTemplate['campaign_timeline_id']);
                        this._populateBoardTemplate(table_campaign_timeline_board_template_id);
                    }
                });

                // get all channels that belong to timeline
                $(this.databaseManager.table_campaign_timeline_chanels().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_id) {
                    var recCampaignTimelineChannel = this.databaseManager.table_campaign_timeline_chanels().getRec(campaign_timeline_chanel_id);
                    if (campaign_timeline_id == recCampaignTimelineChannel['campaign_timeline_id']) {

                        // get all players / resources that belong timeline
                        $(this.databaseManager.table_campaign_timeline_chanel_players().getAllPrimaryKeys()).each(function (k, campaign_timeline_chanel_player_id) {
                            var recCampaignTimelineChannelPlayer = this.databaseManager.table_campaign_timeline_chanel_players().getRec(campaign_timeline_chanel_player_id);
                            if (campaign_timeline_chanel_id == recCampaignTimelineChannelPlayer['campaign_timeline_chanel_id']) {
                                console.log(campaign_timeline_chanel_player_id);
                            }
                        });
                    }
                });
            }
        });
    }
}

// return {
//     campaign_timeline_chanel_player_id: recTimelinePlayer['campaign_timeline_chanel_player_id'],
//     campaign_timeline_chanel_player_data: recTimelinePlayer['player_data']
// };
// // pepper.fire(Pepper['NEW_PLAYER_CREATED'], self, null, returnData);