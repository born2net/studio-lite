import {OrientationEnum} from "../app/campaigns/campaign-orientation";

export interface IScreenTemplateData {
    resolution: string;
    screenType: string;
    orientation: OrientationEnum;
    screenProps: {};
    name: string;
    scale: number;
    campaignTimelineId?: number,
    campaignTimelineBoardTemplateId?: number
}