/**
 * extend msdb.interfaces_auto with additional functionality
 * requirement: same name as extended class / model + Ext
 */


import {BranchStationsModel, CampaignsModel, CampaignTimelineChanelPlayersModel, PlayerDataModel} from "../imsdb.interfaces_auto";

export class CampaignsModelExt extends CampaignsModel {

    public getCampaignPlaylistModeName(): string {
        if (this.getCampaignPlaylistMode() == 0) {
            return 'sequencer'
        } else {
            return 'scheduler'
        }
    }

}

export class CampaignTimelineChanelPlayersModelExt extends CampaignTimelineChanelPlayersModel {
    public getPlayerOffsetTimeInt() {
        return parseFloat(this.getKey('player_offset_time'));
    }

    public getPlayerDurationInt() {
        return parseFloat(this.getKey('player_duration'));
    }

}


export class BranchStationsModelExt extends BranchStationsModel {
    public get getLanEnabled() {
        return this.getLanServerEnabled() == 'True' ? true : false;
    }

    public get getNativeId() {
        return this.getKey('native_id');
    }

}

export class PlayerDataModelExt extends PlayerDataModel {

    public get getSceneName() {
        var domPlayerData = jXML.parseXML(this.getPlayerDataValue())
        return jXML(domPlayerData).find('Player').attr('label');
    }

    public get getSceneMime() {
        var domPlayerData = jXML.parseXML(this.getPlayerDataValue())
        return jXML(domPlayerData).find('Player').attr('mimeType');
    }

    public get getNativeId() {
        return Number(this.getKey('native_id'));
    }

}