import {IMsDatabase, INITIAL_STORE_DATA, INITIAL_APP_DB, IAppDb} from "./store.data";

export interface ApplicationState {
    msDatabase: IMsDatabase
    appDb: IAppDb
}
export const INITIAL_APPLICATION_STATE: ApplicationState = {
    msDatabase: INITIAL_STORE_DATA,
    appDb: INITIAL_APP_DB
};