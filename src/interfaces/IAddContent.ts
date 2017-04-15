import {BlockTypeEnum} from "./BlockTypeEnum";
import {ISceneData} from "../app/blocks/block-service";

export interface IAddContents {
    type:BlockTypeEnum;
    blockCode: number;
    name: string;
    allow: boolean;
    fa: string;
    description: string;
    resourceId?: number;
    blockId?:number;
    sceneData?: ISceneData;
    size?:string;
    specialJsonItemName?: string;
    specialJsonItemColor?: string;
}
