import {Injectable} from "@angular/core";
import {BlockLabels} from "../interfaces/Consts";
import {BlockFabricScene} from "../app/blocks/block-fabric-scene";
import {RedPepperService} from "./redpepper.service";
import {BlockFabric} from "../app/blocks/block-fabric";
import {BlockFabricImage} from "../app/blocks/block-fabric-image";
import {BlockFabricLabel} from "../app/blocks/block-fabric-label";
import {BlockFabricSvg} from "../app/blocks/block-fabric-svg";
import {BlockService} from "../app/blocks/block-service";
import * as _ from "lodash";
import X2JS from "x2js";
import {BlockFabricJsonItem} from "../app/blocks/block-fabric-josn-item";

@Injectable()
export class BlockFactoryService {
    parser;

    constructor(private rp: RedPepperService, private bs: BlockService) {
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

    /**
     This is factory method produces block instances which will reside on the timeline and referenced within this
     channel instance. The factory will parse the blockCode and create the appropriate block type.
     **/
    createBlock(block_id, i_player_data, i_scene_id?) {
        // con('creating block ' + blockCode + ' ' + i_player_data);
        var block;
        var playerData = this.parser.xml2js(i_player_data);
        var blockCode = parseInt(playerData['Player']['_player']);

        switch (blockCode) {
            case BlockLabels.BLOCKCODE_SCENE: {
                block = new BlockFabricScene({i_block_id: block_id}, this.bs, this.rp);
                break;
            }

            case BlockLabels.BLOCKCODE_IMAGE: {
                block = new BlockFabricImage({i_block_id: block_id, i_scene_player_data_id: i_scene_id}, this.bs, this.rp);
                break;
            }

            case BlockLabels.BLOCKCODE_SVG: {
                block = new BlockFabricSvg({i_block_id: block_id, i_scene_player_data_id: i_scene_id}, this.bs, this.rp);
                break;
            }

            case BlockLabels.LABEL: {
                block = new BlockFabricLabel({i_block_id: block_id, i_scene_player_data_id: i_scene_id}, this.bs, this.rp);
                break;
            }

            case BlockLabels.BLOCKCODE_GOOGLE_SHEETS: {}
            case BlockLabels.BLOCKCODE_CALENDAR: {}
            case BlockLabels.BLOCKCODE_INSTAGRAM: {}
            case BlockLabels.BLOCKCODE_JSON_ITEM: {}
            case BlockLabels.BLOCKCODE_WORLD_WEATHER: {}
            case BlockLabels.BLOCKCODE_TWITTER_ITEM: {}
            case BlockLabels.BLOCKCODE_JSON_ITEM: {
                block = new BlockFabricJsonItem({i_block_id: block_id, i_scene_player_data_id: i_scene_id}, this.bs, this.rp);
                break;
            }

            default: {
                block = new BlockFabric({i_block_id: block_id, i_scene_player_data_id: i_scene_id}, this.bs, this.rp, blockCode);
                break;
            }
        }
        return block;
    }
}

// subclass our block from fabric.Group if resides inside scene
// if (i_placement == PLACEMENT_SCENE) {
//     // var g = new fabric.Group([]);
//     // _.extend(block, g);
//     // g = undefined;
// }