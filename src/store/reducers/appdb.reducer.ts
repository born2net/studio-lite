import {IAppDb} from "../store.data";
import {UserModel} from "../../models/UserModel";
import * as StoreActions from "../actions/appdb.actions";
import * as EffectActions from "../effects/appdb.effects";
import * as ActionsConst from "../actions/appdb.actions";
import * as _ from 'lodash';
import {Map, List} from 'immutable';
import {StationModel} from "../../models/StationModel";
import {Lib} from "../../Lib";
import {FasterqLineModel} from "../../models/fasterq-line-model";
import {FasterqQueueModel} from "../../models/fasterq-queue-model";
import {FasterqAnalyticsModel} from "../../models/fasterq-analytics";

const baseUrl = 'https://galaxy.signage.me/WebService/ResellerService.ashx';
export const appBaseUrlCloud = 'https://secure.digitalsignage.com';

export function appDb(state: IAppDb, action: any): IAppDb {

    switch (action.type) {
        case StoreActions.APP_INIT:
            state.appStartTime = Date.now();
            state.appBaseUrl = `${baseUrl}`;
            state.appBaseUrlServices = `https://secure.digitalsignage.com${Lib.DevMode() ? ':443' : ''}`;
            return state;

        case ActionsConst.ACTION_UISTATE_UPDATE: {
            _.merge(state.uiState, action.payload);
            return state;
        }

        case EffectActions.EFFECT_UPDATE_USER_MODEL:
            var userModel: UserModel = action.payload;
            state.userModel = userModel.setTime();
            state.appBaseUrlUser = `${baseUrl}?resellerUserName=${userModel.getKey('user')}&resellerPassword=${userModel.getKey('pass')}`;
            state.appBaseUrlCloud = `${appBaseUrlCloud}/END_POINT/${userModel.getKey('user')}/${userModel.getKey('pass')}`;
            return state;

        case EffectActions.EFFECT_LOADED_STATIONS:
            var stations: List<StationModel> = action.payload;
            state.stations = stations;
            return state;

        case EffectActions.EFFECT_UPDATED_FASTERQ_LINE:
            var index = state.fasterq.lines.findIndex((i_fasterqLineModel: FasterqLineModel) => i_fasterqLineModel.lineId == action.payload.data.id);
            state.fasterq.lines = state.fasterq.lines.update(index, (i_fasterqLineModel: FasterqLineModel) => {
                i_fasterqLineModel = i_fasterqLineModel.setKey<FasterqLineModel>(FasterqLineModel, 'name', action.payload.data.name);
                return i_fasterqLineModel.setKey<FasterqLineModel>(FasterqLineModel, 'reminder', action.payload.data.reminder);
            });
            return state;

        case EffectActions.EFFECT_REMOVED_FASTERQ_LINE:
            var index = state.fasterq.lines.findIndex((i_fasterqLineModel: FasterqLineModel) => i_fasterqLineModel.lineId == action.payload.data.id);
            state.fasterq.lines = state.fasterq.lines.remove(index)
            return state;

        case EffectActions.EFFECT_QUEUE_CALL_SAVED:
            if (_.isNull(action.payload))
                return state;
            var index = state.fasterq.queues.findIndex((i_fasterqLineModel: FasterqQueueModel) => i_fasterqLineModel.queueId == action.payload.queue_id);
            state.fasterq.queues = state.fasterq.queues.update(index, (i_fasterqQueueModel: FasterqQueueModel) => {
                // var prev = state.fasterq.queues.get(index).called
                // var curr = i_fasterqQueueModel.called;
                // if (!_.isNull(prev) && _.isNull(curr)){
                //     console.log('oops');
                // }
                delete action.payload.queue;
                var queue = i_fasterqQueueModel.setData<FasterqQueueModel>(FasterqQueueModel, action.payload)
                return queue;
            });
            return state;
                                                      
        case EffectActions.EFFECT_QUEUE_SERVICE_SAVED:
            var index = state.fasterq.queues.findIndex((i_fasterqLineModel: FasterqQueueModel) => i_fasterqLineModel.queueId == action.payload.queue_id);
            state.fasterq.queues = state.fasterq.queues.update(index, (i_fasterqQueueModel: FasterqQueueModel) => {
                // var prev = state.fasterq.queues.get(index).serviced
                // var curr = i_fasterqQueueModel.serviced;
                // if (!_.isNull(prev) && _.isNull(curr)){
                //     console.log('oops');
                // }
                return i_fasterqQueueModel.setKey<FasterqQueueModel>(FasterqQueueModel, 'serviced', action.payload.serviced);
            });
            return state;

        case EffectActions.EFFECT_ADDED_FASTERQ_LINE:
            var fasterqLineModel: FasterqLineModel = new FasterqLineModel(action.payload.serverReplay);
            state.fasterq.lines = state.fasterq.lines.push(fasterqLineModel)
            return state;

        case EffectActions.EFFECT_LOADED_FASTERQ_LINES:
            var lines: List<FasterqLineModel> = action.payload;
            state.fasterq.lines = lines;
            return state;

        case EffectActions.EFFECT_LOADED_FASTERQ_LINE:
            var line: FasterqLineModel = action.payload;
            state.fasterq.terminal = line;
            return state;

        case EffectActions.EFFECT_LOADED_FASTERQ_ANALYTICS:
            var analytics: List<FasterqAnalyticsModel> = action.payload;
            state.fasterq.analytics = analytics;
            return state;

        case EffectActions.EFFECT_LOADED_FASTERQ_QUEUES:
            var queues: List<FasterqQueueModel> = action.payload;
            state.fasterq.queues = queues;
            return state;

        case EffectActions.EFFECT_TWO_FACTOR_UPDATED:
            var userModel = state.userModel;
            userModel = userModel.setTwoFactorRequired(action.payload);
            state.userModel = userModel.setTime();
            return state;

        case StoreActions.ACTION_TWO_FACTOR_REMOVED:
            var userModel = state.userModel;
            userModel = userModel.setTwoFactorRequired(false);
            state.userModel = userModel.setTime();
            return state;

        case EffectActions.EFFECT_AUTH_STATUS:
            state.appAuthStatus = Map({authStatus: action.payload});
            return state;

        default:
            return state;
    }
}



