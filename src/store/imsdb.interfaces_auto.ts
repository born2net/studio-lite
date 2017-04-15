

// >>>> paste into: store/imsdb.interfaces_auto.ts

import {List} from 'immutable';

import {StoreModel} from "../store/model/StoreModel";

export class GlobalSettingsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getParamId() {
        return this.getKey('param_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getParamKey() {
        return this.getKey('param_key');
    }

    public getParamValue() {
        return this.getKey('param_value');
    }

}
export class ResourcesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getResourceId() {
        return this.getKey('resource_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getResourceName() {
        return this.getKey('resource_name');
    }

    public getResourceType() {
        return this.getKey('resource_type');
    }

    public getResourcePixelWidth() {
        return this.getKey('resource_pixel_width');
    }

    public getResourcePixelHeight() {
        return this.getKey('resource_pixel_height');
    }

    public getDefaultPlayer() {
        return this.getKey('default_player');
    }

    public getSnapshot() {
        return this.getKey('snapshot');
    }

    public getResourceTotalTime() {
        return this.getKey('resource_total_time');
    }

    public getResourceDateCreated() {
        return this.getKey('resource_date_created');
    }

    public getResourceDateModified() {
        return this.getKey('resource_date_modified');
    }

    public getResourceTrust() {
        return this.getKey('resource_trust');
    }

    public getResourcePublic() {
        return this.getKey('resource_public');
    }

    public getResourceBytesTotal() {
        return this.getKey('resource_bytes_total');
    }

    public getResourceModule() {
        return this.getKey('resource_module');
    }

    public getTreePath() {
        return this.getKey('tree_path');
    }

    public getAccessKey() {
        return this.getKey('access_key');
    }

    public getResourceHtml() {
        return this.getKey('resource_html');
    }

    public getShortcut() {
        return this.getKey('shortcut');
    }

    public getShortcutBusinessId() {
        return this.getKey('shortcut_business_id');
    }

    public getShortcutResourceId() {
        return this.getKey('shortcut_resource_id');
    }

}
export class AdLocalPackagesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdLocalPackageId() {
        return this.getKey('ad_local_package_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getEnabled() {
        return this.getKey('enabled');
    }

    public getPackageName() {
        return this.getKey('package_name');
    }

    public getUseDateRange() {
        return this.getKey('use_date_range');
    }

    public getStartDate() {
        return this.getKey('start_date');
    }

    public getEndDate() {
        return this.getKey('end_date');
    }

}
export class AdLocalContentsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdLocalContentId() {
        return this.getKey('ad_local_content_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdLocalPackageId() {
        return this.getKey('ad_local_package_id');
    }

    public getEnabled() {
        return this.getKey('enabled');
    }

    public getContentName() {
        return this.getKey('content_name');
    }

}
export class CategoryValuesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCategoryValueId() {
        return this.getKey('category_value_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getParentCategoryValueId() {
        return this.getKey('parent_category_value_id');
    }

    public getCategoryValue() {
        return this.getKey('category_value');
    }

}
export class CatalogItemsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCatalogItemId() {
        return this.getKey('catalog_item_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getItemName() {
        return this.getKey('item_name');
    }

    public getAdLocalContentId() {
        return this.getKey('ad_local_content_id');
    }

}
export class CatalogItemInfosModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCatalogItemId() {
        return this.getKey('catalog_item_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getInfo0() {
        return this.getKey('info0');
    }

    public getInfo1() {
        return this.getKey('info1');
    }

    public getInfo2() {
        return this.getKey('info2');
    }

    public getInfo3() {
        return this.getKey('info3');
    }

}
export class CatalogItemResourcesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCatalogItemResourceId() {
        return this.getKey('catalog_item_resource_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCatalogItemId() {
        return this.getKey('catalog_item_id');
    }

    public getResourceId() {
        return this.getKey('resource_id');
    }

    public getResourceGroup() {
        return this.getKey('resource_group');
    }

}
export class CatalogItemCategoriesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCatalogItemCategoryId() {
        return this.getKey('catalog_item_category_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCatalogItemId() {
        return this.getKey('catalog_item_id');
    }

    public getCategoryValueId() {
        return this.getKey('category_value_id');
    }

}
export class PlayerDataModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getPlayerDataId() {
        return this.getKey('player_data_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getPlayerDataValue() {
        return this.getKey('player_data_value');
    }

    public getPlayerDataPublic() {
        return this.getKey('player_data_public');
    }

    public getTreePath() {
        return this.getKey('tree_path');
    }

    public getSourceCode() {
        return this.getKey('source_code');
    }

    public getAccessKey() {
        return this.getKey('access_key');
    }

}
export class BoardsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getBoardId() {
        return this.getKey('board_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getBoardName() {
        return this.getKey('board_name');
    }

    public getBoardPixelWidth() {
        return this.getKey('board_pixel_width');
    }

    public getBoardPixelHeight() {
        return this.getKey('board_pixel_height');
    }

    public getMonitorOrientationEnabled() {
        return this.getKey('monitor_orientation_enabled');
    }

    public getMonitorOrientationIndex() {
        return this.getKey('monitor_orientation_index');
    }

    public getAccessKey() {
        return this.getKey('access_key');
    }

    public getTreePath() {
        return this.getKey('tree_path');
    }

}
export class CampaignsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignId() {
        return this.getKey('campaign_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignName() {
        return this.getKey('campaign_name');
    }

    public getCampaignPlaylistMode() {
        return this.getKey('campaign_playlist_mode');
    }

    public getKioskMode() {
        return this.getKey('kiosk_mode');
    }

    public getKioskKey() {
        return this.getKey('kiosk_key');
    }

    public getKioskTimelineId() {
        return this.getKey('kiosk_timeline_id');
    }

    public getKioskWaitTime() {
        return this.getKey('kiosk_wait_time');
    }

    public getMouseInterruptMode() {
        return this.getKey('mouse_interrupt_mode');
    }

    public getTreePath() {
        return this.getKey('tree_path');
    }

    public getAccessKey() {
        return this.getKey('access_key');
    }

}
export class CampaignChannelsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignChannelId() {
        return this.getKey('campaign_channel_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignId() {
        return this.getKey('campaign_id');
    }

    public getChanelName() {
        return this.getKey('chanel_name');
    }

    public getChanelColor() {
        return this.getKey('chanel_color');
    }

    public getRandomOrder() {
        return this.getKey('random_order');
    }

    public getRepeatToFit() {
        return this.getKey('repeat_to_fit');
    }

    public getFixedPlayersLength() {
        return this.getKey('fixed_players_length');
    }

}
export class CampaignChannelPlayersModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignChannelPlayerId() {
        return this.getKey('campaign_channel_player_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignChannelId() {
        return this.getKey('campaign_channel_id');
    }

    public getPlayerOffsetTime() {
        return this.getKey('player_offset_time');
    }

    public getPlayerDuration() {
        return this.getKey('player_duration');
    }

    public getPlayerData() {
        return this.getKey('player_data');
    }

    public getMouseChildren() {
        return this.getKey('mouse_children');
    }

    public getAdLocalContentId() {
        return this.getKey('ad_local_content_id');
    }

}
export class CampaignTimelinesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignId() {
        return this.getKey('campaign_id');
    }

    public getTimelineName() {
        return this.getKey('timeline_name');
    }

    public getTimelineDuration() {
        return this.getKey('timeline_duration');
    }

}
export class CampaignEventsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignEventId() {
        return this.getKey('campaign_event_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignId() {
        return this.getKey('campaign_id');
    }

    public getSenderName() {
        return this.getKey('sender_name');
    }

    public getEventName() {
        return this.getKey('event_name');
    }

    public getEventCondition() {
        return this.getKey('event_condition');
    }

    public getCommandName() {
        return this.getKey('command_name');
    }

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

    public getCommandParams() {
        return this.getKey('command_params');
    }

}
export class CampaignBoardsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignBoardId() {
        return this.getKey('campaign_board_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getBoardId() {
        return this.getKey('board_id');
    }

    public getCampaignId() {
        return this.getKey('campaign_id');
    }

    public getCampaignBoardName() {
        return this.getKey('campaign_board_name');
    }

    public getAllowPublicView() {
        return this.getKey('allow_public_view');
    }

    public getAdminPublicView() {
        return this.getKey('admin_public_view');
    }

}
export class BoardTemplatesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getBoardTemplateId() {
        return this.getKey('board_template_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getBoardId() {
        return this.getKey('board_id');
    }

    public getTemplateName() {
        return this.getKey('template_name');
    }

}
export class BoardTemplateViewersModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getBoardTemplateViewerId() {
        return this.getKey('board_template_viewer_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getBoardTemplateId() {
        return this.getKey('board_template_id');
    }

    public getViewerName() {
        return this.getKey('viewer_name');
    }

    public getPixelX() {
        return this.getKey('pixel_x');
    }

    public getPixelY() {
        return this.getKey('pixel_y');
    }

    public getPixelWidth() {
        return this.getKey('pixel_width');
    }

    public getPixelHeight() {
        return this.getKey('pixel_height');
    }

    public getEnableGaps() {
        return this.getKey('enable_gaps');
    }

    public getViewerOrder() {
        return this.getKey('viewer_order');
    }

    public getLocked() {
        return this.getKey('locked');
    }

}
export class CampaignTimelineChanelsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineChanelId() {
        return this.getKey('campaign_timeline_chanel_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

    public getChanelName() {
        return this.getKey('chanel_name');
    }

    public getChanelColor() {
        return this.getKey('chanel_color');
    }

    public getRandomOrder() {
        return this.getKey('random_order');
    }

    public getRepeatToFit() {
        return this.getKey('repeat_to_fit');
    }

    public getFixedPlayersLength() {
        return this.getKey('fixed_players_length');
    }

}
export class CampaignTimelineChannelsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineChannelId() {
        return this.getKey('campaign_timeline_channel_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

}
export class CampaignTimelineBoardTemplatesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineBoardTemplateId() {
        return this.getKey('campaign_timeline_board_template_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

    public getBoardTemplateId() {
        return this.getKey('board_template_id');
    }

    public getCampaignBoardId() {
        return this.getKey('campaign_board_id');
    }

    public getTemplateOffsetTime() {
        return this.getKey('template_offset_time');
    }

    public getTemplateDuration() {
        return this.getKey('template_duration');
    }

}
export class CampaignTimelineBoardViewerChanelsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineBoardViewerChanelId() {
        return this.getKey('campaign_timeline_board_viewer_chanel_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineBoardTemplateId() {
        return this.getKey('campaign_timeline_board_template_id');
    }

    public getBoardTemplateViewerId() {
        return this.getKey('board_template_viewer_id');
    }

    public getCampaignTimelineChanelId() {
        return this.getKey('campaign_timeline_chanel_id');
    }

}
export class CampaignTimelineBoardViewerChannelsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineBoardViewerChannelId() {
        return this.getKey('campaign_timeline_board_viewer_channel_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineBoardTemplateId() {
        return this.getKey('campaign_timeline_board_template_id');
    }

    public getBoardTemplateViewerId() {
        return this.getKey('board_template_viewer_id');
    }

    public getCampaignChannelId() {
        return this.getKey('campaign_channel_id');
    }

}
export class CampaignTimelineChanelPlayersModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineChanelPlayerId() {
        return this.getKey('campaign_timeline_chanel_player_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineChanelId() {
        return this.getKey('campaign_timeline_chanel_id');
    }

    public getPlayerOffsetTime() {
        return this.getKey('player_offset_time');
    }

    public getPlayerDuration() {
        return this.getKey('player_duration');
    }

    public getPlayerId() {
        return this.getKey('player_id');
    }

    public getPlayerEditorId() {
        return this.getKey('player_editor_id');
    }

    public getPlayerData() {
        return this.getKey('player_data');
    }

    public getMouseChildren() {
        return this.getKey('mouse_children');
    }

    public getAdLocalContentId() {
        return this.getKey('ad_local_content_id');
    }

}
export class CampaignTimelineSchedulesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineScheduleId() {
        return this.getKey('campaign_timeline_schedule_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

    public getPriorty() {
        return this.getKey('priorty');
    }

    public getStartDate() {
        return this.getKey('start_date');
    }

    public getEndDate() {
        return this.getKey('end_date');
    }

    public getRepeatType() {
        return this.getKey('repeat_type');
    }

    public getWeekDays() {
        return this.getKey('week_days');
    }

    public getCustomDuration() {
        return this.getKey('custom_duration');
    }

    public getDuration() {
        return this.getKey('duration');
    }

    public getStartTime() {
        return this.getKey('start_time');
    }

    public getPatternEnabled() {
        return this.getKey('pattern_enabled');
    }

    public getPatternName() {
        return this.getKey('pattern_name');
    }

}
export class CampaignTimelineSequencesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getCampaignTimelineSequenceId() {
        return this.getKey('campaign_timeline_sequence_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getCampaignId() {
        return this.getKey('campaign_id');
    }

    public getCampaignTimelineId() {
        return this.getKey('campaign_timeline_id');
    }

    public getSequenceIndex() {
        return this.getKey('sequence_index');
    }

    public getSequenceCount() {
        return this.getKey('sequence_count');
    }

}
export class ScriptsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getScriptId() {
        return this.getKey('script_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getScriptSrc() {
        return this.getKey('script_src');
    }

}
export class MusicChannelsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getMusicChannelId() {
        return this.getKey('music_channel_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getMusicChannelName() {
        return this.getKey('music_channel_name');
    }

    public getAccessKey() {
        return this.getKey('access_key');
    }

    public getTreePath() {
        return this.getKey('tree_path');
    }

}
export class MusicChannelSongsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getMusicChannelSongId() {
        return this.getKey('music_channel_song_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getMusicChannelId() {
        return this.getKey('music_channel_id');
    }

    public getResourceId() {
        return this.getKey('resource_id');
    }

}
export class BranchStationsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getBranchStationId() {
        return this.getKey('branch_station_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getBranchId() {
        return this.getKey('branch_id');
    }

    public getCampaignBoardId() {
        return this.getKey('campaign_board_id');
    }

    public getStationName() {
        return this.getKey('station_name');
    }

    public getRebootExceedMemEnabled() {
        return this.getKey('reboot_exceed_mem_enabled');
    }

    public getRebootExceedMemValue() {
        return this.getKey('reboot_exceed_mem_value');
    }

    public getRebootTimeEnabled() {
        return this.getKey('reboot_time_enabled');
    }

    public getRebootTimeValue() {
        return this.getKey('reboot_time_value');
    }

    public getRebootErrorEnabled() {
        return this.getKey('reboot_error_enabled');
    }

    public getMonitorStandbyEnabled() {
        return this.getKey('monitor_standby_enabled');
    }

    public getMonitorStandbyFrom() {
        return this.getKey('monitor_standby_from');
    }

    public getMonitorStandbyTo() {
        return this.getKey('monitor_standby_to');
    }

    public getLocationAddress() {
        return this.getKey('location_address');
    }

    public getLocationLong() {
        return this.getKey('location_long');
    }

    public getLocationLat() {
        return this.getKey('location_lat');
    }

    public getMapType() {
        return this.getKey('map_type');
    }

    public getMapZoom() {
        return this.getKey('map_zoom');
    }

    public getStationSelected() {
        return this.getKey('station_selected');
    }

    public getAdvertisingDescription() {
        return this.getKey('advertising_description');
    }

    public getAdvertisingKeys() {
        return this.getKey('advertising_keys');
    }

    public getRebootExceedMemAction() {
        return this.getKey('reboot_exceed_mem_action');
    }

    public getRebootTimeAction() {
        return this.getKey('reboot_time_action');
    }

    public getRebootErrorAction() {
        return this.getKey('reboot_error_action');
    }

    public getStationMode() {
        return this.getKey('station_mode');
    }

    public getPowerMode() {
        return this.getKey('power_mode');
    }

    public getPowerOnDay1() {
        return this.getKey('power_on_day1');
    }

    public getPowerOffDay1() {
        return this.getKey('power_off_day1');
    }

    public getPowerOnDay2() {
        return this.getKey('power_on_day2');
    }

    public getPowerOffDay2() {
        return this.getKey('power_off_day2');
    }

    public getPowerOnDay3() {
        return this.getKey('power_on_day3');
    }

    public getPowerOffDay3() {
        return this.getKey('power_off_day3');
    }

    public getPowerOnDay4() {
        return this.getKey('power_on_day4');
    }

    public getPowerOffDay4() {
        return this.getKey('power_off_day4');
    }

    public getPowerOnDay5() {
        return this.getKey('power_on_day5');
    }

    public getPowerOffDay5() {
        return this.getKey('power_off_day5');
    }

    public getPowerOnDay6() {
        return this.getKey('power_on_day6');
    }

    public getPowerOffDay6() {
        return this.getKey('power_off_day6');
    }

    public getPowerOnDay7() {
        return this.getKey('power_on_day7');
    }

    public getPowerOffDay7() {
        return this.getKey('power_off_day7');
    }

    public getSendNotification() {
        return this.getKey('send_notification');
    }

    public getFrameRate() {
        return this.getKey('frame_rate');
    }

    public getQuality() {
        return this.getKey('quality');
    }

    public getTransitionEnabled() {
        return this.getKey('transition_enabled');
    }

    public getZwaveConfig() {
        return this.getKey('zwave_config');
    }

    public getLanServerEnabled() {
        return this.getKey('lan_server_enabled');
    }

    public getLanServerIp() {
        return this.getKey('lan_server_ip');
    }

    public getLanServerPort() {
        return this.getKey('lan_server_port');
    }

}
export class AdRatesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdRateId() {
        return this.getKey('ad_rate_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdRateName() {
        return this.getKey('ad_rate_name');
    }

    public getAdRateMap() {
        return this.getKey('ad_rate_map');
    }

    public getHourRate0() {
        return this.getKey('hour_rate0');
    }

    public getHourRate1() {
        return this.getKey('hour_rate1');
    }

    public getHourRate2() {
        return this.getKey('hour_rate2');
    }

    public getHourRate3() {
        return this.getKey('hour_rate3');
    }

}
export class StationAdsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getBranchStationId() {
        return this.getKey('branch_station_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdvertisingNetwork() {
        return this.getKey('advertising_network');
    }

    public getAdvertisingDescription() {
        return this.getKey('advertising_description');
    }

    public getAdvertisingKeys() {
        return this.getKey('advertising_keys');
    }

    public getAdRateId() {
        return this.getKey('ad_rate_id');
    }

}
export class AdOutPackagesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdOutPackageId() {
        return this.getKey('ad_out_package_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getPackageName() {
        return this.getKey('package_name');
    }

    public getStartDate() {
        return this.getKey('start_date');
    }

    public getEndDate() {
        return this.getKey('end_date');
    }

}
export class AdOutPackageContentsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdOutPackageContentId() {
        return this.getKey('ad_out_package_content_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdOutPackageId() {
        return this.getKey('ad_out_package_id');
    }

    public getResourceId() {
        return this.getKey('resource_id');
    }

    public getPlayerDataId() {
        return this.getKey('player_data_id');
    }

    public getDuration() {
        return this.getKey('duration');
    }

    public getReparationsPerHour() {
        return this.getKey('reparations_per_hour');
    }

}
export class AdOutPackageStationsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdOutPackageStationId() {
        return this.getKey('ad_out_package_station_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdOutPackageId() {
        return this.getKey('ad_out_package_id');
    }

    public getAdOutSubdomain() {
        return this.getKey('ad_out_subdomain');
    }

    public getAdOutBusinessId() {
        return this.getKey('ad_out_business_id');
    }

    public getAdOutStationId() {
        return this.getKey('ad_out_station_id');
    }

    public getDaysMask() {
        return this.getKey('days_mask');
    }

    public getHourStart() {
        return this.getKey('hour_start');
    }

    public getHourEnd() {
        return this.getKey('hour_end');
    }

}
export class AdInDomainsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdInDomainId() {
        return this.getKey('ad_in_domain_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdOutDomain() {
        return this.getKey('ad_out_domain');
    }

    public getAcceptNewBusiness() {
        return this.getKey('accept_new_business');
    }

}
export class AdInDomainBusinessesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdInDomainBusinessId() {
        return this.getKey('ad_in_domain_business_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdInDomainId() {
        return this.getKey('ad_in_domain_id');
    }

    public getAdOutBusinessId() {
        return this.getKey('ad_out_business_id');
    }

    public getAcceptNewPackage() {
        return this.getKey('accept_new_package');
    }

}
export class AdInDomainBusinessPackagesModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdInDomainBusinessPackageId() {
        return this.getKey('ad_in_domain_business_package_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdInDomainBusinessId() {
        return this.getKey('ad_in_domain_business_id');
    }

    public getAdPackageId() {
        return this.getKey('ad_package_id');
    }

    public getAcceptNewStation() {
        return this.getKey('accept_new_station');
    }

    public getSuspendModifiedPackageDate() {
        return this.getKey('suspend_modified_package_date');
    }

    public getSuspendModifiedContent() {
        return this.getKey('suspend_modified_content');
    }

}
export class AdInDomainBusinessPackageStationsModel extends StoreModel {
    constructor(data: any = {}) {super(data);}

    public getAdInDomainBusinessPackageStationId() {
        return this.getKey('ad_in_domain_business_package_station_id');
    }

    public getChangelistId() {
        return this.getKey('changelist_id');
    }

    public getChangeType() {
        return this.getKey('change_type');
    }

    public getAdInDomainBusinessPackageId() {
        return this.getKey('ad_in_domain_business_package_id');
    }

    public getAdPackageStationId() {
        return this.getKey('ad_package_station_id');
    }

    public getAcceptStatus() {
        return this.getKey('accept_status');
    }

    public getSuspendModifiedStation() {
        return this.getKey('suspend_modified_station');
    }

}



export interface ISDK {

    table_global_settings?: List<GlobalSettingsModel>;
    table_resources?: List<ResourcesModel>;
    table_ad_local_packages?: List<AdLocalPackagesModel>;
    table_ad_local_contents?: List<AdLocalContentsModel>;
    table_category_values?: List<CategoryValuesModel>;
    table_catalog_items?: List<CatalogItemsModel>;
    table_catalog_item_infos?: List<CatalogItemInfosModel>;
    table_catalog_item_resources?: List<CatalogItemResourcesModel>;
    table_catalog_item_categories?: List<CatalogItemCategoriesModel>;
    table_player_data?: List<PlayerDataModel>;
    table_boards?: List<BoardsModel>;
    table_campaigns?: List<CampaignsModel>;
    table_campaign_channels?: List<CampaignChannelsModel>;
    table_campaign_channel_players?: List<CampaignChannelPlayersModel>;
    table_campaign_timelines?: List<CampaignTimelinesModel>;
    table_campaign_events?: List<CampaignEventsModel>;
    table_campaign_boards?: List<CampaignBoardsModel>;
    table_board_templates?: List<BoardTemplatesModel>;
    table_board_template_viewers?: List<BoardTemplateViewersModel>;
    table_campaign_timeline_chanels?: List<CampaignTimelineChanelsModel>;
    table_campaign_timeline_channels?: List<CampaignTimelineChannelsModel>;
    table_campaign_timeline_board_templates?: List<CampaignTimelineBoardTemplatesModel>;
    table_campaign_timeline_board_viewer_chanels?: List<CampaignTimelineBoardViewerChanelsModel>;
    table_campaign_timeline_board_viewer_channels?: List<CampaignTimelineBoardViewerChannelsModel>;
    table_campaign_timeline_chanel_players?: List<CampaignTimelineChanelPlayersModel>;
    table_campaign_timeline_schedules?: List<CampaignTimelineSchedulesModel>;
    table_campaign_timeline_sequences?: List<CampaignTimelineSequencesModel>;
    table_scripts?: List<ScriptsModel>;
    table_music_channels?: List<MusicChannelsModel>;
    table_music_channel_songs?: List<MusicChannelSongsModel>;
    table_branch_stations?: List<BranchStationsModel>;
    table_ad_rates?: List<AdRatesModel>;
    table_station_ads?: List<StationAdsModel>;
    table_ad_out_packages?: List<AdOutPackagesModel>;
    table_ad_out_package_contents?: List<AdOutPackageContentsModel>;
    table_ad_out_package_stations?: List<AdOutPackageStationsModel>;
    table_ad_in_domains?: List<AdInDomainsModel>;
    table_ad_in_domain_businesses?: List<AdInDomainBusinessesModel>;
    table_ad_in_domain_business_packages?: List<AdInDomainBusinessPackagesModel>;
    table_ad_in_domain_business_package_stations?: List<AdInDomainBusinessPackageStationsModel>;

}


export const TableNames = [
    'global_settings',
    'resources',
    'ad_local_packages',
    'ad_local_contents',
    'category_values',
    'catalog_items',
    'catalog_item_infos',
    'catalog_item_resources',
    'catalog_item_categories',
    'player_data',
    'boards',
    'campaigns',
    'campaign_channels',
    'campaign_channel_players',
    'campaign_timelines',
    'campaign_events',
    'campaign_boards',
    'board_templates',
    'board_template_viewers',
    'campaign_timeline_chanels',
    'campaign_timeline_channels',
    'campaign_timeline_board_templates',
    'campaign_timeline_board_viewer_chanels',
    'campaign_timeline_board_viewer_channels',
    'campaign_timeline_chanel_players',
    'campaign_timeline_schedules',
    'campaign_timeline_sequences',
    'scripts',
    'music_channels',
    'music_channel_songs',
    'branch_stations',
    'ad_rates',
    'station_ads',
    'ad_out_packages',
    'ad_out_package_contents',
    'ad_out_package_stations',
    'ad_in_domains',
    'ad_in_domain_businesses',
    'ad_in_domain_business_packages',
    'ad_in_domain_business_package_stations',

]


export interface IBaseProto {
    m_name:string;
    fields:Array<any>
    addData: (i_xmlTable) => any;
    getHandle: (i_id) => any;
    setRecordId: (i_handle,i_id) => any;
    createRecord: () => any;
    addRecord: (i_record,i_handle) => any;
    getRec: (i_handle) => any;
    getAllPrimaryKeys: () => any;
    openForEdit: (i_handel) => any;
    openForDelete: (i_handel) => any;
    appendModifyAndNewChangelist: (i_doc) => any;
    appendDeletedChangelist: (i_doc) => any;
    getPlayerDataIds: (i_playerData) => any;
    convertToIds: (i_docPlayerData) => any;
    createPlayId: (i_xmlPlayer) => any;
    getNewPrimaryKeys: () => any;
    getModifyPrimaryKeys: () => any;
    getDeletedPrimaryKeys: () => any;
    getConflictPrimaryKeys: () => any;
    commitChanges: (i_changelistId) => any;

}


export interface ITable_global_settings extends IBaseProto {
    m_fields: [{"field":"param_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"param_key"},{"field":"param_value"}]
}
export interface ITable_resources extends IBaseProto {
    m_fields: [{"field":"resource_id","foriegn":"resources","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"resource_name"},{"field":"resource_type"},{"field":"resource_pixel_width"},{"field":"resource_pixel_height"},{"field":"default_player"},{"field":"snapshot"},{"field":"resource_total_time"},{"field":"resource_date_created"},{"field":"resource_date_modified"},{"field":"resource_trust"},{"field":"resource_public"},{"field":"resource_bytes_total"},{"field":"resource_module"},{"field":"tree_path"},{"field":"access_key"},{"field":"resource_html"},{"field":"shortcut"},{"field":"shortcut_business_id"},{"field":"shortcut_resource_id"}]
}
export interface ITable_ad_local_packages extends IBaseProto {
    m_fields: [{"field":"ad_local_package_id","foriegn":"ad_local_packages","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"enabled"},{"field":"package_name"},{"field":"use_date_range"},{"field":"start_date"},{"field":"end_date"}]
}
export interface ITable_ad_local_contents extends IBaseProto {
    m_fields: [{"field":"ad_local_content_id","foriegn":"ad_local_contents","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_local_package_id","foriegn":"ad_local_packages","isNullAble":false},{"field":"enabled"},{"field":"content_name"}]
}
export interface ITable_category_values extends IBaseProto {
    m_fields: [{"field":"category_value_id","foriegn":"category_values","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"parent_category_value_id"},{"field":"category_value"}]
}
export interface ITable_catalog_items extends IBaseProto {
    m_fields: [{"field":"catalog_item_id","foriegn":"catalog_items","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"item_name"},{"field":"ad_local_content_id","foriegn":"ad_local_contents","isNullAble":true}]
}
export interface ITable_catalog_item_infos extends IBaseProto {
    m_fields: [{"field":"catalog_item_id","foriegn":"catalog_items","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"info0"},{"field":"info1"},{"field":"info2"},{"field":"info3"}]
}
export interface ITable_catalog_item_resources extends IBaseProto {
    m_fields: [{"field":"catalog_item_resource_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"catalog_item_id","foriegn":"catalog_items","isNullAble":false},{"field":"resource_id","foriegn":"resources","isNullAble":false},{"field":"resource_group"}]
}
export interface ITable_catalog_item_categories extends IBaseProto {
    m_fields: [{"field":"catalog_item_category_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"catalog_item_id","foriegn":"catalog_items","isNullAble":false},{"field":"category_value_id","foriegn":"category_values","isNullAble":false}]
}
export interface ITable_player_data extends IBaseProto {
    m_fields: [{"field":"player_data_id","foriegn":"player_data","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"player_data_value"},{"field":"player_data_public"},{"field":"tree_path"},{"field":"source_code"},{"field":"access_key"}]
}
export interface ITable_boards extends IBaseProto {
    m_fields: [{"field":"board_id","foriegn":"boards","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"board_name"},{"field":"board_pixel_width"},{"field":"board_pixel_height"},{"field":"monitor_orientation_enabled"},{"field":"monitor_orientation_index"},{"field":"access_key"},{"field":"tree_path"}]
}
export interface ITable_campaigns extends IBaseProto {
    m_fields: [{"field":"campaign_id","foriegn":"campaigns","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_name"},{"field":"campaign_playlist_mode"},{"field":"kiosk_mode"},{"field":"kiosk_key"},{"field":"kiosk_timeline_id"},{"field":"kiosk_wait_time"},{"field":"mouse_interrupt_mode"},{"field":"tree_path"},{"field":"access_key"}]
}
export interface ITable_campaign_channels extends IBaseProto {
    m_fields: [{"field":"campaign_channel_id","foriegn":"campaign_channels","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_id","foriegn":"campaigns","isNullAble":false},{"field":"chanel_name"},{"field":"chanel_color"},{"field":"random_order"},{"field":"repeat_to_fit"},{"field":"fixed_players_length"}]
}
export interface ITable_campaign_channel_players extends IBaseProto {
    m_fields: [{"field":"campaign_channel_player_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_channel_id","foriegn":"campaign_channels","isNullAble":false},{"field":"player_offset_time"},{"field":"player_duration"},{"field":"player_data"},{"field":"mouse_children"},{"field":"ad_local_content_id","foriegn":"ad_local_contents","isNullAble":true}]
}
export interface ITable_campaign_timelines extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_id","foriegn":"campaigns","isNullAble":false},{"field":"timeline_name"},{"field":"timeline_duration"}]
}
export interface ITable_campaign_events extends IBaseProto {
    m_fields: [{"field":"campaign_event_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_id","foriegn":"campaigns","isNullAble":true},{"field":"sender_name"},{"field":"event_name"},{"field":"event_condition"},{"field":"command_name"},{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":true},{"field":"command_params"}]
}
export interface ITable_campaign_boards extends IBaseProto {
    m_fields: [{"field":"campaign_board_id","foriegn":"campaign_boards","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"board_id","foriegn":"boards","isNullAble":false},{"field":"campaign_id","foriegn":"campaigns","isNullAble":false},{"field":"campaign_board_name"},{"field":"allow_public_view"},{"field":"admin_public_view"}]
}
export interface ITable_board_templates extends IBaseProto {
    m_fields: [{"field":"board_template_id","foriegn":"board_templates","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"board_id","foriegn":"boards","isNullAble":false},{"field":"template_name"}]
}
export interface ITable_board_template_viewers extends IBaseProto {
    m_fields: [{"field":"board_template_viewer_id","foriegn":"board_template_viewers","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"board_template_id","foriegn":"board_templates","isNullAble":false},{"field":"viewer_name"},{"field":"pixel_x"},{"field":"pixel_y"},{"field":"pixel_width"},{"field":"pixel_height"},{"field":"enable_gaps"},{"field":"viewer_order"},{"field":"locked"}]
}
export interface ITable_campaign_timeline_chanels extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_chanel_id","foriegn":"campaign_timeline_chanels","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":false},{"field":"chanel_name"},{"field":"chanel_color"},{"field":"random_order"},{"field":"repeat_to_fit"},{"field":"fixed_players_length"}]
}
export interface ITable_campaign_timeline_channels extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_channel_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":false}]
}
export interface ITable_campaign_timeline_board_templates extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_board_template_id","foriegn":"campaign_timeline_board_templates","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":false},{"field":"board_template_id","foriegn":"board_templates","isNullAble":false},{"field":"campaign_board_id","foriegn":"campaign_boards","isNullAble":false},{"field":"template_offset_time"},{"field":"template_duration"}]
}
export interface ITable_campaign_timeline_board_viewer_chanels extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_board_viewer_chanel_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_board_template_id","foriegn":"campaign_timeline_board_templates","isNullAble":false},{"field":"board_template_viewer_id","foriegn":"board_template_viewers","isNullAble":false},{"field":"campaign_timeline_chanel_id","foriegn":"campaign_timeline_chanels","isNullAble":false}]
}
export interface ITable_campaign_timeline_board_viewer_channels extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_board_viewer_channel_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_board_template_id","foriegn":"campaign_timeline_board_templates","isNullAble":false},{"field":"board_template_viewer_id","foriegn":"board_template_viewers","isNullAble":false},{"field":"campaign_channel_id","foriegn":"campaign_channels","isNullAble":false}]
}
export interface ITable_campaign_timeline_chanel_players extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_chanel_player_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_chanel_id","foriegn":"campaign_timeline_chanels","isNullAble":false},{"field":"player_offset_time"},{"field":"player_duration"},{"field":"player_id"},{"field":"player_editor_id"},{"field":"player_data"},{"field":"mouse_children"},{"field":"ad_local_content_id","foriegn":"ad_local_contents","isNullAble":true}]
}
export interface ITable_campaign_timeline_schedules extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_schedule_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":false},{"field":"priorty"},{"field":"start_date"},{"field":"end_date"},{"field":"repeat_type"},{"field":"week_days"},{"field":"custom_duration"},{"field":"duration"},{"field":"start_time"},{"field":"pattern_enabled"},{"field":"pattern_name"}]
}
export interface ITable_campaign_timeline_sequences extends IBaseProto {
    m_fields: [{"field":"campaign_timeline_sequence_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"campaign_id","foriegn":"campaigns","isNullAble":false},{"field":"campaign_timeline_id","foriegn":"campaign_timelines","isNullAble":false},{"field":"sequence_index"},{"field":"sequence_count"}]
}
export interface ITable_scripts extends IBaseProto {
    m_fields: [{"field":"script_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"script_src"}]
}
export interface ITable_music_channels extends IBaseProto {
    m_fields: [{"field":"music_channel_id","foriegn":"music_channels","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"music_channel_name"},{"field":"access_key"},{"field":"tree_path"}]
}
export interface ITable_music_channel_songs extends IBaseProto {
    m_fields: [{"field":"music_channel_song_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"music_channel_id","foriegn":"music_channels","isNullAble":false},{"field":"resource_id","foriegn":"resources","isNullAble":false}]
}
export interface ITable_branch_stations extends IBaseProto {
    m_fields: [{"field":"branch_station_id","foriegn":"branch_stations","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"branch_id"},{"field":"campaign_board_id","foriegn":"campaign_boards","isNullAble":true},{"field":"station_name"},{"field":"reboot_exceed_mem_enabled"},{"field":"reboot_exceed_mem_value"},{"field":"reboot_time_enabled"},{"field":"reboot_time_value"},{"field":"reboot_error_enabled"},{"field":"monitor_standby_enabled"},{"field":"monitor_standby_from"},{"field":"monitor_standby_to"},{"field":"location_address"},{"field":"location_long"},{"field":"location_lat"},{"field":"map_type"},{"field":"map_zoom"},{"field":"station_selected"},{"field":"advertising_description"},{"field":"advertising_keys"},{"field":"reboot_exceed_mem_action"},{"field":"reboot_time_action"},{"field":"reboot_error_action"},{"field":"station_mode"},{"field":"power_mode"},{"field":"power_on_day1"},{"field":"power_off_day1"},{"field":"power_on_day2"},{"field":"power_off_day2"},{"field":"power_on_day3"},{"field":"power_off_day3"},{"field":"power_on_day4"},{"field":"power_off_day4"},{"field":"power_on_day5"},{"field":"power_off_day5"},{"field":"power_on_day6"},{"field":"power_off_day6"},{"field":"power_on_day7"},{"field":"power_off_day7"},{"field":"send_notification"},{"field":"frame_rate"},{"field":"quality"},{"field":"transition_enabled"},{"field":"zwave_config"},{"field":"lan_server_enabled"},{"field":"lan_server_ip"},{"field":"lan_server_port"}]
}
export interface ITable_ad_rates extends IBaseProto {
    m_fields: [{"field":"ad_rate_id","foriegn":"ad_rates","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_rate_name"},{"field":"ad_rate_map"},{"field":"hour_rate0"},{"field":"hour_rate1"},{"field":"hour_rate2"},{"field":"hour_rate3"}]
}
export interface ITable_station_ads extends IBaseProto {
    m_fields: [{"field":"branch_station_id","foriegn":"branch_stations","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"advertising_network"},{"field":"advertising_description"},{"field":"advertising_keys"},{"field":"ad_rate_id","foriegn":"ad_rates","isNullAble":true}]
}
export interface ITable_ad_out_packages extends IBaseProto {
    m_fields: [{"field":"ad_out_package_id","foriegn":"ad_out_packages","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"package_name"},{"field":"start_date"},{"field":"end_date"}]
}
export interface ITable_ad_out_package_contents extends IBaseProto {
    m_fields: [{"field":"ad_out_package_content_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_out_package_id","foriegn":"ad_out_packages","isNullAble":false},{"field":"resource_id","foriegn":"resources","isNullAble":true},{"field":"player_data_id","foriegn":"player_data","isNullAble":true},{"field":"duration"},{"field":"reparations_per_hour"}]
}
export interface ITable_ad_out_package_stations extends IBaseProto {
    m_fields: [{"field":"ad_out_package_station_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_out_package_id","foriegn":"ad_out_packages","isNullAble":false},{"field":"ad_out_subdomain"},{"field":"ad_out_business_id"},{"field":"ad_out_station_id"},{"field":"days_mask"},{"field":"hour_start"},{"field":"hour_end"}]
}
export interface ITable_ad_in_domains extends IBaseProto {
    m_fields: [{"field":"ad_in_domain_id","foriegn":"ad_in_domains","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_out_domain"},{"field":"accept_new_business"}]
}
export interface ITable_ad_in_domain_businesses extends IBaseProto {
    m_fields: [{"field":"ad_in_domain_business_id","foriegn":"ad_in_domain_businesses","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_in_domain_id","foriegn":"ad_in_domains","isNullAble":false},{"field":"ad_out_business_id"},{"field":"accept_new_package"}]
}
export interface ITable_ad_in_domain_business_packages extends IBaseProto {
    m_fields: [{"field":"ad_in_domain_business_package_id","foriegn":"ad_in_domain_business_packages","isNullAble":false},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_in_domain_business_id","foriegn":"ad_in_domain_businesses","isNullAble":false},{"field":"ad_package_id"},{"field":"accept_new_station"},{"field":"suspend_modified_package_date"},{"field":"suspend_modified_content"}]
}
export interface ITable_ad_in_domain_business_package_stations extends IBaseProto {
    m_fields: [{"field":"ad_in_domain_business_package_station_id"},{"field":"changelist_id"},{"field":"change_type"},{"field":"ad_in_domain_business_package_id","foriegn":"ad_in_domain_business_packages","isNullAble":false},{"field":"ad_package_station_id"},{"field":"accept_status"},{"field":"suspend_modified_station"}]
}
export interface ICreateDataBase extends IBaseProto {
    m_fields: undefined
}
export interface ICreateHandles extends IBaseProto {
    m_fields: undefined
}



export interface IDataManager_proto {
    table_global_settings:()=> ITable_global_settings
    table_resources:()=> ITable_resources
    table_ad_local_packages:()=> ITable_ad_local_packages
    table_ad_local_contents:()=> ITable_ad_local_contents
    table_category_values:()=> ITable_category_values
    table_catalog_items:()=> ITable_catalog_items
    table_catalog_item_infos:()=> ITable_catalog_item_infos
    table_catalog_item_resources:()=> ITable_catalog_item_resources
    table_catalog_item_categories:()=> ITable_catalog_item_categories
    table_player_data:()=> ITable_player_data
    table_boards:()=> ITable_boards
    table_campaigns:()=> ITable_campaigns
    table_campaign_channels:()=> ITable_campaign_channels
    table_campaign_channel_players:()=> ITable_campaign_channel_players
    table_campaign_timelines:()=> ITable_campaign_timelines
    table_campaign_events:()=> ITable_campaign_events
    table_campaign_boards:()=> ITable_campaign_boards
    table_board_templates:()=> ITable_board_templates
    table_board_template_viewers:()=> ITable_board_template_viewers
    table_campaign_timeline_chanels:()=> ITable_campaign_timeline_chanels
    table_campaign_timeline_channels:()=> ITable_campaign_timeline_channels
    table_campaign_timeline_board_templates:()=> ITable_campaign_timeline_board_templates
    table_campaign_timeline_board_viewer_chanels:()=> ITable_campaign_timeline_board_viewer_chanels
    table_campaign_timeline_board_viewer_channels:()=> ITable_campaign_timeline_board_viewer_channels
    table_campaign_timeline_chanel_players:()=> ITable_campaign_timeline_chanel_players
    table_campaign_timeline_schedules:()=> ITable_campaign_timeline_schedules
    table_campaign_timeline_sequences:()=> ITable_campaign_timeline_sequences
    table_scripts:()=> ITable_scripts
    table_music_channels:()=> ITable_music_channels
    table_music_channel_songs:()=> ITable_music_channel_songs
    table_branch_stations:()=> ITable_branch_stations
    table_ad_rates:()=> ITable_ad_rates
    table_station_ads:()=> ITable_station_ads
    table_ad_out_packages:()=> ITable_ad_out_packages
    table_ad_out_package_contents:()=> ITable_ad_out_package_contents
    table_ad_out_package_stations:()=> ITable_ad_out_package_stations
    table_ad_in_domains:()=> ITable_ad_in_domains
    table_ad_in_domain_businesses:()=> ITable_ad_in_domain_businesses
    table_ad_in_domain_business_packages:()=> ITable_ad_in_domain_business_packages
    table_ad_in_domain_business_package_stations:()=> ITable_ad_in_domain_business_package_stations
    createDataBase:()=> ICreateDataBase
    createHandles:()=> ICreateHandles

}

