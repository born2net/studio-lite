export const BLOCKS_LOADED = 'BLOCKS_LOADED';
export const PLACEMENT_SCENE = 'PLACEMENT_SCENE';
export const PLACEMENT_CHANNEL = 'PLACEMENT_CHANNEL';
export const PLACEMENT_IS_SCENE = 'PLACEMENT_IS_SCENE';
export const PLACEMENT_LISTS = 'PLACEMENT_LISTS';
export const FASTERQ_QUEUE_CALL_CANCLED = 'FASTERQ_QUEUE_CALL_CANCLED';
export const BLOCK_SERVICE = 'BLOCK_SERVICE';

export const BlockLabels = {
    'BLOCKCODE_SCENE': 3510,
    'BLOCKCODE_COLLECTION': 4100,
    'BLOCKCODE_TWITTER': 4500,
    'BLOCKCODE_TWITTER_ITEM': 4505,
    'BLOCKCODE_JSON': 4300,
    'BLOCKCODE_JSON_ITEM': 4310,
    'BLOCKCODE_WORLD_WEATHER': 6010,
    'BLOCKCODE_GOOGLE_SHEETS': 6022,
    'BLOCKCODE_CALENDAR': 6020,
    'BLOCKCODE_TWITTERV3': 6230,
    'BLOCKCODE_INSTAGRAM': 6050,
    'BLOCKCODE_DIGG': 6000,
    'BLOCKCODE_IMAGE': 3130,
    'BLOCKCODE_SVG': 3140,
    'BLOCKCODE_VIDEO': 3100,
    'RSS': 3345,
    'QR': 3430,
    'YOUTUBE': 4600,
    'LOCATION': 4105,
    'FASTERQ': 6100,
    'IMAGE': 3160,
    'EXTERNAL_VIDEO': 3150,
    'CLOCK': 3320,
    'HTML': 3235,
    'LABEL': 3241,
    'MRSS': 3340
}

export class Consts {
    public static Clas() {
        return {
            CLASS_APP_HEIGHT: '.appHeight'
        };
    }

    public static Events() {
        return {
            WIN_SIZED: 'winSized',
            MENU_SELECTION: 'menuSelection',
            STATIONS_NETWORK_ERROR: 'stationsNetworkError'
        };
    }

    public static Values() {
        return {
            MENU_MIN_ICON_SHOW: 1550,
            APP_SIZE: 'AppSize',
            SERVER_MODE: 'serverMode', // 0 = cloud, 1 = private 2 = hybrid
            USER_NAME: 'userName',
            USER_PASS: 'userPass'
        };
    }

    public static Services() {
        return {
            App: 'Application',
            Properties: 'Properties',
            ActionService: 'ActionService'
        };
    }
}
